import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${"__MSG_EXT_NAME__" || packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: "__MSG_EXT_DESCRIPTION__" || packageData.description,
  version: packageData.version,
  manifest_version: 3,
  default_locale: 'en',
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'popup.html',
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.js'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['activeTab', 'tabs', 'storage', 'scripting', 'unlimitedStorage', 'fontSettings'],
})
