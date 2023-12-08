import { animated, useTransition } from '@react-spring/web';
import { Spin } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import ArticleContent, {
  ArticleContentProps,
  ArticleContentStrings,
} from './article-content';
import { CookieBannerStrings } from './cookie-banner';
import Error, { ErrorProps } from './error';
import { FooterStrings } from './footer';
import HrefLangs from './hreflang';
import LayoutWithMenu, { LayoutWithMenuProps } from './layout-with-menu';
import { Locale } from './locale';
import PreviewBanner from './preview-banner';
import { SearchBarStrings } from './search-bar';
import { getArticle } from './zendesk';

export interface ArticlePageStrings {
  articleErrorStrings: ErrorProps;
  searchBarStrings: SearchBarStrings;
  cookieBannerStrings: CookieBannerStrings;
  articleContentStrings: ArticleContentStrings;
  lastUpdatedLabel: string;
  footerStrings: FooterStrings;
}

interface MountProps {
  children: React.ReactNode;
}

function Mount({ children }: MountProps) {
  const transitions = useTransition([children], {
    from: { opacity: 0 },
    enter: { opacity: 1 },
  });

  return transitions(
    (styles, item) =>
      item && <animated.div style={styles}>{children}</animated.div>
  );
}
interface ArticlePageProps {
  pageTitle: string;
  articleId: number;
  canonicalLocales: { [key: string]: string };
  // True when article's translation doen't exist and
  // error page should be shown instead of article content.
  pageUnderConstruction?: boolean;
  siteUrl: string;
  preview: boolean;
  // If true, this page will have a noindex meta-tag.
  noIndex?: boolean;
  errorProps: ErrorProps;
  metaTagAttributes: object[];
  layoutWithMenuProps: LayoutWithMenuProps;
  children: React.ReactNode;
}

/**
 * ArticlePage component provides:
 * - article content in preview or regular mode
 * - additional tags in HTML head if the tags are provided in article content
 * - error hanlding logic if article doesn't exist or its translation is missing
 */
export default function ArticlePage(props: ArticlePageProps) {
  return (
    <>
      <Head>
        <title>{props.pageTitle}</title>
        {props.noIndex && <meta name="robots" content="noindex" />}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {props.metaTagAttributes.map((m: any) => {
          const key =
            m['name'] ?? m['http-equiv'] ?? m['charset'] ?? JSON.stringify(m);
          return <meta key={key} {...m} />;
        })}
        {HrefLangs({
          localeCodesToCanonicalLocaleCodes: props.canonicalLocales,
          siteUrl: props.siteUrl,
          path: `/articles/${props.articleId}`,
        })}
      </Head>
      {props.preview && <PreviewBanner apiRoute="/api/clear-preview-cookies" />}
      <LayoutWithMenu {...props.layoutWithMenuProps}>
        {props.pageUnderConstruction ? (
          <Error {...props.errorProps} />
        ) : (
          props.children
        )}
      </LayoutWithMenu>
    </>
  );
}

interface MountArticleProps {
  articleProps: ArticleContentProps;
}

/**
 * Adds features to ArticleContent component:
 * - Spin element on load
 * - Animation when ArticleContent is re-rendered, excluding the first render because of SEO reasons.
 */
export function MountArticle({ articleProps }: MountArticleProps) {
  const [activeSpin, setActiveSpin] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const onRouteChangeStart = () => {
      setActiveSpin(true);
      setShouldMount(true);
    };
    const onRouteChangeStop = () => setActiveSpin(false);
    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeStop);
    router.events.on('routeChangeError', onRouteChangeStop);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeStop);
      router.events.off('routeChangeError', onRouteChangeStop);
    };
  }, [router, setActiveSpin]);

  // The article content is mounted/animated only when article is re-selected.
  // That is to aviod problems with SEO and caching of content with 0 opacity:
  // https://discourse.webflow.com/t/google-does-it-see-text-that-is-initially-set-at-0-opacity/26967
  const mountedArticle = useMemo(
    () =>
      shouldMount ? (
        <Mount>
          <ArticleContent {...articleProps} />
        </Mount>
      ) : (
        <ArticleContent {...articleProps} />
      ),
    [shouldMount, articleProps]
  );

  return activeSpin ? <Spin>{mountedArticle}</Spin> : mountedArticle;
}

type ZendeskData = {
  url: string;
  mappedUrl: string;
  authHeader: HeadersInit;
};

/** Adds graceful handling for non existing articles or translations.
 *
 * Returns 404 if article has no translations for any of the provided locales.
 * Otherwise returns props which show that page is underconstruction, i.e.
 * the article doesn't exist in the current locale but does exist in other locales.
 */
export async function getErrorResponseProps(
  articleId: number,
  currentLocale: Locale,
  preview: boolean,
  supportedLocales: { [key: string]: Locale },
  zendeskData: ZendeskData
) {
  const articleExistsInOtherLocales = await checkForArticleInOtherLocales(
    articleId,
    currentLocale,
    preview,
    supportedLocales,
    zendeskData
  );

  if (!articleExistsInOtherLocales) return { notFound: true, props: {} };

  return {
    pageUnderConstruction: true,
    locale: currentLocale,
    props: {},
  };
}

async function checkForArticleInOtherLocales(
  articleId: number,
  currentLocale: Locale,
  includeDrafts: boolean,
  locales: { [key: string]: Locale },
  zendeskData: ZendeskData
): Promise<boolean> {
  const otherLocales: Locale[] = Object.values(locales).filter(
    (val) => val.url !== currentLocale.url
  );

  const { url, mappedUrl, authHeader } = zendeskData;
  for (const locale of otherLocales) {
    const article = await getArticle(
      locale,
      articleId,
      url,
      mappedUrl,
      authHeader,
      includeDrafts
    );
    if (article) return true;
  }

  return false;
}
