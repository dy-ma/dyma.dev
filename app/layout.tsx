import type { Metadata, Viewport } from 'next';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dylan Mou Ang — Software Engineer',
  description:
    'Dylan Mou Ang is a software engineer working on infrastructure at Aina.',
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="min-h-full scroll-smooth bg-paper [color-scheme:only_light] motion-reduce:scroll-auto"
    >
      <body className="min-h-full bg-paper font-serif text-[20px] leading-[1.45] text-ink [text-rendering:optimizeLegibility] selection:bg-ink selection:text-paper [&:has(.article-page)_.footer-shell]:w-[min(calc(100%_-_40px),900px)] max-[760px]:[&:has(.article-page)_.footer-shell]:w-[min(calc(100%_-_28px),100%)]">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
