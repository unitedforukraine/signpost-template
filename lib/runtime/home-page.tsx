import { Typography } from 'antd'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { transformContentHtml } from './article-content'
import type { CookieBannerStrings } from './cookie-banner'
import Footer, { FooterStrings } from './footer'
import { LogoProps } from './header'
import HeaderBanner, { HeaderBannerProps } from './header-banner'
import { HomePageCardProps } from './home-page-card'
import HomePageCardsList, { CardsListStrings } from './home-page-cards-list'
import LayoutWithMenu from './layout-with-menu'
import { Locale } from './locale'
import { MenuOverlayItem } from './menu-overlay'
import RecentArticles, { RecentArticlesStrings } from './recent-articles'
import { SearchBarStrings, createDefaultSearchBarProps } from './search-bar'
import { AlgoliaSearchIndex } from './search-common'
import { ServiceMapProps, ServiceMapStrings } from './service-map'
import { Section, SectionWithArticles } from './topic-with-articles'
import { CategoryWithSections, ZendeskArticle, ZendeskCategory, } from './zendesk'
import type { Config } from './config'

const { Text } = Typography

export interface HomePageStrings {
  cardsListStrings: CardsListStrings
  cookieBannerStrings: CookieBannerStrings
  searchBarStrings?: SearchBarStrings
  serviceMapStrings?: ServiceMapStrings
  topBannerString?: string
  footerStrings: FooterStrings
  recentArticlesStrings?: RecentArticlesStrings
}

export interface HomePageProps {
  config: Config,
  currentLocale: Locale
  // All available locales.
  locales: { [key: string]: Locale }
  strings: HomePageStrings
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[]
  headerBannerProps: HeaderBannerProps
  headerLogoProps: LogoProps
  searchBarIndex?: AlgoliaSearchIndex
  serviceMapProps?: ServiceMapProps
  // The HTML text of the About Us category shown on the home page.
  aboutUsTextHtml: string
  categories: ZendeskCategory[] | CategoryWithSections[]
  cookieBanner: React.ReactNode
  newsSection?: Section
  footerLinks?: MenuOverlayItem[]
  signpostVersion: string
  openGraphImage?: string
  hasRecentArticles?: boolean
  CATEGORY_ICON_NAMES?: { [key: string]: string }
  SECTION_ICON_NAMES?: { [key: string]: string }
  CATEGORIES_TO_HIDE?: number[]
  articles?: ZendeskArticle[]
  articleCategories?: CategoryWithSections[]
}

