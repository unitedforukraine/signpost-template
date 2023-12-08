import { StatusCodes } from 'http-status-codes'

import { fetchWithRetry } from './fetch'
import { Locale } from './locale'

/** Sanitizes URLs in article bodies.
 *
 * In order for the article to work seamlessly on non-Zendesk hosts, this
 * function rewrites domains in links.
 *
 * @param zendeskUrl - The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param zendeskMappedUrl - The mapped URL configured in Zendesk that Zendesk
 *                           prepends to links, e.g., https://www.unitedforukraine.org.
 *
 * @returns The new article body HTML
 */
export function sanitizeArticleUrls(
  zendeskUrl: string,
  zendeskMappedUrl: string,
  body: string
): string {
  const articleAttachmentUrlRegex =
    /["']([^"'])*(\/hc\/article_attachments\/[^"']*)["']/g
  body = body.replaceAll(articleAttachmentUrlRegex, `"${zendeskUrl}$2"`)

  return body.replaceAll(`href="${zendeskMappedUrl}/hc`, 'href="/hc')
}

/** Sanitizes a Zendesk article. */
export function sanitizeArticle(
  zendeskUrl: string,
  zendeskMappedUrl: string,
  article: ZendeskArticle
) {
  // Sometimes an article is empty.
  if (!article.body) return
  article.body = sanitizeArticleUrls(
    zendeskUrl,
    zendeskMappedUrl,
    article.body
  )
}

/** Fetches a paginated Zendesk resource.
 *
 * @returns an array of JSON-parsed objects
 * */
// Body.json() returns Promise<any>
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function fetchPaginated(targetUrl: URL): Promise<any[]> {
  // 100 entries per fetch is Zendesk's limit:
  // https://developer.zendesk.com/api-reference/help_center/help-center-api/introduction/#using-cursor-based-pagination
  targetUrl.searchParams.set('page[size]', '100')
  const responses = []
  do {
    const response = await fetchWithRetry(targetUrl).then((response) =>
      response.json()
    )
    responses.push(response)
    targetUrl = response.links.next
  } while (targetUrl)
  return responses
}

/**
 * https://developer.zendesk.com/api-reference/help_center/help-center-api/categories/
 */
export interface ZendeskCategory {
  id: number
  name: string
  description: string
  locale: string
  icon: string
}

/**
 * Fetches list of Zendesk categories for the given locale.
 *
 * @param locale The locale of the categories.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns List of ZendeskCategory
 */
export async function getCategories(
  locale: Locale,
  zendeskUrl: string
): Promise<ZendeskCategory[]> {
  const responses = await fetchPaginated(
    new URL(`${zendeskUrl}/api/v2/help_center/${locale.url}/categories`)
  )
  return responses.flatMap((response) => response.categories)
}

/**
 * https://developer.zendesk.com/api-reference/help_center/help-center-api/sections/#json-format
 */
export interface ZendeskSection {
  description: string
  id: number
  locale: string
  name: string
  category_id: number
  icon: string
}

/**
 * Fetches section for the given locale.
 *
 * @param locale The locale of the section.
 * @param sectionId Section id to fetch.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns ZendeskSection
 */
export async function getSection(
  locale: Locale,
  sectionId: number,
  zendeskUrl: string
): Promise<ZendeskSection | undefined> {
  const response = await fetchWithRetry(
    new URL(
      `${zendeskUrl}/api/v2/help_center/${locale.url}/sections/${sectionId}`
    )
  )
  if (response.status === StatusCodes.OK) {
    const json = await response.json()
    return json.section
  } else if (response.status === StatusCodes.NOT_FOUND) {
    return undefined
  }
  throw new Error(
    `Failed to fetch a section (id: ${sectionId}, locale: ${locale.url}) from Zendesk. Received ${response.status}.`
  )
}

/**
 * Fetches list of Zendesk sections for the given locale.
 *
 * @param locale The locale of the sections.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns List of ZendeskSection
 */
export async function getSections(
  locale: Locale,
  zendeskUrl: string
): Promise<ZendeskSection[]> {
  const responses = await fetchPaginated(
    new URL(`${zendeskUrl}/api/v2/help_center/${locale.url}/sections`)
  )
  return responses.flatMap((response) => response.sections)
}

/**
 * Fetches list of sections for the given category and locale.
 *
 * @param locale The locale of sections.
 * @param categoryId Category id that sections to fetch belong to.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns List of ZendeskSection
 */
export async function getSectionsForCategory(
  locale: Locale,
  categoryId: number,
  zendeskUrl: string
): Promise<ZendeskSection[]> {
  const responses = await fetchPaginated(
    new URL(
      `${zendeskUrl}/api/v2/help_center/${locale.url}/categories/${categoryId}/sections`
    )
  )
  return responses.flatMap((response) => response.sections)
}

