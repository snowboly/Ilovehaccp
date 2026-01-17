"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isBuilder = pathname?.startsWith('/builder');

  if (isBuilder) return null;

  return <Footer />;
}
