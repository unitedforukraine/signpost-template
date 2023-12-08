import { Pagination, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import HomePageCard from './home-page-card';
import { getDateString } from './last-edit-stamp';
import { Locale } from './locale';
import SelectMenu, { MenuItem } from './select-menu';
import { CategoryWithSections, ZendeskArticle } from './zendesk';

const { Title } = Typography;

export interface RecentArticlesStrings {
  selectSubTopicLabel?: string;
  selectTopicLabel: string;
  lastUpdatedLabel: string;
  recentArticlesTitle: string;
}

interface RecentArticlesProps {
  locale: Locale;
  strings: RecentArticlesStrings;
  CATEGORY_ICON_NAMES: { [key: string]: string };
  SECTION_ICON_NAMES: { [key: string]: string };
  CATEGORIES_TO_HIDE: number[];
  articles: ZendeskArticle[];
  categories: CategoryWithSections[];
}

export default function RecentArticles({
  locale,
  strings,
  CATEGORY_ICON_NAMES,
  SECTION_ICON_NAMES,
  CATEGORIES_TO_HIDE,
  articles,
  categories,
}: RecentArticlesProps) {
  const [articlesList, setArticlesList] = useState<ZendeskArticle[]>([]);
  const [categoryItems, setCategoryItems] = useState<MenuItem[]>([]);
  const [sectionFilterItems, setSectionFilterItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredSections, setFilteredSections] = useState<MenuItem[]>([]);
  const [originalArticlesList, setOriginalArticlesList] = useState<
    ZendeskArticle[]
  >([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  function handleTopicChange(val: number): void {
    setSelectedCategory(val);
    setSectionFilterValue(-1);
    setSelectedSection(null);

    const newFilteredSections = sectionFilterItems.filter(
      (item) => item.category === val
    );
    setFilteredSections(newFilteredSections);
    setSectionFilterValue(-1);

    const filteredArticles = originalArticlesList.filter(
      (article) => article.category_id === val
    );

    setArticlesList(filteredArticles);
    setCurrentPage(1);
  }

  // Filter articles based on selected section from the original list

  function setSectionFilterValue(val: number) {
    setSelectedSection(val);
    const filteredArticles = originalArticlesList.filter(
      (article) => article.section_id === val
    );
    setArticlesList(filteredArticles);
    setCurrentPage(1);
  }
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  useEffect(() => {
    setLoading(true);

    // Map category IDs and icons to retrieved articles
    const flatSectionData: {
      [key: number]: { icon: string; categoryID: number };
    } = categories.reduce(
      (
        acc: { [key: number]: { icon: string; categoryID: number } },
        category
      ) => {
        category.sections?.forEach((section) => {
          const icon =
            SECTION_ICON_NAMES[section.id] ||
            CATEGORY_ICON_NAMES[category.category.id] ||
            'help_outline';
          acc[section.id] = { icon, categoryID: category.category.id };
        });
        return acc;
      },
      {}
    );

    articles?.forEach((article) => {
      if (article.section_id in flatSectionData) {
        article.category_id = flatSectionData[article.section_id].categoryID;
        article.icon = flatSectionData[article.section_id].icon;
      }
    });
    const filteredArticles = articles.filter(
      (article) =>
        article.category_id && !CATEGORIES_TO_HIDE.includes(article.category_id)
    );

    filteredArticles.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const categoryItems = categories.map((category) => {
      return {
        name: category.category.name,
        value: category.category.id,
        iconName: CATEGORY_ICON_NAMES[category.category.id] || 'help_outline',
      };
    });
    const sections = categories.flatMap((category) => category.sections);
    const sectionFilterItems = sections.map((section) => {
      return {
        name: section.name,
        value: section.id,
        category: section.category_id,
      };
    });

    setCategoryItems(categoryItems);
    setSectionFilterItems(sectionFilterItems);
    setArticlesList(filteredArticles);
    setOriginalArticlesList(filteredArticles);
    setLoading(false);
  }, [
    locale,
    categories,
    articles,
    CATEGORIES_TO_HIDE,
    CATEGORY_ICON_NAMES,
    SECTION_ICON_NAMES,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastArticle = currentPage * itemsPerPage;
  const indexOfFirstArticle = indexOfLastArticle - itemsPerPage;
  const currentArticles = articlesList.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  return (
    <div className="recent-articles-list">
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <Title level={3} className="cards-list-title">
            {strings.recentArticlesTitle}
          </Title>
          <div className="select-menu-container">
            <SelectMenu
              label={strings.selectTopicLabel}
              items={categoryItems}
              showIcon={true}
              iconType="outlined"
              size="large"
              onSelectChange={(val) => handleTopicChange(val)}
            />
            <SelectMenu
              label={strings.selectSubTopicLabel || ''}
              items={selectedCategory ? filteredSections : sectionFilterItems}
              showIcon={false}
              onSelectChange={(val) => {
                setSectionFilterValue(val);
              }}
              size="large"
              value={selectedSection}
            />
          </div>
          <div className="card-list-wrapper">
            {currentArticles.map((s) => (
              <HomePageCard
                key={s.id}
                title={s.title}
                subtitle={getDateString(
                  s.updated_at,
                  strings.lastUpdatedLabel,
                  locale
                )}
                iconName={s.icon ?? 'help_outline'}
                href={`/articles/${s.id}`}
              />
            ))}
          </div>
          <Pagination
            size="small"
            onChange={handlePageChange}
            total={articlesList.length}
            className="recent-articles-pagination"
            showSizeChanger={false}
          />
        </>
      )}
    </div>
  );
}
