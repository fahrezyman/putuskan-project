import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-bold text-sm text-[#1A1A1A]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`brutal-input px-3 py-2.5 w-full ${error ? 'border-red-600 focus:shadow-[4px_4px_0px_#dc2626]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
    </div>
  );
}
