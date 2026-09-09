import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export function formatArticleDate(date?: Date) {
  return date?.toISOString().slice(0, 10);
}

function compareByRecency(left: Article, right: Article) {
  if (left.data.date && right.data.date) {
    return right.data.date.getTime() - left.data.date.getTime();
  }
  if (left.data.date) return -1;
  if (right.data.date) return 1;
  return (
    (left.data.homeOrder ?? Number.MAX_SAFE_INTEGER) -
    (right.data.homeOrder ?? Number.MAX_SAFE_INTEGER)
  );
}

export async function getArticles() {
  return (await getCollection('articles')).sort(compareByRecency);
}

export async function getPublishedArticles() {
  return (await getArticles()).filter((article) => article.data.published);
}

export async function getHomeArticles() {
  const articles = (await getPublishedArticles())
    .filter((article) => article.data.home !== 'none')
    .sort(
      (left, right) =>
        (left.data.homeOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.data.homeOrder ?? Number.MAX_SAFE_INTEGER),
    );

  const leadCount = articles.filter(
    (article) => article.data.home === 'lead',
  ).length;
  if (leadCount !== 1) {
    throw new Error(
      `Expected exactly one published home-page lead article; found ${leadCount}.`,
    );
  }
  return articles;
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

export function getPreviewParagraphs(article: Article, count = 3) {
  return (article.body ?? '')
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
    .filter(Boolean)
    .slice(0, count);
}
