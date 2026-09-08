import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';
import { PretextSpread } from '@/components/pretext-spread';
import { VisitorCounter } from '@/components/visitor-counter';
import { readVisitorCookie, VISITOR_COOKIE_NAME } from '@/lib/visitor-cookie';

const introduction =
  'ey, I’m Dylan, a software engineer working on infrastructure at Aina. I work on software systems and the tools used to run them. Most of my work is concerned with how services are deployed, observed, and kept working as they change. This page is a record of some of that work. The three projects below are placeholders for longer accounts of Drop, Fabric, and Redthing. I do not publish very often, so the writing will arrive gradually. For now, this is the short version: I design and operate infrastructure, I care about making systems understandable, and I am usually working somewhere between the application and the machines underneath it.';

const projects = [
  {
    slug: 'drop',
    title: 'Drop',
    number: '1',
    description: 'Project notes and a longer write-up to come.',
  },
  {
    slug: 'fabric',
    title: 'Fabric',
    number: '2',
    description: 'Project notes and a longer write-up to come.',
  },
  {
    slug: 'redthing',
    title: 'Redthing',
    number: '3',
    description: 'Project notes and a longer write-up to come.',
  },
];

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
      <article className="advertisement page-shell">
        <VisitorCounter
          initialReturning={visitor !== null}
          initialVisitorNumber={visitor?.visitorNumber ?? null}
        />

        <figure className="ad-figure">
          <Image
            src="/images/pig-field.png"
            width={900}
            height={600}
            alt="A pig sitting in an open field, facing away toward the horizon."
            sizes="(max-width: 760px) calc(100vw - 28px), 820px"
            priority
          />
          <figcaption>Fig. 1</figcaption>
        </figure>

        <div id="about">
          <PretextSpread lead="H" text={introduction} />
        </div>
      </article>

      <section
        id="work"
        className="work page-shell"
        aria-labelledby="work-title"
      >
        <h2 id="work-title">Work</h2>
        <div className="project-list">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="project-row"
            >
              <span className="project-number">{project.number}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <span className="project-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer id="contact" className="site-footer page-shell">
        <h2>Contact</h2>
        <div className="contact-links">
          <a href="mailto:dylanmouang@gmail.com">dylanmouang@gmail.com</a>
          <a
            href="https://www.linkedin.com/in/dylan-mou-ang"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="https://github.com/dy-ma" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://x.com/dymaonx" target="_blank" rel="noreferrer">
            Twitter
          </a>
        </div>
        <p className="colophon">Dylan Mou Ang</p>
      </footer>
    </main>
  );
}
