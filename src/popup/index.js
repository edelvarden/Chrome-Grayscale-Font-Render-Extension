import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/elevation/elevation'
import '@material/web/switch/switch'
import { $, $$$, CONFIG, LOCAL_CONFIG, simpleErrorHandler, tl } from '../utils/fn'
import './index.css'
import './localize'

const sendMessageToContentScript = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]
    chrome.tabs.sendMessage(activeTab.id, message)
  })
}

const startPreview = () => {
  sendMessageToContentScript({ action: 'executePreview' })
}

const removeEffect = () => {
  sendMessageToContentScript({ action: 'executeCleanup' })
}

const save = (settings) => {
  CONFIG?.set(settings, function () {
    simpleErrorHandler(tl('error_settings_save')) || (on && startPreview())
  })
}

const reset = () => {
  CONFIG?.clear(function () {
    simpleErrorHandler(tl('error_settings_reset'))
    removeEffect()
    location.reload(true)
  })
}

const fixFontRange = (fontRange) => {
  const fontIDs = fontRange
    .replace(/[^0-9A-F,\-]/gi, '')
    .replace(/([\-,]){2,}/g, '$1')
    .replace(/,-[^,]+|[^,]+-,/g, '')
    .split(',')

  const validFontIDs = fontIDs.filter(function (fontID) {
    if (/-/.test(fontID)) {
      let [start, end] = fontID.split('-').map(id => parseInt(id, 16))
      if (start <= end && start >= 0 && end <= 1114111) return true
    } else {
      fontID = parseInt(fontID, 16)
      if (fontID > 0 && fontID <= 1114111) return true
    }
    return false
  })
  return validFontIDs.join(',')
}

const saveSettings = () => {
  const settings = {
    'font-default': select_default.value.trim(),
    'font-fixed': select_fixed.value.trim(),
  }
  save(settings)
}

const saveSwitchState = (state) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]
    const tabURL = currentTab.url
    const storageKey = `switch_state_${tabURL}`
    chrome.storage.sync.set({ [storageKey]: state })
  })
}

const getSwitchState = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      const tabURL = currentTab.url
      const storageKey = `switch_state_${tabURL}`
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

const bindEvents = () => {
  btn_switch.addEventListener('click', () => {
    on = !on
    saveSwitchState(on)
    LOCAL_CONFIG?.set({ off: !on }, () => {
      simpleErrorHandler(tl('error_settings_save')) ||
        ((btn_switch.className = on ? 'on' : 'off'), on ? startPreview() : removeEffect())
    })
  }, false)

  btn_reset.addEventListener('click', reset, false)
  select_default.addEventListener('change', saveSettings, false)
  select_fixed.addEventListener('change', saveSettings, false)
}

const initSettings = (a, c) => {
  btn_switch = $('#switch')
  btn_reset = $('#reset')
  select_default = $('#font-default')
  select_fixed = $('#font-fixed')

  bindEvents()
  initSwitchState()

  LOCAL_CONFIG?.get({ off: false }, (a) => {
    simpleErrorHandler(tl('error_settings_load')) ||
      ((btn_switch.selected = !a.off), (on = !a.off))
  })

  // sort font list alphabetically
  c.sort((a, b) => a.displayName.localeCompare(b.displayName))
  const defaultOption = $$$('option', { innerText: tl('settings_font_default') }, { value: '' })

  const createOption = (font) => {
    const option = document.createElement('option')
    option.value = font.fontId
    option.innerText = font.displayName
    return option
  }

  [select_default, select_fixed].forEach(select => {
    select.appendChild(defaultOption.cloneNode(true))
    c.forEach(font => {
      select.appendChild(createOption(font))
    })
  })

  select_default.value = a['font-default']
  select_fixed.value = a['font-fixed']
}

var on,
  btn_switch,
  btn_reset,
  select_default,
  select_fixed

window.addEventListener('load', () => {
  CONFIG?.get({
    'font-default': '',
    'font-fixed': '',
  }, (a) => {
    simpleErrorHandler(tl('error_settings_load')) ||
      chrome.fontSettings.getFontList((c) => {
        initSettings(a, c)
      })
  })
}, false)
