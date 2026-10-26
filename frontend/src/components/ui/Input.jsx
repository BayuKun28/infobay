import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  multiline = false,
  rows = 4,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-black text-xs uppercase tracking-wider text-black dark:text-slate-200"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {multiline ? (
        <textarea
          id={inputId}
          rows={rows}
          required={required}
          className={`w-full p-3 border-2 border-black dark:border-slate-600 bg-white dark:bg-[#0F1626] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 font-semibold text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all ${
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/40' : ''
          } ${className}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full p-3 border-2 border-black dark:border-slate-600 bg-white dark:bg-[#0F1626] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 font-semibold text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all ${
            error ? 'border-red-500 bg-red-50 dark:bg-red-950/40' : ''
          } ${className}`}
          {...props}
        />
      )}

      {error ? (
        <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
