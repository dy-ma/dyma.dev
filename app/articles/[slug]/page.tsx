import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArticlePretextDropCap } from '@/components/article-pretext-drop-cap';
import { ArticleBackLink } from '@/components/article-back-link';
import { articles, articlesBySlug } from '@/lib/articles';

const articleShellClassName =
  'mx-auto w-[min(calc(100%_-_40px),900px)] max-[760px]:w-[min(calc(100%_-_28px),100%)]';

function splitOpeningParagraph(markdown: string) {
  const [opening = '', ...rest] = markdown.split(/\n\s*\n/);
  return { opening: opening.trim(), rest: rest.join('\n\n').trim() };
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesBySlug[slug];
  if (!article) return {};

  return {
    title: `${article.headline} — Dylan Mou Ang`,
    description: article.summary,
    robots: article.published ? undefined : { index: false, follow: false },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articlesBySlug[slug];
  if (!article) notFound();
  const { opening, rest } = splitOpeningParagraph(article.body);

  return (
    <main className="article-page">
      <header
        className={`${articleShellClassName} flex flex-col pt-7 pb-[clamp(44px,7vw,72px)]`}
      >
        <ArticleBackLink />
        <p className="mt-[clamp(68px,10vw,118px)] mb-3 text-[0.86rem] tracking-[0.1em] [font-variant:small-caps]">
          {article.project}
        </p>
        <h1 className="text-[clamp(4.5rem,13vw,9rem)] leading-[0.82] font-light tracking-[-0.05em] max-[679px]:font-normal">
          {article.headline}
        </h1>
        {article.date ? (
          <div className="mt-[50px] border-t border-rule pt-3 text-[0.92rem]">
            {article.date}
          </div>
        ) : null}
      </header>
      {article.image ? (
        <figure
          className={`${articleShellClassName} mb-0 pb-[clamp(44px,7vw,80px)]`}
        >
          <Image
            className="block h-auto w-full"
            src={article.image.src}
            width={article.image.width}
            height={article.image.height}
            alt={article.image.alt}
            sizes="(max-width: 940px) calc(100vw - 40px), 900px"
            priority
          />
          {article.image.caption ? (
            <figcaption className="mt-[0.45rem] text-center text-[0.88rem] italic">
              {article.image.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      <article
        className={`${articleShellClassName} columns-1 gap-0 border-t border-rule py-[clamp(80px,12vw,160px)] text-[22px] leading-[1.36] max-[679px]:text-[1.15rem] max-[679px]:leading-[1.5] [&>*]:mx-auto [&>*]:max-w-[680px] [&_p]:[break-inside:avoid] [&_p]:text-justify [&_p]:[text-align-last:auto] [&_p]:[text-justify:inter-word] [&_h2]:mt-[3em] [&_h2]:mb-[0.6em] [&_h2]:text-[clamp(2.5rem,4vw,3.75rem)] [&_h2]:leading-[0.95] [&_h2]:font-light [&_h2]:tracking-[-0.025em] [&_h2]:[break-after:avoid] max-[679px]:[&_h2]:font-normal [&_blockquote]:!my-[3em] [&_blockquote]:!max-w-[820px] [&_blockquote]:border-l [&_blockquote]:border-rule [&_blockquote]:py-[0.35em] [&_blockquote]:pr-0 [&_blockquote]:pl-[1em] [&_blockquote]:text-[1.5em] [&_blockquote]:leading-[1.18] [&_code]:font-mono [&_code]:text-[0.82em] [&_img]:my-[1.25em] [&_img]:block [&_img]:h-auto [&_img]:max-w-full`}
      >
        {opening ? <ArticlePretextDropCap text={opening} /> : null}
        {rest ? <ReactMarkdown>{rest}</ReactMarkdown> : null}
      </article>
    </main>
  );
}
