/* pages for testing
- https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm
- https://code.visualstudio.com/docs/getstarted/keybindings
- https://fonts.google.com/icons
- https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
- https://react.dev/learn
- https://www.30secondsofcode.org/js/s/inject-css/
- https://material.io/blog/migrating-material-3
*/
import { Message } from '@types'
import { cleanupStyles, preview } from '../utils/fontManager'
;(async () => {
  await preview()

  const navigationEvents = ['popstate', 'pushState', 'replaceState', 'pageshow']

  navigationEvents.forEach((event) => window.addEventListener(event, async () => await preview()))

  chrome.runtime.onMessage.addListener(async (message: Message) => {
    switch (message.action) {
      case 'executePreview':
        await preview()
        break
      case 'executeCleanup':
        cleanupStyles()
        break
      default:
        break
    }
  })
})()
