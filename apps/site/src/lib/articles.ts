import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export function formatArticleDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function compareByRecency(left: Article, right: Article) {
  return (
    right.data.date.getTime() - left.data.date.getTime() ||
    left.id.localeCompare(right.id)
  );
}

export async function getArticles() {
  return (await getCollection('articles')).sort(compareByRecency);
}

export async function getPublishedArticles() {
  return (await getArticles()).filter((article) => article.data.published);
}

function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getPreviewParagraphs(article: Article, characterLimit: number) {
  const paragraphs = (article.body ?? '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(
      (block) =>
        block.length > 0 &&
        !block.startsWith('#') &&
        !block.startsWith('![') &&
        !block.startsWith('```'),
    )
    .map(stripInlineMarkdown)
    .filter(Boolean);

  const preview: string[] = [];
  let remaining = characterLimit;

  for (const paragraph of paragraphs) {
    if (remaining <= 0) break;
    if (paragraph.length <= remaining) {
      preview.push(paragraph);
      remaining -= paragraph.length;
      continue;
    }

    const fragment = paragraph.slice(0, remaining);
    const lastSpace = fragment.lastIndexOf(' ');
    preview.push(
      `${fragment.slice(0, lastSpace > 0 ? lastSpace : remaining).trim()}…`,
    );
    break;
  }

  return preview;
}
