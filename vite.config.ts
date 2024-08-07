import * as path from 'path'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'
import tsconfigPaths from 'vite-tsconfig-paths'

const viteManifestHackIssue846: Plugin & { renderCrxManifest: (manifest: any, bundle: any) => void } = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
      bundle['manifest.json'] = bundle['.vite/manifest.json']
      bundle['manifest.json'].fileName = 'manifest.json'
      delete bundle['.vite/manifest.json']
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), viteManifestHackIssue846, crx({ manifest })],
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        popup: path.resolve('popup.html'),
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
})
