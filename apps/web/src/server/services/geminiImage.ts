import { GoogleGenAI, type Part } from '@google/genai';

import { env } from '~/env';
import { createLogger } from '~/lib/logger';

const log = createLogger('gemini-image');

const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
const DEFAULT_VERTEX_LOCATION = 'us-central1';

type AspectRatio = '1:1' | '16:9' | '4:5';

type InlinePartWithData = Extract<Part, { inlineData?: { data?: string } }>;

const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '4:5': { width: 896, height: 1120 },
};

export interface GeminiImageRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
}

export interface GeminiImageResponse {
  data: Buffer;
  mimeType: string;
  width?: number;
  height?: number;
  model: string;
}

class GeminiImageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GeminiImageError';
  }
}

export class GeminiImageClient {
  private readonly useVertexAI: boolean;
  private readonly apiKey?: string;
  private readonly vertexProject?: string;
  private readonly vertexLocation: string;
  private readonly model: string;
  private readonly fallbackModel: string;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    fallbackModel?: string;
    disableFallback?: boolean;
    useVertexAI?: boolean;
    vertexProject?: string;
    vertexLocation?: string;
  }) {
    // Vertex AI configuration
    this.useVertexAI = options?.useVertexAI ?? env.GEMINI_USE_VERTEX_AI === 'true';
    this.vertexProject = options?.vertexProject ?? env.GOOGLE_CLOUD_PROJECT;
    this.vertexLocation =
      options?.vertexLocation ?? env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_VERTEX_LOCATION;

    // API key (only used for non-Vertex AI)
    this.apiKey = options?.apiKey ?? env.GEMINI_API_KEY;

    // Model configuration
    this.model = options?.model ?? env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL;

    // Smart fallback: if model is explicitly set by user, disable fallback
    const defaultFallback = env.GEMINI_IMAGE_FALLBACK_MODEL ?? 'gemini-2.0-flash-exp';
    if (options?.disableFallback) {
      // User explicitly selected a model, don't fallback
      this.fallbackModel = this.model;
    } else if (options?.fallbackModel) {
      this.fallbackModel = options.fallbackModel;
    } else {
      this.fallbackModel = defaultFallback;
    }
  }

  async generateImage({
    prompt,
    aspectRatio = '1:1',
  }: GeminiImageRequest): Promise<GeminiImageResponse> {
    // Validate configuration
    if (this.useVertexAI) {
      if (!this.vertexProject) {
        throw new GeminiImageError('GOOGLE_CLOUD_PROJECT is required for Vertex AI');
      }
      log.info({ project: this.vertexProject, location: this.vertexLocation }, 'Using Vertex AI');
    } else {
      if (!this.apiKey) {
        throw new GeminiImageError('Gemini API key is not configured');
      }
    }

    if (!prompt?.trim()) {
      throw new GeminiImageError('Prompt is required');
    }

    const trimmedPrompt = prompt.trim();
    const dimensions = ASPECT_DIMENSIONS[aspectRatio];
    const hintedPrompt = dimensions
      ? `${trimmedPrompt}\n\nTarget aspect ratio: ${aspectRatio} (${dimensions.width}x${dimensions.height}).`
      : trimmedPrompt;

    // Try primary model first
    try {
      log.info({ model: this.model }, 'Attempting image generation with primary model');
      return await this.generateWithModel(this.model, hintedPrompt, dimensions);
    } catch (error) {
      const isQuotaError =
        error instanceof Error &&
        (error.message.includes('429') ||
          error.message.includes('quota') ||
          error.message.includes('RESOURCE_EXHAUSTED'));

      if (isQuotaError && this.fallbackModel !== this.model) {
        log.warn(
          { primaryModel: this.model, fallbackModel: this.fallbackModel, error },
          'Primary model quota exceeded, attempting fallback model'
        );

        try {
          return await this.generateWithModel(this.fallbackModel, hintedPrompt, dimensions);
        } catch (fallbackError) {
          log.error({ fallbackError }, 'Fallback model also failed');
          if (fallbackError instanceof GeminiImageError) {
            throw fallbackError;
          }
          if (fallbackError instanceof Error) {
            throw new GeminiImageError(
              `Both models failed. Fallback error: ${fallbackError.message}`,
              fallbackError
            );
          }
          throw new GeminiImageError(
            'Failed to generate image with both primary and fallback models',
            fallbackError
          );
        }
      }

      // Not a quota error or no fallback available
      log.error({ error }, 'Gemini SDK error');
      if (error instanceof GeminiImageError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new GeminiImageError(error.message, error);
      }
      throw new GeminiImageError('Failed to generate image with Gemini API', error);
    }
  }

  private async generateWithModel(
    modelName: string,
    hintedPrompt: string,
    dimensions?: { width: number; height: number }
  ): Promise<GeminiImageResponse> {
    // Create client based on authentication mode
    const ai = this.useVertexAI
      ? new GoogleGenAI({
          vertexai: true,
          project: this.vertexProject!,
          location: this.vertexLocation,
        })
      : new GoogleGenAI({
          apiKey: this.apiKey!,
        });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: hintedPrompt }],
        },
      ],
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    const candidates = response.candidates ?? [];
    const inlinePart = candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .find(
        (part): part is InlinePartWithData => 'inlineData' in part && Boolean(part.inlineData?.data)
      );

    if (!inlinePart?.inlineData?.data) {
      log.error({ candidates, model: modelName }, 'Gemini response missing inline image data');
      throw new GeminiImageError('Gemini response did not include image data');
    }

    const buffer = Buffer.from(inlinePart.inlineData.data, 'base64');

    log.info({ model: modelName, size: buffer.length }, 'Successfully generated image');

    return {
      data: buffer,
      mimeType: inlinePart.inlineData.mimeType ?? 'image/png',
      width: dimensions?.width,
      height: dimensions?.height,
      model: modelName,
    };
  }
}

export function isGeminiConfigured() {
  // Check for Vertex AI configuration
  if (env.GEMINI_USE_VERTEX_AI === 'true') {
    return Boolean(env.GOOGLE_CLOUD_PROJECT);
  }
  // Check for API key configuration
  return Boolean(env.GEMINI_API_KEY);
}
