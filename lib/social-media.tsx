// A module for handling social media.
import { SocialMediaProps } from '@ircsignpost/signpost-base/dist/src/header-banner';

import facebookImage from '../public/facebook.svg';
import messengerImage from '../public/messenger.svg';
import telegramImage from '../public/telegram.svg';

export interface SocialMediaLink {
  title: string;
  href: string;
}

// Serializable social media links
export interface SocialMediaLinks {
  facebookLink: SocialMediaLink;
  telegramLink: SocialMediaLink;
  messengerLink: SocialMediaLink;
}

/**
 * Provides data for Social Media buttons, e.g. Facebook, Whatsapp, etc.
 *
 * TODO: You might need to add new Social media buttons or remove Facebook/Whatsapp/Messenger.
 * If so, import social media icons (or remove unused ones) under public/ dir.
 */
export function getSocialMediaProps(
  socialMediaLinks: SocialMediaLinks
): SocialMediaProps[] {
  return [
    {
      ...socialMediaLinks.facebookLink,
      image: facebookImage,
    },
    {
      ...socialMediaLinks.telegramLink,
      image: telegramImage,
    },
    {
      ...socialMediaLinks.messengerLink,
      image: messengerImage,
    },
  ];
}