// A category with its sections.
export interface CategoryWithSections {
  category: ZendeskCategory
  sections: ZendeskSection[]
}

/**
 * Gets categories with their associated sections.
 *
 * @async
 * @param locale The locale of the fetched data.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param [categoryFilter] If provided, filters out specified categories.
 * @returns Categories with their associated sections.
 */
export async function getCategoriesWithSections(
  locale: Locale,
  zendeskUrl: string,
  categoryFilter?: (category: ZendeskCategory) => boolean
): Promise<CategoryWithSections[]> {
  let categories: ZendeskCategory[] = await getCategories(locale, zendeskUrl)
  if (categoryFilter) categories = categories.filter(categoryFilter)

  const categoriesAndSections = []
  for (const category of categories) {
    const sections = await getSectionsForCategory(
      locale,
      category.id,
      zendeskUrl
    )
    categoriesAndSections.push({ category, sections })
  }
  return categoriesAndSections
}

/**
 * https://developer.zendesk.com/api-reference/help_center/help-center-api/articles/#json-format
 */
export interface ZendeskArticle {
  body: string
  edited_at: string
  id: number
  locale: string
  section_id: number
  title: string
  updated_at: string
  draft: boolean
  icon?: string
  category_id?: number
  author_id?: number
}

/**
 * Fetches all articles for the given locale.
 *
 * @param locale The locale of articles.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns List of ZendeskArticle
 */
export async function getArticles(
  locale: Locale,
  zendeskUrl: string
): Promise<ZendeskArticle[]> {
  const responses = await fetchPaginated(
    new URL(`${zendeskUrl}/api/v2/help_center/${locale.url}/articles`)
  )
  const articles: ZendeskArticle[] = responses.flatMap(
    (response) => response.articles
  )
  return articles
}

/**
 * Fetches list of articles for the given section and locale.
 *
 * @param locale The locale of articles.
 * @param sectionId Section id that articles to fetch belong to.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 *
 * @returns List of ZendeskArticle
 */
export async function getArticlesForSection(
  locale: Locale,
  sectionId: number,
  zendeskUrl: string,
  sortBy?: string
): Promise<ZendeskArticle[]> {
  const responses = await fetchPaginated(
    new URL(
      `${zendeskUrl}/api/v2/help_center/${locale.url
      }/sections/${sectionId}/articles${sortBy ? `?sort_by=${sortBy}&sort_order=desc` : ''
      }`
    )
  )
  return responses.flatMap((response) => response.articles)
}

/**
 * Fetches article for the given locale.
 *
 * @param locale The locale of the article.
 * @param articleId The article id.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param zendeskMappedUrl The mapped URL configured in Zendesk that Zendesk
 *                           prepends to links, e.g., https://www.unitedforukraine.org.
 * @param authHeader Authorization header to access Zendesk API.
 *
 * @returns {Promise<ZendeskArticle | undefined>} If available, returns the
 * Zendesk Article. If the article does not exist or is not publicly available,
 * returns undefined.
 */
export async function getArticle(
  locale: Locale,
  articleId: number,
  zendeskUrl: string,
  zendeskMappedUrl: string,
  authHeader: HeadersInit,
  includeDrafts?: boolean
): Promise<ZendeskArticle | undefined> {
  if (includeDrafts) {
    return getDraftArticle(
      locale,
      articleId,
      zendeskUrl,
      zendeskMappedUrl,
      authHeader
    )
  }
  const response = await fetchWithRetry(
    `${zendeskUrl}/api/v2/help_center/${locale.url}/articles/${articleId}`
  )
  if (response.status === StatusCodes.OK) {
    const json = await response.json()
    const article = json.article
    sanitizeArticle(zendeskUrl, zendeskMappedUrl, article)
    return article
  } else if (
    [StatusCodes.NOT_FOUND, StatusCodes.UNAUTHORIZED].includes(response.status)
  ) {
    return undefined
  }
  throw new Error(
    `Failed to fetch an article (id: ${articleId}, locale: ${locale.url}) from Zendesk. Received ${response.status}.`
  )
}

/**
 * Fetches latest article revision (for body draft and published articles).
 *
 * @param locale The locale of the article.
 * @param articleId The article id.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param zendeskMappedUrl The mapped URL configured in Zendesk that Zendesk
 *                           prepends to links, e.g., https://www.unitedforukraine.org.
 * @param authHeader Authorization header to access Zendesk API.
 *
 * @returns latest article revision/draft
 */
