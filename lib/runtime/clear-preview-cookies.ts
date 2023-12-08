import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Implementation of clear-preview-cookie api taht disables preview mode.
 *
 * Redirect to the slug path or to the root path if slug parameter is not provided.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.clearPreviewData();
  const nextPath: string = (req.query['slug'] as string) ?? '/';
  res.redirect(nextPath);
}
