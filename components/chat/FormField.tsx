'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconName = 'user' | 'phone' | 'mail';

const icons = {
  user: User,
  phone: Phone,
  mail: Mail,
};

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  icon: IconName;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
}

export function FormField({
  label,
  icon,
  value,
  onChange,
  error,
  hint,
  id,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
  ...rest
}: FormFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const Icon = icons[icon];
  const showError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-[10.5px] font-semibold uppercase tracking-wider text-bosque-500"
      >
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 transition-all',
          showError
            ? 'border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]'
            : focused
            ? 'border-bosque-500 shadow-[0_0_0_4px_rgba(51,102,77,0.12)]'
            : 'border-bosque-100'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            showError
              ? 'text-red-500'
              : focused
              ? 'text-bosque-700'
              : 'text-bosque-300'
          )}
          aria-hidden="true"
        />
        <input
          {...rest}
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={showError || undefined}
          aria-describedby={error || hint ? `${inputId}-hint` : undefined}
          className={cn(
            'flex-1 border-0 bg-transparent text-sm text-bosque-900 placeholder:text-bosque-300',
            'focus:outline-none focus:ring-0'
          )}
        />
      </div>
      {(error || hint) && (
        <p
          id={`${inputId}-hint`}
          className={cn(
            'text-[11px] leading-tight',
            showError ? 'text-red-600' : 'text-bosque-400'
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
