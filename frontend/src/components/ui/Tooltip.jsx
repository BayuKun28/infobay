import React, { useState } from 'react';

export default function Tooltip({ text, children, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div
          role="tooltip"
          className={`absolute z-40 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-black bg-neo-yellow border-2 border-black shadow-neo-sm whitespace-nowrap pointer-events-none ${
            positions[position] || positions.top
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
