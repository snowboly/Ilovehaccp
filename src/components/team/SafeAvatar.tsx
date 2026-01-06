'use client';

import dynamic from 'next/dynamic';

const DynamicTeamAvatar = dynamic(
  () => import('./TeamAvatars').then((mod) => mod.TeamAvatar),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-full" />
  }
);

export default function SafeAvatar({ name }: { name: string }) {
  return <DynamicTeamAvatar name={name} />;
}
