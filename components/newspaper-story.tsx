import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Article } from '@/lib/articles';
import { cn } from '@/lib/utils';

const subheadClassName =
  'text-[0.8rem] tracking-[0.035em] [font-variant:small-caps]';

const previewComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <p className={subheadClassName}>{children}</p>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <p className={subheadClassName}>{children}</p>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <p className={subheadClassName}>{children}</p>
  ),
  a: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  img: () => null,
};

const archiveShapes = ['wide', 'narrow', 'half', 'half', 'narrow', 'wide'];

export function NewspaperStory({
  article,
  context = 'home',
  index = 0,
  total = 0,
  returnTo,
  returnLabel,
}: {
  article: Article;
  context?: 'home' | 'archive';
  index?: number;
  total?: number;
  returnTo?: string;
  returnLabel?: string;
}) {
  const placement = article.home === 'lead' ? 'lead' : 'secondary';
  const isArchive = context === 'archive';
  const isTrailingSingleton =
    isArchive && total % 2 === 1 && index === total - 1;
  const archiveShape = isTrailingSingleton
    ? 'full'
    : archiveShapes[index % archiveShapes.length];
  const previousArchiveShape =
    index > 0 ? archiveShapes[(index - 1) % archiveShapes.length] : null;
  const lastArchiveRowStart = Math.max(0, total - (total % 2 === 0 ? 2 : 1));
  const hasArchiveBottomBorder = index < lastArchiveRowStart;
  const hasArchiveLeftBorder =
    archiveShape === 'narrow' ||
    (archiveShape === 'half' && previousArchiveShape === 'half') ||
    (archiveShape === 'wide' && previousArchiveShape === 'narrow');
  const className = cn(
    'group flex min-w-0 flex-col text-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-ink',
    isArchive
      ? 'p-[clamp(22px,3vw,34px)] max-[540px]:block max-[540px]:border-l-0 max-[540px]:px-0 max-[540px]:py-6'
      : 'p-[clamp(20px,2.5vw,30px)] max-[540px]:border-r-0 max-[540px]:border-t-0 max-[540px]:px-0 max-[540px]:py-[22px]',
    isArchive && archiveShape === 'wide' && 'col-span-7',
    isArchive && archiveShape === 'narrow' && 'col-span-5',
    isArchive && archiveShape === 'half' && 'col-span-6',
    isArchive && archiveShape === 'full' && 'col-span-12',
    isArchive &&
      hasArchiveBottomBorder &&
      'border-b border-rule max-[540px]:border-b-0',
    isArchive &&
      index < total - 1 &&
      'max-[540px]:border-b max-[540px]:border-rule',
    isArchive && hasArchiveLeftBorder && 'border-l border-ink',
    !isArchive &&
      placement === 'lead' &&
      'col-start-1 row-span-2 row-start-1 border-r border-ink pl-0',
    !isArchive && placement === 'secondary' && 'col-start-2 pr-0',
    !isArchive &&
      placement === 'secondary' &&
      index > 1 &&
      'border-t border-ink',
    !isArchive && index > 0 && 'max-[540px]:border-t max-[540px]:border-ink',
  );
  const returnParams = new URLSearchParams();

  if (returnTo) {
    returnParams.set('returnTo', returnTo);
  }

  if (returnLabel) {
    returnParams.set('returnLabel', returnLabel);
  }

  const href = returnParams.size
    ? `/articles/${article.slug}?${returnParams.toString()}`
    : `/articles/${article.slug}`;

  const Headline = isArchive ? 'h2' : 'h3';
  const showImage =
    Boolean(article.image) && (isArchive || placement === 'lead');

  return (
    <Link
      href={href}
      className={className}
      aria-label={`Read ${article.headline}`}
    >
      <header className="contents">
        <p className="mb-[0.65rem] flex justify-between gap-4 text-[0.82rem] leading-none tracking-[0.08em] [font-variant:small-caps]">
          <span>{article.project}</span>
          {article.date ? <span>{article.date}</span> : null}
        </p>
        <Headline
          className={cn(
            'leading-[0.9] font-normal tracking-[-0.04em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.08em] group-focus-visible:underline group-focus-visible:decoration-1 group-focus-visible:underline-offset-[0.08em]',
            isArchive
              ? archiveShape === 'narrow'
                ? 'text-[clamp(2.35rem,4vw,3.8rem)] max-[540px]:text-[clamp(2.55rem,13vw,3.8rem)]'
                : 'text-[clamp(2.7rem,5vw,5rem)] max-[540px]:text-[clamp(2.55rem,13vw,3.8rem)]'
              : placement === 'lead'
                ? 'text-[clamp(3rem,6vw,5.6rem)] max-[540px]:text-[clamp(2.55rem,13vw,3.8rem)]'
                : 'text-[clamp(2rem,3.8vw,3.35rem)] max-[540px]:text-[clamp(2.55rem,13vw,3.8rem)]',
          )}
        >
          {article.headline}
        </Headline>
      </header>

      {showImage && article.image ? (
        <figure className="mt-[1.15rem] mb-4 border-b border-rule pb-[0.55rem]">
          <Image
            className="block h-auto w-full contrast-[1.08]"
            src={article.image.src}
            width={article.image.width}
            height={article.image.height}
            alt={article.image.alt}
            sizes={
              isArchive
                ? '(max-width: 540px) calc(100vw - 28px), (max-width: 1100px) 60vw, 620px'
                : '(max-width: 540px) calc(100vw - 28px), (max-width: 1100px) 62vw, 680px'
            }
          />
          {article.image.caption ? (
            <figcaption className="mt-[0.35rem] text-[0.64rem] leading-[1.15] italic">
              {article.image.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div
        className={cn(
          'mt-4 text-justify text-base leading-[1.25] [text-justify:inter-word] [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:mb-[0.85em] [&_p]:[break-inside:avoid] [&_p:first-child::first-letter]:float-left [&_p:first-child::first-letter]:mt-[0.045em] [&_p:first-child::first-letter]:mr-[0.08em] [&_p:first-child::first-letter]:text-[3.35em] [&_p:first-child::first-letter]:leading-[0.72]',
          isArchive &&
            "relative max-h-52 overflow-hidden after:absolute after:right-0 after:bottom-0 after:h-[2.8rem] after:w-full after:bg-[linear-gradient(to_bottom,transparent,#fff_82%)] after:content-['']",
          isArchive &&
            archiveShape === 'full' &&
            'columns-2 gap-[clamp(20px,3vw,34px)] max-[540px]:columns-1',
          !isArchive &&
            article.homeTreatment === 'full' &&
            "relative max-h-[18rem] columns-2 gap-[clamp(20px,3vw,34px)] overflow-hidden [column-rule:none] after:absolute after:right-0 after:bottom-0 after:h-[3.2rem] after:w-full after:bg-[linear-gradient(to_bottom,transparent,#fff_82%)] after:content-[''] max-[540px]:max-h-[13.5rem] max-[540px]:columns-1",
          !isArchive &&
            article.homeTreatment === 'excerpt' &&
            "relative max-h-[15.1rem] overflow-hidden [column-rule:1px_solid_rgb(17_17_17_/_42%)] after:absolute after:right-0 after:bottom-0 after:h-[2.8rem] after:w-full after:bg-[linear-gradient(to_bottom,transparent,#fff_82%)] after:content-[''] max-[540px]:max-h-48",
        )}
      >
        <ReactMarkdown components={previewComponents} skipHtml>
          {article.body}
        </ReactMarkdown>
      </div>

      <span
        className={cn(
          'self-end pt-4 text-[0.86rem] italic',
          isArchive && 'mt-auto',
        )}
        aria-hidden="true"
      >
        {isArchive
          ? 'Read article'
          : article.homeTreatment === 'full'
            ? 'Open article'
            : 'Continued'}{' '}
        →
      </span>
    </Link>
  );
}
