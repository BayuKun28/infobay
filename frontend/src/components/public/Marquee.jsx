import React from 'react';
import { Sparkles, Terminal, Flame, Zap, ShieldCheck, Code2, Cpu, Server } from 'lucide-react';

export default function Marquee({ items }) {
  const defaultItems = [
    { text: "FULL-STACK WEB & MOBILE DEVELOPER", icon: <Terminal className="w-4 h-4" /> },
    { text: "REACTJS & NEXT.JS SPECIALIST", icon: <Zap className="w-4 h-4" /> },
    { text: "LARAVEL & REST API ARCHITECTURE", icon: <Flame className="w-4 h-4" /> },
    { text: "POSTGRESQL & ENTERPRISE DB", icon: <ShieldCheck className="w-4 h-4" /> },
    { text: "AUTHENTIC NEUBRUTALISM DESIGN", icon: <Sparkles className="w-4 h-4" /> },
    { text: "7+ YEARS EXPERIENCE", icon: <Code2 className="w-4 h-4" /> },
  ];

  const iconPool = [
    <Terminal className="w-4 h-4" />,
    <Zap className="w-4 h-4" />,
    <Flame className="w-4 h-4" />,
    <ShieldCheck className="w-4 h-4" />,
    <Sparkles className="w-4 h-4" />,
    <Code2 className="w-4 h-4" />,
    <Cpu className="w-4 h-4" />,
    <Server className="w-4 h-4" />
  ];

  let displayItems = defaultItems;

  if (Array.isArray(items) && items.length > 0) {
    displayItems = items.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          text: item,
          icon: iconPool[idx % iconPool.length],
        };
      }
      if (typeof item === 'object' && item !== null) {
        return {
          text: item.text || item.title || item.name || '',
          icon: item.icon || iconPool[idx % iconPool.length],
        };
      }
      return {
        text: String(item),
        icon: iconPool[idx % iconPool.length],
      };
    }).filter(i => Boolean(i.text));
  }

  // Ensure enough items for seamless infinite marquee loop
  const repeatedItems = [...displayItems, ...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="bg-neo-yellow border-y-4 border-black py-2.5 overflow-hidden font-black text-xs sm:text-sm tracking-wider select-none relative z-10">
      <div className="flex w-max animate-marquee gap-8">
        {repeatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
            <span className="p-1 bg-black text-white border border-black shadow-neo-sm">
              {item.icon}
            </span>
            <span className="uppercase text-black font-extrabold whitespace-nowrap">{item.text}</span>
            <span className="text-black font-black mx-2 select-none">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
