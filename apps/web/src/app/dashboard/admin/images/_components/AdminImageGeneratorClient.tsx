'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowPathIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { RouterOutputs } from '~/trpc/react';
import { api } from '~/trpc/react';

type GeneratedImage = RouterOutputs['adminImage']['list'][number];

const ASPECT_OPTIONS = [
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Landscape (16:9)', value: '16:9' },
  { label: 'Portrait (4:5)', value: '4:5' },
] as const;

const MODEL_OPTIONS = [
  { label: 'Nano Banana Pro', value: 'gemini-3-pro-image-preview' },
  { label: 'Nano Banana', value: 'gemini-2.5-flash-image' },
] as const;

/** Truncate text for accessible alt attributes (max 125 chars) */
function truncateAltText(text: string, maxLength = 125): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trim() + '…';
}

interface AdminImageGeneratorClientProps {
  initialImages: GeneratedImage[];
  isConfigured: boolean;
}

export default function AdminImageGeneratorClient({
  initialImages,
  isConfigured,
}: AdminImageGeneratorClientProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_OPTIONS)[number]['value']>('1:1');
  const [model, setModel] =
    useState<(typeof MODEL_OPTIONS)[number]['value']>('gemini-2.5-flash-image');
  const [images, setImages] = useState(initialImages);
  const [formError, setFormError] = useState<string | null>(null);

  const utils = api.useUtils();
  const generateMutation = api.adminImage.generate.useMutation({
    onSuccess: (image) => {
      setPrompt('');
      setFormError(null);
      setImages((prev) => [image, ...prev].slice(0, 24));
      void utils.adminImage.list.invalidate();
    },
    onError: (error) => {
      setFormError(error.message || 'Unable to generate image right now');
    },
  });

  const isDisabled = !isConfigured || generateMutation.isPending;

  const subtitle = useMemo(() => {
    if (!isConfigured) {
      return 'Add GEMINI_API_KEY to your environment to unlock this workflow.';
    }
    return 'Use Nano Banana Pro to prototype recipe artwork and marketing assets.';
  }, [isConfigured]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white p-8 shadow-xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            <ShieldCheckIcon className="h-4 w-4" />
            Admin only
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
            <SparklesIcon className="h-4 w-4" />
            Nano Banana Pro
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Image generation pipeline</h1>
        <p className="mt-2 text-base text-gray-600">{subtitle}</p>
      </div>

      <form
        className="mb-10 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          if (!prompt.trim()) {
            setFormError('Enter a descriptive prompt before generating an image.');
            return;
          }
          setFormError(null);
          generateMutation.mutate({ prompt: prompt.trim(), aspectRatio, model });
        }}
      >
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-semibold text-gray-800">
            Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            placeholder="Chef’s table overhead shot of a colourful Mediterranean grain bowl..."
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-gray-300 px-4 py-3 text-base shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={!isConfigured || generateMutation.isPending}
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-8">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Model</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {MODEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setModel(option.value)}
                  disabled={!isConfigured || generateMutation.isPending}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    model === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-600'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Aspect Ratio</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {ASPECT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAspectRatio(option.value)}
                  disabled={!isConfigured || generateMutation.isPending}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    aspectRatio === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-600'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {formError && <p className="mb-4 text-sm font-semibold text-red-600">{formError}</p>}
        {!isConfigured && (
          <p className="mb-4 text-sm text-amber-700">
            Provide <code className="rounded bg-amber-100 px-1">GEMINI_API_KEY</code> in your env
            files to enable this workflow.
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generateMutation.isPending ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Generate image
              </>
            )}
          </button>
        </div>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Recent images</h2>
          <p className="text-sm text-gray-500">Stored locally under /public/generated-images</p>
        </div>
        {images.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-gray-600">
            <PhotoIcon className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-base font-semibold">No images yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Generated artwork will appear here for auditing before we move to blob storage.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {images.map((image) => (
              <figure
                key={image.id}
                className="rounded-3xl border border-gray-100 bg-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
                  <Image
                    src={image.publicUrl}
                    alt={truncateAltText(image.prompt)}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                <figcaption className="space-y-2 px-5 py-4">
                  <p className="text-sm font-semibold text-gray-800">{image.prompt}</p>
                  <div className="text-xs text-gray-500">
                    <p>
                      Model: <span className="font-medium">{image.model}</span>
                    </p>
                    <p>
                      Created{' '}
                      {image.createdAt instanceof Date
                        ? image.createdAt.toLocaleString()
                        : new Date(image.createdAt).toLocaleString()}
                    </p>
                    <p>
                      Size: {(image.fileSize / 1024).toFixed(1)} KB • {image.mimeType}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
