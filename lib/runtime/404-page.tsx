import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import type { CookieBannerStrings } from './cookie-banner'
import Error, { ErrorProps } from './error'
import Footer, { FooterStrings } from './footer'
import { LogoProps } from './header'
import LayoutWithMenu from './layout-with-menu'
import { Locale } from './locale'
import { MenuOverlayItem } from './menu-overlay'
import { SearchBarStrings, createDefaultSearchBarProps } from './search-bar'
import { AlgoliaSearchIndex } from './search-common'

export interface Custom404Strings {
  errorStrings: ErrorProps
  cookieBannerStrings: CookieBannerStrings
  searchBarStrings: SearchBarStrings
  footerStrings: FooterStrings
}

export interface Custom404PageProps {
  currentLocale: Locale
  // All available locales.
  locales: { [key: string]: Locale }
  // Page title.
  title: string
  strings: Custom404Strings
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[]
  headerLogoProps: LogoProps
  searchBarIndex?: AlgoliaSearchIndex
  cookieBanner: React.ReactNode
  footerLinks?: MenuOverlayItem[]
  signpostVersion: string
}

export default function Custom404Page({
  currentLocale,
  locales,
  title,
  strings,
  menuOverlayItems,
  headerLogoProps,
  searchBarIndex,
  cookieBanner,
  footerLinks,
  signpostVersion,
}: Custom404PageProps) {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <LayoutWithMenu
        headerProps={{
          currentLocale,
          locales,
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
        <Error {...strings.errorStrings} />
      </LayoutWithMenu>
    </>
  )
}
