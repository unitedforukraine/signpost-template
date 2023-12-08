// Standard layout with mobile menu overlay functionality.
import type { DirectionType } from 'antd/lib/config-provider/context';
import React, { useState } from 'react';

import { StandardHeaderProps } from './header';
import Layout from './layout';
import MenuOverlay, { MenuOverlayItem } from './menu-overlay';

export interface LayoutWithMenuProps {
  headerProps: StandardHeaderProps;
  // Menu items to display in the overlay and header.
  menuOverlayItems: MenuOverlayItem[];
  children: React.ReactNode;
  // The direction of the layout.
  layoutDirection?: DirectionType;
  // The footer component for the main layout.
  footerComponent?: JSX.Element;
  // The footer component for the menu overlay.
  footerComponentMenuOverlay?: JSX.Element;
  cookieBanner: React.ReactNode;
}

export default function LayoutWithMenu({
  headerProps,
  menuOverlayItems,
  children,
  layoutDirection,
  footerComponent,
  footerComponentMenuOverlay,
  cookieBanner,
}: LayoutWithMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div style={{ height: '100%' }}>
        <MenuOverlay
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          items={menuOverlayItems}
          logoProps={headerProps.logoProps}
          searchBarProps={headerProps.searchBarProps}
          footerComponent={footerComponentMenuOverlay}
        />
        <Layout
          headerProps={{
            ...headerProps,
            onMenuOpen: () => setIsOpen(true),
            menuItems: menuOverlayItems,
          }}
          layoutDirection={layoutDirection}
          footerComponent={footerComponent}
          cookieBanner={cookieBanner}
        >
          {children}
        </Layout>
      </div>
    </>
  );
}
