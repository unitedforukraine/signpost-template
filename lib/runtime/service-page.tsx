import { animated, useTransition } from '@react-spring/web';
import { Spin } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import { CookieBannerStrings } from './cookie-banner';
import Error, { ErrorProps } from './error';
import { FooterStrings } from './footer';
import HrefLangs from './hreflang';
import LayoutWithMenu, { LayoutWithMenuProps } from './layout-with-menu';
import PreviewBanner from './preview-banner';
import { SearchBarStrings } from './search-bar';
import ServiceContent, {
  ServiceContentProps,
  ServiceContentStrings,
} from './service-content';

export interface ServicePageStrings {
  serviceErrorStrings: ErrorProps;
  searchBarStrings: SearchBarStrings;
  cookieBannerStrings: CookieBannerStrings;
  serviceContentStrings: ServiceContentStrings;
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

export interface ServicePageProps {
  pageTitle: string;
  serviceId: number;
  canonicalLocales: { [key: string]: string };
  pageUnderConstruction?: boolean;
  siteUrl: string;
  preview: boolean;
  noIndex?: boolean;
  errorProps: ErrorProps;
  metaTagAttributes: object[];
  layoutWithMenuProps: LayoutWithMenuProps;
  children: React.ReactNode;
}

export default function ServicePage(props: ServicePageProps) {
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
          path: `/services/${props.serviceId}`,
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

interface MountServiceProps {
  serviceProps: ServiceContentProps;
}

export function MountService({ serviceProps }: MountServiceProps) {
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

  const mountedService = useMemo(
    () =>
      shouldMount ? (
        <Mount>
          <ServiceContent {...serviceProps} />
        </Mount>
      ) : (
        <ServiceContent {...serviceProps} />
      ),
    [shouldMount, serviceProps]
  );

  return activeSpin ? <Spin>{mountedService}</Spin> : mountedService;
}
