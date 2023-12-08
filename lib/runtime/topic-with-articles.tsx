import { List, Space, Typography } from 'antd';
import Link from 'next/link';
import React, { useState } from 'react';

import LastEditStamp, { LastEditStampProps } from './last-edit-stamp';
import SelectMenu, { MenuItem } from './select-menu';

const { Text, Title } = Typography;
export interface Section {
  id: number;
  name: string;
  description?: string;
  articles: Article[];
}

export interface Article {
  id: number;
  title: string;
  lastEdit: LastEditStampProps;
}

interface SectionContentProps {
  section: Section;
}

export function SectionWithArticles({ section }: SectionContentProps) {
  return (
    <List
      itemLayout="horizontal"
      className="section"
      header={
        section.description ? (
          <>
            <Title level={3}>{section.name}</Title>
            <Text type="secondary">{section.description}</Text>
          </>
        ) : (
          <Title level={3}>{section.name}</Title>
        )
      }
      dataSource={section.articles}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <List.Item.Meta
            title={
              <Link href={'/articles/' + item.id}>
                <a style={{ fontSize: 16 }}>{item.title}</a>
              </Link>
            }
            description={<LastEditStamp {...item.lastEdit} />}
          />
        </List.Item>
      )}
    />
  );
}

interface TopicWithArticlesProps {
  // Id of the selected topic.
  topicId: number;
  // List of topics.
  topicItems: MenuItem[];
  // List of sections with articles.
  sections: Section[];
  // A label for select topic dropdown.
  selectTopicLabel: string;
  // On select topic change action.
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onSelectChange: (val: any) => void;
  // A flag indication if it has a dropdown for section filtering
  sectionFilter?: boolean;
  // A label for select filter dropdown.
  selectSubTopicLabel?: string;
  // List of filters.
  sectionFilterItems?: MenuItem[];
  // On select topic change action.
  onSectionFilterChange?: (val: number) => void;
}

export default function TopicWithArticles({
  topicId,
  topicItems,
  sections,
  selectTopicLabel,
  onSelectChange,
  sectionFilter,
  sectionFilterItems,
  onSectionFilterChange,
  selectSubTopicLabel,
}: TopicWithArticlesProps) {
  const [sectionFilterValue, setSectionFilterValue] = useState<
    number | undefined
  >(undefined);

  return (
    <Space direction="vertical" size="large" className="topic">
      <div className="select-menu-container">
        <SelectMenu
          label={selectTopicLabel}
          items={topicItems}
          showIcon={true}
          iconType="outlined"
          size="large"
          initialValue={topicId}
          onSelectChange={() => {
            setSectionFilterValue(undefined);
            onSelectChange;
          }}
        />
        {sectionFilter && (
          <SelectMenu
            label={selectSubTopicLabel || ''}
            items={sectionFilterItems || []}
            showIcon={false}
            onSelectChange={(val) => {
              setSectionFilterValue(val);
            }}
            onChange={onSectionFilterChange}
            size="large"
            value={sectionFilterValue}
          />
        )}
      </div>
      {sections.map((section) => (
        <SectionWithArticles key={section.id} section={section} />
      ))}
    </Space>
  );
}
