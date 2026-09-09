'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

type BackLinkState = {
  href: string;
  label: string;
  useHistory: boolean;
};

const FALLBACK_BACK_LINK: BackLinkState = {
  href: '/articles',
  label: '← Back',
  useHistory: false,
};

function sanitizeReturnTo(raw: string): string {
  if (!raw.startsWith('/')) return FALLBACK_BACK_LINK.href;
  return raw.includes('://') ? FALLBACK_BACK_LINK.href : raw;
}

function deriveBackLink(): BackLinkState {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  const returnLabel = params.get('returnLabel');

  if (returnTo) {
    return {
      href: sanitizeReturnTo(returnTo),
      label: returnLabel || FALLBACK_BACK_LINK.label,
      useHistory: false,
    };
  }

  return {
    href: FALLBACK_BACK_LINK.href,
    label: FALLBACK_BACK_LINK.label,
    useHistory: true,
  };
}

export function ArticleBackLink() {
  const router = useRouter();
  const [backLink, setBackLink] = useState(FALLBACK_BACK_LINK);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setBackLink(deriveBackLink());
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!backLink.useHistory || !canGoBack) {
        return;
      }

      event.preventDefault();
      router.back();
    },
    [backLink.useHistory, canGoBack, router],
  );

  return (
    <a
      className="mt-[0.1rem] mb-[0.15rem] inline-flex items-center gap-[0.35rem] self-start p-0 text-[clamp(1rem,3.3vw,1.22rem)] italic underline decoration-1 underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-ink"
      href={backLink.href}
      onClick={handleBack}
    >
      {backLink.label}
    </a>
  );
}
