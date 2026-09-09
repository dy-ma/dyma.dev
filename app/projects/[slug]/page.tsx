import { permanentRedirect } from 'next/navigation';
import { articles } from '@/lib/articles';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function LegacyProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/articles/${slug}`);
}
