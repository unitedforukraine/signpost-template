import CookieBanner from '@ircsignpost/signpost-base/dist/src/cookie-banner';
import { MenuOverlayItem } from '@ircsignpost/signpost-base/dist/src/menu-overlay';
import {
  default as DefaultSearchResultsPage,
  SearchResultsPageStrings,
} from '@ircsignpost/signpost-base/dist/src/search-results-page';
import {
  CategoryWithSections,
  ZendeskCategory,
  getArticle,
  getCategories,
  getCategoriesWithSections,
  getTranslationsFromDynamicContent,
} from '@ircsignpost/signpost-base/dist/src/zendesk';
import { GetStaticProps } from 'next';
import getConfig from 'next/config';

import {
  ABOUT_US_ARTICLE_ID,
  CATEGORIES_TO_HIDE,
  CATEGORY_ICON_NAMES,
  GOOGLE_ANALYTICS_IDS,
  REVALIDATION_TIMEOUT_SECONDS,
  SEARCH_BAR_INDEX,
  SEARCH_RESULTS_PAGE_INDEX,
  SECTION_ICON_NAMES,
  SITE_TITLE,
  USE_CAT_SEC_ART_CONTENT_STRUCTURE,
  ZENDESK_AUTH_HEADER,
} from '../lib/constants';
import {
  LOCALES,
  Locale,
  getLocaleFromCode,
  getZendeskLocaleId,
} from '../lib/locale';
import { getHeaderLogoProps } from '../lib/logo';
import { getMenuItems } from '../lib/menu';
import {
  COMMON_DYNAMIC_CONTENT_PLACEHOLDERS,
  SEARCH_RESULTS_PLACEHOLDERS,
  populateCookieBannerStrings,
  populateMenuOverlayStrings,
  populateSearchResultsPageStrings,
} from '../lib/translations';
import { getSiteUrl, getZendeskMappedUrl, getZendeskUrl } from '../lib/url';

interface SearchResultsPageProps {
  currentLocale: Locale;
  strings: SearchResultsPageStrings;
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[];
  // Page title.
  title: string;
  // The site's url, e.g., 'https://unitedforukraine.org'.
  siteUrl: string;
  // A map of dynamic content placeholders to their string values.
  dynamicContent: { [key: string]: string };
}

export default function SearchResultsPage({
  currentLocale,
  strings,
  menuOverlayItems,
  title,
  dynamicContent,
  siteUrl,
}: SearchResultsPageProps) {
  const { publicRuntimeConfig } = getConfig();

  return (
    <DefaultSearchResultsPage
      currentLocale={currentLocale}
      locales={LOCALES}
      pageTitle={title}
      articleSearchResultsIndex={SEARCH_RESULTS_PAGE_INDEX}
      searchResultsFilters={{ categoriesToHide: CATEGORIES_TO_HIDE }}
      searchBarIndex={SEARCH_BAR_INDEX}
      menuOverlayItems={menuOverlayItems}
      headerLogoProps={getHeaderLogoProps(currentLocale)}
      strings={strings}
      siteUrl={siteUrl}
      signpostVersion={publicRuntimeConfig?.version}
      cookieBanner={
        <CookieBanner
          strings={populateCookieBannerStrings(dynamicContent)}
          googleAnalyticsIds={GOOGLE_ANALYTICS_IDS}
        />
      }
    />
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale: Locale = getLocaleFromCode(locale ?? 'en-us');

  const dynamicContent = await getTranslationsFromDynamicContent(
    getZendeskLocaleId(currentLocale),
    COMMON_DYNAMIC_CONTENT_PLACEHOLDERS.concat(SEARCH_RESULTS_PLACEHOLDERS),
    getZendeskUrl(),
    ZENDESK_AUTH_HEADER
  );

  let categories: ZendeskCategory[] | CategoryWithSections[];
  if (USE_CAT_SEC_ART_CONTENT_STRUCTURE) {
    categories = await getCategoriesWithSections(
      currentLocale,
      getZendeskUrl(),
      (c) => !CATEGORIES_TO_HIDE.includes(c.id)
    );
    categories.forEach(({ sections }) => {
      sections.forEach(
        (s) => (s.icon = SECTION_ICON_NAMES[s.id] || 'help_outline')
      );
    });
  } else {
    categories = await getCategories(currentLocale, getZendeskUrl());
    categories = categories.filter((c) => !CATEGORIES_TO_HIDE.includes(c.id));
    categories.forEach(
      (c) => (c.icon = CATEGORY_ICON_NAMES[c.id] || 'help_outline')
    );
  }

  const aboutUsArticle = await getArticle(
    currentLocale,
    ABOUT_US_ARTICLE_ID,
    getZendeskUrl(),
    getZendeskMappedUrl(),
    ZENDESK_AUTH_HEADER
  );

  const menuOverlayItems = getMenuItems(
    populateMenuOverlayStrings(dynamicContent),
    categories,
    !!aboutUsArticle
  );

  const strings = populateSearchResultsPageStrings(dynamicContent);

  return {
    props: {
      currentLocale,
      strings,
      menuOverlayItems,
      title: SITE_TITLE,
      siteUrl: getSiteUrl(),
      dynamicContent,
    },
    revalidate: REVALIDATION_TIMEOUT_SECONDS,
  };
};
