/**
 * P0-20: JSON-LD schema.org helpers for SEO + GEO.
 *
 * Every Casino-generated app should use one or more of these builders to
 * inject structured data. Search engines use JSON-LD for rich snippets;
 * LLMs extract it for factual citations.
 *
 * Phase E extracts this to `@flowstack/sdk` so generated apps share the
 * same helpers.
 */

const BASE_URL = import.meta.env.VITE_SITE_URL || 'https://casino.flowstack.fun';

export interface OrganizationOptions {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactEmail?: string;
}

export function buildOrganizationJsonLd(opts: OrganizationOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name,
    url: opts.url ?? BASE_URL,
    ...(opts.logo && { logo: opts.logo }),
    ...(opts.description && { description: opts.description }),
    ...(opts.sameAs && opts.sameAs.length > 0 && { sameAs: opts.sameAs }),
    ...(opts.contactEmail && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: opts.contactEmail,
        contactType: 'customer support',
      },
    }),
  };
}

export interface WebSiteOptions {
  name: string;
  url?: string;
  description?: string;
  searchUrl?: string;
}

export function buildWebSiteJsonLd(opts: WebSiteOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: opts.url ?? BASE_URL,
    ...(opts.description && { description: opts.description }),
    ...(opts.searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: opts.searchUrl,
        'query-input': 'required name=search_term_string',
      },
    }),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export interface ArticleOptions {
  title: string;
  description: string;
  url: string;
  datePublished: string; // ISO 8601
  dateModified?: string;
  authorName?: string;
  image?: string;
}

export function buildArticleJsonLd(opts: ArticleOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    ...(opts.authorName && {
      author: { '@type': 'Person', name: opts.authorName },
    }),
    ...(opts.image && { image: opts.image }),
  };
}
