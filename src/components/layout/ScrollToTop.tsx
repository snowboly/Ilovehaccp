"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      // Second pass for mobile/slower renders
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    };

    resetScroll();
    
    // Fallback for dynamic content loading
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
