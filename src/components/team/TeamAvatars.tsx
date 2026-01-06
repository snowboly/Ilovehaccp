import React from 'react';

// Using direct URLs provided by the user for exact visual control.
const AVATAR_MAP = {
  "Dr. Joao": "/team/joao.svg", // Keeping local for now until new URL provided
  "Dr. Margarida": "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
  "Dr. Fabio": "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Prescription02&hairColor=Brown&facialHairType=BeardMajestic&facialHairColor=Black&clotheType=ShirtCrewNeck&clotheColor=Blue03&graphicType=Bear&eyeType=Default&eyebrowType=AngryNatural&mouthType=Tongue&skinColor=Tanned",
  "Dr. Claudia": "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=Overall&clotheColor=PastelOrange&eyeType=Happy&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Yellow",
  "Dr. Isabel": "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=BlondeGolden&facialHairType=Blank&clotheType=CollarSweater&clotheColor=PastelOrange&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Yellow"
};

export const getAvatarUrl = (name: string) => {
  return AVATAR_MAP[name as keyof typeof AVATAR_MAP] || "/team/joao.svg"; 
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