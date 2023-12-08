import { Alert, Button } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

interface PreviewBannerProps {
  // An API route to redirect to when exiting preview mode, e.g. '/api/clear-preview-cookies'.
  apiRoute: string;
}

export default function PreviewBanner({ apiRoute }: PreviewBannerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(router.isReady);
  }, [router]);

  const description = "You're in the preview mode.";
  const buttonLabel = 'Exit the preview mode';

  return (
    <Alert
      message={description}
      banner
      showIcon={false}
      className="preview-banner"
      action={
        <Button
          href={`${apiRoute}?slug=/${router.locale}${router.asPath}`}
          loading={!loading}
        >
          {buttonLabel}
        </Button>
      }
    />
  );
}
