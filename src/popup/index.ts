import '@material/web/elevation/elevation'
import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/switch/switch'
import { FontListItem, GoogleFont } from '@types'
import { googleFontsList } from '@utils/constants'
import '@utils/localize'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { simpleErrorHandler, tl } from '@utils/stringUtils'
import { html, render } from 'lit'
import ResetIcon from './components/icons/ResetIcon'
import SelectComponent from './components/select'
import './index.css'

// Define types for variables
let on: boolean = true // Explicitly define type for `on`

// Type for message object
interface Message {
  action: string
}

// Function to send message to content script
const sendMessageToContentScript = (message: Message): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id!, message) // `id` is optional, use `!` to assert it exists
    }
  })
}

// Start preview function
const startPreview = (): void => sendMessageToContentScript({ action: 'executePreview' })

// Remove effect function
const removeEffect = (): void => sendMessageToContentScript({ action: 'executeCleanup' })

// Save function with settings parameter
const save = (settings: { 'font-default'?: string; 'font-mono'?: string }): void => {
  CONFIG?.set(settings, () => {
    simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) || (on && startPreview())
  })
}

// Reset function
const reset = (): void => {
  CONFIG?.clear(() => {
    simpleErrorHandler(tl('ERROR_SETTINGS_RESET'))
    removeEffect()

    const select_default = document.querySelector('#font-default') as HTMLSelectElement | null
    const select_mono = document.querySelector('#font-mono') as HTMLSelectElement | null

    if (select_default) select_default.value = ''
    if (select_mono) select_mono.value = ''

    if (on === false) {
      handleSwitch()
    }

    initSwitchState()
  })
}

// Save settings function
const saveSettings = (): void => {
  const select_default = document.querySelector('#font-default') as HTMLSelectElement | null
  const select_mono = document.querySelector('#font-mono') as HTMLSelectElement | null

  const settings = {
    'font-default': select_default?.value.trim() || '',
    'font-mono': select_mono?.value.trim() || '',
  }
  save(settings)
}

// Save switch state function
const saveSwitchState = (state: boolean): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    const currentTab = tabs[0]
    const storageKey = `switch_state_${currentTab.url}`
    chrome.storage.sync.set({ [storageKey]: state })
  })
}

// Get switch state function returning a promise
const getSwitchState = (): Promise<boolean | undefined> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0]
      const storageKey = `switch_state_${currentTab.url}`
      chrome.storage.sync.get([storageKey], (result) => {
        resolve(result[storageKey])
      })
    })
  })
}

// Initialize switch state asynchronously
const initSwitchState = async (): Promise<void> => {
  const switchState = await getSwitchState()
  on = switchState !== false
  const btn_switch = document.querySelector('#switch') as HTMLInputElement | null
  if (btn_switch) btn_switch.checked = on // Adjusted to use `checked` for checkbox
}

// Handle switch function
const handleSwitch = (): void => {
  on = !on
  saveSwitchState(on)
  const btn_switch = document.querySelector('#switch') as HTMLInputElement | null
  LOCAL_CONFIG?.set({ off: !on }, () => {
    simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) ||
      (btn_switch?.classList.toggle('on', on), on ? startPreview() : removeEffect()) // Toggle class based on `on` state
  })
}

// Initialize settings function with font settings and font list
const initSettings = (
  fontSettings: { 'font-default'?: string; 'font-mono'?: string },
  fontList: FontListItem[],
): void => {
  const selectProps = {
    id: 'font-default',
    value: fontSettings['font-default'] || '',
    options: fontList,
    handleChange: saveSettings,
  }
  const defaultSelect = SelectComponent(selectProps)

  const select2Props = {
    id: 'font-mono',
    value: fontSettings['font-mono'] || '',
    options: fontList,
    handleChange: saveSettings,
  }
  const monospaceSelect = SelectComponent(select2Props)

  const resetButton = html`
    <md-filled-tonal-icon-button id="reset" aria-label="reset-settings" @click=${reset}>
      ${ResetIcon()}
    </md-filled-tonal-icon-button>
  `

  const template = html`<div class="surface">
    <md-elevation></md-elevation>
    <div id="settings" class="settings-container">
      <!-- Default/Fixed Fonts selection -->
      <section class="setting-inner">
        <!-- Custom Fonts -->
        <div class="settings__item">
          <h2 class="title">${tl('SETTINGS_TITLE_FONTS')}</h2>
          <div style="display: flex; flex-direction: row; align-items: center; gap: 1rem;">
            <!-- Reset settings button -->
            ${resetButton}
            <!-- Enable/Disable button -->
            <label>
              <md-switch id="switch" selected @input=${handleSwitch}></md-switch>
            </label>
          </div>
        </div>
        <div class="settings__item">
          <div class="select-label">
            <span class="select-label__title">${tl('FONT_DEFAULT')}</span>
            <span class="select-label__description">${tl('FONT_DEFAULT_DESCRIPTION')}</span>
          </div>
          <div>${defaultSelect}</div>
        </div>
        <div class="settings__item">
          <div class="select-label">
            <span class="select-label__title">${tl('FONT_MONOSPACE')}</span>
            <span class="select-label__description">${tl('FONT_MONOSPACE_DESCRIPTION')}</span>
          </div>
          <div>${monospaceSelect}</div>
        </div>
      </section>
    </div>
  </div>`

  const mainElement = document.querySelector('main')
  if (mainElement) {
    render(template, mainElement)
  } else {
    console.error('Main element not found!')
  }
}

// Add event listener to load event
window.addEventListener('load', async () => {
  try {
    const fontSettings = await CONFIG?.get({
      'font-default': '',
      'font-mono': '',
    })
    const fontList: FontListItem[] = await chrome.fontSettings.getFontList()

    googleFontsList.forEach((googleFont: GoogleFont) => {
      if (!fontList.some((font) => font.displayName === googleFont.displayName)) {
        const fontId = 'GF-' + googleFont.fontFamily // Prefix 'GF-'
        fontList.push({ displayName: googleFont.displayName, fontId })
      }
    })

    fontList.sort((a, b) => a.displayName.localeCompare(b.displayName))

    // (none) option
    fontList.unshift({ fontId: '', displayName: tl('SETTINGS_FONT_DEFAULT') })

    initSettings(fontSettings, fontList)
  } catch (error) {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))
  }
})
