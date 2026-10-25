import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  yellow: 'bg-neo-yellow text-black hover:bg-yellow-400',
  mint: 'bg-neo-mint text-black hover:bg-emerald-300',
  pink: 'bg-neo-pink text-black hover:bg-rose-300',
  cyan: 'bg-neo-cyan text-black hover:bg-cyan-400',
  lilac: 'bg-neo-lilac text-black hover:bg-purple-300',
  white: 'bg-white text-black hover:bg-gray-100',
  black: 'bg-black text-white hover:bg-gray-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const SIZES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.yellow;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider border-2 border-black shadow-neo-sm transition-all duration-150 select-none ${
        disabled
          ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed shadow-none'
          : `active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo cursor-pointer ${variantClass}`
      } ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 stroke-[2.5]" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
