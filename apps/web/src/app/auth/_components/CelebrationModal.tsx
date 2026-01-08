'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CelebrationModalProps {
  userName: string;
  tier: 'basic' | 'premium';
}

export default function CelebrationModal({ userName, tier }: CelebrationModalProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{ id: number; left: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    // Show modal with delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Generate confetti pieces
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
    }));
    setConfettiPieces(pieces);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const keyFeatures =
    tier === 'premium'
      ? [
          { icon: '📅', text: 'Generate 7-day meal plans' },
          { icon: '🎯', text: 'Advanced dietary filters' },
          { icon: '📊', text: 'Premium shopping list exports' },
          { icon: '💰', text: 'Budget estimates by store' },
        ]
      : [
          { icon: '📅', text: 'Create 3-day meal plans' },
          { icon: '🛒', text: 'Generate shopping lists' },
          { icon: '🍽️', text: 'Browse recipe collection' },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-modal-title"
    >
      {/* Confetti animation */}
      <div aria-hidden="true">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="pointer-events-none absolute top-0 h-3 w-3 animate-confetti"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][
                piece.id % 5
              ],
            }}
          />
        ))}
      </div>

      {/* Modal content */}
      <div
        className={`relative w-full max-w-lg transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Success icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 animate-bounce-subtle">
            <svg
              className="h-10 w-10 text-emerald-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 id="celebration-modal-title" className="text-center text-3xl font-bold text-gray-900">
          Welcome to MealMind{tier === 'premium' ? ' Premium' : ''}!
        </h2>

        {/* Personalized message */}
        <p className="mt-3 text-center text-lg text-gray-700">
          Great to have you here, <span className="font-semibold text-emerald-700">{userName}</span>
          !
        </p>

        {tier === 'premium' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Your premium account is active and ready to use.
          </p>
        )}

        {/* Key features */}
        <div className="mt-8 space-y-3">
          <p className="text-center text-sm font-semibold text-gray-900">
            Here&apos;s what you can do now:
          </p>
          <div className="grid gap-3">
            {keyFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 transition-all duration-300"
                style={{
                  animation: `slide-in-bottom 0.4s ease-out ${0.2 + idx * 0.1}s both`,
                }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-800">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleGetStarted}
            className="w-full rounded-lg bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95"
          >
            Create your first meal plan
          </button>
          <p className="text-center text-xs text-gray-500">
            We&apos;ll guide you through the process step by step
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slide-in-bottom {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti forwards;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
