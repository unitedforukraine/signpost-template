// This module controls analytics for the site.
import { useRouter } from 'next/router'
import Script from 'next/script'
import React, { useEffect } from 'react'

declare global {
  interface Window {
    gtag: any
  }
}

// The following functions only work if you include the Analytics component on your site.
// The component should be included as the first component in pages/_app.(jsx|tsx),
// right above <Component {...pageProps} />;

// Opts user out of Google Analytics tracking.
export function disableGoogleAnalytics(googleAnalyticsIds: string[]) {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
  for (const id of googleAnalyticsIds) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    (window as any)[`ga-disable-${id}`] = true
  }
}

// Re-enables Google Analytics tracking if it was previously disabled.
export function enableGoogleAnalytics(googleAnalyticsIds: string[]) {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
  for (const id of googleAnalyticsIds) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    delete (window as any)[`ga-disable-${id}`]
  }
}

// Tracks a click event for the given category and label.
export function trackClickEvent(eventCategory: string, eventLabel: string) {
  window.gtag('event', /*action*/ 'click,auxclick,contextmenu', {
    event_category: eventCategory,
    event_label: eventLabel,
  })
}

export interface AnalyticsProps {
  // The google analytics IDs to track.
  // There must be at least one. There may be more than one, for example,
  // during the migration from Universal Analytics to Google Analytics 4.
  googleAnalyticsIds: string[]
}

export default function Analytics({ googleAnalyticsIds }: AnalyticsProps) {
  const router = useRouter()

  // Records a page view hit for the given url.
  function pageview(url: string) {
    // https://developers.google.com/analytics/devguides/collection/gtagjs/pages#page_view_event
    window.gtag('event', 'page_view', {
      page_path: url,
    })
  }

  useEffect(() => {
    if (googleAnalyticsIds.length === 0) return

    // When the component is mounted, subscribe to router changes
    // and log those page views. Need this because of client side
    // navigation.
    router.events.on('routeChangeComplete', pageview)

    // If the component is unmounted, unsubscribe from the event
    // with the `off` method.
    return () => {
      router.events.off('routeChangeComplete', pageview)
    }
  }, [router.events, googleAnalyticsIds.length])

  if (googleAnalyticsIds.length === 0) {
    return <></>
  }

  return (
    <>
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      {/* We need two Google Analytics IDs because Universal Analytics will soon be deprecated
      so we need to slowly migrate to Google Analytics 4. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsIds[0]}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          ${googleAnalyticsIds
            .map((id) => {
              return `gtag('config', '${id}', {
                  send_page_view: false
                });`
            })
            .join('')}
        `}
      </Script>
    </>
  )
}
