import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import type { CookieBannerStrings } from './cookie-banner'
import Footer, { FooterStrings } from './footer'
import type { LogoProps } from './header'
import LayoutWithMenu from './layout-with-menu'
import { Locale } from './locale'
import type { MenuOverlayItem } from './menu-overlay'
import { SearchBarStrings, createDefaultSearchBarProps } from './search-bar'
import { AlgoliaSearchIndex } from './search-common'
import type { MenuItem } from './select-menu'
import type { Section } from './topic-with-articles'
import TopicWithArticles from './topic-with-articles'
import { getSection } from './zendesk'

export interface SectionStrings {
  cookieBannerStrings: CookieBannerStrings
  searchBarStrings: SearchBarStrings
  selectTopicLabel: string
  footerStrings: FooterStrings
}

export interface SectionPageProps {
  currentLocale: Locale
  // All available locales.
  locales: { [key: string]: Locale }
  pageTitle: string
  sectionId: number
  sectionItems: MenuItem[]
  section: Section
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[]
  headerLogoProps: LogoProps
  searchBarIndex?: AlgoliaSearchIndex
  cookieBanner: React.ReactNode
  strings: SectionStrings
  footerLinks?: MenuOverlayItem[]
  signpostVersion: string
}

export default function SectionPage({
  currentLocale,
  locales,
  pageTitle,
  sectionId,
  sectionItems,
  section,
  menuOverlayItems,
  headerLogoProps,
  searchBarIndex,
  cookieBanner,
  strings,
  footerLinks,
  signpostVersion,
}: SectionPageProps) {
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
          topicId={sectionId}
          topicItems={sectionItems}
          sections={[section]}
          selectTopicLabel={strings.selectTopicLabel}
          onSelectChange={(val) => {
            router.push(`/sections/${val}`)
          }}
        />
      </LayoutWithMenu>
    </>
  )
}

export async function getSectionRedirectServerSideProps(
  locale: Locale,
  sectionId: number,
  zendeskUrl: string
) {
  const section = await getSection(locale, sectionId, zendeskUrl)

  if (!section) return { notFound: true, props: {} }

  return {
    redirect: {
      destination: `/${locale.url}/categories/${section.category_id}`,
    },
    props: {},
  }
}
