import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export default function Card({ accent = false, className = '', children, ...props }: Props) {
  return (
    <div
      className={`brutal-card p-6 transition-all duration-100 ${accent ? 'brutal-shadow-accent' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
