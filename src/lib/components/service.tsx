import LastEditStamp, { LastEditStampProps } from "./last-edit-stamp";
import {
  FaTiktok,
  FaFacebook,
  FaFacebookMessenger,
  FaInstagram,
  FaLinkedin,
  FaMailBulk,
  FaPhoneAlt,
  FaTwitter,
  FaWhatsapp,
  FaInfo,
  FaLink,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { app, translate } from "../app";
import React, { useEffect, useState } from "react";

export interface ServiceContentProps {
  lastEdit: LastEditStampProps;
  publicContactInformationStrings: { [channel: string]: string };
}

function GetIconForChannel({ channel }: { channel: string }) {
  const icons = {
    phone: FaPhoneAlt,
    email: FaMailBulk,
    whatsapp: FaWhatsapp,
    facebook: FaFacebook,
    website: FaLink,
    description: FaInfo,
    instagram: FaInstagram,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    tiktok: FaTiktok,
    Messenger: FaFacebookMessenger,
  };
  const IconComponent = icons[channel.toLowerCase()] || FaInfo;
  return <IconComponent className="aligned-icon" />;
}

function getContactDetailLink(info: {
  channel: string;
  contactDetails: string;
}) {
  const { channel, contactDetails } = info;

  switch (channel.toLowerCase()) {
    case "email":
      return (
        <span
          onClick={() => (window.location.href = `mailto:${contactDetails}`)}
          className="hover-blue cursor-pointer"
        >
          {contactDetails}
        </span>
      );
    case "Phone":
      return <a href={`tel:${contactDetails}`}>{contactDetails}</a>;
    case "whatsapp":
      return <a href={`https://wa.me/${contactDetails}`}>{contactDetails}</a>;
    case "viber":
      return (
        <a href={`viber://chat/?number=%2${contactDetails}`}>
          {contactDetails}
        </a>
      );
    case "telegram":
      return <a href={`https://t.me/${contactDetails}`}>{contactDetails}</a>;
    case "signal":
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

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

export function Service({ lastEdit }: ServiceContentProps) {
  let { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const s = app.data.services[id];
      console.log("Fetched service:", s);
      setService(s);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!service) {
    return <div>Service {id} not found</div>;
  }
  console.log("Rendering service component", { service });
  console.log("contact info", service.contactInfo);

  const contactInfoDisplay = service.contactInfo?.map((info, index) => {
    console.log("Processing:", info); // More detailed debugging for each item
    if (!info.contact_details) {
      console.log("No contact details for:", info); // Check for missing contact details
      return null;
    }

    const Icon = <GetIconForChannel channel={info.channel} />;
    const ContactDetail = getContactDetailLink({
      channel: info.channel,
      contactDetails: info.contact_details,
    });

    return (
      <div key={index} className="mb-2 last:mb-0">
        <h3 className="text-lg font-bold flex items-center mb-1">
          {Icon}
          <span className="ml-2">{info.channel}</span>
        </h3>
        <div>{ContactDetail}</div>
      </div>
    );
  });

  const title = translate(service.name);
  const location = translate(service.address);
  const description = translate(service.description);
  const hourDisplay = service.addHours?.map((hour, index) => (
    <div key={index} className="hours-container">
      <span className="day-label">{translate(hour.Day.trim())}: </span>
      <span className="time">
        {formatTime(hour.open)} - {formatTime(hour.close)}
      </span>
    </div>
  ));
  const provider = translate(service.provider.name);
  console.log("Provider:", provider);

  return (
    <div className="py-30 mb-20 w-full flex flex-col items-center text-black bg-white">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold">{title}</h1>
        <LastEditStamp {...lastEdit} />
        <h2 className="text-xl provider-name">{location}</h2>
        <div
          className="service mt-10"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {hourDisplay && hourDisplay.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4 mb-4">
            <h2 className="text-xl font-bold mb-3">
              {translate("Service Hours")}
            </h2>
            <div className="space-y-2">{hourDisplay}</div>
          </div>
        )}

        {contactInfoDisplay && contactInfoDisplay.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6 mt-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Contact Information</h2>
            <div className="flex flex-wrap gap-4">{contactInfoDisplay}</div>
          </div>
        )}
      </div>
    </div>
  );
}
