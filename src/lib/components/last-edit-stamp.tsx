import { Typography } from 'antd';
import React from 'react';

import {langauages} from '.././locale';

const { Text } = Typography;

interface Locale {
    url: string;
    direction: 'ltr' | 'rtl';
    name: string;
}

function getLocaleData(localeKey: keyof typeof langauages): Locale {
    const langData = langauages[localeKey];
    return {
        url: localeKey,
        direction: langData && langData? 'rtl' : 'ltr',
        name: langData?.name 

    }
}

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
  // label: 'string';
  // Locale name for formatting the displayed timestamp.
  locale: Locale;
}

/**
 * @returns element with a localized and formatted last edit date text.
 */
export default function LastEditStamp({
  value,
  locale,
}: LastEditStampProps) {

  const tempLabel = "Last Updated";
  return (
    <Text type="secondary" style={{ fontSize: '0.85rem' }}>
      {getDateString(value, tempLabel, locale)}
    </Text>
  );
}