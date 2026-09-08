'use client';

import NumberFlow, { continuous } from '@number-flow/react';
import { useEffect, useState } from 'react';

type Visitor = {
  visitorNumber: number;
  total: number;
  returning: boolean;
  lastVisitDays: number | null;
};

type CounterState = {
  target: number | null;
  value: number | null;
};

const NUMBER_FLOW_PLUGINS = [continuous];
const NUMBER_FORMAT = { useGrouping: true };
const NUMBER_FLOW_TRANSFORM_TIMING = {
  duration: 480,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};
const NUMBER_FLOW_SPIN_TIMING = {
  duration: 520,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};
const NUMBER_FLOW_OPACITY_TIMING = {
  duration: 220,
  easing: 'ease-out',
};

function startingValue(target: number) {
  const firstAtThisLength = target < 10 ? 0 : 10 ** (String(target).length - 1);
  return Math.max(firstAtThisLength, target - 2);
}

function lastSeen(days: number | null) {
  if (days === null) return '';
  if (days === 0) return 'You last visited earlier today.';
  if (days === 1) return 'You last visited yesterday.';
  return `You last visited ${days.toLocaleString('en-US')} days ago.`;
}

export function VisitorCounter({
  initialReturning,
  initialVisitorNumber,
}: {
  initialReturning: boolean;
  initialVisitorNumber: number | null;
}) {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const targetNumber = visitor?.visitorNumber ?? initialVisitorNumber;
  const returning = visitor?.returning ?? initialReturning;
  const [counter, setCounter] = useState<CounterState>(() => ({
    target: targetNumber,
    value: targetNumber === null ? null : startingValue(targetNumber),
  }));

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/visitor', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Visitor count unavailable');
        return response.json() as Promise<Visitor>;
      })
      .then(setVisitor)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setUnavailable(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (targetNumber === null) return;

    const timer = window.setTimeout(() => {
      setCounter({
        target: targetNumber,
        value: targetNumber,
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [targetNumber]);

  const finalNumber = targetNumber?.toLocaleString('en-US') ?? '';
  const displayedNumber =
    counter.target === targetNumber
      ? counter.value
      : targetNumber === null
        ? null
        : startingValue(targetNumber);

  return (
    <header className="ad-heading" aria-live="polite" aria-atomic="true">
      <h1 className="visitor-heading">
        Welcome{returning ? ' back' : ''}, visitor{' '}
        <span
          className="counter-slot"
          aria-label={
            targetNumber === null
              ? unavailable
                ? 'unavailable'
                : 'loading'
              : finalNumber
          }
        >
          {targetNumber === null ? (
            <span className="counter-fallback" aria-hidden="true">
              {unavailable ? '—' : '0'}
            </span>
          ) : (
            <NumberFlow
              aria-hidden="true"
              className="visitor-number"
              format={NUMBER_FORMAT}
              isolate
              locales="en-US"
              opacityTiming={NUMBER_FLOW_OPACITY_TIMING}
              plugins={NUMBER_FLOW_PLUGINS}
              spinTiming={NUMBER_FLOW_SPIN_TIMING}
              transformTiming={NUMBER_FLOW_TRANSFORM_TIMING}
              trend={1}
              value={displayedNumber ?? targetNumber}
              willChange
            />
          )}
        </span>
        {'.'}
      </h1>
      <p className="visitor-detail">
        {visitor
          ? `${visitor.total.toLocaleString('en-US')} visitors so far.${
              visitor.returning ? ` ${lastSeen(visitor.lastVisitDays)}` : ''
            }`
          : unavailable
            ? 'The visitor count is unavailable.'
            : 'Counting visitors…'}
      </p>
    </header>
  );
}
