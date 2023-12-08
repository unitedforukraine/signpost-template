import { Button, Space } from 'antd'
import { useRouter } from 'next/router'
// import type { Locale } from './locale'

export interface FooterStrings {
  disclaimerSummary: string
}
interface FooterProps {
  // The current locale.
  currentLocale: any// Locale
  // All locales for the user to choose from.
  strings: FooterStrings
  // links?: MenuOverlayItem[]
  signpostVersion: string
}

/** Footer with the laguage selector. */
export default function Footer({
  currentLocale,
  strings,
  // links,
  signpostVersion,
}: FooterProps) {
  const router = useRouter()
  // const targets = links ? menuOverlayItemToTargets(links) : {}
  const targets = {}

  function renderLinks(links: any[]) {
    return (
      <Space direction="horizontal" wrap>
        {links.map((link) => {
          return (
            <Button key={link.key} type="link" size="small" className="footer-linkButton" onClick={() => {
              router.push(targets[link.key])
            }}>
              {link.label}
            </Button>
          )
        })}
      </Space>
    )
  }

  return (
    <div className="footer footer--background-color">
      <Space className="footer-disclaimer" direction="vertical" size="large">
        <div>
          <a href="https://www.signpost.ngo/" target="_blank" rel="noopener noreferrer">Signpost Project</a>{' '} &copy; 2022
        </div>
        {strings.disclaimerSummary}
        {/* {links && renderLinks(links)} */}
      </Space>
      <Space wrap direction="vertical">
        {`V ${signpostVersion}`}
      </Space>
    </div>
  )
}
