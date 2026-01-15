"use client";

import { Info } from 'lucide-react';
import { useState } from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip = ({ text }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2 z-10">
      <button 
        type="button"
        className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling if inside another clickable
            setIsVisible(!isVisible);
        }}
        aria-label="More info"
      >
        <Info className="w-4 h-4" />
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          {text}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
