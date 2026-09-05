import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { projects, type ProjectSlug } from '@/lib/projects';

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(slug in projects)) notFound();
  const project = projects[slug as ProjectSlug];

  return (
    <main>
      <header className="article-header article-shell">
        <Link className="article-back" href="/#work">
          ← Return home
        </Link>
        <h1 className="article-title">{project.title}</h1>
        <div className="article-meta">
          <span>{project.date}</span>
          <span>{project.summary}</span>
        </div>
      </header>
      <article className="markdown article-shell">
        <ReactMarkdown>{project.body}</ReactMarkdown>
      </article>
    </main>
  );
}
