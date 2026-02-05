'use client';

interface ArticleHeroProps {
  image?: string;
  title: string;
  layout: 'mobile' | 'desktop';
}

export function ArticleHero({ image, title, layout }: ArticleHeroProps) {
  if (!image) return null;

  if (layout === 'mobile') {
    return (
      <figure className="mb-6 lg:hidden">
        <img src={image} alt={title} className="w-full rounded-xl shadow-sm" />
      </figure>
    );
  }

  return (
    <div className="hidden lg:block rounded-xl overflow-hidden shadow-sm">
      <img src={image} alt={title} className="w-full" />
    </div>
  );
}
