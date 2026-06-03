'use client';

import { cn } from '@/lib/utils';

type EthiopianPhoneInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  hint?: string;
};

export function EthiopianPhoneInput({
  id,
  name,
  value,
  onChange,
  hasError = false,
  hint = '9 digits, starting with 7 or 9',
}: EthiopianPhoneInputProps) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    onChange(digits);
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex h-11 w-full items-stretch overflow-hidden rounded-xl border bg-background shadow-xs transition-[color,box-shadow]',
          hasError
            ? 'border-red-500 focus-within:ring-red-500/20'
            : 'border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        )}
      >
        <div className="flex shrink-0 items-center border-r border-input bg-gray-50 px-3">
          <span className="text-sm font-semibold leading-none text-gray-600">+251</span>
        </div>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={9}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="912345678"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm leading-none outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="px-0.5 text-xs text-gray-500">{hint}</p>
    </div>
  );
}
