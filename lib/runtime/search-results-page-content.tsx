import algoliasearch from 'algoliasearch/lite';
import { Typography } from 'antd';
import { BaseHit } from 'instantsearch.js';
import Link from 'next/link';
import React from 'react';
import {
  Configure,
  InstantSearch,
  Pagination,
  Snippet,
  UseHitsProps,
  useHits,
} from 'react-instantsearch-hooks-web';

import LastEditStamp from './last-edit-stamp';
import { Locale } from './locale';
import {
  AlgoliaSearchIndex,
  SearchFilters,
  createAlgoliaSearchFilter,
} from './search-common';

const { Text, Title, Paragraph } = Typography;

/** These fields should match field names from Algolia Zendesk search index. */
interface ZendeskArticleHit extends BaseHit {
  // Article title.
  title: string;
  // Article language.
  locale: { locale: string; name: string; rtl: boolean };
  // Last updated date in string format.
  updated_at_iso: string;
}

/** Search article props. */
interface ArticleSearchResultProps {
  locale: Locale;
  searchQuery: string;
  lastEditedLabel: string;
  resultSummaryStringTemplate: (
    firstOnPage: number,
    lastOnPage: number,
    totalCount: number,
    query: string
  ) => string;
  useHitsProps?: UseHitsProps<ZendeskArticleHit>;
}

/**
 * Custom Algolia Hit renderer for Zendesk article search results:
 * https://www.algolia.com/doc/api-reference/widgets/hits/react-hooks/#hook
 */
function ArticleSearchResults({
  locale,
  searchQuery,
  lastEditedLabel,
  resultSummaryStringTemplate,
  useHitsProps,
}: ArticleSearchResultProps) {
  const { hits, results } = useHits(useHitsProps);

  return (
    <>
      <Paragraph style={{ marginTop: '20px' }}>
        <Text type="secondary">
          {results &&
            resultSummaryStringTemplate(
              results.page * results.hitsPerPage + 1,
              (results.page + 1) * results.hitsPerPage,
              results.nbHits,
              searchQuery ?? ''
            )}
        </Text>
      </Paragraph>
      <div>
        {hits.map((hit) => (
          <Paragraph key={hit.objectID}>
            <Link href={`/articles/${hit.id}`} locale={hit.locale.locale}>
              <a>
                <Title level={5}>{hit.title}</Title>
                <LastEditStamp
                  locale={locale}
                  label={lastEditedLabel}
                  value={hit.updated_at_iso}
                />
                <div>
                  <Text>
                    <Snippet
                      hit={hit}
                      attribute="body_safe"
                      highlightedTagName="mark"
                    />
                  </Text>
                </div>
              </a>
            </Link>
            <hr className="divider" />
          </Paragraph>
        ))}
      </div>
    </>
  );
}

export type ResultSummaryStringTemplate = (
  firstOnPage: number,
  lastOnPage: number,
  totalCount: number,
  query: string
) => string;

/** Localized strings and templates rendered on Search results page. */
export interface SearchResultsStrings {
  // Localized string 'Last edited at:'.
  lastEditedLabel: string;
  // Localized search summary string 'X-Y results of Z for <query>.
  resultSummaryStringTemplate: ResultSummaryStringTemplate;
}

export interface SearchResultsPageContentProps {
  currentLocale: Locale;
  // Search query.
  searchQuery: string;
  // Algolia Search Index data.
  searchIndex: AlgoliaSearchIndex;
  // Search filters.
  searchFilters: SearchFilters;
  // Localized strings.
  strings: SearchResultsStrings;
}

/**
 * Search Results page is build using Algolia Search engine.
 * It uses following React components for rendering:
 * InstantSearch: https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/
 * Configure: https://www.algolia.com/doc/api-reference/widgets/configure/react-hooks/
 * Pagination: https://www.algolia.com/doc/api-reference/widgets/pagination/react-hooks/
 * Custom UI for Hits: https://www.algolia.com/doc/api-reference/widgets/hits/react-hooks/#hook
 *
 * Refer to this guide for building Search page using Algolia search index:
 * https://www.algolia.com/doc/guides/building-search-ui/getting-started/react-hooks/
 */
export default function SearchResultsPageContent({
  currentLocale,
  searchQuery,
  searchIndex,
  searchFilters,
  strings,
}: SearchResultsPageContentProps) {
  // Signpost U4U search index key.
  const searchClient = algoliasearch(
    searchIndex.appId,
    searchIndex.publicApiKey
  );
  const index = searchClient.initIndex(searchIndex.indexName);
  return (
    <InstantSearch searchClient={searchClient} indexName={index.indexName}>
      <Configure
        query={searchQuery}
        hitsPerPage={5}
        filters={createAlgoliaSearchFilter(searchFilters)}
        // Rank articles in current language higher. It's needed to avoid
        // aritle duplication of similar languages (e.g. RU/UK).
        optionalFilters={['locale.locale:' + currentLocale]}
      />
      <ArticleSearchResults
        searchQuery={searchQuery}
        locale={currentLocale}
        {...strings}
      />
      <Pagination
        // Apply custom styles to Pagination UI components.
        classNames={{
          list: 'pagination-list',
          item: 'pagination-item',
          selectedItem: 'pagination-item--selected',
        }}
      />
    </InstantSearch>
  );
}
