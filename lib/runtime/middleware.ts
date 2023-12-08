import { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function createRedirectResponse(
  targetUrl: URL,
  permanent = false
): NextResponse {
  return NextResponse.redirect(targetUrl, permanent ? 308 : 307);
}

/**
 * Redirects legacy '/hc/LANG' paths that were used by Zendesk Themes.
 *
 * This redirect just cuts any "/hc" from the pathname.
 *
 * For rationale, see [the design doc](https://docs.google.com/document/d/1pyNUCcVx6zoYYrAfke58AT13MY_d18mNyaskfXwEQGg/edit).
 *
 * @return If the path is a legacy Zendesk Themes path, the path to redirect to. Otherwise, a nullish value.
 */
function getRedirectZendeskHelpCenterPaths(
  pathname: string
): string | null | undefined {
  if (pathname === '/hc') return '/';
  const hcRegex = /^\/hc(\/.*)$/;
  const hcMatch = hcRegex.exec(pathname);
  return hcMatch?.[1];
}

/**
 * Redirects 'default' locale paths to the locale selector.
 *
 * This function follows https://nextjs.org/docs/advanced-features/i18n-routing#prefixing-the-default-locale.
 *
 * @return If the path is the default locale path, the URL to redirect to. Otherwise, a nullish value.
 */
function getRedirectDefaultLocale(nextUrl: NextURL): URL | undefined {
  const PUBLIC_FILE = /\.(.*)$/;

  const shouldHandleLocale =
    !PUBLIC_FILE.test(nextUrl.pathname) &&
    !nextUrl.pathname.startsWith('/_next/') &&
    !nextUrl.pathname.includes('/api/') &&
    !nextUrl.pathname.includes('/locale-select') &&
    nextUrl.locale === 'default';

  if (shouldHandleLocale) {
    const url = nextUrl.clone();
    url.pathname = '/locale-select';
    url.searchParams.append('target', nextUrl.pathname);
    return url;
  }
  return undefined;
}

export function middleware(req: NextRequest): NextResponse | undefined {
  const redirectHcPath: string | null | undefined =
    getRedirectZendeskHelpCenterPaths(req.nextUrl.pathname);
  if (redirectHcPath) {
    const url = req.nextUrl.clone();
    url.pathname = redirectHcPath;
    return createRedirectResponse(url, /*permanent*/ true);
  }

  const redirectLocale = getRedirectDefaultLocale(req.nextUrl);
  if (redirectLocale)
    return createRedirectResponse(redirectLocale, /*permanent*/ false);

  return undefined;
}
