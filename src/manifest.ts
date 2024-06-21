import { defineManifest } from '@crxjs/vite-plugin'
//@ts-ignore
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${'__MSG_EXT_NAME__' || packageData.displayName || packageData.name}${isDev ? ` ⚡️ Dev` : ''}`,
  description: '__MSG_EXT_DESCRIPTION__' || packageData.description,
  version: packageData.version,
  manifest_version: 3,
  default_locale: 'en',
  icons: {
    48: 'icons/48x48.png',
    128: 'icons/128x128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'icons/48x48.png',
  },
  options_page: 'popup.html',
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.ts'],
    },
  ],
  permissions: ['activeTab', 'tabs', 'storage', 'scripting', 'unlimitedStorage', 'fontSettings'],
})
