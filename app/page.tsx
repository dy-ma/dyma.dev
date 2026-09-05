import Link from 'next/link';
import Image from 'next/image';
import { VisitorCounter } from '@/components/visitor-counter';

const projects = [
  {
    slug: 'drop',
    title: 'Drop',
    number: '01',
    description:
      'A placeholder for a project about moving things from one place to another without making the journey everyone else’s problem.',
  },
  {
    slug: 'fabric',
    title: 'Fabric',
    number: '02',
    description:
      'A placeholder for a project about the connective tissue between systems, teams, and the occasional questionable decision.',
  },
  {
    slug: 'redthing',
    title: 'Redthing',
    number: '03',
    description:
      'A placeholder for the red thing. Its real explanation will be considerably more useful than this one.',
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header page-shell">
        <a className="wordmark" href="#top" aria-label="Dylan Mou Ang, home">
          Dylan Mou Ang
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section
        id="top"
        className="hero page-shell"
        aria-labelledby="hero-title"
      >
        <div className="hero-kicker">A small place on the internet</div>
        <VisitorCounter />
        <p id="hero-title" className="hero-note">
          Dylan is a software engineer working on infrastructure at{' '}
          <a href="https://ainatech.ai" target="_blank" rel="noreferrer">
            Aina
          </a>
          .
        </p>
        <a
          className="scroll-cue"
          href="#figure"
          aria-label="Continue to the illustration"
        >
          Continue ↓
        </a>
      </section>

      <figure id="figure" className="hero-figure reveal">
        <div className="image-frame">
          <Image
            src="/images/pig-field.png"
            width="1440"
            height="960"
            alt="A pig sitting in an open field, facing away toward the horizon."
            sizes="(max-width: 760px) 100vw, min(1460px, calc(100vw - 20px))"
            priority
          />
        </div>
        <figcaption className="page-shell">
          <span>Fig. 01</span>
          <span>September, somewhere quiet.</span>
        </figcaption>
      </figure>

      <section
        id="about"
        className="about page-shell reveal"
        aria-labelledby="about-title"
      >
        <p className="section-label">About</p>
        <div className="about-grid">
          <h2 id="about-title">
            I build the parts you’re not supposed to notice.
          </h2>
          <div className="body-copy">
            <p>
              I’m Dylan, a software engineer working on infrastructure at Aina.
              I like systems that are understandable, operable, and boring in
              the useful sense of the word.
            </p>
            <p>
              The longer version is still being written. It will eventually
              contain more about the work, the thinking behind it, and several
              things I would now do differently.
            </p>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="work page-shell"
        aria-labelledby="work-title"
      >
        <div className="section-heading reveal">
          <p className="section-label">Selected work</p>
          <h2 id="work-title">Three things, for now.</h2>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="project-row reveal"
            >
              <span className="project-number">{project.number}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer id="contact" className="site-footer page-shell reveal">
        <div>
          <p className="section-label">Elsewhere</p>
          <h2>Say hello, if you like.</h2>
        </div>
        <div className="contact-links">
          <a href="mailto:dylanmouang@gmail.com">Email</a>
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
        <div className="colophon">
          <span>Set in EB Garamond and IBM Plex Mono.</span>
          <span>Built with an unreasonable amount of care.</span>
        </div>
      </footer>
    </main>
  );
}
