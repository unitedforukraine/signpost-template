// This module implements the language select button and dropdown.
import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import { ButtonType } from 'antd/lib/button'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import React from 'react'

import useLocalStorage from './use-local-storage'
import type { Locale } from './locale'

export interface LanguageSelectProps {
  // The current locale.
  currentLocale: Locale
  // All available locales for the user to choose from.
  locales: { [key: string]: Locale }
  // Type of the language select button.
  buttonType?: ButtonType
  // CSS class name that will be added to the language select button.
  buttonClassName?: string
  // If the language code of the country should be used instead of the full name.
  // By default, the whole name will be used.
  useLanguageCode?: boolean
}

/** The language selection button with its dropdown. */
export default function LanguageSelect({
  currentLocale,
  locales,
  buttonType,
  buttonClassName,
  useLanguageCode,
}: LanguageSelectProps) {
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('.')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [preferredLocale, setPreferredLocale] = useLocalStorage<string>(
    'preferredLocaleJSON',
    currentLocale.url
  )

  useEffect(() => {
    if (!router.isReady) return
    // This is becase if we don't remove the #... from the URL that the anchor link creates it'll always scroll to that element on language change
    const path = router.asPath.replace(/#.*/, '')
    setCurrentPath(path)
  }, [router, setCurrentPath])

  const menu = (
    <Menu
      items={Object.entries(locales)
        .map((keyAndValue) => keyAndValue[1])
        .map(({ url, name }) => {
          return {
            key: url,
            label: (
              <Link key={name} href={currentPath} locale={url}>
                <a onClick={() => setPreferredLocale(url)}> {name} </a>
              </Link>
            ),
          }
        })}
      style={{ overflow: 'hidden' }}
    ></Menu>
  )

  return (
    <>
      <Dropdown overlay={menu} overlayStyle={{}}>
        <Button
          type={buttonType ?? 'primary'}
          className={buttonClassName}
          style={useLanguageCode ? { textTransform: 'uppercase' } : {}}
        >
          {useLanguageCode ? currentLocale.url : currentLocale.name}
          <CaretDownOutlined />
        </Button>
      </Dropdown>
    </>
  )
}
