import React from 'react';

// Using local static assets for maximum reliability and speed.
// Images are stored in /public/team/
const AVATAR_MAP = {
  "Dr. Joao": "/team/joao.svg",
  "Dr. Margarida": "/team/margarida.svg",
  "Dr. Fabio": "/team/fabio.svg",
  "Dr. Claudia": "/team/claudia.svg",
  "Dr. Isabel": "/team/isabel.svg"
};

export const getAvatarUrl = (name: string) => {
  return AVATAR_MAP[name as keyof typeof AVATAR_MAP] || "/team/joao.svg"; // Fallback
};

export const TeamAvatar = ({ name, className }: { name: string, className?: string }) => {
  const url = getAvatarUrl(name);
  return (
    <img 
      src={url} 
      alt={`${name} Avatar`} 
      className={className} 
      loading="lazy"
    />
  );
};