export default function HomePage({
  config,
  currentLocale,
  locales,
  strings,
  menuOverlayItems,
  headerBannerProps,
  headerLogoProps,
  searchBarIndex,
  serviceMapProps,
  aboutUsTextHtml,
  categories,
  cookieBanner,
  newsSection,
  footerLinks,
  signpostVersion,
  openGraphImage,
  hasRecentArticles,
  CATEGORY_ICON_NAMES,
  SECTION_ICON_NAMES,
  CATEGORIES_TO_HIDE,
  articles,
  articleCategories,
}: HomePageProps) {

  const ServiceMap = dynamic(() => import('./service-map'), {
    loading: () => <p>A map is loading...</p>,
    ssr: false,
  })

  const router = useRouter()
  const hasServiceMap = serviceMapProps && serviceMapProps.services.length && strings.serviceMapStrings
  const newsSectionLight = 'sections' in categories[0] && categories.length % 2 === 0
  const serviceMapLight = newsSection ? !newsSectionLight : 'sections' in categories[0] && categories.length % 2 === 0
  const recentArticlesLight = (hasServiceMap && !serviceMapLight) || (!hasServiceMap && categories.length % 2 === 0)
  const aboutUsCategoryLight = hasRecentArticles ? !recentArticlesLight : hasServiceMap ? !serviceMapLight : serviceMapLight

  return (
    <>
      <Head>
        <title>{config.title}</title>
        <link rel="icon" href="/favicon.ico" />
        {/* Add Open Graph meta tag for image */}
        {openGraphImage && (
          <meta property="og:image" content={openGraphImage} />
        )}
      </Head>
      <LayoutWithMenu
        headerProps={{
          currentLocale,
          locales,
          logoProps: headerLogoProps,
          searchBarProps: searchBarIndex && strings.searchBarStrings ? createDefaultSearchBarProps(strings.searchBarStrings, searchBarIndex, currentLocale, router) : undefined,
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
        <section className={'header-banner--background-color'}>
          <HeaderBanner {...headerBannerProps} />
        </section>
        {strings.topBannerString && (
          <section className={'home-page-section ' + 'top-banner'}>
            <Text>{strings.topBannerString}</Text>
          </section>
        )}
        {'sections' in categories[0] ? (
          <>
            {(categories as CategoryWithSections[]).map(
              ({ category, sections }, index) => (
                <CategoryCardList
                  key={category.id}
                  title={category.name}
                  subtitle={category.description}
                  sections={sections.map((section) => {
                    return {
                      title: section.name,
                      subtitle: section.description,
                      iconName: section.icon,
                      href: '/sections/' + section.id.toString(),
                    }
                  })}
                  backgroundClassName={
                    index % 2 === 0
                      ? 'home-page-section--light'
                      : 'home-page-section--dark'
                  }
                />
              )
            )}
          </>
        ) : (
          <section
            className={'home-page-section' + ' ' + 'home-page-section--light'}
          >
            <HomePageCardsList
              cards={(categories as ZendeskCategory[]).map((c) => {
                return {
                  title: c.name,
                  subtitle: c.description,
                  iconName: c.icon,
                  href: `/categories/${c.id}`,
                }
              })}
              strings={strings.cardsListStrings}
            />
          </section>
        )}
        {newsSection && (
          <section
            className={
              'home-page-section ' +
              (newsSectionLight
                ? 'home-page-section--light'
                : 'home-page-section--dark')
            }
          >
            <SectionWithArticles key={newsSection.id} section={newsSection} />
          </section>
        )}
        {!!hasServiceMap && (
          <section
            className={
              'home-page-section ' +
              (serviceMapLight
                ? 'home-page-section--light'
                : 'home-page-section--dark')
            }
            id="service-map"
          >
            <ServiceMap
              {...serviceMapProps}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              strings={strings.serviceMapStrings!}
            />
          </section>
        )}
        {hasRecentArticles && strings.recentArticlesStrings && (
          <section
            className={
              'home-page-section ' +
              (recentArticlesLight
                ? 'home-page-section--light'
                : 'home-page-section--dark')
            }
            id="recent-articles"
          >
            <RecentArticles
              locale={currentLocale}
              strings={strings.recentArticlesStrings}
              CATEGORY_ICON_NAMES={CATEGORY_ICON_NAMES || {}}
              SECTION_ICON_NAMES={SECTION_ICON_NAMES || {}}
              CATEGORIES_TO_HIDE={CATEGORIES_TO_HIDE || []}
              articles={articles || []}
              categories={articleCategories || []}
            />
          </section>
        )}
        {aboutUsTextHtml && (
          <section
            className={
              'home-page-section ' +
              (aboutUsCategoryLight
                ? 'home-page-section--light'
                : 'home-page-section--dark')
            }
          >
            {transformContentHtml(aboutUsTextHtml)}
          </section>
        )}
      </LayoutWithMenu>
    </>
  )
}

interface CategoryCardListProps {
  // The title of this category.
  title: string
  // The subtitle of this category.
  subtitle: string
  // The sections to be shown under this category.
  sections: HomePageCardProps[]
  backgroundClassName: string
}

function CategoryCardList({
  title,
  subtitle,
  sections,
  backgroundClassName,
}: CategoryCardListProps) {
  return (
    <section className={'home-page-section ' + backgroundClassName}>
      <HomePageCardsList
        strings={{ title: title, description: subtitle }}
        cards={sections}
      />
    </section>
  )
}
