import { Typography } from 'antd';
import { Button } from 'antd';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import React from 'react';

const { Title, Text, Paragraph } = Typography;

export interface SocialMediaProps {
  title: string;
  href: string;
  image: StaticImageData;
}

export interface HeaderBannerStrings {
  // Welcome (value/prop) title.
  welcomeTitle: string;
  // Strings for part of banner that shows social media buttons.
  socialMediaTitle: string;
  socialMediaDescription: string;
}

export interface HeaderBannerProps extends HeaderBannerStrings {
  // List of social media buttons.
  socialMediaData: SocialMediaProps[];
}

/** Implementation of social media button. */
function SocialMediaButton({ title, href, image }: SocialMediaProps) {
  return (
    <Button href={href} target="_blank" className="social-media-button">
      <div className="social-media-button-internal-wrapper">
        <Image
          src={image}
          alt={title}
          layout="fixed"
          width="30px"
          height="30px"
        />
        <Title level={5} style={{ margin: '8px' }}>
          {title}
        </Title>
        <span
          className="material-icons"
          style={{ transform: 'rotate(-45deg)' }}
        >
          {'arrow_right_alt'}
        </span>
      </div>
    </Button>
  );
}

/**
 * A header banner showing website welcome title (value-proposition) and social
 * media buttons.
 */
export default function HeaderBanner({
  welcomeTitle,
  socialMediaTitle,
  socialMediaDescription,
  socialMediaData,
}: HeaderBannerProps) {
  return (
    <div className="header-banner-section">
      <Title
        level={2}
        className="header-banner-title header-banner--text-color"
        style={{ fontWeight: 600 }}
      >
        {welcomeTitle}
      </Title>
      {!!socialMediaData.length && (
        <Paragraph className="header-help-paragraph">
          <Title level={3} className="header-banner--text-color">
            {socialMediaTitle}
          </Title>
          <Text className="header-banner--text-color">
            {socialMediaDescription}
          </Text>
        </Paragraph>
      )}
      {!!socialMediaData.length && (
        <div className="social-media-button-container">
          {socialMediaData.map((data, index) => (
            <SocialMediaButton key={index} {...data} />
          ))}
        </div>
      )}
    </div>
  );
}
