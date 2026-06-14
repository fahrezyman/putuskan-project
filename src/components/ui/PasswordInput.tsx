import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, id, className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold text-sm text-[#1A1A1A]">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`brutal-input px-3 py-2.5 w-full pr-11 ${error ? 'border-red-600' : ''} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333] hover:text-[#1A1A1A] transition-colors text-sm font-bold select-none"
          tabIndex={-1}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {visible ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>
      {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
    </div>
  );
}
