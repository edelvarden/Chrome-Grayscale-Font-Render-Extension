import '@material/web/elevation/elevation'
import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/switch/switch'
import { $, $$$, CONFIG, LOCAL_CONFIG, simpleErrorHandler, tl } from '@utils/fn'
import '../localize'
import './index.css'

let btn_switch, btn_reset, select_default, select_mono

let on = true

const sendMessageToContentScript = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0]
      chrome.tabs.sendMessage(activeTab.id, message)
    }
  })
}

const startPreview = () => sendMessageToContentScript({ action: 'executePreview' })
const removeEffect = () => sendMessageToContentScript({ action: 'executeCleanup' })

const save = (settings) => {
  CONFIG?.set(settings, () => {
    simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) || (on && startPreview())
  })
}

const reset = () => {
  CONFIG?.clear(() => {
    simpleErrorHandler(tl('ERROR_SETTINGS_RESET'))
    removeEffect()

    select_default.value = ''
    select_mono.value = ''

    if (on === false) {
      handleSwitch()
    }

    initSwitchState()
  })
}

const saveSettings = () => {
  const settings = {
    'font-default': select_default.value.trim(),
    'font-mono': select_mono.value.trim(),
  }
  save(settings)
}

const saveSwitchState = (state) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]
    const storageKey = `switch_state_${currentTab.url}`
    chrome.storage.sync.set({ [storageKey]: state })
  })
}

const getSwitchState = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      const storageKey = `switch_state_${currentTab.url}`
      chrome.storage.sync.get([storageKey], (result) => {
        resolve(result[storageKey])
      })
    })
  })
}

const initSwitchState = async () => {
  const switchState = await getSwitchState()
  on = switchState !== false
  btn_switch.selected = on
}

const handleSwitch = () => {
  on = !on
  saveSwitchState(on)
  LOCAL_CONFIG?.set({ off: !on }, () => {
    simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) ||
      ((btn_switch.className = on ? 'on' : 'off'), on ? startPreview() : removeEffect())
  })
}

// Event Binding
const bindEvents = () => {
  btn_switch.addEventListener('click', handleSwitch, false)
  btn_reset.addEventListener('click', reset, false)
  select_default.addEventListener('change', saveSettings, false)
  select_mono.addEventListener('change', saveSettings, false)
}

const googleFontsList = [
  // sans-serif
  { fontFamily: 'Roboto', displayName: 'Roboto', fontStyle: 'sans-serif' },
  { fontFamily: 'Open Sans', displayName: 'Open Sans', fontStyle: 'sans-serif' },
  { fontFamily: 'Montserrat', displayName: 'Montserrat', fontStyle: 'sans-serif' },
  { fontFamily: 'Poppins', displayName: 'Poppins', fontStyle: 'sans-serif' },
  { fontFamily: 'Lato', displayName: 'Lato', fontStyle: 'sans-serif' },
  { fontFamily: 'Inter', displayName: 'Inter', fontStyle: 'sans-serif' },
  { fontFamily: 'Ubuntu', displayName: 'Ubuntu', fontStyle: 'sans-serif' },
  { fontFamily: 'Ubuntu Sans', displayName: 'Ubuntu Sans', fontStyle: 'sans-serif' },
  { fontFamily: 'Noto Sans', displayName: 'Noto Sans', fontStyle: 'sans-serif' },
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
  { fontFamily: 'Ubuntu Sans Mono', displayName: 'Ubuntu Sans Mono', fontStyle: 'monospace' },
  { fontFamily: 'Ubuntu Mono', displayName: 'Ubuntu Mono', fontStyle: 'monospace' },
  // cursive
  { fontFamily: 'Playwrite US Trad', displayName: 'Playwrite USA Traditional', fontStyle: 'cursive' },
  { fontFamily: 'Playwrite FR Moderne', displayName: 'Playwrite France Moderne', fontStyle: 'cursive' },
]

// Initialization
const initSettings = (fontSettings, fontList) => {
  btn_switch = $('#switch')
  btn_reset = $('#reset')
  select_default = $('#font-default')
  select_mono = $('#font-mono')

  bindEvents()
  initSwitchState()

  LOCAL_CONFIG?.get({ off: false }, (config) => {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD')) ||
      ((btn_switch.selected = !config.off), (on = !config.off))
  })

  // Add Google fonts to fontList if they do not already exist
  googleFontsList.forEach((googleFont) => {
    if (!fontList.some((font) => font.displayName === googleFont.displayName)) {
      const fontId = 'GF-' + googleFont.fontFamily // Prefix 'GF-'
      fontList.push({ displayName: googleFont.displayName, fontId })
    }
  })

  // sort font list alphabetically
  fontList.sort((a, b) => a.displayName.localeCompare(b.displayName))

  const defaultOption = $$$('option', { innerText: tl('SETTINGS_FONT_DEFAULT') }, { value: '' })

  const createOption = (font) => {
    const option = document.createElement('option')
    option.value = font.fontId
    option.innerText = font.displayName
    return option
  }

  // Append default option and font options to select elements
  ;[select_default, select_mono].forEach((select) => {
    select.innerHTML = '' // Clear select options before appending
    select.appendChild(defaultOption.cloneNode(true))
    fontList.forEach((font) => {
      select.appendChild(createOption(font))
    })
  })

  select_default.value = fontSettings['font-default']
  select_mono.value = fontSettings['font-mono']
}

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
      simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'), error)
    }
  },
  false,
)