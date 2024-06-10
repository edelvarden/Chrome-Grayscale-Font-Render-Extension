import '@material/web/iconbutton/filled-tonal-icon-button'
import '@material/web/elevation/elevation'
import '@material/web/switch/switch'
import { $, $$$, CONFIG, LOCAL_CONFIG, simpleErrorHandler, tl } from '../utils/fn'
import './index.css'
import './localize'

// Function to send message to content script
const sendMessageToContentScript = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]
    chrome.tabs.sendMessage(activeTab.id, message)
  })
}

// Trigger execution of preview function in content script
const startPreview = () => {
  sendMessageToContentScript({
    action: 'executePreview',
  })
}

const removeEffect = () => {
  sendMessageToContentScript({
    action: 'executeCleanup',
  })
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
      var b
      fontID = fontID.split('-')
      b = parseInt(fontID[0], 16)
      fontID = parseInt(fontID[1], 16)
      if (b <= fontID && 0 <= b && 1114111 >= fontID) return true
    } else if (((fontID = parseInt(fontID, 16)), 0 < fontID && 1114111 > fontID)) return true
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
  return new Promise((resolve, reject) => {
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
  btn_switch.checked = switchState !== false
}

const bindEvents = () => {
  btn_switch.addEventListener(
    'click',
    function () {
      on = !on
      saveSwitchState(on)
      LOCAL_CONFIG?.set({ off: !on }, function () {
        simpleErrorHandler(tl('error_settings_save')) ||
          ((btn_switch.className = on ? 'on' : 'off'), on ? startPreview() : removeEffect())
      })
    },
    false,
  )

  // Event listener for reset button
  btn_reset.addEventListener('click', reset, false)

  // Event listener for select_default
  select_default.addEventListener('change', saveSettings, false)

  // Event listener for select_fixed
  select_fixed.addEventListener('change', saveSettings, false)
}

const initSettings = (a, c) => {
  btn_switch = $('#switch')
  btn_reset = $('#reset')
  select_default = $('#font-default')
  select_fixed = $('#font-fixed')

  bindEvents()

  initSwitchState()

  LOCAL_CONFIG?.get({ off: !1 }, function (a) {
    simpleErrorHandler(tl('error_settings_load')) ||
      ((btn_switch.checked = a.off ? false : true), (on = !a.off))
  })

  var b,
    h,
    d = $$$('option', { innerText: tl('settings_font_default') }, { value: '' })

  // sort alphabetically
  c.sort((a, b) => a.displayName.localeCompare(b.displayName))

  font_list.appendChild(d)

  var g

  for (var f = 0, k = c.length; f < k; ++f)
    (b = c[f].displayName),
      (h = c[f].fontId),
      (g = d.cloneNode()),
      (g.value = h),
      (g.innerText = b),
      font_list.appendChild(g)
  ;[select_default, select_fixed].forEach(function (a) {
    a.appendChild(font_list.cloneNode(!0))
  })

  select_default.value = a['font-default']
  select_fixed.value = a['font-fixed']
}

var font_list = document.createDocumentFragment(),
  on,
  btn_switch,
  btn_reset,
  select_default,
  select_fixed
window.addEventListener(
  'load',
  function () {
    CONFIG?.get(
      {
        'font-default': '',
        'font-fixed': '',
      },
      function (a) {
        simpleErrorHandler(tl('error_settings_load')) ||
          chrome.fontSettings.getFontList(function (c) {
            initSettings(a, c)
          })
      },
    )
  },
  !1,
)
