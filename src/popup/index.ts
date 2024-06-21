import '@material/web/elevation/elevation'
import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/switch/switch'
import { $, $$$ } from '@utils/domUtils'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { simpleErrorHandler, tl } from '@utils/stringUtils'
import '@utils/localize'
import './index.css'

// Define types for variables
let btn_reset: HTMLElement | null
let btn_switch: HTMLInputElement | null
let select_default: HTMLSelectElement | null
let select_mono: HTMLSelectElement | null

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
  if (btn_switch) btn_switch.checked = on // Adjusted to use `checked` for checkbox
}

// Handle switch function
const handleSwitch = (): void => {
  on = !on
  saveSwitchState(on)
  LOCAL_CONFIG?.set({ off: !on }, () => {
    simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) ||
      (btn_switch?.classList.toggle('on', on), on ? startPreview() : removeEffect()) // Toggle class based on `on` state
  })
}

// Bind events function
const bindEvents = (): void => {
  btn_switch?.addEventListener('input', handleSwitch, false) // Adjusted to use optional chaining
  btn_reset?.addEventListener('click', reset, false) // Adjusted to use optional chaining
  select_default?.addEventListener('change', saveSettings, false) // Adjusted to use optional chaining
  select_mono?.addEventListener('change', saveSettings, false) // Adjusted to use optional chaining
}

// Array of Google fonts with type
interface GoogleFont {
  fontFamily: string
  displayName: string
  fontStyle: string
}

// Google fonts list
const googleFontsList: GoogleFont[] = [
  // sans-serif
  { fontFamily: 'Roboto', displayName: 'Roboto', fontStyle: 'sans-serif' },
  { fontFamily: 'Open Sans', displayName: 'Open Sans', fontStyle: 'sans-serif' },
  { fontFamily: 'Montserrat', displayName: 'Montserrat', fontStyle: 'sans-serif' },
  { fontFamily: 'Poppins', displayName: 'Poppins', fontStyle: 'sans-serif' },
  { fontFamily: 'Lato', displayName: 'Lato', fontStyle: 'sans-serif' },
  { fontFamily: 'Inter', displayName: 'Inter', fontStyle: 'sans-serif' },
  { fontFamily: 'Ubuntu', displayName: 'Ubuntu', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans', displayName: 'Noto Sans', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans JP', displayName: 'Noto Sans Japanese', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans KR', displayName: 'Noto Sans Korean', fontStyle: 'sans-serif' },
  {
    fontFamily: 'Noto Sans TC',
    displayName: 'Noto Sans Traditional Chinese',
    fontStyle: 'sans-serif',
  },
  {
    fontFamily: 'Noto Sans SC',
    displayName: 'Noto Sans Simplified Chinese',
    fontStyle: 'sans-serif',
  },
  { fontFamily: 'Noto Sans HK', displayName: 'Noto Sans Hong Kong', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans Thai', displayName: 'Noto Sans Thai', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans Hebrew', displayName: 'Noto Sans Hebrew', fontStyle: 'sans-serif' },
  { fontFamily: 'Readex Pro', displayName: 'Readex Pro', fontStyle: 'sans-serif' },
  { fontFamily: 'Titillium Web', displayName: 'Titillium Web', fontStyle: 'sans-serif' },
  // serif
  { fontFamily: 'Merriweather', displayName: 'Merriweather', fontStyle: 'serif' },
  { fontFamily: 'Lora', displayName: 'Lora', fontStyle: 'serif' },
  // monospace
  { fontFamily: 'Roboto Mono', displayName: 'Roboto Mono', fontStyle: 'monospace' },
  { fontFamily: 'Noto Sans Mono', displayName: 'Noto Sans Mono', fontStyle: 'monospace' },
  { fontFamily: 'JetBrains Mono', displayName: 'JetBrains Mono', fontStyle: 'monospace' },
  { fontFamily: 'Inconsolata', displayName: 'Inconsolata', fontStyle: 'monospace' },
  { fontFamily: 'Fira Code', displayName: 'Fira Code', fontStyle: 'monospace' },
  { fontFamily: 'Source Code Pro', displayName: 'Source Code Pro', fontStyle: 'monospace' },
  { fontFamily: 'Anonymous Pro', displayName: 'Anonymous Pro', fontStyle: 'monospace' },
  { fontFamily: 'Ubuntu Mono', displayName: 'Ubuntu Mono', fontStyle: 'monospace' },
  // cursive
  {
    fontFamily: 'Playwrite US Trad',
    displayName: 'Playwrite USA Traditional',
    fontStyle: 'cursive',
  },
  {
    fontFamily: 'Playwrite FR Moderne',
    displayName: 'Playwrite France Moderne',
    fontStyle: 'cursive',
  },
]

// Initialize settings function with font settings and font list
const initSettings = (
  fontSettings: { 'font-default'?: string; 'font-mono'?: string },
  fontList: any[],
): void => {
  btn_switch = $('#switch') as HTMLInputElement | null
  btn_reset = $('#reset') as HTMLElement | null
  select_default = $('#font-default') as HTMLSelectElement | null
  select_mono = $('#font-mono') as HTMLSelectElement | null

  bindEvents()
  initSwitchState()

  LOCAL_CONFIG?.get({ off: false }, (config: { [key: string]: any }) => {
    if (config && config.hasOwnProperty('off')) {
      const off = config.off
      if (btn_switch) {
        btn_switch.checked = !off
      }
      on = !off
    }
  })

  googleFontsList.forEach((googleFont: GoogleFont) => {
    if (!fontList.some((font) => font.displayName === googleFont.displayName)) {
      const fontId = 'GF-' + googleFont.fontFamily // Prefix 'GF-'
      fontList.push({ displayName: googleFont.displayName, fontId })
    }
  })

  fontList.sort((a, b) => a.displayName.localeCompare(b.displayName))

  const defaultOption = $$$('option', { innerText: tl('SETTINGS_FONT_DEFAULT') }, { value: '' })

  const createOption = (font: { displayName: string; fontId: string }): HTMLOptionElement => {
    const option = $$$('option', { innerText: font.displayName }, { value: font.fontId })
    return option as HTMLOptionElement
  }

  ;[select_default, select_mono].forEach((select) => {
    if (select) {
      select.innerHTML = '' // Clear select options before appending
      select.appendChild(defaultOption.cloneNode(true))
      fontList.forEach((font) => {
        select.appendChild(createOption(font))
      })
    }
  })

  if (select_default) select_default.value = fontSettings['font-default'] || ''
  if (select_mono) select_mono.value = fontSettings['font-mono'] || ''
}

// Add event listener to load event
window.addEventListener(
  'load',
  async () => {
    try {
      const fontSettings = await CONFIG?.get({
        'font-default': '',
        'font-mono': '',
      })
      const fontList = await chrome.fontSettings.getFontList()

      initSettings(fontSettings, fontList)
    } catch (error) {
      simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))
    }
  },
  false,
)
