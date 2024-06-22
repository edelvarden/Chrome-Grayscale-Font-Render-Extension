import '@material/web/checkbox/checkbox'
import '@material/web/elevation/elevation'
import '@material/web/iconbutton/icon-button'
import '@material/web/switch/switch'
import { FontListItem, GoogleFont, Message } from '@types'
import { googleFontsList } from '@utils/constants'
import '@utils/localize'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { simpleErrorHandler, tl } from '@utils/stringUtils'
import { TemplateResult, html, render } from 'lit'
import ResetIcon from './components/icons/ResetIcon'
import SwapIcon from './components/icons/SwapIcon'
import SelectComponent from './components/select'
import './index.css'

// Define types for variables
let isOn: boolean = true // Explicitly define type for `isOn`
let isAdvancedMode: boolean = false

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
const saveSettings = (settings: { [key: string]: any }): void => {
  CONFIG?.set(settings, () => {
    if (!simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) && isOn) startPreview()
  })
}

// Reset function
const resetSettings = (): void => {
  CONFIG?.clear(() => {
    simpleErrorHandler(tl('ERROR_SETTINGS_RESET'))
    removeEffect()
    ;['font-default', 'font-default2', 'font-mono', 'font-mono2'].forEach((id) => {
      const select = document.querySelector(`#${id}`) as HTMLSelectElement | null
      if (select) select.value = ''
    })

    if (!isOn) {
      handleSwitchToggle()
    }

    initializeSwitchState()
  })
}

// Save settings function
const handleSaveSettings = (): void => {
  ;['font-default', 'font-default2', 'font-mono', 'font-mono2'].forEach((id) => {
    const select = document.querySelector(`#${id}`) as HTMLSelectElement | null
    if (!select) return

    const settings: { [key: string]: any } = { ...CONFIG?.get() }
    settings[id] = select.value.trim() || ''
    saveSettings(settings)
  })
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

// Handle switch button click function
const handleSwitchButtonClick = (id1: string, id2: string): void => {
  const select1 = document.querySelector(`#${id1}`) as HTMLSelectElement | null
  const select2 = document.querySelector(`#${id2}`) as HTMLSelectElement | null

  if (select1 && select2) {
    const tempValue = select1.value
    select1.value = select2.value
    select2.value = tempValue

    // Save the swapped values immediately
    handleSaveSettings()
  }
}

// Handle Advanced Mode toggle function
const handleAdvancedModeToggle = async (): Promise<void> => {
  isAdvancedMode = !isAdvancedMode
  localStorage.setItem('isAdvancedMode', JSON.stringify(isAdvancedMode))
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

  // add (none) option
  fontList.unshift({ fontId: '', displayName: tl('SETTINGS_FONT_DEFAULT') })

  initializeSettings(fontSettings, fontList)
}

// Initialize settings function with font settings and font list
const initializeSettings = (
  fontSettings: { [key: string]: any },
  fontList: FontListItem[] = [],
): void => {
  const resetButton: TemplateResult = html`
    <md-icon-button id="reset" aria-label="reset-settings" @click=${resetSettings}>
      ${ResetIcon()}
    </md-icon-button>
  `

  const advancedModeCheckbox: TemplateResult = html`
    <label style="display: flex; flex-direction: row; align-items: center;">
      <md-checkbox
        id="advancedModeCheckbox"
        touch-target="wrapper"
        @change=${handleAdvancedModeToggle}
        .checked=${isAdvancedMode}
      ></md-checkbox>
      Advanced mode
    </label>
  `

  const template: TemplateResult = html`
    <div class="surface">
      <md-elevation></md-elevation>
      <div id="settings" class="settings-container">
        <!-- Default/Fixed Fonts selection -->
        <section class="settings__inner">
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
          <!-- Additional settings items for fonts -->
          ${['font-default', 'font-mono'].map(
            (id) => html`
              <div class="settings__item">
                <div class="select-label">
                  <span class="select-label__title"
                    >${id === 'font-default' ? tl('FONT_DEFAULT') : tl('FONT_MONOSPACE')}</span
                  >
                  <span class="select-label__description"
                    >${id === 'font-default'
                      ? tl('FONT_DEFAULT_DESCRIPTION')
                      : tl('FONT_MONOSPACE_DESCRIPTION')}</span
                  >
                </div>
                <div class="settings__swap-container">
                  ${SelectComponent({
                    id,
                    value: fontSettings[id] || '',
                    options: fontList,
                    handleChange: handleSaveSettings,
                  })}
                  ${isAdvancedMode
                    ? html`
                        <div>
                          <md-icon-button @click=${() => handleSwitchButtonClick(id, id + '2')}
                            >${SwapIcon()}</md-icon-button
                          >
                        </div>
                        ${SelectComponent({
                          id: id + '2',
                          value: fontSettings[id + '2'] || '',
                          options: fontList,
                          handleChange: handleSaveSettings,
                        })}
                      `
                    : ''}
                </div>
              </div>
            `,
          )}
          <div class="settings__item">${advancedModeCheckbox}</div>
        </section>
      </div>
    </div>
  `

  // Render the template
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

    // add (none) option
    fontList.unshift({ fontId: '', displayName: tl('SETTINGS_FONT_DEFAULT') })

    // Initialize isAdvancedMode from local storage
    const storedAdvancedMode = localStorage.getItem('isAdvancedMode')
    if (storedAdvancedMode !== null) {
      isAdvancedMode = JSON.parse(storedAdvancedMode)
    }

    initializeSettings(fontSettings, fontList)
  } catch (error) {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))
  }
})
