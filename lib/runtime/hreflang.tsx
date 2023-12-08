// The module handles hreflang meta tags.
// For more information on what a hreflang is, see
// https://nextjs.org/docs/advanced-features/i18n-routing#search-engine-optimization
import type { ReactElement } from 'react';
import React from 'react';

// Builds a fully qualified URL from its fragments.
function buildUrl(siteUrl: string, localeCode: string, path: string): string {
  return `${siteUrl}/${localeCode}${path}`;
}

interface HrefLangProps {
  // A locale code.
  localeCode: string;
  // The fully qualified URL for the locale, e.g.,
  // 'https://unitedforukraine.org/en-us/foo'.
  url: string;
}

// Creates a single hreflang meta tag link element.
function HrefLang({ localeCode, url }: HrefLangProps): ReactElement {
  return (
    <link
      key={`alternate-${localeCode}`}
      rel="alternate"
      hrefLang={localeCode}
      href={url}
    />
  );
}

interface HrefLangsProps {
  // A map from available locale codes to their canonical variants.
  localeCodesToCanonicalLocaleCodes: { [key: string]: string };
  // The site's URL, e.g., 'https://unitedforukraine.org'.
  siteUrl: string;
  // The current path without locale, e.g., '/foo/bar?baz=123'.
  path: string;
}

// Creates all hreflang meta tags for SEO.
//
// This function doesn't use the React JSX syntax, so that it can be used
// inside the Head component, which requires no intermediate React components.
export default function HrefLangs({
  localeCodesToCanonicalLocaleCodes,
  siteUrl,
  path,
}: HrefLangsProps): ReactElement[] {
  return Object.entries(localeCodesToCanonicalLocaleCodes).map(
    ([localeCode, canonicalLocaleCode]) =>
      HrefLang({
        localeCode: localeCode,
        url: buildUrl(siteUrl, canonicalLocaleCode, path),
      })
  );
}
