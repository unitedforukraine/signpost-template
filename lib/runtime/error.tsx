import { Button, Result } from 'antd';
import Link from 'next/link';
import React from 'react';

export interface ErrorProps {
  title?: string;
  subtitle?: string;
  description?: string;
  homeButtonLabel?: string;
}

function Error({ title, subtitle, description, homeButtonLabel }: ErrorProps) {
  return (
    <section className="section last-section">
      <Result
        status="404"
        title={title}
        subTitle={
          <>
            <div>{subtitle}</div>
            <div>{description}</div>
          </>
        }
        extra={
          <Button type="primary">
            <Link href="/">{homeButtonLabel}</Link>
          </Button>
        }
      />
    </section>
  );
}

export default Error;
