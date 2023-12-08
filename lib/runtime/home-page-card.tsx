import { Card, Typography } from 'antd';
import Link from 'next/link';
import React from 'react';

const { Title, Text } = Typography;

type IconType = 'material' | 'fontAwesome';
export interface HomePageCardProps {
  // Card title.
  title: string;
  // Card subtitle.
  subtitle: string;
  // The material icon name for the card.
  iconName: string;
  iconType?: IconType;
  // Either a link or a function that changes location.
  //
  // We occasionally need a function, because we want to use a GA call to register a click.
  href: string | (() => void);
}

function renderIcon(iconType: IconType = 'material', iconName: string) {
  if (iconType === 'material') {
    return <span className="material-icons card-icon">{iconName}</span>;
  } else {
    return <i className={`fa fa-${iconName} card-icon`} />;
  }
}

/**
 * Component for a card usually shown on Home page (e.g. sections or categories).
 *
 * Configurable styles:
 *  - Ant card styles, e.g. card-padding-base.
 *  - @home-page-card-icon-color
 *  - @home-page-card-shadow
 */
export default function HomePageCard({
  title,
  subtitle,
  iconName,
  href,
  iconType,
}: HomePageCardProps) {
  const cardContent = (
    <Card hoverable className="home-page-card">
      <Card.Meta
        avatar={renderIcon(iconType, iconName)}
        title={
          // Override font-size for large screens for .card-title.
          <Title level={4} className="card-title">
            {title}
          </Title>
        }
        description={<Text type="secondary">{subtitle}</Text>}
      />
    </Card>
  );

  return typeof href === 'string' ? (
    <Link href={href} tabIndex={0}>
      <a className="card-wrapper">{cardContent}</a>
    </Link>
  ) : (
    <div
      className="card-wrapper"
      tabIndex={0}
      onClick={href}
      onKeyDown={(e) => {
        if (e.key === 'Enter') href();
      }}
    >
      {cardContent}
    </div>
  );
}
