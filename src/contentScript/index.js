/* pages for testing
- https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm
- https://code.visualstudio.com/docs/getstarted/keybindings
- https://fonts.google.com/icons
- https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
- https://react.dev/learn
*/
import {
  CONFIG,
  LOCAL_CONFIG,
  cleanupStyles,
  init,
  invokeObserver,
  invokeReplacer,
  preview,
  simpleErrorHandler,
  tl,
} from '../utils/fn.js'

invokeObserver()

window.addEventListener('DOMContentLoaded', () => {
  invokeReplacer()
})

// ----------------------------------------------------------------

LOCAL_CONFIG?.get({ off: !1 }, function (c) {
  simpleErrorHandler(tl('error_settings_load')) ||
    c.off ||
    CONFIG?.get(
      {
        'font-default': '',
        'font-fixed': '',
      },
      function (settings) {

        if (simpleErrorHandler(tl('error_settings_load'))) {
          return
        }

        init(settings)
      },
    )
})

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
