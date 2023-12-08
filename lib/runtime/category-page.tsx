import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import type { CookieBannerStrings } from './cookie-banner'
import Footer, { FooterStrings } from './footer'
import type { LogoProps } from './header'
import LayoutWithMenu from './layout-with-menu'
import type { Locale } from './locale'
import type { MenuOverlayItem } from './menu-overlay'
import { SearchBarStrings, createDefaultSearchBarProps } from './search-bar'
import { AlgoliaSearchIndex } from './search-common'
import type { MenuItem } from './select-menu'
import type { Article, Section } from './topic-with-articles'
import TopicWithArticles from './topic-with-articles'
import {
  getSection,
  getArticlesForSection as getZendeskArticlesForSection,
  getSectionsForCategory as getZendeskSectionsForCategory,
} from './zendesk'

export interface CategoryStrings {
  cookieBannerStrings: CookieBannerStrings
  searchBarStrings: SearchBarStrings
  selectTopicLabel: string
  selectSubTopicLabel: string
  footerStrings: FooterStrings
}

export interface CategoryPageProps {
  currentLocale: Locale
  // All available locales.
  locales: { [key: string]: Locale }
  pageTitle: string
  categoryId: number
  categoryItems: MenuItem[]
  sections: Section[]
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[]
  headerLogoProps: LogoProps
  searchBarIndex?: AlgoliaSearchIndex
  cookieBanner: React.ReactNode
  strings: CategoryStrings
  sectionFilter: boolean
  sectionFilterItems: MenuItem[]
  onSectionFilterChange: (val: number) => void
  footerLinks?: MenuOverlayItem[]
  signpostVersion: string
}

export default function CategoryPage({
  currentLocale,
  locales,
  pageTitle,
  categoryId,
  categoryItems,
  sections,
  menuOverlayItems,
  headerLogoProps,
  searchBarIndex,
  cookieBanner,
  strings,
  sectionFilter,
  sectionFilterItems,
  onSectionFilterChange,
  footerLinks,
  signpostVersion,
}: CategoryPageProps) {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <LayoutWithMenu
        headerProps={{
          currentLocale,
          locales: locales,
          logoProps: headerLogoProps,
          searchBarProps:
            searchBarIndex && strings.searchBarStrings
              ? createDefaultSearchBarProps(
                strings.searchBarStrings,
                searchBarIndex,
                currentLocale,
                router
              )
              : undefined,
        }}
        menuOverlayItems={menuOverlayItems}
        cookieBanner={cookieBanner}
        footerComponent={
          <Footer
            currentLocale={currentLocale}
            strings={strings.footerStrings}
            // links={footerLinks}
            signpostVersion={signpostVersion}
          />
        }
        layoutDirection={currentLocale.direction}
      >
        <TopicWithArticles
          topicId={categoryId}
          topicItems={categoryItems}
          sections={sections}
          selectTopicLabel={strings.selectTopicLabel}
          onSelectChange={(val) => {
            router.push(`/categories/${val}`)
          }}
          sectionFilter={sectionFilter}
          sectionFilterItems={sectionFilterItems}
          selectSubTopicLabel={strings.selectSubTopicLabel}
          onSectionFilterChange={onSectionFilterChange}
        />
      </LayoutWithMenu>
    </>
  )
}

/**
 * Gets section data from Zendesk.
 *
 * @async
 * @param locale - The current locale.
 * @param categoryId
 * @param zendeskUrl - The canonical Zendesk URL, e.g., https://signpost-u4u.zendesk.com.
 * @param lastUpdatedLabel - The label used for articles.
 * @returns {Promise<Section[]>}
 */
export async function getSectionsForCategory(
  locale: Locale,
  categoryId: number,
  zendeskUrl: string,
  lastUpdatedLabel: string
): Promise<Section[]> {
  const sectionsRes = await getZendeskSectionsForCategory(
    locale,
    categoryId,
    zendeskUrl
  )
  const sections = await Promise.all(
    sectionsRes.map(async (section) => {
      const articles = (
        await getZendeskArticlesForSection(locale, section.id, zendeskUrl)
      ).map((article) => {
        return {
          id: article.id,
          title: article.title,
          lastEdit: {
            label: lastUpdatedLabel,
            value: article.updated_at,
            locale: locale,
          },
        }
      })

      return { id: section.id, name: section.name, articles }
    })
  )
  return sections
}

export async function getCategorySection(
  locale: Locale,
  zendeskUrl: string,
  sectionId: number,
  lastUpdatedLabel: string,
  sortBy?: string
): Promise<Section | undefined> {
  const articles: Article[] = (
    await getZendeskArticlesForSection(locale, sectionId, zendeskUrl, sortBy)
  ).map((article) => {
    return {
      id: article.id,
      title: article.title,
      lastEdit: {
        label: lastUpdatedLabel,
        value: article.updated_at,
        locale: locale,
      },
    }
  })

  const section = await getSection(locale, sectionId, zendeskUrl)
  if (!section) return

  const mappedSection: Section = {
    id: section.id,
    name: section.name,
    description: section.description,
    articles,
  }

  return mappedSection
}
