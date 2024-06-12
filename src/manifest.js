import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${'__MSG_EXT_NAME__' || packageData.displayName || packageData.name}${isDev ? ` ⚡️ Dev` : ''}`,
  description: '__MSG_EXT_DESCRIPTION__' || packageData.description,
  version: packageData.version,
  manifest_version: 3,
  default_locale: 'en',
  icons: {
    16: 'icons/16x16.png',
    32: 'icons/32x32.png',
    48: 'icons/48x48.png',
    96: 'icons/96x96.png',
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
      js: ['src/contentScript/index.js'],
    },
  ],
  permissions: ['activeTab', 'tabs', 'storage', 'scripting', 'unlimitedStorage', 'fontSettings'],
})
