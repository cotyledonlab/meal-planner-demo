import { useId } from 'react';
import { cn } from '~/lib/utils';

interface DecorativeProps {
  className?: string;
}

// Hand-drawn style carrot illustration
export function CarrotIllustration({ className }: DecorativeProps) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-20 h-[7.5rem]', className)}
      aria-hidden="true"
    >
      {/* Carrot body - organic shape */}
      <path
        d="M40 20 C55 25, 58 45, 55 70 C52 95, 45 110, 40 115 C35 110, 28 95, 25 70 C22 45, 25 25, 40 20Z"
        fill={`url(#carrot-gradient-${gradientId})`}
        stroke="#C2410C"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-draw-line"
      />
      {/* Carrot lines */}
      <path
        d="M32 40 Q40 42, 48 40"
        stroke="#C2410C"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M30 55 Q40 58, 50 55"
        stroke="#C2410C"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M32 70 Q40 73, 48 70"
        stroke="#C2410C"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Leafy top */}
      <path
        d="M40 20 C35 15, 25 5, 20 8 C25 12, 30 18, 40 20"
        fill="#059669"
        stroke="#047857"
        strokeWidth="1.5"
      />
      <path
        d="M40 20 C40 12, 38 2, 40 0 C42 2, 40 12, 40 20"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="1.5"
      />
      <path
        d="M40 20 C45 15, 55 5, 60 8 C55 12, 50 18, 40 20"
        fill="#059669"
        stroke="#047857"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient
          id={`carrot-gradient-${gradientId}`}
          x1="40"
          y1="20"
          x2="40"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Hand-drawn style tomato illustration
export function TomatoIllustration({ className }: DecorativeProps) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-24 h-24', className)}
      aria-hidden="true"
    >
      {/* Tomato body */}
      <ellipse
        cx="50"
        cy="55"
        rx="38"
        ry="35"
        fill={`url(#tomato-gradient-${gradientId})`}
        stroke="#B91C1C"
        strokeWidth="2"
      />
      {/* Highlight */}
      <ellipse cx="35" cy="45" rx="10" ry="8" fill="white" opacity="0.3" />
      {/* Stem */}
      <path d="M50 20 L50 28" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <path
        d="M50 25 C40 20, 30 22, 28 28 C35 26, 42 25, 50 25"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="1.5"
      />
      <path
        d="M50 25 C60 20, 70 22, 72 28 C65 26, 58 25, 50 25"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="1.5"
      />
      <path
        d="M50 25 C45 18, 42 10, 45 8 C50 12, 50 20, 50 25"
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth="1.5"
      />
      <path
        d="M50 25 C55 18, 58 10, 55 8 C50 12, 50 20, 50 25"
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth="1.5"
      />
      <defs>
        <radialGradient id={`tomato-gradient-${gradientId}`} cx="0.4" cy="0.4" r="0.6">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Hand-drawn style herb/basil leaf
export function HerbIllustration({ className }: DecorativeProps) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-[3.75rem] h-20', className)}
      aria-hidden="true"
    >
      {/* Main leaf */}
      <path
        d="M30 75 C30 60, 10 45, 15 25 C20 10, 30 5, 30 5 C30 5, 40 10, 45 25 C50 45, 30 60, 30 75Z"
        fill={`url(#herb-gradient-${gradientId})`}
        stroke="#15803D"
        strokeWidth="2"
      />
      {/* Leaf veins */}
      <path d="M30 10 L30 70" stroke="#15803D" strokeWidth="1.5" opacity="0.5" />
      <path d="M30 25 C25 30, 20 32, 18 30" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <path d="M30 25 C35 30, 40 32, 42 30" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <path d="M30 40 C24 45, 18 47, 16 45" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <path d="M30 40 C36 45, 42 47, 44 45" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <path d="M30 55 C26 58, 22 59, 21 57" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <path d="M30 55 C34 58, 38 59, 39 57" stroke="#15803D" strokeWidth="1" opacity="0.4" />
      <defs>
        <linearGradient
          id={`herb-gradient-${gradientId}`}
          x1="30"
          y1="5"
          x2="30"
          y2="75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4ADE80" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Decorative squiggle line
export function SquiggleDivider({ className }: DecorativeProps) {
  return (
    <svg
      viewBox="0 0 200 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-5', className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 10 Q25 0, 50 10 T100 10 T150 10 T200 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

// Decorative dots pattern
export function DotPattern({ className }: DecorativeProps) {
  const patternId = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      <pattern
        id={`dots-${patternId}`}
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.15" />
      </pattern>
      <rect width="100%" height="100%" fill={`url(#dots-${patternId})`} />
    </svg>
  );
}

// Organic blob background shape
export function BlobShape({
  className,
  variant = 'primary',
}: DecorativeProps & { variant?: 'primary' | 'secondary' | 'accent' }) {
  const gradientId = useId();
  const colors = {
    primary: ['#10B981', '#059669'],
    secondary: ['#F59E0B', '#D97706'],
    accent: ['#8B5CF6', '#7C3AED'],
  };

  const [start, end] = colors[variant];

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    >
      <path
        d="M45.3,-51.2C58.3,-40.7,68.3,-25.1,71.4,-7.8C74.5,9.5,70.6,28.5,60.1,42.4C49.6,56.3,32.5,65.1,14.1,68.8C-4.3,72.5,-23.9,71.2,-40.6,62.5C-57.2,53.9,-70.8,38,-75.1,20.1C-79.4,2.2,-74.3,-17.6,-63.4,-32.4C-52.5,-47.2,-35.7,-57,-18.8,-63.4C-1.9,-69.8,15.2,-72.8,31.6,-67.2C48,-61.6,63.7,-47.4,45.3,-51.2Z"
        transform="translate(100 100)"
        fill={`url(#blob-${variant}-${gradientId})`}
        opacity="0.1"
      />
      <defs>
        <linearGradient id={`blob-${variant}-${gradientId}`} x1="0" y1="0" x2="200" y2="200">
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Hand-drawn underline
export function HandDrawnUnderline({ className }: DecorativeProps) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-3', className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M2 8 Q30 2, 60 7 T120 6 T180 8 T198 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Kitchen utensil - spoon
export function SpoonIllustration({ className }: DecorativeProps) {
  return (
    <svg
      viewBox="0 0 30 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-8 h-[7.5rem]', className)}
      aria-hidden="true"
    >
      <ellipse cx="15" cy="20" rx="12" ry="18" fill="#D4D4D8" stroke="#A1A1AA" strokeWidth="2" />
      <ellipse cx="15" cy="18" rx="8" ry="12" fill="#E4E4E7" opacity="0.5" />
      <rect
        x="12"
        y="35"
        width="6"
        height="80"
        rx="3"
        fill="#D4D4D8"
        stroke="#A1A1AA"
        strokeWidth="2"
      />
    </svg>
  );
}

// Decorative wave divider for section breaks
export function WaveDivider({ className, flip = false }: DecorativeProps & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full', flip && 'rotate-180', className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
        fill="currentColor"
      />
    </svg>
  );
}
