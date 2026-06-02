'use client';

import Lottie from 'lottie-react';
import emptyFarmsAnimation from '@/public/lotties/empty.json';

interface FarmEmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export default function FarmEmptyState({ message }: FarmEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-[240px] sm:max-w-xs">
        <Lottie animationData={emptyFarmsAnimation} loop autoplay />
      </div>
      <p className="mt-2 max-w-sm text-sm text-black/60">{message}</p>
    </div>
  );
}
