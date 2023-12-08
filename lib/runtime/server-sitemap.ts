// This module contains a utility function for generating a server-side sitemap.
//
// The server-side generator is meant to complement the static one by
// generating dynamic paths that are governed by CMS.
//
// To use this module, create `pages/server-sitemap/index.tsx` on your website, and
// fill it with content like this:
//
// ```
// import { generateSitemap } from 'next-sitemap';
// import * as article from '../articles/[article]';
// export async function getServerSideProps(ctx) {
//   return generateSitemap(ctx,
//                          'https://www.example.com',
//                          article.getStringPaths());
// }
// ```
//
// For more context on how to set up a sitemap, see
//
// - https://www.npmjs.com/package/next-sitemap
// - https://www.npmjs.com/package/next-sitemap#generating-dynamicserver-side-sitemaps.
import type { GetServerSidePropsContext, PreviewData } from 'next';
import { getServerSideSitemap } from 'next-sitemap';
import type { ParsedUrlQuery } from 'querystring';

/** Generates a sitemap.
 *
 * @param ctx — The context passed to GetServerSideProps in Next.js.
 * @param siteUrl — The site's URL, e.g., 'https://www.unitedforukraine.org'.
 * @param paths — The site's paths, e.g., ['/en-us/articles/123', '/uk/sections/456'].
 */
export default async function generateSitemap(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
  siteUrl: string,
  paths: string[]
): Promise<unknown> {
  // These values are used by the static generator, so we use them in our
  // server-side generator.
  const lastmod = new Date().toISOString();
  const changefreq = 'daily' as const;
  const priority = 0.7;

  const fields = paths.map((path: string) => {
    return {
      loc: siteUrl + path,
      lastmod,
      changefreq,
      priority,
    };
  });

  return getServerSideSitemap(ctx, fields);
}
