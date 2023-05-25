// Utilities for working with URLs

// @return The site's effective URL, e.g., https://www.beporsed.org
export function getSiteUrl(): string {
  // If SITE_URL is present, use that. Otherwise use the Vercel deployment's
  // dynamic URL for preview and dev deployments.
  return process.env.SITE_URL ?? 'https://' + process.env.VERCEL_URL;
}

// @return The site's Zendesk effective URL, e.g., https://signpost-afghanistan.zendesk.com
export function getZendeskUrl(): string {
  // If ZENDESK_URL is present, use that. Otherwise use Signpost global URL.
  return process.env.ZENDESK_URL ?? 'https://signposttest.zendesk.com';
}

// @return Zendesk's mapped URL for the site, e.g., https://www.beporsed-ma-ra.org
export function getZendeskMappedUrl(): string {
  return process.env.ZENDESK_MAPPED_URL ?? 'https://www.TODO.com';
}
