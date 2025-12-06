import { GoogleGenAI, type Part } from '@google/genai';

import { env } from '~/env';
import { createLogger } from '~/lib/logger';

const log = createLogger('gemini-image');

const DEFAULT_MODEL = 'gemini-3-pro-image-preview';
const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_API_VERSION = 'v1beta';
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com';
const VERSION_SUFFIX = /\/(v[\w-]+)$/i;

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
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly fallbackModel: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(options?: {
    apiKey?: string;
    model?: string;
    fallbackModel?: string;
    disableFallback?: boolean;
    baseUrl?: string;
    apiVersion?: string;
  }) {
    this.apiKey = options?.apiKey ?? env.GEMINI_API_KEY;
    this.model = options?.model ?? env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL;

    // Smart fallback: if model is explicitly set by user, disable fallback
    const defaultFallback = env.GEMINI_IMAGE_FALLBACK_MODEL ?? 'gemini-2.5-flash-image';
    if (options?.disableFallback) {
      // User explicitly selected a model, don't fallback
      this.fallbackModel = this.model;
    } else if (options?.fallbackModel) {
      this.fallbackModel = options.fallbackModel;
    } else if (options?.model) {
      // User selected a specific model, fallback to the other one
      this.fallbackModel =
        options.model === 'gemini-3-pro-image-preview'
          ? 'gemini-2.5-flash-image'
          : 'gemini-3-pro-image-preview';
    } else {
      this.fallbackModel = defaultFallback;
    }

    const baseCandidate = options?.baseUrl ?? env.GEMINI_API_BASE_URL ?? DEFAULT_BASE_URL;
    const { baseEndpoint, apiVersion } = normalizeEndpoint(baseCandidate, options?.apiVersion);
    this.baseUrl = baseEndpoint;
    this.apiVersion = apiVersion ?? DEFAULT_API_VERSION;
  }

  async generateImage({
    prompt,
    aspectRatio = '1:1',
  }: GeminiImageRequest): Promise<GeminiImageResponse> {
    if (!this.apiKey) {
      throw new GeminiImageError('Gemini API key is not configured');
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
    const ai = new GoogleGenAI({
      apiKey: this.apiKey!,
      httpOptions: {
        baseUrl: this.baseUrl,
        apiVersion: this.apiVersion,
      },
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: hintedPrompt }],
        },
      ],
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
  return Boolean(env.GEMINI_API_KEY);
}

function normalizeEndpoint(rawBaseUrl: string, explicitVersion?: string) {
  const normalized = rawBaseUrl.replace(/\/+$/, '') || DEFAULT_BASE_URL;
  if (explicitVersion) {
    return {
      baseEndpoint: normalized,
      apiVersion: explicitVersion,
    };
  }
  const match = VERSION_SUFFIX.exec(normalized);
  if (match) {
    const endpoint = normalized.slice(0, -match[0].length) || DEFAULT_ENDPOINT;
    return {
      baseEndpoint: endpoint,
      apiVersion: match[1],
    };
  }
  return {
    baseEndpoint: normalized || DEFAULT_ENDPOINT,
    apiVersion: DEFAULT_API_VERSION,
  };
}
