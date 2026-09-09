import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';
import { NewspaperStory } from '@/components/newspaper-story';
import { BodyText } from '@/components/body-text';
import { SiteSection } from '@/components/site-section';
import { VisitorCounter } from '@/components/visitor-counter';
import { homeArticles } from '@/lib/articles';
import { readVisitorCookie, VISITOR_COOKIE_NAME } from '@/lib/visitor-cookie';

const introduction =
  'ey, I’m Dylan, a software engineer working on infrastructure at Aina. I work on software systems and the tools used to run them. Most of my work is concerned with how services are deployed, observed, and kept working as they change. This page is a record of some of that work. The notes below offer brief accounts of Drop, Fabric, and Redthing. I design and operate infrastructure, I care about making systems understandable, and I am usually working somewhere between the application and the machines underneath it.';

export default async function Home() {
  const cookieStore = await cookies();
  const secret =
    env.VISITOR_COOKIE_SECRET || 'local-preview-secret-change-in-production';
  const visitor = await readVisitorCookie(
    cookieStore.get(VISITOR_COOKIE_NAME)?.value,
    secret,
  );

  return (
    <main>
      <SiteSection
        as="article"
        className="mx-auto min-h-svh w-[min(calc(100%_-_48px),1040px)] pt-[clamp(44px,7vw,88px)] pb-[clamp(46px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_28px),100%)] max-[760px]:pt-10"
      >
        <VisitorCounter
          initialReturning={visitor !== null}
          initialVisitorNumber={visitor?.visitorNumber ?? null}
        />

        <figure className="mx-auto mt-[clamp(48px,7vw,78px)] w-[min(92%,820px)] max-[760px]:w-full">
          <Image
            className="block h-auto w-full"
            src="/images/pig-field.png"
            width={900}
            height={600}
            alt="A pig sitting in an open field, facing away toward the horizon."
            sizes="(max-width: 760px) calc(100vw - 28px), 820px"
            priority
          />
          <figcaption className="mt-2 text-center text-xs italic">
            Fig. 1
          </figcaption>
        </figure>

        <div id="about">
          <BodyText lead="H" text={introduction} columns={2} />
        </div>
      </SiteSection>

      <div
        className="mx-auto mt-[clamp(0.9rem,2vw,1.8rem)] mb-[clamp(1rem,2.2vw,2rem)] w-[min(calc(100%_-_48px),1040px)] border-t border-rule max-[760px]:w-[min(calc(100%_-_28px),100%)]"
        aria-hidden="true"
      />

      <SiteSection
        id="work"
        className="mx-auto w-[min(calc(100%_-_48px),1040px)] pt-[clamp(16px,2.9vw,30px)] max-[760px]:w-[min(calc(100%_-_28px),100%)]"
        aria-labelledby="work-title"
      >
        <header className="py-[clamp(12px,1.8vw,20px)] pb-[clamp(10px,1.2vw,16px)] text-center max-[540px]:pt-4 max-[540px]:pb-[13px]">
          <h2
            id="work-title"
            className="mx-auto max-w-[14ch] text-[clamp(3.2rem,7vw,6.4rem)] leading-[0.82] font-light tracking-[-0.055em] max-[540px]:text-[clamp(2.85rem,15vw,4.25rem)]"
          >
            What I’ve been up to
          </h2>
          <div className="mt-[0.9rem] flex justify-center gap-[1.1rem] text-[1.02rem] max-[540px]:flex-col max-[540px]:items-center max-[540px]:gap-[0.35rem]">
            <Link
              className="text-[1.16rem] italic underline-offset-[0.17em] focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-ink"
              href="/articles"
            >
              All articles →
            </Link>
          </div>
        </header>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(210px,1fr)] items-stretch border-y-4 border-double border-ink max-[540px]:block">
          {homeArticles.map((article, index) => (
            <NewspaperStory
              key={article.slug}
              article={article}
              index={index}
              total={homeArticles.length}
              returnTo="/#work"
              returnLabel="← Back"
            />
          ))}
        </div>
      </SiteSection>
    </main>
  );
}
