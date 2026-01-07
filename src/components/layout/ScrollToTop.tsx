"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // We use a small timeout to ensure the DOM has rendered
    // and to override any browser-level scroll restoration
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as any // Use 'instant' for immediate jump
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
