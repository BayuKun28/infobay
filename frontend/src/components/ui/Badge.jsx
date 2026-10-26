import React from 'react';

const VARIANTS = {
  yellow: 'bg-neo-yellow text-black',
  mint: 'bg-neo-mint text-black',
  pink: 'bg-neo-pink text-black',
  cyan: 'bg-neo-cyan text-black',
  lilac: 'bg-neo-lilac text-black',
  white: 'bg-white dark:bg-[#1E293B] text-black dark:text-white',
  black: 'bg-black text-white',
};

export default function Badge({
  children,
  variant = 'yellow',
  dot = false,
  dotColor = 'bg-green-500',
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.yellow;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-neo-sm ${variantClass} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-none border border-black ${dotColor} animate-pulse`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 stroke-[2.5]" />}
      <span>{children}</span>
    </span>
  );
}
