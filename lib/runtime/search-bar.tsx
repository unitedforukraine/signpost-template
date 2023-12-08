import { BaseItem, createAutocomplete } from '@algolia/autocomplete-core';
import {
  OnStateChangeProps,
  getAlgoliaResults,
} from '@algolia/autocomplete-js';
import { SearchOutlined } from '@ant-design/icons';
import algoliasearch from 'algoliasearch/lite';
import { AutoComplete, Button } from 'antd';
import { NextRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Locale } from './locale';
import { AlgoliaSearchIndex, SearchFilters } from './search-common';

const { Option } = AutoComplete;

export interface SearchBarStrings {
  searchHint: string;
}

// We are wrapping the value state into one type to make the interface safer.
// Clients need to provide for the search bar to be usable, e.g., providing
// just value without the state update, makes little sense.
export interface SearchBarValueState {
  // An existing user query string to show and use if any.
  // If value is empty, the search bar shows a placeholder.
  value: string;
  // Change event handler when the value of the query has changed.
  onChange: (query: string) => void;
}

export interface SearchBarProps {
  // Localizes strings used in Search component.
  strings: SearchBarStrings;
  // If undefined, search bar maintains the query value internally.
  valueState?: SearchBarValueState;
  // Algolia Search Index data.
  searchIndex: AlgoliaSearchIndex;
  // Search filters.
  searchFilters?: SearchFilters;
  // Callback to perform when search button is clicked.
  onSearch: (query: string) => void;
}

/** These fields must be kept in sync with fields in Algolia search index. */
interface SearchSuggestion extends BaseItem {
  objectID: string;
  query: string;
}

/**
 * Define default SearchBarProps that
 *  - open /search-results-page link with query as param,
 *  - use locale to rank suggestions of current language higher.
 */
export function createDefaultSearchBarProps(
  strings: SearchBarStrings,
  index: AlgoliaSearchIndex,
  locale: Locale,
  router: NextRouter,
  valueState?: SearchBarValueState
): SearchBarProps {
  return {
    strings: strings,
    valueState,
    searchIndex: index,
    // Define optional filters which influence results that match the filter to be ranked higher.
    searchFilters: {
      // Prefer query suggestions of current language. Allows avoiding showing same suggestions in 2 similar languages (e.g. Ru and Ua).
      // https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/
      optionalFilters: ['locale.locale:' + locale.url],
    },
    onSearch: (query: string) => {
      router.push({
        pathname: '/search-results-page',
        query: { query },
      });
    },
  };
}

/**
 * Algolia Autocomplete APIs are described at
 * https://www.algolia.com/doc/ui-libraries/autocomplete/guides/creating-a-renderer/.
 */
export default function SearchBar({
  strings,
  valueState,
  searchIndex,
  searchFilters,
  onSearch,
}: SearchBarProps) {
  // Create Search index.
  const searchClient = useMemo(
    () => algoliasearch(searchIndex.appId, searchIndex.publicApiKey),
    [searchIndex.appId, searchIndex.publicApiKey]
  );
  const index = useMemo(
    () => searchClient.initIndex(searchIndex.indexName),
    [searchClient, searchIndex.indexName]
  );
  // We need to use useState unconditionally, hence the temp variables.
  const [tempValue, tempOnChange] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [value, onChange] = valueState
    ? [valueState.value, valueState.onChange]
    : [tempValue, tempOnChange];

  // Store query input from search box.
  const queryRef = useRef('');
  // Store autocomplete suggestions in a state.
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Generate autocomplete and memoize it.
  const autocomplete = useMemo(
    () =>
      createAutocomplete({
        onStateChange({ state }: OnStateChangeProps<SearchSuggestion>) {
          // Update suggestions and query whenever autocomplete state changes.
          queryRef.current = state.query;
          setSuggestions(
            state.collections
              .map((collection) => {
                return collection.items.flat();
              })
              .flat()
          );
        },
        getSources({ query }) {
          return [
            {
              sourceId: 'articles',
              getItems() {
                return getAlgoliaResults({
                  searchClient,
                  queries: [
                    {
                      indexName: index.indexName,
                      query,
                      params: {
                        clickAnalytics: true,
                        optionalFilters: searchFilters?.optionalFilters,
                      },
                    },
                  ],
                });
              },
            },
          ];
        },
      }),
    [index.indexName, searchClient, searchFilters?.optionalFilters]
  );

  useEffect(() => {
    autocomplete.setQuery(value);
    autocomplete.refresh();
  }, [value, autocomplete]);

  function maybePerformSearch(searchQuery: string) {
    if (searchQuery && searchQuery !== '') {
      setLoading(true);
      onSearch(searchQuery);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      maybePerformSearch(queryRef.current);
    }
  };

  return (
    <div className="search-bar-container">
      <AutoComplete
        autoFocus={true}
        placeholder={strings.searchHint}
        value={value ? value : undefined}
        className="search-input"
        size="small"
        onChange={onChange}
        onSelect={maybePerformSearch}
        onKeyDown={handleKeyDown}
      >
        {suggestions.map((item) => {
          if (!item.query || item.query === '') {
            return null;
          }
          return (
            <Option key={item.objectID} value={item.query}>
              {item.query}
            </Option>
          );
        })}
      </AutoComplete>
      <Button
        type="primary"
        size="small"
        className={'search-icon'}
        loading={loading}
        style={{
          border: '0',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0',
        }}
        icon={<SearchOutlined />}
        onClick={() => {
          maybePerformSearch(queryRef.current);
        }}
      />
    </div>
  );
}
