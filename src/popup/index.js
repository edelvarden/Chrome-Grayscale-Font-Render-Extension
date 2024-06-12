import '@material/web/elevation/elevation'
import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/switch/switch'
import '../localize'
import { $, $$$, CONFIG, LOCAL_CONFIG, simpleErrorHandler, tl } from '../utils/fn'
import './index.css'

let btn_switch, btn_reset, select_default, select_fixed

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
    select_fixed.value = ''

    if (on === false) {
      handleSwitch()
    }

    initSwitchState()
  })
}

const saveSettings = () => {
  const settings = {
    'font-default': select_default.value.trim(),
    'font-mono': select_fixed.value.trim(),
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
  select_fixed.addEventListener('change', saveSettings, false)
}

// Initialization
const initSettings = (fontSettings, fontList) => {
  btn_switch = $('#switch')
  btn_reset = $('#reset')
  select_default = $('#font-default')
  select_fixed = $('#font-mono')

  bindEvents()
  initSwitchState()

  LOCAL_CONFIG?.get({ off: false }, (config) => {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD')) ||
      ((btn_switch.selected = !config.off), (on = !config.off))
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

  ;[select_default, select_fixed].forEach((select) => {
    select.appendChild(defaultOption.cloneNode(true))
    fontList.forEach((font) => select.appendChild(createOption(font)))
  })

  select_default.value = fontSettings['font-default']
  select_fixed.value = fontSettings['font-mono']
}

// Main
window.addEventListener(
  'load',
  () => {
    CONFIG?.get(
      {
        'font-default': '',
        'font-mono': '',
      },
      (fontSettings) => {
        simpleErrorHandler(tl('ERROR_SETTINGS_LOAD')) ||
          chrome.fontSettings.getFontList((fontList) => {
            initSettings(fontSettings, fontList)
          })
      },
    )
  },
  false,
)
