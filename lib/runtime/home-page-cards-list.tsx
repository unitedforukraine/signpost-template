import { Typography } from 'antd';
import React from 'react';

import HomePageCard, { HomePageCardProps } from './home-page-card';

const { Title, Text } = Typography;

export interface CardsListStrings {
  title: string;
  description: string;
}

export interface CardsListProps {
  // A list of cards to show in the section.
  cards: HomePageCardProps[];
  // Localized strings for seciton title and subtitle.
  strings: CardsListStrings;
}

/**
 * Component for a list of cards usually shown on Home page (e.g. sections or categories).
 *
 * Note: we override font-size for title and description for large screens in .less.
 * TODO: consider using Tailwind for inlining responsive font size.
 */
export default function HomePageCardsList({ strings, cards }: CardsListProps) {
  return (
    <>
      <Title level={3} className="cards-list-title">
        {strings.title}
      </Title>
      <Text type="secondary" className="cards-list-description">
        {strings.description}
      </Text>
      <div className="card-list-wrapper">
        {cards.map((c) => (
          <HomePageCard key={c.title} {...c} />
        ))}
      </div>
    </>
  );
}
