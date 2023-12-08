// The full screen menu shown on mobile that overlays the main content.
import { Menu } from 'antd';
import type { DirectionType } from 'antd/lib/config-provider/context';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { LogoProps } from './header';
import Layout from './layout';
import { SearchBarProps } from './search-bar';

export interface MenuOverlayStrings {
  home: string;
}

export interface MenuOverlayLeafItem {
  key: React.Key;
  label: React.ReactNode;
  href: string;
}

export interface MenuOverlayGroupItem {
  key: React.Key;
  label: React.ReactNode;
  children: MenuOverlayItem[];
}

export type MenuOverlayItem = MenuOverlayLeafItem | MenuOverlayGroupItem;

export interface MenuOverlayProps {
  // Whether the menu should be open.
  isOpen: boolean;
  // Callback for when the menu should be closed.
  onClose: () => void;
  // Items to display.
  items: MenuOverlayItem[];
  // The logo props.
  logoProps: LogoProps;
  // Props for the search bar component.
  searchBarProps?: SearchBarProps;
  // The direction of the layout.
  layoutDirection?: DirectionType;
  // The footer component.
  footerComponent?: JSX.Element;
}

export function menuOverlayItemToAntMenuItem(item: MenuOverlayItem): ItemType {
  if ('href' in item) {
    return {
      key: item.key,
      label: item.label,
    };
  } else {
    return {
      key: item.key,
      label: item.label,
      children: item.children.map(menuOverlayItemToAntMenuItem),
    };
  }
}

export function menuOverlayItemToTargets(items: MenuOverlayItem[]): {
  [key: string]: string;
} {
  let targets: { [key: string]: string } = {};
  for (const item of items) {
    if ('href' in item) {
      targets[item.key] = item.href;
    } else {
      targets = { ...targets, ...menuOverlayItemToTargets(item.children) };
    }
  }
  return targets;
}

export default function MenuOverlay({
  isOpen,
  onClose,
  items,
  logoProps,
  searchBarProps,
  layoutDirection,
  footerComponent,
}: MenuOverlayProps) {
  // We are not using useMemo, because this function is as costly as the
  // equality comparison to check if useMemo's function needs to run would be.
  const targets = menuOverlayItemToTargets(items);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const previousStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousStyle;
    };
  }, [isOpen]);

  useEffect(() => {
    router.events.on('routeChangeComplete', onClose);
    router.events.on('routeChangeError', onClose);

    return () => {
      router.events.off('routeChangeComplete', onClose);
      router.events.off('routeChangeError', onClose);
    };
  }, [router, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'scroll',
        display: isOpen ? 'block' : 'none',
      }}
    >
      <Layout
        headerProps={{ onClose, logoProps, searchBarProps }}
        layoutDirection={layoutDirection}
        footerComponent={footerComponent}
        disableMainPadding={true}
      >
        <div
          style={{ backgroundColor: 'white', width: '100%', height: '100%' }}
        >
          <Menu
            mode="inline"
            style={{ width: '100%' }}
            items={items.map(menuOverlayItemToAntMenuItem)}
            onClick={({ key }) => {
              router.push(targets[key]);
            }}
          />
        </div>
      </Layout>
    </div>
  );
}
