import type { ImgHTMLAttributes } from 'react';

/**
 * P0-20: Lazy-loading image wrapper.
 *
 * Wraps <img> with sensible defaults for performance: `loading="lazy"`,
 * `decoding="async"`, and a required `alt` attribute (TypeScript enforces it).
 *
 * Use instead of raw <img> in every Casino-generated app so below-the-fold
 * images don't block first paint and every image is accessible + SEO-friendly.
 *
 * Phase E extracts this to `@flowstack/sdk` for use in generated apps.
 */

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'loading'> {
  /** REQUIRED. Descriptive alt text — never "image" or empty for content images. */
  alt: string;
  /** Override lazy loading. Default is lazy; set 'eager' for above-the-fold hero images. */
  loading?: 'lazy' | 'eager';
}

export function Image({ alt, loading = 'lazy', decoding = 'async', ...rest }: ImageProps) {
  return <img alt={alt} loading={loading} decoding={decoding} {...rest} />;
}
