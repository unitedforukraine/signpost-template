import { ShareAltOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Button, Dropdown, notification } from 'antd';
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'next-share';
import React, { useEffect, useState } from 'react';

export interface ShareButtonStrings {
  label: string;
  notificationText: string;
  linkShareButton: string;
}

/**
 * Component that renders share button.
 * When the share button is clicked, either the native share
 * functionality is triggered, or the current URL is copied
 * to clipboard and a 'Link copied' notification is shown.
 */
export default function ShareButton({
  notificationText,
  label,
  linkShareButton,
}: ShareButtonStrings) {
  const [url, setUrl] = useState('');

  const menu = (
    <Menu>
      <Menu.Item key="1" className={'menu-item-button'}>
        <FacebookShareButton url={url}>
          <FacebookIcon size={20} round className={'menu-item-icon'} />
          Facebook
        </FacebookShareButton>
      </Menu.Item>
      <Menu.Item key="2" className={'menu-item-button'}>
        <TwitterShareButton url={url}>
          <TwitterIcon size={20} round className={'menu-item-icon'} />
          Twitter
        </TwitterShareButton>
      </Menu.Item>
      <Menu.Item key="3" className={'menu-item-button'}>
        <WhatsappShareButton url={url}>
          <WhatsappIcon size={20} round className={'menu-item-icon'} />
          Whatsapp
        </WhatsappShareButton>
      </Menu.Item>
      <Menu.Item key="4" className={'menu-item-button'}>
        <button onClick={openShareOptions}>
          <i className={'fa-solid fa-link menu-item-icon'} /> {linkShareButton}
        </button>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function openShareOptions() {
    if (navigator.canShare?.({ url })) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      notification['success']({
        message: notificationText,
        duration: 2,
      });
    }
  }

  return (
    <Dropdown overlay={menu}>
      <Button size="small" icon={<ShareAltOutlined />}>
        {label}
      </Button>
    </Dropdown>
  );
}
