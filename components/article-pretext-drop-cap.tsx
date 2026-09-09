'use client';

import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type PositionedLine = {
  isLast?: boolean;
  key: string;
  text: string;
  width: number;
  x: number;
  y: number;
};

type DropCapLayout = {
  height: number;
  lines: PositionedLine[];
};

const BODY_FONT_SIZE = 22;
const BODY_LINE_HEIGHT = 30;
const DROP_CAP_FONT_SIZE = 76;
const DROP_CAP_WIDTH = 54;
const DROP_CAP_CLEARANCE = 9;
const DROP_CAP_LINES = 2;
const MEDIUM_QUERY = '(min-width: 680px)';
const preparedText = new Map<string, PreparedTextWithSegments>();

function prepareText(text: string) {
  const font = `400 ${BODY_FONT_SIZE}px "Cormorant Garamond"`;
  const cached = preparedText.get(text);
  if (cached) return cached;
  const prepared = prepareWithSegments(text, font);
  preparedText.set(text, prepared);
  return prepared;
}

function projectDropCap(text: string, width: number): DropCapLayout {
  const prepared = prepareText(text);
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;

  while (true) {
    const besideDropCap = y < BODY_LINE_HEIGHT * DROP_CAP_LINES;
    const x = besideDropCap ? DROP_CAP_WIDTH + DROP_CAP_CLEARANCE : 0;
    const line = layoutNextLine(prepared, cursor, width - x);
    if (line === null) break;

    lines.push({
      key: `article-opening-${y}`,
      text: line.text,
      width: width - x,
      x,
      y,
    });
    cursor = line.end;
    y += BODY_LINE_HEIGHT;
  }

  if (lines.length > 0) lines[lines.length - 1].isLast = true;

  return {
    height: Math.max(y, BODY_LINE_HEIGHT * DROP_CAP_LINES),
    lines,
  };
}

export function ArticlePretextDropCap({ text }: { text: string }) {
  const lead = text.slice(0, 1);
  const remainder = text.slice(1);
  const hostRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<DropCapLayout | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const render = async () => {
      await document.fonts.load(`400 ${BODY_FONT_SIZE}px "Cormorant Garamond"`);
      await document.fonts.load(
        `400 ${DROP_CAP_FONT_SIZE}px "Cormorant Garamond"`,
      );

      if (cancelled) return;
      setLayout(
        window.matchMedia(MEDIUM_QUERY).matches
          ? projectDropCap(remainder, host.clientWidth)
          : null,
      );
    };

    const observer = new ResizeObserver(render);
    observer.observe(host);
    void render();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [remainder]);

  return (
    <div
      className="mx-auto mb-[0.9em] max-w-[680px] [break-inside:avoid]"
      ref={hostRef}
    >
      <p className={cn('m-0 hidden', !layout && 'block')}>
        <span className="float-left mt-[0.06em] mr-[0.09em] text-[3.6em] leading-[0.76]">
          {lead}
        </span>
        {remainder}
      </p>

      {layout ? (
        <div
          className="relative w-full max-w-[680px]"
          style={{ height: layout.height }}
        >
          <span
            className="absolute top-0 left-0 block h-[60px] w-[54px] overflow-hidden text-[76px] leading-[60px] font-normal"
            aria-hidden="true"
          >
            {lead}
          </span>
          <div aria-hidden="true">
            {layout.lines.map((line) => (
              <span
                className={cn(
                  'absolute block h-[30px] overflow-hidden whitespace-nowrap text-justify text-[22px] leading-[30px] font-normal [text-align-last:justify]',
                  line.isLast && '[text-align-last:left]',
                )}
                key={line.key}
                style={{ left: line.x, top: line.y, width: line.width }}
              >
                {line.text}
              </span>
            ))}
          </div>
          <p className="sr-only">{text}</p>
        </div>
      ) : null}
    </div>
  );
}
