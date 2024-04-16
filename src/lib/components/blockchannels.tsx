import { translate } from "../app";
import { Container } from "./container";
import {
  FaFacebook,
  FaTelegram,
  FaFacebookMessenger,
  FaWhatsapp,
  FaEnvelope,
  FaInstagram,
  FaTiktok,
  FaWhatsappSquare,
} from "react-icons/fa";

export function BlockChannels(props: { block: BlockChannels }) {
  const { block } = props;

  return (
    <Container block={block}>
      {block.title && (
        <div className="text-2xl">{translate(props.block.title)} </div>
      )}
      {block.subtitle && (
        <div className="mt-4 mb-5">{translate(props.block.subtitle)} </div>
      )}
      {block.fb_link && (
        <a
          href={translate(props.block.fb_link)}
          className="inline-block"
          target="_blank"
          aria-label="Facebook"
        >
          <FaFacebook size={40} className="mr-2" />
        </a>
      )}
      {block.fbmess_link && (
        <a
          href={translate(block.fbmess_link)}
          className="inline-block"
          target="_blank"
          aria-label="Facebook Messenger"
        >
          <FaFacebookMessenger size={40} className="mr-2" />
        </a>
      )}
      {block.whatsapp_link && (
        <a
          href={translate(block.whatsapp_link)}
          className="inline-block"
          target="_blank"
          aria-label="Whatsapp"
        >
          <FaWhatsapp size={40} className="mr-2" />
        </a>
      )}
      {block.email_link && (
        <a
          href={`mailto:${translate(block.email_link)}`}
          className="inline-block"
          target="_blank"
          aria-label="Email"
        >
          <FaEnvelope size={40} className="mr-2" />
        </a>
      )}
      {block.instagram_link && (
        <a
          href={translate(block.instagram_link)}
          className="inline-block"
          target="_blank"
          aria-label="Instagram"
        >
          <FaInstagram size={40} className="mr-2" />
        </a>
      )}
      {block.tiktok_link && (
        <a
          href={translate(block.tiktok_link)}
          className="inline-block"
          target="_blank"
          aria-label="TikTok"
        >
          <FaTiktok size={40} className="mr-2" />
        </a>
      )}
      {block.telegram_link && (
        <a
          href={translate(props.block.telegram_link)}
          className="inline-block"
          target="_blank"
          aria-label="Telegram"
        >
          <FaTelegram size={40} className="inline mr-2" />
        </a>
      )}
      {block.whatsappc_link && (
        <a
          href={translate(block.whatsappc_link)}
          className="inline-block"
          target="_blank"
          aria-label="WhatsApp Channel"
        >
          <FaWhatsappSquare size={40} className="mr-2" />
        </a>
      )}
    </Container>
  );
}
