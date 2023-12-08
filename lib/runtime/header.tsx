// This module implements U4U's header.
import {
  CaretDownOutlined,
  CloseOutlined,
  MenuOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import HeaderBanner, { HeaderBannerProps } from './header-banner';
import LanguageSelect from './language-select';
import type { Locale } from './locale';
import {
  MenuOverlayGroupItem,
  MenuOverlayItem,
  menuOverlayItemToAntMenuItem,
  menuOverlayItemToTargets,
} from './menu-overlay';
import SearchBar, { SearchBarProps } from './search-bar';

export interface StandardHeaderProps {
  // Handle menu opening action.
  onMenuOpen?: () => void;
  // Menu items to display in the header.
  menuItems?: MenuOverlayItem[];
  // The current locale.
  currentLocale: Locale;
  // All locales for the user to choose from.
  locales: { [key: string]: Locale };
  // The logo props.
  logoProps: LogoProps;
  // Props for the search bar component.
  searchBarProps?: SearchBarProps;
  // Data for header banner. If it's present, we render banner with welcome description and social media data.
  headerBannerProps?: HeaderBannerProps;
  // The class for the parent tag.
  className?: string;
}

export interface MenuOverlayHeaderProps {
  // Handler for menu closing action.
  onClose: () => void;
  // The logo props.
  logoProps: LogoProps;
  // Props for the search bar component.
  searchBarProps?: SearchBarProps;
}

export type HeaderProps = StandardHeaderProps | MenuOverlayHeaderProps;

export interface LogoProps {
  // Src url for the logo.
  src: string;
  link?: string;
}

function Logo({ src, link }: LogoProps): React.ReactElement {
  return (
    <Link href={link ? link : '/'}>
      <div className={'image-container'}>
        <a className={'header__section header__section--logo'}>
          <Image src={src} alt="Logo" layout="fill" className={'image'} />
        </a>
      </div>
    </Link>
  );
}

/** Mobile header that only shows Logo and Menu close button. */
function MenuOverlayHeader({
  onClose,
  logoProps,
}: MenuOverlayHeaderProps): React.ReactElement {
  return (
    <div className={'header header--background-color'}>
      <Logo {...logoProps} />
      <section className={'header__section--menu header__section'}>
        <Button
          type="primary"
          className={'header__section--menu-button header--text-color'}
          onClick={onClose}
          icon={<CloseOutlined />}
          style={{ textTransform: 'capitalize' }}
        />
      </section>
    </div>
  );
}

/**
 * Header on mobile screens that shows Logo, Search button and Menu.
 * If Search button is clicked, show Search bar and close button.
 */
export function StandardMobileHeader({
  onMenuOpen,
  currentLocale,
  locales,
  logoProps,
  searchBarProps,
  headerBannerProps,
  className,
}: StandardHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const buttonClassName =
    'header__section--menu-button' +
    (headerBannerProps ? ' header-banner--text-color' : ' header--text-color');
  // If search is active, show search bar in header and hide all other elements.
  return (
    <div
      className={
        (headerBannerProps
          ? 'header-banner--background-color'
          : 'header--background-color') + (className ? ' ' + className : '')
      }
    >
      <div className={'header'}>
        {isSearchActive && searchBarProps ? (
          <>
            <SearchBar {...searchBarProps} />
            <Button
              type="primary"
              className={buttonClassName}
              onClick={() => {
                setIsSearchActive(false);
              }}
              icon={<CloseOutlined />}
              style={{ textTransform: 'capitalize' }}
            />
          </>
        ) : (
          <>
            <Logo {...logoProps} />
            <section className={'header__section--menu header__section'}>
              <LanguageSelect
                buttonClassName={buttonClassName}
                currentLocale={currentLocale}
                locales={locales}
                useLanguageCode={false}
              />
              {/* Hide search and the menu on very small screens with
                 display CSS. They are not necessary. */}
              {searchBarProps && (
                <Button
                  type="primary"
                  className={buttonClassName + ' display-xsm-block'}
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setIsSearchActive(true);
                  }}
                  style={{ display: 'none' }}
                />
              )}
              <Button
                type="primary"
                className={buttonClassName + ' display-xsm-block'}
                onClick={onMenuOpen}
                icon={<MenuOutlined />}
                style={{ textTransform: 'capitalize', display: 'none' }}
              />
            </section>
          </>
        )}
      </div>
      {headerBannerProps && <HeaderBanner {...headerBannerProps} />}
    </div>
  );
}

/** Header on large screens. It shows Logo, Search bar and Language picker. */
export function StandardDesktopHeader({
  menuItems,
  currentLocale,
  locales,
  logoProps,
  searchBarProps,
  headerBannerProps,
  className,
}: StandardHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const targets = menuItems ? menuOverlayItemToTargets(menuItems) : {};
  const router = useRouter();
  const buttonClassName =
    'header__section--menu-button' +
    (headerBannerProps ? ' header-banner--text-color' : ' header--text-color');
  return (
    <div
      className={
        (headerBannerProps
          ? 'header-banner--background-color'
          : 'header--background-color') + (className ? ' ' + className : '')
      }
    >
      <div className={'header'}>
        <Logo {...logoProps} />
        <section className={'header__section header__section--non-logo'}>
          {isSearchActive && searchBarProps ? (
            <>
              <SearchBar {...searchBarProps} />
              <Button
                type="primary"
                className={buttonClassName}
                onClick={() => {
                  setIsSearchActive(false);
                }}
                icon={<CloseOutlined />}
                style={{ textTransform: 'capitalize' }}
              />
            </>
          ) : (
            <div className={'header__section--menu'}>
              {menuItems &&
                menuItems.map((menuItem: MenuOverlayItem) => {
                  if ('href' in menuItem) {
                    return (
                      <Button
                        key={menuItem.key}
                        type="primary"
                        className={buttonClassName}
                        onClick={() => {
                          router.push(targets[menuItem.key]);
                        }}
                      >
                        {menuItem.label}
                      </Button>
                    );
                  }
                  const menu = (
                    <Menu
                      items={(menuItem as MenuOverlayGroupItem).children.map(
                        menuOverlayItemToAntMenuItem
                      )}
                      style={{ overflow: 'hidden' }}
                      onClick={({ key }) => {
                        router.push(targets[key]);
                      }}
                    ></Menu>
                  );
                  return (
                    <Dropdown
                      overlay={menu}
                      overlayStyle={{}}
                      key={menuItem.key}
                    >
                      <Button type="primary" className={buttonClassName}>
                        {menuItem.label}
                        <CaretDownOutlined />
                      </Button>
                    </Dropdown>
                  );
                })}
              <LanguageSelect
                currentLocale={currentLocale}
                locales={locales}
                buttonClassName={buttonClassName}
              />
              {searchBarProps && (
                <Button
                  type="primary"
                  className={buttonClassName}
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setIsSearchActive(true);
                  }}
                />
              )}
            </div>
          )}
        </section>
      </div>
      {headerBannerProps && <HeaderBanner {...headerBannerProps} />}
    </div>
  );
}

export default function Header(props: HeaderProps) {
  if ('onClose' in props) {
    return <MenuOverlayHeader {...props} />;
  } else {
    return (
      <>
        <StandardMobileHeader {...props} className="display-md-none" />
        <StandardDesktopHeader
          {...props}
          className="display-none display-md-block"
        />
      </>
    );
  }
}
