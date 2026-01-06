'use client';

import Avatar from 'avataaars';

export const JoaoAvatar = () => (
  <Avatar
    avatarStyle='Circle'
    topType='ShortHairShortFlat'
    accessoriesType='Blank'
    hairColor='Black'
    facialHairType='BeardLight'
    facialHairColor='Black'
    clotheType='BlazerShirt'
    eyeType='Default'
    eyebrowType='Default'
    mouthType='Default'
    skinColor='Light'
  />
);

export const MargaridaAvatar = () => (
  <Avatar
    avatarStyle='Circle'
    topType='LongHairStraight'
    accessoriesType='Blank'
    hairColor='BrownDark'
    facialHairType='Blank'
    clotheType='BlazerShirt'
    eyeType='Default'
    eyebrowType='Default'
    mouthType='Default'
    skinColor='Light'
  />
);

export const FabioAvatar = () => (
  <Avatar
    avatarStyle='Circle'
    topType='ShortHairDreads01'
    accessoriesType='Blank'
    hairColor='Brown'
    facialHairType='BeardMedium'
    facialHairColor='BrownDark'
    clotheType='ShirtVNeck'
    clotheColor='Heather'
    eyeType='Happy'
    eyebrowType='RaisedExcitedNatural'
    mouthType='Twinkle'
    skinColor='Light'
  />
);

export const ClaudiaAvatar = () => (
  <Avatar
    avatarStyle='Circle'
    topType='LongHairNotTooLong'
    accessoriesType='Wayfarers'
    hairColor='BrownDark'
    facialHairType='Blank'
    clotheType='ShirtCrewNeck'
    clotheColor='White'
    eyeType='Close'
    eyebrowType='RaisedExcitedNatural'
    mouthType='Default'
    skinColor='Light'
  />
);

export const IsabelAvatar = () => (
  <Avatar
    avatarStyle='Circle'
    topType='LongHairStraightStrand'
    accessoriesType='Blank'
    hairColor='BlondeGolden'
    facialHairType='Blank'
    clotheType='ShirtCrewNeck'
    clotheColor='PastelBlue'
    eyeType='Happy'
    eyebrowType='DefaultNatural'
    mouthType='Smile'
    skinColor='Light'
  />
);

export const TeamAvatar = ({ name }: { name: string }) => {
  switch (name) {
    case 'Dr. Joao': return <JoaoAvatar />;
    case 'Dr. Margarida': return <MargaridaAvatar />;
    case 'Dr. Fabio': return <FabioAvatar />;
    case 'Dr. Claudia': return <ClaudiaAvatar />;
    case 'Dr. Isabel': return <IsabelAvatar />;
    default: return null;
  }
};
