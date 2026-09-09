const articleSources = import.meta.glob<string>(
  '../content/articles/*/index.md',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
);

const articleAssets = import.meta.glob<string>(
  '../content/articles/**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
);

export type HomepagePlacement = 'lead' | 'secondary' | 'none';
export type HomepageTreatment = 'full' | 'excerpt';

export type ArticleImage = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

export type Article = {
  slug: string;
  headline: string;
  project: string;
  date?: string;
  summary: string;
  published: boolean;
  home: HomepagePlacement;
  homeOrder?: number;
  homeTreatment: HomepageTreatment;
  image?: ArticleImage;
  body: string;
};

function stringField(
  data: Record<string, unknown>,
  field: string,
  slug: string,
) {
  const value = data[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Article "${slug}" needs a ${field} field.`);
  }
  return value.trim();
}

function numberField(
  data: Record<string, unknown>,
  field: string,
  slug: string,
) {
  const value = data[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Article "${slug}" needs a numeric ${field} field.`);
  }
  return value;
}

function parseScalar(value: string): string | number | boolean {
  const trimmed = value.trim();
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readFrontmatter(source: string, slug: string) {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  if (lines[0] !== '---') {
    throw new Error(`Article "${slug}" must begin with frontmatter.`);
  }

  const closingLine = lines.indexOf('---', 1);
  if (closingLine === -1) {
    throw new Error(`Article "${slug}" has unclosed frontmatter.`);
  }

  const data: Record<string, unknown> = {};
  for (const line of lines.slice(1, closingLine)) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator === -1) {
      throw new Error(`Article "${slug}" has invalid frontmatter: ${line}`);
    }
    const key = line.slice(0, separator).trim();
    data[key] = parseScalar(line.slice(separator + 1));
  }

  return {
    data,
    content: lines
      .slice(closingLine + 1)
      .join('\n')
      .trim(),
  };
}

function slugFromSourcePath(sourcePath: string) {
  const match = sourcePath.match(/\/articles\/([^/]+)\/index\.md$/);
  if (!match) throw new Error(`Invalid article source path: ${sourcePath}`);
  return match[1];
}

function resolveAsset(sourcePath: string, reference: string, slug: string) {
  if (!reference.startsWith('./')) return reference;

  const sourceDirectory = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1);
  const assetPath = `${sourceDirectory}${reference.slice(2)}`;
  const asset = articleAssets[assetPath];

  if (!asset) {
    throw new Error(
      `Article "${slug}" references an asset that was not found: ${reference}`,
    );
  }
  return asset;
}

function resolveMarkdownAssets(
  markdown: string,
  sourcePath: string,
  slug: string,
) {
  return markdown.replace(
    /(!\[[^\]]*\]\()([^\s)]+)([^)]*\))/g,
    (match, opening: string, reference: string, closing: string) => {
      if (!reference.startsWith('./')) return match;
      return `${opening}${resolveAsset(sourcePath, reference, slug)}${closing}`;
    },
  );
}

function parseArticle(sourcePath: string, source: string): Article {
  const slug = slugFromSourcePath(sourcePath);
  const { data, content } = readFrontmatter(source, slug);
  const home =
    typeof data.home === 'string' ? data.home.trim() : ('none' as const);
  const homeTreatment =
    typeof data.homeTreatment === 'string'
      ? data.homeTreatment.trim()
      : ('excerpt' as const);

  if (home !== 'lead' && home !== 'secondary' && home !== 'none') {
    throw new Error(
      `Article "${slug}" home must be "lead", "secondary", or "none".`,
    );
  }
  if (homeTreatment !== 'full' && homeTreatment !== 'excerpt') {
    throw new Error(
      `Article "${slug}" homeTreatment must be "full" or "excerpt".`,
    );
  }
  if (typeof data.published !== 'boolean') {
    throw new Error(`Article "${slug}" needs a boolean published field.`);
  }
  if (home !== 'none' && typeof data.homeOrder !== 'number') {
    throw new Error(
      `Article "${slug}" needs a numeric homeOrder when shown on the home page.`,
    );
  }

  const imageReference =
    typeof data.image === 'string' ? data.image.trim() : '';
  const image = imageReference
    ? {
        src: resolveAsset(sourcePath, imageReference, slug),
        alt: stringField(data, 'imageAlt', slug),
        caption:
          typeof data.imageCaption === 'string'
            ? data.imageCaption.trim()
            : undefined,
        width: numberField(data, 'imageWidth', slug),
        height: numberField(data, 'imageHeight', slug),
      }
    : undefined;

  return {
    slug,
    headline: stringField(data, 'headline', slug),
    project: stringField(data, 'project', slug),
    date:
      typeof data.date === 'string' && data.date.trim() !== ''
        ? data.date.trim()
        : undefined,
    summary: stringField(data, 'summary', slug),
    published: data.published,
    home,
    homeOrder:
      typeof data.homeOrder === 'number' ? data.homeOrder : undefined,
    homeTreatment,
    image,
    body: resolveMarkdownAssets(content.trim(), sourcePath, slug),
  };
}

function compareByRecency(left: Article, right: Article) {
  if (left.date && right.date) return right.date.localeCompare(left.date);
  if (left.date) return -1;
  if (right.date) return 1;
  return (
    (left.homeOrder ?? Number.MAX_SAFE_INTEGER) -
    (right.homeOrder ?? Number.MAX_SAFE_INTEGER)
  );
}

export const articles = Object.entries(articleSources)
  .map(([sourcePath, source]) => parseArticle(sourcePath, source))
  .sort(compareByRecency);

export const publishedArticles = articles.filter((article) => article.published);

export const homeArticles = publishedArticles
  .filter((article) => article.home !== 'none')
  .sort(
    (left, right) =>
      (left.homeOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.homeOrder ?? Number.MAX_SAFE_INTEGER),
  );

const leadArticleCount = homeArticles.filter(
  (article) => article.home === 'lead',
).length;

if (leadArticleCount !== 1) {
  throw new Error(
    `Expected exactly one published home-page lead article; found ${leadArticleCount}.`,
  );
}

export const articlesBySlug = Object.fromEntries(
  articles.map((article) => [article.slug, article]),
) as Record<string, Article>;
