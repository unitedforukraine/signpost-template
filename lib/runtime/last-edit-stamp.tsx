import { Typography } from 'antd';
import React from 'react';

import { Locale } from './locale';

const { Text } = Typography;

/** Returns formatted date string using the label as the prefix. */
export const getDateString = (
  value: string,
  label: string,
  locale: Locale
): string => {
  if (!value || !label) return '';
  const formatter = new Intl.DateTimeFormat(locale.url);
  return locale.direction == 'ltr'
    ? `${label}: ${formatter.format(Date.parse(value))}`
    : `${formatter.format(Date.parse(value))}: ${label}`;
};

export interface LastEditStampProps {
  // Timestamp, e.g. "2022-08-22T16:28:15Z".
  value: string;
  // Description of the timestamp.
  label: string;
  // Locale name for formatting the displayed timestamp.
  locale: Locale;
}

/**
 * @returns element with a localized and formatted last edit date text.
 */
export default function LastEditStamp({
  value,
  label,
  locale,
}: LastEditStampProps) {
  return (
    <Text type="secondary" style={{ fontSize: '0.85rem' }}>
      {getDateString(value, label, locale)}
    </Text>
  );
}
