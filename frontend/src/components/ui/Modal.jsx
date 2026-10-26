import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} border-4 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F] text-black dark:text-[#F8FAFC] shadow-[10px_10px_0px_0px_#000] max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start p-5 border-b-3 border-black dark:border-slate-700 bg-white dark:bg-[#151D2F]">
          <div>
            {subtitle && (
              <span className="bg-neo-yellow border-2 border-black text-black px-2 py-0.5 font-black text-xs uppercase tracking-wider shadow-neo-sm inline-block mb-1.5">
                {subtitle}
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-neo-pink hover:bg-black hover:text-white text-black shadow-neo-sm transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-black dark:text-slate-200">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 border-t-3 border-black dark:border-slate-700 bg-[#FFFDF0] dark:bg-[#0E1524] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
