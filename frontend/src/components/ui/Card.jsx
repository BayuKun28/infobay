import React from 'react';

const SHADOWS = {
  sm: 'shadow-neo-sm',
  md: 'shadow-neo',
  lg: 'shadow-neo-lg',
  xl: 'shadow-neo-xl',
};

export default function Card({
  children,
  header,
  headerBg = 'bg-neo-yellow',
  shadow = 'lg',
  hover = true,
  className = '',
  ...props
}) {
  const shadowClass = SHADOWS[shadow] || SHADOWS.lg;

  return (
    <div
      className={`border-4 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] text-black dark:text-[#F8FAFC] overflow-hidden ${shadowClass} ${
        hover ? 'hover:-translate-y-1.5 hover:shadow-neo-xl transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {header && (
        <div className={`p-4 border-b-3 border-black dark:border-slate-700 ${headerBg}`}>
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
