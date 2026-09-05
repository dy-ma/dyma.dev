'use client';

import { useEffect, useState } from 'react';

type Visitor = {
  visitorNumber: number;
  total: number;
  returning: boolean;
  lastVisitDays: number | null;
};

function lastSeen(days: number | null) {
  if (days === null) return '';
  if (days === 0) return 'You were last here earlier today.';
  if (days === 1) return 'You were last here yesterday.';
  return `You were last here ${days.toLocaleString('en-US')} days ago.`;
}

export function VisitorCounter() {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/visitor', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Visitor desk unavailable');
        return response.json() as Promise<Visitor>;
      })
      .then(setVisitor)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setUnavailable(true);
      });

    return () => controller.abort();
  }, []);

  const number = visitor?.visitorNumber.toLocaleString('en-US') ?? '…';

  return (
    <div aria-live="polite" aria-atomic="true">
      <h1 className="visitor-heading">
        Welcome{visitor?.returning ? ' back' : ''}, visitor{' '}
        <span className="counter-number">{number}</span>.
      </h1>
      <p className="visitor-detail">
        {visitor
          ? visitor.returning
            ? `We’re up to ${visitor.total.toLocaleString('en-US')} now. ${lastSeen(visitor.lastVisitDays)}`
            : 'You’re the newest one.'
          : unavailable
            ? 'The front desk is momentarily unattended.'
            : 'Checking the guest book…'}
      </p>
    </div>
  );
}
