import { Button, Space } from 'antd';
import { Typography } from 'antd';
import { default as parseHtml } from 'html-dom-parser';
import parse, { HTMLReactParserOptions, domToReact } from 'html-react-parser';
import React from 'react';

import LastEditStamp, { LastEditStampProps } from './last-edit-stamp';
import ShareButton, { ShareButtonStrings } from './share-button';
import TextReader from './text-reader';

export interface ArticleContentStrings {
  /** If null, the text to speech component is not rendered. */
  textReaderTitle?: string;
  shareButtonStrings: ShareButtonStrings;
}

/** Extracts meta tags from article content.
 *
 * Client documentation:
 * https://docs.google.com/document/d/1RyKzdU5ytXyswHtMoefjpvC7DtEMcJ1ZwJtMRsP5r4E/edit?resourcekey=0-ATE1HUHP4GrX6OPMwmJPJA#heading=h.glljwdjqb4d4
 *
 * @returns A tuple of extracted meta tag attributes and remaining article content.
 */

export function extractMetaTags(content: string): [object[], string] {
  const metaTags: object[] = [];
  let contentWithMetaTags = content;

  // Generate Open Graph meta tags for article content
  const titleRegex = /<h[1-2][^>]*>(.*?)<\/h[1-2]>/i;
  const titleMatch = content.match(titleRegex);
  if (titleMatch) {
    const ogTitle = titleMatch[2];
    if (ogTitle) {
      metaTags.push({ property: 'og:title', content: ogTitle });
    }
  }

  const descriptionRegex = /<p[^>]*>(.*?[.?!])<\/p>/i;
  const descriptionMatch = content.match(descriptionRegex);
  if (descriptionMatch) {
    const ogDescription = descriptionMatch[1]
      .replace(/(<([^>]+)>)/gi, '')
      .substring(0, 200);
    if (ogDescription) {
      metaTags.push({ property: 'og:description', content: ogDescription });
    }
  }

  const imageRegex = /<img.+?src=["'](.+?)["'].*?>/i;
  const imageMatch = content.match(imageRegex);
  if (imageMatch) {
    const ogImage = imageMatch[1];
    if (ogImage) {
      metaTags.push({ property: 'og:image', content: ogImage });
    }
  }

  // Extract other meta tags from content
  const metaTagRegex = /(?:{meta|{og:image})([^}]*)}/g;
  const metaTagMatches = content.matchAll(metaTagRegex);

  for (const metaTagMatch of metaTagMatches) {
    const metaTagInHtml: string = metaTagMatch[0]
      .replace(/\{/, `<`)
      .replace(/\}/, `>`);
    const metaTag = parseHtml(metaTagInHtml)[0];
    if ('attribs' in metaTag) {
      const { property, content } = metaTag.attribs;
      if (property && content) {
        metaTags.push({ property, content });
      }
    }
    contentWithMetaTags = contentWithMetaTags.replace(
      metaTagMatch[0],
      metaTagInHtml
    );
  }

  return [metaTags, contentWithMetaTags];
}

function createInfoBlock(
  children: string | JSX.Element | JSX.Element[]
): JSX.Element {
  return <Typography.Text type="secondary">{children}</Typography.Text>;
}

function createHeader(
  children: string | JSX.Element | JSX.Element[],
  level: number,
  secondary: boolean
): JSX.Element {
  // For Typography.Title, it as to be integer [1,5].
  let antLevel: 1 | 2 | 3 | 4 | 5;
  if (level <= 1) {
    antLevel = 1;
  } else if (level <= 2) {
    antLevel = 2;
  } else if (level <= 3) {
    antLevel = 3;
  } else if (level <= 4) {
    antLevel = 4;
  } else {
    antLevel = 5;
  }
  return secondary ? (
    <Typography.Title level={antLevel} type="secondary">
      {children}
    </Typography.Title>
  ) : (
    <Typography.Title level={antLevel}>{children}</Typography.Title>
  );
}

/** Transforms static content HTML to a fully reactified element.
 *
 * This function also transforms link-button instructions to proper React buttons.
 */
export function transformContentHtml(
  content: string
): string | JSX.Element | JSX.Element[] {
  if (!content) return content;
  // For content-writer's convenience, we support WordPress style
  // [link-button][/link-button] annotations.
  const linkButtonTagRegex = /\[([^\]]*)link-button([^\]]*)\]/g;
  content = content.replaceAll(linkButtonTagRegex, `<$1link-button$2>`);
  const contentParseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!('attribs' in domNode)) return;
      if (!domNode.attribs) return;

      if (domNode.name === 'link-button') {
        return (
          <Button
            href={domNode.attribs.href}
            type="primary"
            style={{ width: '20rem', maxWidth: '100%' }}
          >
            {domToReact(domNode.children, contentParseOptions)}
          </Button>
        );
      }
      if (domNode.attribs.class === 'info-block') {
        return createInfoBlock(
          domToReact(domNode.children, contentParseOptions)
        );
      }

      const headerRegex = /h([1-6])/g;
      const headerMatch = headerRegex.exec(domNode.name);
      if (headerMatch) {
        return createHeader(
          domToReact(domNode.children, contentParseOptions),
          Number(headerMatch[1]),
          domNode.attribs.secondary !== undefined
        );
      }
    },
  };
  return parse(content, contentParseOptions);
}
export interface ArticleContentProps {
  // Article title.
  title?: string;
  disableShareButton?: boolean;
  // HTML content of the article.
  content: string;
  lastEdit: LastEditStampProps;
  strings: ArticleContentStrings;
}

export default function ArticleContent({
  title,
  disableShareButton,
  content,
  lastEdit,
  strings,
}: ArticleContentProps) {
  const shareButton = !disableShareButton && (
    <ShareButton {...strings.shareButtonStrings}></ShareButton>
  );
  return (
    <section className="article-section" id="main-content">
      {title && <h1 className="article-title">{title}</h1>}
      {strings.textReaderTitle ? (
        <Space direction="vertical" style={{}}>
          <LastEditStamp {...lastEdit} />
          <Space direction="horizontal" style={{ marginBottom: '1rem' }}>
            <TextReader
              title={strings.textReaderTitle}
              currentLocale={lastEdit.locale.url}
            />
            {shareButton}
          </Space>
        </Space>
      ) : (
        <Space direction="horizontal" style={{ marginBottom: '1rem' }}>
          {shareButton}
          <LastEditStamp {...lastEdit} />
        </Space>
      )}

      {/* Render a chunk of html which is passed as a string property. */}
      <div className="article-body">{transformContentHtml(content)}</div>
    </section>
  );
}
