import type { NextApiRequest, NextApiResponse } from 'next';

import { Locale } from './locale';
import { doesArticleExistAtPath } from './zendesk';

/**
 * Preview handler helper that enables preview mode.
 * Expected to be called from the pages/api/preview.ts handler function.
 *
 * Check https://nextjs.org/docs/advanced-features/preview-mode for explanations.
 * https://<your-site>/api/preview?secret=<token>&slug=<path> is the preview mode URL.
 *
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param previewToken secret token to enable preview mode.
 * @param getLocaleFromCode A function to convert locale code to the corresponding Locale object.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param zendeskMappedUrl The mapped URL configured in Zendesk that Zendesk
 *                           prepends to links, e.g., https://www.unitedforukraine.org.
 * @param authHeader Authorization header to access Zendesk API.
 * @returns
 */
export default async function previewHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  previewToken: string | undefined,
  getLocaleFromCode: (code: string) => Locale,
  zendeskUrl: string,
  zendeskMappedUrl: string,
  authHeader: HeadersInit
) {
  // Check the secret and next parameters.
  // This secret should only be known to this API route and the CMS.
  if (previewToken && req.query.secret !== previewToken) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!req.query.slug) {
    return res.status(400).json({ message: 'Slug parameter missing' });
  }

  // Fetch the headless CMS to check if the provided `slug` exists
  // getArticleBySlug would implement the required fetching logic to the headless CMS
  const articleExists = await doesArticleExistAtPath(
    req.query.slug as string,
    getLocaleFromCode,
    zendeskUrl,
    zendeskMappedUrl,
    authHeader,
    true
  );

  // If the slug doesn't exist, prevent preview mode from being enabled.
  if (!articleExists) {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  // Enable preview mode by setting the cookies.
  res.setPreviewData({});

  res.redirect(req.query.slug as string);
}
