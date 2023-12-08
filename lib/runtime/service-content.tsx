import {
  FacebookOutlined,
  InfoCircleOutlined,
  InstagramOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';

import { ArticleContentStrings } from './article-content';
import { DirectusArticle } from './directus';
import LastEditStamp, { LastEditStampProps } from './last-edit-stamp';
import ShareButton from './share-button';
import TextReader from './text-reader';

export interface ServiceContentStrings {
  commonStrings: ArticleContentStrings;
  openingHoursLabelStrings: string;
  descriptionString: string;
  addressString: string;
  openingHoursStrings: { [day: string]: string };
  publicContactInformationStrings: { [channel: string]: string };
}
export interface ServiceContentProps {
  service: DirectusArticle;
  lastEdit: LastEditStampProps;
  disableShareButton?: boolean;
  strings: ServiceContentStrings;
}

function GetIconForChannel({ channel }: { channel: string }) {
  const commonProps = { className: 'aligned-icon' };
  switch (channel.toLowerCase()) {
    case 'phone':
      return <PhoneOutlined {...commonProps} />;
    case 'email':
      return <MailOutlined {...commonProps} />;
    case 'whatsapp':
      return <WhatsAppOutlined {...commonProps} />;
    case 'facebook':
      return <FacebookOutlined {...commonProps} />;
    case 'website':
      return <LinkOutlined {...commonProps} />;
    case 'description':
      return <InfoCircleOutlined {...commonProps} />;
    case 'instagram':
      return <InstagramOutlined {...commonProps} />;
    default:
      return <InfoCircleOutlined {...commonProps} />;
  }
}

function getContactDetailLink(info: {
  channel: string;
  contactDetails: string;
}) {
  const { channel, contactDetails } = info;

  switch (channel.toLowerCase()) {
    case 'email':
      return (
        <span
          onClick={() => (window.location.href = `mailto:${contactDetails}`)}
          className="hover-blue cursor-pointer"
        >
          {contactDetails}
        </span>
      );
    case 'phone':
      return <a href={`tel:${contactDetails}`}>{contactDetails}</a>;
    case 'whatsapp':
      return <a href={`https://wa.me/${contactDetails}`}>{contactDetails}</a>;
    case 'viber':
      return (
        <a href={`viber://chat/?number=%2${contactDetails}`}>
          {contactDetails}
        </a>
      );
    case 'telegram':
      return <a href={`https://t.me/${contactDetails}`}>{contactDetails}</a>;
    case 'signal':
      return (
        <a href={`https://signal.me/#p/${contactDetails}`}>{contactDetails}</a>
      );
    default:
      return (
        <a
          href={contactDetails}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-blue-600"
        >
          {contactDetails}
        </a>
      );
  }
}

export default function ServiceContent({
  service,
  lastEdit,
  disableShareButton,
  strings,
}: ServiceContentProps) {
  const shareButton = !disableShareButton && (
    <ShareButton {...strings.commonStrings.shareButtonStrings}></ShareButton>
  );

  if (!service) return <p>No service found with the provided ID</p>;

  const mappedHours = service.addHours?.map((x) => {
    return {
      day: x.Day,
      label: strings.openingHoursStrings[x.Day],
      open: x.open,
      close: x.close,
    };
  });

  const mappedPublicContactInformation = service.contactInfo?.map((x) => {
    return {
      channel: x.channel,
      contactDetails: x.contact_details,
      label:
        strings.publicContactInformationStrings[x.channel.replace(/\s+/g, '')],
    };
  });

  return (
    <div id="main-content">
      <h1 className="text-4xl font-semibold my-6">{service.name}</h1>
      {strings.commonStrings.textReaderTitle ? (
        <Space direction="vertical" style={{}}>
          <LastEditStamp {...lastEdit} />
          <Space direction="horizontal" style={{ marginBottom: '1rem' }}>
            <TextReader
              title={strings.commonStrings.textReaderTitle}
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

      <div className="container mx-auto p-6">
        {service.description && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold mb-3">
              {strings.descriptionString}
            </h2>
            <div dangerouslySetInnerHTML={{ __html: service.description }} />
          </div>
        )}

        {mappedHours &&
          mappedHours.some(
            (hour) =>
              hour.day.trim() !== '' &&
              (hour.open.trim() !== '' || hour.close.trim() !== '')
          ) && (
            <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
              <h2 className="text-xl font-bold mb-3">
                {strings.openingHoursLabelStrings}
              </h2>
              <div className="space-y-2">
                {mappedHours.map((hour) => {
                  const hasValidTime =
                    hour.open.trim() !== '' && hour.close.trim() !== '';

                  if (hour.day && hasValidTime) {
                    return (
                      <div key={`${hour.day}-${hour.open}`} className="mt-1">
                        <span className="font-medium">{hour.label}:</span>
                        <span className="ml-2">
                          {hour.open.length > 6
                            ? hour.open.slice(0, -3)
                            : hour.open}
                          {' - '}
                          {hour.close.length > 6
                            ? hour.close.slice(0, -3)
                            : hour.close}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

        {service.address && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold mb-3">{strings.addressString}</h2>
            <p>{service.address}</p>
          </div>
        )}

        {mappedPublicContactInformation?.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
            {mappedPublicContactInformation.map((info) => {
              if (!info.contactDetails) return null;

              // Get the relevant icon for the channel
              const Icon = <GetIconForChannel channel={info.channel} />;

              // Get the contact detail link
              const ContactDetail = getContactDetailLink(info);

              return (
                <div key={info.contactDetails} className="mb-2 last:mb-0">
                  <h3 className="text-lg font-bold flex items-center mb-1">
                    {Icon}
                    <span className="ml-2">{info.label}</span>
                  </h3>
                  <div>{ContactDetail}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
