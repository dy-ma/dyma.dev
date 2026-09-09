import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SiteSectionProps = {
  as?: 'section' | 'article';
  id?: string;
  className?: string;
  children: ReactNode;
};

export function SiteSection({
  as = 'section',
  id,
  className = '',
  children,
}: SiteSectionProps) {
  const Tag = as;

  return (
    <Tag id={id} className={cn('relative', className)}>
      {children}
    </Tag>
  );
}
