'use client';

import { useEffect, useState } from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  stepKey: string;
}

export default function StepTransition({ children, stepKey }: StepTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset visibility when step changes
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [stepKey]);

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
