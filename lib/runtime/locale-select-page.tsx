// This module implements a locale selection page.
//
// This page accepts an optional target pathname as a query parameter. It
// displays a page that redirects to the pathname in the selected locale.
import { Button, Spin } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import useLocalStorage from './use-local-storage'

// A single language to be used on the page.
export interface Lang {
  langShort: string
  langLong: string
}

interface LocaleSelectButtonProps {
  target?: URL | string
  lang: Lang
  onClick: () => void
}

/** A button for redirecting a user to a locale.
 *
 * This block disables the language selection buttons if target is falsey, so
 * that users or automation don't click on them before they are ready.
 */
function LocaleSelectButton({
  target,
  lang,
  onClick,
}: LocaleSelectButtonProps) {
  return (
    <div className="locale-select-page-button-container">
      {target ? (
        <Link href={target} locale={lang.langShort} passHref>
          {/* Putting display: 'block', so that the button fills out available width. */}
          <Button ghost size="large" onClick={onClick} block={true}>
            {lang.langLong}
          </Button>
        </Link>
      ) : (
        <Button ghost disabled={true}>
          {lang.langLong}
        </Button>
      )}
    </div>
  )
}

export interface LocaleSelectPageComponentProps {
  // The relative non-localized target URL the locale selection should redirect to.
  target?: URL | string
  // The function the page should call when it want to redirect the user.
  onRedirect: (target: URL | string, locale: string) => void
  langs: Lang[]
  image: JSX.Element
  message: string
}

/** The main locale selection page component.
 *
 * This page has two functionalities:
 * - Allow first time visitors to select their locale.
 * - Redirect recurring visitors to their selected locale.
 *
 * Until this page gets a valid target and has checked local storage, it
 * renders a spinner.
 *
 * The page only shows the locale selection buttons to first time visitors.
 */
export function LocaleSelectPageComponent({
  target,
  onRedirect,
  langs,
  image,
  message,
}: LocaleSelectPageComponentProps) {
  // The target path this page should redirect to.
  const UNSET_PREFERRED_LOCALE = 'unset'
  const [preferredLocale, setPreferredLocale] = useLocalStorage<string>(
    'preferredLocaleJSON',
    UNSET_PREFERRED_LOCALE
  )

  /** If the user has already been here, redirect the user. */
  function redirect() {
    // Wait for router to get all query parameters (target) and preferredLocale
    // to be set.
    if (
      !target ||
      preferredLocale === undefined ||
      preferredLocale === UNSET_PREFERRED_LOCALE
    )
      return

    function isLocaleSupported(langShort: string): boolean {
      return langs.map((l) => l.langShort).includes(langShort)
    }

    if (isLocaleSupported(preferredLocale)) {
      onRedirect(target, preferredLocale)
    } else {
      setPreferredLocale(UNSET_PREFERRED_LOCALE)
      return
    }
  }
  useEffect(redirect, [
    target,
    onRedirect,
    langs,
    preferredLocale,
    setPreferredLocale,
  ])

  return (
    <>
      {/* Render the page only once the router is ready, because the links in
        the dialog depend on router.query.target.

        Also gate on preferredLocale being unset. We do not want to display a
        locale selector while a redirect is happening.
        */}
      <div className="locale-select-page-container">
        {target !== null &&
          (preferredLocale === undefined ||
            preferredLocale === UNSET_PREFERRED_LOCALE) ? (
          <div
            className="locale-select-page-content"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {image}
            <div className="locale-select-page-message">{message}</div>
            {langs.map((lang) => (
              <LocaleSelectButton
                target={target}
                lang={lang}
                key={lang.langShort}
                onClick={() => setPreferredLocale(lang.langShort)}
              />
            ))}
          </div>
        ) : (
          <Spin size="large" />
        )}
      </div>
    </>
  )
}

function getFirstParameter(
  param: string | string[] | undefined
): string | undefined {
  if (Array.isArray(param)) return param[0]
  return param
}

export interface LocaleSelectPageProps {
  // The site's title.
  siteTitle: string
  // The locale selection message.
  message: string
  // The supported locales.
  langs: Lang[]
  // The logo image.
  image: JSX.Element
}

/** The locale selection page. */
export default function LocaleSelectPage({
  siteTitle,
  message,
  langs,
  image,
}: LocaleSelectPageProps) {
  const router = useRouter()
  // The target path this page should redirect to.
  const [target, setTarget] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) return
    setTarget(getFirstParameter(router.query.target) ?? '/')
  }, [router, setTarget])

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <LocaleSelectPageComponent
        target={target}
        onRedirect={(target: URL | string, locale: string) =>
          router.push(target, undefined, { locale })
        }
        langs={langs}
        image={image}
        message={message}
      />
    </>
  )
}
