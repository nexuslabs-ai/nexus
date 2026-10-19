import { ImageResponse } from 'next/og';

import { SITE_NAME, SITE_URL } from './site';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

// Satori takes inline styles only, so the card uses the default theme's zinc
// values as literals.
const BACKGROUND = '#09090b';
const FOREGROUND = '#fafafa';
const MUTED = '#a1a1aa';
const SUBTLE = '#71717a';

/** The 1200×630 social card: wordmark, eyebrow, title, description and host. */
export function renderOgImage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: BACKGROUND,
        color: FOREGROUND,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: FOREGROUND,
            color: BACKGROUND,
            fontSize: 34,
          }}
        >
          N
        </div>
        <div style={{ fontSize: 32 }}>{SITE_NAME}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            fontSize: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED }}>
          {description}
        </div>
      </div>
      <div style={{ fontSize: 24, color: SUBTLE }}>
        {new URL(SITE_URL).host}
      </div>
    </div>,
    OG_IMAGE_SIZE
  );
}