export async function getDraftArticle(
  locale: Locale,
  articleId: number,
  zendeskUrl: string,
  zendeskMappedUrl: string,
  authHeader: HeadersInit
): Promise<ZendeskArticle | undefined> {
  // This API is undocumented, but used by Zendesk to fetch latest article revisions.
  // TODO: update Zendesk API once Zendesk team adds fetching article revisions to v2 APIs.
  const response = await fetchWithRetry(
    `${zendeskUrl}/knowledge/api/articles/${articleId}/translations/${locale.url}`,
    {
      method: 'GET',
      headers: authHeader,
    }
  )
  if (response.status === StatusCodes.OK) {
    const article = await response.json()
    // Match JSON fields to ZendeskArticle type, because they are different from API for published articles.
    const zendeskArticle: ZendeskArticle = {
      body: article.body,
      edited_at: article.updated_at,
      locale: article.locale,
      title: article.title,
      id: articleId,
      section_id: 0, // Section ID is not available from this Zendesk API.
      updated_at: article.updated_at,
      draft: article.draft,
    }
    sanitizeArticle(zendeskUrl, zendeskMappedUrl, zendeskArticle)
    return zendeskArticle
  } else if (response.status === StatusCodes.NOT_FOUND) {
    return undefined
  }
  throw new Error(
    `Failed to fetch an article (id: ${articleId}, locale: ${locale.url}) from Zendesk. Received ${response.status}.`
  )
}

/**
 * @param path Article path, e.g. /en-us/articles/5980399965725
 * @param getLocaleFromCode A function to convert locale code to the corresponding Locale object.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param zendeskMappedUrl The mapped URL configured in Zendesk that Zendesk
 *                           prepends to links, e.g., https://www.unitedforukraine.org.
 * @param authHeader Authorization header to access Zendesk API.
 * @param includeDrafts When true, takes into account articles in draft (unpublished state).
 * @returns true if the path is correct and the article exists at that path.
 */
export async function doesArticleExistAtPath(
  path: string,
  getLocaleFromCode: (code: string) => Locale,
  zendeskUrl: string,
  zendeskMappedUrl: string,
  authHeader: HeadersInit,
  includeDrafts: boolean
): Promise<boolean> {
  const pathParts = path.split('/')
  if (pathParts.length != 4) {
    return false
  }
  const articleId = Number(pathParts[3])
  const locale = getLocaleFromCode(pathParts[1])
  const article = getArticle(
    locale,
    articleId,
    zendeskUrl,
    zendeskMappedUrl,
    authHeader,
    includeDrafts
  )
  return article != undefined
}

/**
 * Fetch Zendesk Dynamic content for given locale:.
 * Dynamic Content API: https://developer.zendesk.com/api-reference/ticketing/ticket-management/dynamic_content/
 *
 * @param localeId The locale id as definied in Zendesk to generate string translations.
 * @param placeholders an array of Dynamic content IDs.
 * @param zendeskUrl The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param authHeader Authorization header to access Zendesk API.
 *
 * @returns The "placeholder to string" map for the given dynamic content IDs.
 */
export async function getTranslationsFromDynamicContent(
  localeId: number,
  placeholders: string[],
  zendeskUrl: string,
  authHeader: HeadersInit
): Promise<{ [key: string]: string }> {
  if (!placeholders?.length) {
    return {}
  }

  type DynamicContentVariant = {
    content: string
    locale_id: number
    default: boolean
  }

  type DynamicContentItem = {
    id: number
    name: string
    variants: DynamicContentVariant[]
  }

  type DynamicContentResponse = {
    items: DynamicContentItem[]
    count: number
  }

  // Fetch Dynamic content from Zendesk.
  const url =
    `${zendeskUrl}/api/v2/dynamic_content/items/show_many.json?identifiers=` +
    placeholders.join(',')
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: authHeader,
  })
  const { items }: DynamicContentResponse = await response.json()
  if (!items) {
    return {}
  }

  const dynamicContentMap: { [key: string]: string } = {}
  for (const item of items) {
    let variant = item.variants.find((v) => v.locale_id === localeId)
    if (!variant) {
      variant = item.variants.find((v) => v.default === true)
    }
    dynamicContentMap[item.name] = variant?.content ?? ''
  }
  return dynamicContentMap
}

export async function getLastArticlesEdited(
  zendeskUrl: string,
  startTime: string,
  authHeader: HeadersInit
): Promise<ZendeskArticle[]> {
  const response = await fetchWithRetry(
    new URL(
      `${zendeskUrl}/api/v2/help_center/incremental/articles?start_time=${startTime}`
    ),
    { method: 'GET', headers: authHeader }
  )
  const { articles } = await response.json()
  return articles
}

/**
 * https://developer.zendesk.com/api-reference/help_center/help-center-api/articles/#json-format
 */
export interface ZendeskArticleTranslation {
  body: string
  created_at: string
  created_by_id: string
  id: number
  locale: string
  source_id: number
  title: string
  updated_at: string
  draft: boolean
}

export async function getArticleTranslations(
  zendeskUrl: string,
  articleId: number
): Promise<ZendeskArticleTranslation[]> {
  const response = await fetchWithRetry(
    new URL(
      `${zendeskUrl}/api/v2/help_center/articles/${articleId}/translations`
    )
  )
  const { translations } = await response.json()
  return translations
}
