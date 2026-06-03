'use client';

import {
  evaluatePasswordStrength,
  passwordStrengthLabel,
  type PasswordStrength,
} from '@/lib/password-strength';
import { cn } from '@/lib/utils';

function barColor(strength: PasswordStrength, index: number): string {
  switch (strength) {
    case 'none':
      return 'bg-gray-200';
    case 'weak':
      return index === 0 ? 'bg-red-500' : 'bg-gray-200';
    case 'medium':
      return index <= 1 ? 'bg-amber-500' : 'bg-gray-200';
    case 'strong':
      return 'bg-green-600';
  }
}

function labelColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'strong':
      return 'text-green-700';
    case 'medium':
      return 'text-amber-700';
    case 'weak':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = evaluatePasswordStrength(password);

  if (strength === 'none') return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              barColor(strength, index),
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', labelColor(strength))}>
        {passwordStrengthLabel(strength)}
      </p>
    </div>
  );
}
