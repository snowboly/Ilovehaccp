import React from 'react';

const AVATAR_BASE_URL = "https://api.dicebear.com/9.x/avataaars/svg";

const PROPS = {
  "Dr. Joao": {
    avatarStyle: 'Circle',
    topType: 'ShortHairShortFlat',
    accessoriesType: 'Blank',
    hairColor: 'Black',
    facialHairType: 'BeardLight',
    facialHairColor: 'Black',
    clotheType: 'BlazerShirt',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  },
  "Dr. Margarida": {
    avatarStyle: 'Circle',
    topType: 'LongHairStraight',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    clotheType: 'BlazerShirt',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  },
  "Dr. Fabio": {
    avatarStyle: 'Circle',
    topType: 'ShortHairDreads01',
    accessoriesType: 'Blank',
    hairColor: 'Brown',
    facialHairType: 'BeardMedium',
    facialHairColor: 'BrownDark',
    clotheType: 'ShirtVNeck',
    clotheColor: 'Heather',
    eyeType: 'Happy',
    eyebrowType: 'RaisedExcitedNatural',
    mouthType: 'Twinkle',
    skinColor: 'Light'
  },
  "Dr. Claudia": {
    avatarStyle: 'Circle',
    topType: 'LongHairNotTooLong',
    accessoriesType: 'Wayfarers',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    clotheType: 'ShirtCrewNeck',
    clotheColor: 'White',
    eyeType: 'Close',
    eyebrowType: 'RaisedExcitedNatural',
    mouthType: 'Default',
    skinColor: 'Light'
  },
  "Dr. Isabel": {
    avatarStyle: 'Circle',
    topType: 'LongHairStraightStrand',
    accessoriesType: 'Blank',
    hairColor: 'BlondeGolden',
    facialHairType: 'Blank',
    clotheType: 'ShirtCrewNeck',
    clotheColor: 'PastelBlue',
    eyeType: 'Happy',
    eyebrowType: 'DefaultNatural',
    mouthType: 'Smile',
    skinColor: 'Light'
  }
};

export const getAvatarUrl = (name: string) => {
  const props = PROPS[name as keyof typeof PROPS];
  if (!props) return `${AVATAR_BASE_URL}?seed=${name}`;
  
  const params = new URLSearchParams(props as any);
  return `${AVATAR_BASE_URL}?${params.toString()}`;
};

export const TeamAvatar = ({ name, className }: { name: string, className?: string }) => {
  const url = getAvatarUrl(name);
  // Using standard img for SVG compatibility and simplicity across Next.js versions
  return <img src={url} alt={name} className={className} />;
};