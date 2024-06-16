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

// Re-apply preview for dynamically loaded content
document.addEventListener('DOMContentLoaded', preview)  // Initial page load
window.addEventListener('load', preview)               // Complete page load

// Listen for navigation events if using React Router or similar SPA framework
window.addEventListener('popstate', preview)           // For history API
window.addEventListener('pushState', preview)          // Custom events for SPA navigation
window.addEventListener('replaceState', preview)       // Custom events for SPA navigation

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
      console.error('❌ Unknown action:', message.action)
      break
  }
})

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes['font-default'] || changes['font-mono'])) {
    preview()
  }
})