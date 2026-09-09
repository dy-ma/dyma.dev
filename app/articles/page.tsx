import type { Metadata } from 'next';
import Link from 'next/link';
import { NewspaperStory } from '@/components/newspaper-story';
import { publishedArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'All articles — Dylan Mou Ang',
  description: 'Notes from Dylan Mou Ang’s recent work.',
};

export default function ArticlesPage() {
  return (
    <main className="mx-auto w-[min(calc(100%_-_48px),1040px)] pt-6 pb-14 max-[760px]:w-[min(calc(100%_-_28px),100%)]">
      <nav className="text-[0.95rem]" aria-label="Article navigation">
        <Link
          className="underline-offset-[0.17em] focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-ink"
          href="/#work"
        >
          ← Front page
        </Link>
      </nav>

      <header className="mt-[clamp(42px,7vw,82px)] border-y-4 border-double border-ink py-[clamp(20px,3vw,34px)] text-center">
        <p className="my-[0.55rem] text-[0.9rem] italic">The complete index</p>
        <h1 className="text-[clamp(4.2rem,10vw,8.6rem)] leading-[0.82] font-light tracking-[-0.055em] max-[760px]:font-normal">
          All articles
        </h1>
      </header>

      <div className="grid grid-cols-12 border-b-4 border-double border-ink max-[540px]:block">
        {publishedArticles.map((article, index) => (
          <NewspaperStory
            key={article.slug}
            article={article}
            context="archive"
            index={index}
            total={publishedArticles.length}
            returnTo="/articles"
            returnLabel="← Back"
          />
        ))}
      </div>
    </main>
  );
}
