import { GoogleGenAI } from '@google/genai';

import { env } from '~/env';
import { createLogger } from '~/lib/logger';

const log = createLogger('gemini-recipe');

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_VERTEX_LOCATION = 'us-central1';

class GeminiRecipeError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'GeminiRecipeError';
  }
}

export interface GeminiRecipeRequest {
  prompt: string;
  temperature?: number;
  model?: string;
  responseSchema?: Record<string, unknown>;
}

export class GeminiRecipeClient {
  private readonly useVertexAI: boolean;
  private readonly apiKey?: string;
  private readonly vertexProject?: string;
  private readonly vertexLocation: string;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string; useVertexAI?: boolean }) {
    this.useVertexAI = options?.useVertexAI ?? env.GEMINI_USE_VERTEX_AI === 'true';
    this.vertexProject = env.GOOGLE_CLOUD_PROJECT;
    this.vertexLocation = env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_VERTEX_LOCATION;
    this.apiKey = options?.apiKey ?? env.GEMINI_API_KEY;
    this.model = options?.model ?? env.GEMINI_TEXT_MODEL ?? DEFAULT_MODEL;
  }

  async generateText({
    prompt,
    temperature = 0.4,
    model,
    responseSchema,
  }: GeminiRecipeRequest): Promise<string> {
    if (this.useVertexAI) {
      if (!this.vertexProject) {
        throw new GeminiRecipeError('GOOGLE_CLOUD_PROJECT is required for Vertex AI');
      }
    } else if (!this.apiKey) {
      throw new GeminiRecipeError('Gemini API key is not configured');
    }

    if (!prompt?.trim()) {
      throw new GeminiRecipeError('Prompt is required');
    }

    const ai = this.useVertexAI
      ? new GoogleGenAI({
          vertexai: true,
          project: this.vertexProject!,
          location: this.vertexLocation,
        })
      : new GoogleGenAI({
          apiKey: this.apiKey!,
        });

    try {
      const response = await ai.models.generateContent({
        model: model ?? this.model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature,
          responseMimeType: 'application/json',
          ...(responseSchema ? { responseSchema } : {}),
        },
      });

      const candidates = response.candidates ?? [];
      const textPart = candidates
        .flatMap((candidate) => candidate.content?.parts ?? [])
        .find((part): part is { text: string } => 'text' in part && Boolean(part.text));

      if (!textPart?.text) {
        throw new GeminiRecipeError('Gemini response did not include text output');
      }

      return textPart.text;
    } catch (error) {
      log.error({ error }, 'Failed to generate recipe draft');
      if (error instanceof GeminiRecipeError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new GeminiRecipeError(error.message, error);
      }
      throw new GeminiRecipeError('Failed to generate recipe draft', error);
    }
  }
}

export function isGeminiRecipeConfigured() {
  if (env.GEMINI_USE_VERTEX_AI === 'true') {
    return Boolean(env.GOOGLE_CLOUD_PROJECT);
  }
  return Boolean(env.GEMINI_API_KEY);
}
