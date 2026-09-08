'use client';

import {
  layoutNextLine,
  layoutWithLines,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';
import { useEffect, useRef, useState } from 'react';

type PositionedLine = {
  isLast?: boolean;
  key: string;
  kind: 'body' | 'lede';
  text: string;
  x: number;
  y: number;
  width: number;
};

type SpreadLayout = {
  height: number;
  lines: PositionedLine[];
};

const BODY_FONT_SIZE = 21;
const BODY_LINE_HEIGHT = 27;
const LEDE_FONT_SIZE = 68;
const LEDE_LINE_HEIGHT = 54;
const COLUMN_GAP = 40;
const COLUMN_BREAKPOINT = 440;
const INSET_X = 18;
const INSET_Y = 18;
const DROP_CAP_WIDTH = 46;
const DROP_CAP_CLEARANCE = 8;
const preparedText = new Map<string, PreparedTextWithSegments>();

function getPreparedText(text: string, font: string) {
  const key = `${font}:${text}`;
  const cached = preparedText.get(key);
  if (cached) return cached;

  const prepared = prepareWithSegments(text, font);
  preparedText.set(key, prepared);
  return prepared;
}

function projectSpread(
  lead: string,
  text: string,
  width: number,
): SpreadLayout {
  const bodyFont = `400 ${BODY_FONT_SIZE}px "Cormorant Garamond"`;
  const ledeFont = `400 ${LEDE_FONT_SIZE}px "Cormorant Garamond"`;
  const preparedBody = getPreparedText(text, bodyFont);
  const preparedLede = getPreparedText(lead, ledeFont);
  const usableWidth = width - INSET_X * 2;
  const columnWidth = (usableWidth - COLUMN_GAP) / 2;
  const lede = layoutWithLines(preparedLede, DROP_CAP_WIDTH, LEDE_LINE_HEIGHT);
  const ledeBottom = BODY_LINE_HEIGHT * 2;

  const tryHeight = (contentHeight: number, keepLines: boolean) => {
    const lines: PositionedLine[] = keepLines
      ? lede.lines.map((line, index) => ({
          key: `lede-${index}`,
          kind: 'lede' as const,
          text: line.text,
          x: INSET_X,
          y: INSET_Y + index * LEDE_LINE_HEIGHT,
          width: DROP_CAP_WIDTH,
        }))
      : [];
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };

    for (let column = 0; column < 2; column += 1) {
      const columnLeft = INSET_X + column * (columnWidth + COLUMN_GAP);

      for (
        let y = 0;
        y + BODY_LINE_HEIGHT <= contentHeight;
        y += BODY_LINE_HEIGHT
      ) {
        const besideLede = column === 0 && y < ledeBottom;
        const lineLeft = besideLede
          ? columnLeft + DROP_CAP_WIDTH + DROP_CAP_CLEARANCE
          : columnLeft;
        const lineWidth = besideLede
          ? columnWidth - DROP_CAP_WIDTH - DROP_CAP_CLEARANCE
          : columnWidth;
        const line = layoutNextLine(preparedBody, cursor, lineWidth);
        if (line === null) {
          if (keepLines) {
            for (let index = lines.length - 1; index >= 0; index -= 1) {
              if (lines[index].kind === 'body') {
                lines[index].isLast = true;
                break;
              }
            }
          }
          return { complete: true, lines };
        }

        if (keepLines) {
          lines.push({
            key: `body-${column}-${y}`,
            kind: 'body',
            text: line.text,
            x: lineLeft,
            y: INSET_Y + y,
            width: lineWidth,
          });
        }
        cursor = line.end;
      }
    }

    return { complete: false, lines };
  };

  let low = Math.max(216, ledeBottom + BODY_LINE_HEIGHT);
  let high = 1200;
  while (low < high) {
    const middle =
      Math.floor((low + high) / (2 * BODY_LINE_HEIGHT)) * BODY_LINE_HEIGHT;
    if (tryHeight(middle, false).complete) high = middle;
    else low = middle + BODY_LINE_HEIGHT;
  }

  return {
    height: low + INSET_Y * 2,
    lines: tryHeight(low, true).lines,
  };
}

export function PretextSpread({ lead, text }: { lead: string; text: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SpreadLayout | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const render = async () => {
      await Promise.all([
        document.fonts.load(`400 ${BODY_FONT_SIZE}px "Cormorant Garamond"`),
        document.fonts.load(`400 ${LEDE_FONT_SIZE}px "Cormorant Garamond"`),
      ]);
      if (!cancelled && host.clientWidth >= COLUMN_BREAKPOINT) {
        setLayout(projectSpread(lead, text, host.clientWidth));
      } else if (!cancelled) {
        setLayout(null);
      }
    };

    const observer = new ResizeObserver(render);
    observer.observe(host);
    void render();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [lead, text]);

  return (
    <div className="pretext-spread" ref={hostRef}>
      <p
        className={`pretext-mobile${layout ? '' : ' pretext-mobile--visible'}`}
      >
        <span>{lead}</span>
        {text}
      </p>

      {layout ? (
        <div className="pretext-stage" style={{ height: layout.height }}>
          <div className="pretext-lines" aria-hidden="true">
            {layout.lines.map((line) => (
              <span
                className={
                  line.kind === 'lede'
                    ? 'pretext-lede-line'
                    : `pretext-body-line${line.isLast ? ' pretext-body-line--last' : ''}`
                }
                key={line.key}
                style={{ left: line.x, top: line.y, width: line.width }}
              >
                {line.text}
              </span>
            ))}
          </div>
          <p className="sr-only">
            {lead}
            {text}
          </p>
        </div>
      ) : null}
    </div>
  );
}
