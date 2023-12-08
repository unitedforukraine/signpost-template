import type { Locale } from "./locale"
import getConfig from "next/config"

export type Config = typeof config

export const config = {
  title: "Signpost",

  locale: {
    url: 'en-us',
    direction: 'ltr',
    name: 'English',
    directus: 'en-US',
  } as Locale,

  publicRuntimeConfig: {
    version: "1.0",
  },

  footerLinks: [],
}



config.publicRuntimeConfig = getConfig()
