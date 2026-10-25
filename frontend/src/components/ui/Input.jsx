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
          className="block font-black text-xs uppercase tracking-wider text-black"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {multiline ? (
        <textarea
          id={inputId}
          rows={rows}
          required={required}
          className={`w-full p-3 border-2 border-black bg-white text-black font-semibold text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all ${
            error ? 'border-red-500 bg-red-50' : ''
          } ${className}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full p-3 border-2 border-black bg-white text-black font-semibold text-sm shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all ${
            error ? 'border-red-500 bg-red-50' : ''
          } ${className}`}
          {...props}
        />
      )}

      {error ? (
        <p className="text-xs font-bold text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs font-semibold text-gray-600 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
