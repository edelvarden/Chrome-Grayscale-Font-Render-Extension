import '@material/web/elevation/elevation'
import '@material/web/iconbutton/icon-button'
import '@material/web/switch/switch'
import { FontListItem, GoogleFont, Message } from '@types'
import { googleFontsList } from '@utils/constants'
import '@utils/localize'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { simpleErrorHandler, tl } from '@utils/stringUtils'
import { html, render } from 'lit'
import ResetIcon from './components/icons/ResetIcon'
import SwapIcon from './components/icons/SwapIcon'
import SelectComponent from './components/select'
import './index.css'

// Define types for variables
let isOn = true // Explicitly define type for `isOn`

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
const saveSettings = (settings: {
  'font-default'?: string
  'font-default2'?: string
  'font-mono'?: string
  'font-mono2'?: string
}): void => {
  CONFIG?.set(settings, () => {
    if (!simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) && isOn) startPreview()
  })
}

// Reset function
const resetSettings = (): void => {
  CONFIG?.clear(() => {
    simpleErrorHandler(tl('ERROR_SETTINGS_RESET'))
    removeEffect()

    const selectDefault = document.querySelector('#font-default') as HTMLSelectElement | null
    const selectDefault2 = document.querySelector('#font-default2') as HTMLSelectElement | null
    const selectMono = document.querySelector('#font-mono') as HTMLSelectElement | null
    const selectMono2 = document.querySelector('#font-mono2') as HTMLSelectElement | null

    if (selectDefault) selectDefault.value = ''
    if (selectDefault2) selectDefault2.value = ''
    if (selectMono) selectMono.value = ''
    if (selectMono2) selectMono2.value = ''

    if (!isOn) {
      handleSwitchToggle()
    }

    initializeSwitchState()
  })
}

// Save settings function
const handleSaveSettings = (): void => {
  const selectDefault = document.querySelector('#font-default') as HTMLSelectElement | null
  const selectDefault2 = document.querySelector('#font-default2') as HTMLSelectElement | null
  const selectMono = document.querySelector('#font-mono') as HTMLSelectElement | null
  const selectMono2 = document.querySelector('#font-mono2') as HTMLSelectElement | null

  const settings = {
    'font-default': selectDefault?.value.trim() || '',
    'font-default2': selectDefault2?.value.trim() || '',
    'font-mono': selectMono?.value.trim() || '',
    'font-mono2': selectMono2?.value.trim() || '',
  }
  saveSettings(settings)
}

// Save switch state function
const saveSwitchState = (state: boolean): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs.length > 0) {
      const currentTab = tabs[0]
      const storageKey = `switch_state_${currentTab.url}`
      chrome.storage.sync.set({ [storageKey]: state })
    }
  })
}

// Get switch state function returning a promise
const getSwitchState = (): Promise<boolean | undefined> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs.length > 0) {
        const currentTab = tabs[0]
        const storageKey = `switch_state_${currentTab.url}`
        chrome.storage.sync.get([storageKey], (result) => {
          resolve(result[storageKey])
        })
      }
    })
  })
}

// Initialize switch state asynchronously
const initializeSwitchState = async (): Promise<void> => {
  const switchState = await getSwitchState()
  isOn = switchState !== false
  const switchElement = document.querySelector('#switch') as HTMLInputElement | null
  if (switchElement) switchElement.checked = isOn // Adjusted to use `checked` for checkbox
}

// Handle switch function
const handleSwitchToggle = (): void => {
  isOn = !isOn
  saveSwitchState(isOn)
  const switchElement = document.querySelector('#switch') as HTMLInputElement | null
  LOCAL_CONFIG?.set({ off: !isOn }, () => {
    if (!simpleErrorHandler(tl('ERROR_SETTINGS_SAVE'))) {
      if (switchElement) switchElement.classList.toggle('on', isOn)
      if (isOn) startPreview()
      else removeEffect()
    }
  })
}

const handleSwitchButtonClick = () => {
  const selectDefault = document.querySelector('#font-default') as HTMLSelectElement | null
  const selectDefault2 = document.querySelector('#font-default2') as HTMLSelectElement | null

  if (selectDefault && selectDefault2) {
    const tempValue = selectDefault.value
    selectDefault.value = selectDefault2.value
    selectDefault2.value = tempValue

    // Save the swapped values immediately
    handleSaveSettings()
  }
}
const handleSwitchButton2Click = () => {
  const selectMono = document.querySelector('#font-mono') as HTMLSelectElement | null
  const selectMono2 = document.querySelector('#font-mono2') as HTMLSelectElement | null

  if (selectMono && selectMono2) {
    const tempValue = selectMono.value
    selectMono.value = selectMono2.value
    selectMono2.value = tempValue

    // Save the swapped values immediately
    handleSaveSettings()
  }
}

// Initialize settings function with font settings and font list
const initializeSettings = (
  fontSettings: {
    'font-default'?: string
    'font-default2'?: string
    'font-mono'?: string
    'font-mono2'?: string
  },
  fontList: FontListItem[],
): void => {
  const resetButton = html`
    <md-icon-button id="reset" aria-label="reset-settings" @click=${resetSettings}>
      ${ResetIcon()}
    </md-icon-button>
  `

  const template = html`<div class="surface">
    <md-elevation></md-elevation>
    <div id="settings" class="settings-container">
      <!-- Default/Fixed Fonts selection -->
      <section class="settings__inner">
        <!-- Custom Fonts -->
        <div class="settings__item">
          <h2 class="settings__title">${tl('SETTINGS_TITLE_FONTS')}</h2>
          <div class="settings__controls">
            <!-- Reset settings button -->
            ${resetButton}
            <!-- Enable/Disable button -->
            <label>
              <md-switch id="switch" selected @input=${handleSwitchToggle}></md-switch>
            </label>
          </div>
        </div>
        <div class="settings__item">
          <div class="select-label">
            <span class="select-label__title">${tl('FONT_DEFAULT')}</span>
            <span class="select-label__description">${tl('FONT_DEFAULT_DESCRIPTION')}</span>
          </div>
          <div class="settings__swap-container">
          ${SelectComponent({
            id: 'font-default',
            value: fontSettings['font-default'] || '',
            options: fontList,
            handleChange: handleSaveSettings,
          })}
          <div>
            <md-icon-button @click=${handleSwitchButtonClick}>${SwapIcon()}</md-icon-button>
          </div>
          ${SelectComponent({
            id: 'font-default2',
            value: fontSettings['font-default2'] || '',
            options: fontList,
            handleChange: handleSaveSettings,
          })}
          </div>
        </div>
        <div class="settings__item" style="flex-direction: row;">
          <div class="select-label">
            <span class="select-label__title">${tl('FONT_MONOSPACE')}</span>
            <span class="select-label__description">${tl('FONT_MONOSPACE_DESCRIPTION')}</span>
          </div>
          <div class="settings__swap-container">
            ${SelectComponent({
              id: 'font-mono',
              value: fontSettings['font-mono'] || '',
              options: fontList,
              handleChange: handleSaveSettings,
            })}
            <div>
              <md-icon-button @click=${handleSwitchButton2Click}>${SwapIcon()}</md-icon-button>
            </div>
            ${SelectComponent({
              id: 'font-mono2',
              value: fontSettings['font-mono2'] || '',
              options: fontList,
              handleChange: handleSaveSettings,
            })}
          </div>
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
      'font-default2': '',
      'font-mono': '',
      'font-mono2': '',
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

    initializeSettings(fontSettings, fontList)
  } catch (error) {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))
  }
})
