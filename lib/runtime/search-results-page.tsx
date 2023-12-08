import { Tabs } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import React from 'react'

import Footer, { FooterStrings } from './footer'
import type { LogoProps } from './header'
import HrefLangs from './hreflang'
import LayoutWithMenu from './layout-with-menu'
import { Locale } from './locale'
import { MenuOverlayItem } from './menu-overlay'
import { SearchBarStrings, createDefaultSearchBarProps } from './search-bar'
import { AlgoliaSearchIndex, SearchFilters } from './search-common'
import SearchResultsPageContent from './search-results-page-content'
import type { ResultSummaryStringTemplate } from './search-results-page-content'

export interface SearchResultsPageStrings {
  searchBarStrings: SearchBarStrings
  // Label shown on search result article description.
  lastEditedLabel: string
  // Localized string used inside search summary template that looks like 'N results found for "<query>"',
  // or an entire search summary template.
  // Note: Zendesk Dynamic content doesn't handle string literals, so the template string is just a hardcoded one.
  // We favor this approach over hardcoding localized string literals for simplicity.
  resultsFoundForQuery: string | ResultSummaryStringTemplate
  allResultsTabString: string
  informationTabString: string
  servicesTabString: string
  footerStrings: FooterStrings
}

interface SearchResultsPageProps {
  currentLocale: Locale
  // All available locales.
  locales: { [key: string]: Locale }
  // The site's canonical URL, e.g., 'https://unitedforukraine.org
  siteUrl: string
  pageTitle: string
  // Search index for article Search results.
  articleSearchResultsIndex: AlgoliaSearchIndex
  searchResultsFilters: SearchFilters
  // Search index for Seaarch bar.
  searchBarIndex: AlgoliaSearchIndex
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[]
  headerLogoProps: LogoProps
  cookieBanner: React.ReactNode
  // Custom footer node. If none is provided, the page will use a default one.
  footer?: JSX.Element
  // Custom footer node for the menu overlay. If the none is provided, the page will use a default one.
  footerMenuOverlay?: JSX.Element
  strings: SearchResultsPageStrings
  informationFilter?: number[]
  servicesFilter?: number[]
  footerLinks?: MenuOverlayItem[]
  signpostVersion: string
}

function getFirstParameter(param: string | string[]): string {
  if (Array.isArray(param)) return param[0]
  return param
}

export default function SearchResultsPage({
  currentLocale,
  locales,
  siteUrl,
  pageTitle,
  articleSearchResultsIndex,
  searchResultsFilters,
  searchBarIndex,
  menuOverlayItems,
  headerLogoProps,
  cookieBanner,
  footer,
  footerMenuOverlay,
  strings,
  informationFilter,
  servicesFilter,
  footerLinks,
  signpostVersion,
}: SearchResultsPageProps) {
  // The search query from the URL.
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('')
  // The search query in the search bar, initialized with initialSearchQuery.
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('')
  const router = useRouter()
  const resultSummaryStringTemplate: ResultSummaryStringTemplate =
    typeof strings.resultsFoundForQuery === 'string'
      ? (
        _firstOnPage: number,
        _lastOnPage: number,
        totalCount: number,
        query: string
      ): string => {
        return `${totalCount} ${strings.resultsFoundForQuery} "${query}"`
      }
      : strings.resultsFoundForQuery

  const getTabItem = (
    searchFilters: SearchFilters,
    key: string,
    label: string
  ) => {
    return {
      label: label,
      key: key,
      children: (
        <SearchResultsPageContent
          currentLocale={currentLocale}
          searchQuery={initialSearchQuery}
          searchIndex={articleSearchResultsIndex}
          searchFilters={searchFilters}
          strings={{
            lastEditedLabel: label,
            resultSummaryStringTemplate,
          }}
        />
      ),
    }
  }

  const getTabsItems = () => {
    const tabs = [
      getTabItem(searchResultsFilters, '1', strings.allResultsTabString),
    ]

    if (informationFilter) {
      tabs.push(
        getTabItem(
          { categories: informationFilter },
          '2',
          strings.informationTabString
        )
      )
    }

    if (servicesFilter) {
      tabs.push(
        getTabItem(
          { categories: servicesFilter },
          '3',
          strings.servicesTabString
        )
      )
    }
    return tabs
  }
  // Retrieve search query from 'query' param in the url.
  useEffect(() => {
    if (router.query.query) {
      const query = getFirstParameter(router.query.query)
      setInitialSearchQuery(query)
      setCurrentSearchQuery(query)
    }
  }, [router.query.query])

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {HrefLangs({
          localeCodesToCanonicalLocaleCodes: Object.fromEntries(
            Object.entries(locales).map(([k, v]) => [k, v.url])
          ),
          siteUrl,
          path: `/search-result-page`,
        })}
      </Head>
      <LayoutWithMenu
        headerProps={{
          currentLocale,
          locales,
          logoProps: headerLogoProps,
          searchBarProps: createDefaultSearchBarProps(
            strings.searchBarStrings,
            searchBarIndex,
            currentLocale,
            router,
            { value: currentSearchQuery, onChange: setCurrentSearchQuery }
          ),
        }}
        menuOverlayItems={menuOverlayItems}
        cookieBanner={cookieBanner}
        footerComponent={
          footer ?? (
            <Footer
              currentLocale={currentLocale}
              strings={strings.footerStrings}
              // links={footerLinks}
              signpostVersion={signpostVersion}
            />
          )
        }
        footerComponentMenuOverlay={footerMenuOverlay}
        layoutDirection={currentLocale.direction}
      >
        <Tabs defaultActiveKey="1" items={getTabsItems()} />
      </LayoutWithMenu>
    </>
  )
}
