import type { Metadata } from 'next';
import { EB_Garamond, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const garamond = EB_Garamond({
  variable: '--font-garamond',
  subsets: ['latin'],
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dylan Mou Ang — Software Engineer',
  description:
    'Dylan Mou Ang is a software engineer working on infrastructure at Aina.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${garamond.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
