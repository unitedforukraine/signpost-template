import { Button, Space } from 'antd'
import React, { useEffect, useState } from 'react'

import { isLocalStorageAvailable } from './local-storage'
import { disableGoogleAnalytics, enableGoogleAnalytics } from './analytics'

export interface CookieBannerStrings {
  content: string
  accept: string
  reject: string
}

export interface CookieBannerProps {
  strings: CookieBannerStrings
  // The analytics IDs to be enabled/disabled based on the cookie banner response.
  // See src/analytics for more information.
  googleAnalyticsIds: string[]
}

export default function CookieBanner({
  strings: { reject, accept, content },
  googleAnalyticsIds,
}: CookieBannerProps) {
  const [showCookieBanner, setShowCookieBanner] = useState(false)

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      // If localStorage is unavailable (e.g., cookies are blocked), then don't even bother showing it.
      return
    }
    if (!window.localStorage.getItem('cookieStatus')) {
      setShowCookieBanner(true)
    }
  }, [])

  function acceptCookies() {
    window.localStorage.setItem('cookieStatus', 'accepted')
    enableGoogleAnalytics(googleAnalyticsIds)
    setShowCookieBanner(false)
  }

  function rejectCookies() {
    window.localStorage.setItem('cookieStatus', 'rejected')
    disableGoogleAnalytics(googleAnalyticsIds)
    setShowCookieBanner(false)
  }

  if (!showCookieBanner) return null

  return (
    <div className="cookie-banner items-stretch md:justify-between left-0 right-0 bottom-0 flex-col md:flex-row fixed z-10 flex">
      <div className="max-w-full md:max-w-sm">{content}</div>
      <Space size={20} className="flex justify-end mt-5 md:mt-0">
        <Button
          size="large"
          className="cookie-banner-text"
          ghost
          onClick={rejectCookies}
        >
          {reject}
        </Button>
        <Button size="large" onClick={acceptCookies}>
          {accept}
        </Button>
      </Space>
    </div>
  )
}
