/**
 * Algolia search data needed to create and use search index:
 * https://www.algolia.com/doc/api-client/getting-started/install/javascript/?client=javascript
 */
export interface AlgoliaSearchIndex {
  appId: string;
  publicApiKey: string;
  indexName: string;
}

/** Optional filters to apply when performing search. */
export interface SearchFilters {
  // Optional list of Zendesk category IDs to allowlist.
  categories?: number[];
  // Optional list of Zendesk category IDs to blocklist.
  categoriesToHide?: number[];
  // Optional search filters.
  // See https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/
  optionalFilters?: string[];
}

/**
 * Create filter string for Algolia filters API:
 * https://www.algolia.com/doc/api-reference/api-parameters/filters/
 */
export function createAlgoliaSearchFilter(filters: SearchFilters): string {
  let filterString = '';
  if (filters.categories?.length) {
    // Add a list of categories to show.
    filterString +=
      '(' +
      filters.categories
        ?.map((categoryId) => 'category.id:' + categoryId)
        .join(' OR ') +
      ')';
  }
  if (filters.categoriesToHide?.length) {
    if (filterString != '') {
      filterString += ' AND ';
    }
    // Add a list of categories to hide.
    filterString += filters.categoriesToHide
      ?.map((categoryId) => 'NOT category.id:' + categoryId)
      .join(' AND ');
  }
  return filterString;
}
