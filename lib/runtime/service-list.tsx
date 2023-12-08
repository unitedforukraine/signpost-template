import { Pagination, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { DirectusArticle } from './directus';
import HomePageCard from './home-page-card';
import { Locale } from './locale';
import { getServiceDesctiption, getServiceName, stripHtmlTags } from './map';

const { Text } = Typography;

interface ServiceListProps {
  services: DirectusArticle[];
  currentLocale: Locale;
  strings: ServiceListStrings;
}

interface ServiceListStrings {
  resultSummaryStringTemplate: (
    firstOnPage: number,
    lastOnPage: number,
    totalCount: number
  ) => string;
}

export default function ServiceList({
  services,
  strings: { resultSummaryStringTemplate },
  currentLocale,
}: ServiceListProps) {
  const [servicesList, setServicesList] = useState<DirectusArticle[]>(
    services.slice(0, 10) //This is done like this because we are using Pagination and showing max 10 services per page
  );
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [maxQuantity, setMaxQuantity] = useState<number>(10);

  const handlePageChange = (page: number, pageSize: number) => {
    setServicesList(
      services.slice(
        (page - 1) * pageSize,
        Math.min(services.length, page * pageSize)
      )
    );
    setMinQuantity(1 + (page - 1) * pageSize);
    setMaxQuantity(Math.min(services.length, page * pageSize));
  };

  useEffect(() => {
    setServicesList(services.slice(0, 10));
    setMinQuantity(1);
    setMaxQuantity(Math.min(services.length, 10));
  }, [services]);

  return (
    <div className="service-list">
      <Text type="secondary">
        {resultSummaryStringTemplate(minQuantity, maxQuantity, services.length)}
      </Text>
      <div className="card-list-wrapper">
        {servicesList.map((s) => (
          <HomePageCard
            key={s.id}
            title={getServiceName(s, currentLocale)}
            subtitle={stripHtmlTags(
              getServiceDesctiption(s, currentLocale) || ''
            )?.slice(0, 100)}
            iconName={
              s.categories.length
                ? s.categories[0]?.service_categories_id?.Icon
                : ''
            }
            href={`/services/${s.id}`}
          />
        ))}
      </div>
      <Pagination
        size="small"
        onChange={handlePageChange}
        total={services.length}
        className="service-list-pagination"
        showSizeChanger={false}
      />
    </div>
  );
}
