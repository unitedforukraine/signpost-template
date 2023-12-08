// This module contains utilities for handling a site's locale.

// This type contains information about a locale.
export interface Locale {
  // Short-code of the locale, e.g., 'en-us' or 'ps'.
  url: string;
  direction: 'ltr' | 'rtl';
  // Human-readable name for this locale.
  name: string;
  // directus locale code.
  directus: string;
}
