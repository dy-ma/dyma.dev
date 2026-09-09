'use client';

import NumberFlow, { continuous } from '@number-flow/react';
import { useEffect, useState } from 'react';

type Visitor = {
  visitorNumber: number;
  total: number;
  currentVisitors: number;
  returning: boolean;
  lastVisitDays: number | null;
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

function lastSeen(days: number | null) {
  if (days === null) return '';
  if (days === 0) return 'You last visited earlier today.';
  if (days === 1) return 'You last visited yesterday.';
  return `You last visited ${days.toLocaleString('en-US')} days ago.`;
}

function AnimatedVisitorNumber({ value }: { value: number }) {
  const [displayedValue, setDisplayedValue] = useState(() =>
    Math.max(0, value - 1),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDisplayedValue(value), 180);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <span className="inline-block align-baseline leading-[0.9] [--number-flow-mask-height:0.2em] [--number-flow-mask-width:0.12em]">
      <NumberFlow
        aria-hidden="true"
        className="inline-block align-baseline leading-[0.9] [--number-flow-mask-height:0.2em] [--number-flow-mask-width:0.12em]"
        format={NUMBER_FORMAT}
        isolate
        locales="en-US"
        opacityTiming={NUMBER_FLOW_OPACITY_TIMING}
        plugins={NUMBER_FLOW_PLUGINS}
        spinTiming={NUMBER_FLOW_SPIN_TIMING}
        transformTiming={NUMBER_FLOW_TRANSFORM_TIMING}
        trend={1}
        value={displayedValue}
        willChange
      />
    </span>
  );
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

  const finalNumber = targetNumber?.toLocaleString('en-US') ?? '';
  const currentVisitors = Math.max(1, visitor?.currentVisitors ?? 1);

  return (
    <header className="text-center" aria-live="polite" aria-atomic="true">
      <h1 className="mx-auto max-w-[13ch] text-[clamp(4.5rem,10.5vw,9.5rem)] leading-[0.83] font-light tracking-[-0.052em] max-[760px]:max-w-[9ch] max-[760px]:text-[clamp(4rem,20vw,6rem)] max-[760px]:font-normal">
        Welcome{returning ? ' back' : ''},{' '}
        <span className="whitespace-nowrap">
          visitor{' '}
          <span
            className="inline-block text-center align-baseline leading-[0.9] [font-feature-settings:'lnum'_1,'tnum'_1] [font-variant-numeric:lining-nums_tabular-nums]"
            aria-label={
              targetNumber === null
                ? unavailable
                  ? 'unavailable'
                  : 'loading'
                : finalNumber
            }
          >
            {targetNumber === null ? (
              <span aria-hidden="true">{unavailable ? '—' : '0'}</span>
            ) : returning ? (
              <span className="inline-block align-baseline leading-[0.9] [--number-flow-mask-height:0.2em] [--number-flow-mask-width:0.12em]">
                {finalNumber}
              </span>
            ) : (
              <AnimatedVisitorNumber value={targetNumber} />
            )}
          </span>
        </span>
      </h1>
      <p className="mt-[1.3rem] min-h-[1.45em] text-base text-faded max-[760px]:text-[0.9rem]">
        {visitor
          ? `There are ${visitor.total.toLocaleString('en-US')} of us so far, and ${currentVisitors.toLocaleString(
              'en-US',
            )} here right now.${
              visitor.returning
                ? ` ${lastSeen(visitor.lastVisitDays)}`
                : ' This is your first time here.'
            }`
          : unavailable
            ? 'The visitor count is unavailable.'
            : 'Counting visitors…'}
      </p>
    </header>
  );
}
