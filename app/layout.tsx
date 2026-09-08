import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
