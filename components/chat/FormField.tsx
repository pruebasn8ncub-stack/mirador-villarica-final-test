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
  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className="group flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className={cn(
          'px-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] transition-colors duration-200',
          showError
            ? 'text-red-500'
            : isActive
            ? 'text-bosque-700'
            : 'text-bosque-400'
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-center gap-2.5 rounded-xl border bg-white/95 px-3.5 py-[11px] transition-all duration-200',
          'backdrop-blur-sm',
          showError
            ? 'border-red-300 shadow-[0_0_0_4px_rgba(248,113,113,0.12),0_1px_2px_rgba(26,61,46,0.04)]'
            : focused
            ? 'border-bosque-600 shadow-[0_0_0_4px_rgba(51,102,77,0.14),0_1px_2px_rgba(26,61,46,0.04)]'
            : 'border-bosque-100/80 shadow-[0_1px_2px_rgba(26,61,46,0.03)] group-hover:border-bosque-200'
        )}
      >
        {/* Accent lateral que aparece en focus — detalle boutique */}
        <span
          aria-hidden
          className={cn(
            'absolute left-0 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-mostaza transition-all duration-300',
            isActive && !showError ? 'opacity-100' : 'opacity-0'
          )}
        />
        <Icon
          className={cn(
            'h-[17px] w-[17px] shrink-0 transition-all duration-200',
            showError
              ? 'text-red-500'
              : focused
              ? 'text-bosque-700'
              : hasValue
              ? 'text-bosque-500'
              : 'text-bosque-300'
          )}
          strokeWidth={focused ? 2.25 : 2}
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
            'flex-1 border-0 bg-transparent text-[14px] font-medium tracking-[-0.005em] text-bosque-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-bosque-300',
            'focus:outline-none focus:ring-0'
          )}
        />
      </div>
      {(error || hint) && (
        <p
          id={`${inputId}-hint`}
          className={cn(
            'px-0.5 text-[11px] leading-tight',
            showError ? 'font-medium text-red-600' : 'text-bosque-400'
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
