/* pages for testing
- https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm
- https://code.visualstudio.com/docs/getstarted/keybindings
- https://fonts.google.com/icons
- https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
- https://react.dev/learn
- https://www.30secondsofcode.org/js/s/inject-css/
*/
import { cleanupStyles, invokeObserver, invokeReplacer, preview } from '@utils/fn.js'

invokeObserver()

window.addEventListener('DOMContentLoaded', () => {
  invokeReplacer()
})

preview()
// ----------------------------------------------------------------

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'executePreview':
      preview()
      break
    case 'executeCleanup':
      cleanupStyles()
      break

    default:
      break
  }
})
