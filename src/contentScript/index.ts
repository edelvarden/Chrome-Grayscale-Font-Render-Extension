/* pages for testing
- https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm
- https://code.visualstudio.com/docs/getstarted/keybindings
- https://fonts.google.com/icons
- https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
- https://react.dev/learn
- https://www.30secondsofcode.org/js/s/inject-css/
- https://material.io/blog/migrating-material-3
*/
import { Message } from "@types";
import { cleanupStyles, invokeObserver, invokeReplacer, preview } from '../utils/fontUtils'
;(async () => {
  await preview()

  document.addEventListener('DOMContentLoaded', async () => {
    invokeReplacer()
  })

  window.addEventListener('popstate', async () => {
    await preview()
  })

  window.addEventListener('pushState', async () => {
    await preview()
  })

  window.addEventListener('replaceState', async () => {
    await preview()
  })

  invokeObserver()

  chrome.runtime.onMessage.addListener(async (message: Message) => {
    switch (message.action) {
      case 'executePreview':
        await preview()
        break
      case 'executeCleanup':
        cleanupStyles()
        break
      default:
        console.error('❌ Unknown action:', message.action)
        break
    }
  })

  // chrome.storage.onChanged.addListener(
  //   async (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
  //     if (area === 'sync' && (changes['font-default'] || changes['font-mono'])) {
  //       await preview()
  //     }
  //   },
  // )
})()
