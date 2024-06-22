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
let isOn: boolean = true
let isAdvancedMode: boolean = false

// Type definition for settings
interface Settings {
  'font-default': string
  'font-default2': string
  'font-mono': string
  'font-mono2': string
}

// Utility function to query active tab
const queryActiveTab = (callback: (tab: chrome.tabs.Tab) => void): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs.length > 0) {
      callback(tabs[0])
    }
  })
}

// Function to send message to content script
const sendMessageToContentScript = (message: Message): void => {
  queryActiveTab((activeTab) => {
    chrome.tabs.sendMessage(activeTab.id!, message)
  })
}

// Messaging functions
const startPreview = (): void => sendMessageToContentScript({ action: 'executePreview' })
const removeEffect = (): void => sendMessageToContentScript({ action: 'executeCleanup' })

// Storage functions
const saveSettings = (settings: Partial<Settings>): void => {
  CONFIG?.set(settings, () => {
    if (!simpleErrorHandler(tl('ERROR_SETTINGS_SAVE')) && isOn) startPreview()
  })
}

const saveSwitchState = (state: boolean): void => {
  queryActiveTab((currentTab) => {
    const storageKey = `switch_state_${currentTab.url}`
    chrome.storage.sync.set({ [storageKey]: state })
  })
}

const getSwitchState = (): Promise<boolean | undefined> => {
  return new Promise((resolve) => {
    queryActiveTab((currentTab) => {
      const storageKey = `switch_state_${currentTab.url}`
      chrome.storage.sync.get([storageKey], (result) => {
        resolve(result[storageKey])
      })
    })
  })
}

// Settings management functions
const handleSaveSettings = (): void => {
  const settings: any = { ...CONFIG?.get() }

  ;['font-default', 'font-default2', 'font-mono', 'font-mono2'].forEach((id) => {
    const select = document.querySelector(`#${id}`) as HTMLSelectElement | null
    if (select) settings[id as keyof Settings] = select.value.trim() || ''
  })
  saveSettings(settings)
}

const resetSettings = (): void => {
  CONFIG?.clear(() => {
    simpleErrorHandler(tl('ERROR_SETTINGS_RESET'))
    removeEffect()
    resetSelectValues()
    if (!isOn) handleSwitchToggle()
    initializeSwitchState()
  })
}

const resetSelectValues = (): void => {
  ['font-default', 'font-default2', 'font-mono', 'font-mono2'].forEach((id) => {
    const select = document.querySelector(`#${id}`) as HTMLSelectElement | null
    if (select) select.value = ''
  })
}

// Switch state functions
const initializeSwitchState = async (): Promise<void> => {
  const switchState = await getSwitchState()
  isOn = switchState !== false
  const switchElement = document.querySelector('#switch') as HTMLInputElement | null
  if (switchElement) switchElement.checked = isOn
}

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

// UI interaction functions
const handleSwitchButtonClick = (id1: string, id2: string): void => {
  swapSelectValues(id1, id2)
  handleSaveSettings()
}

const handleAdvancedModeToggle = async (): Promise<void> => {
  isAdvancedMode = !isAdvancedMode
  localStorage.setItem('isAdvancedMode', JSON.stringify(isAdvancedMode))
  const fontSettings = await CONFIG?.get({
    'font-default': '',
    'font-default2': '',
    'font-mono': '',
    'font-mono2': '',
  }) as Partial<Settings>
  const fontList = await updateFontList()
  initializeSettings(fontSettings, fontList)
}

const updateFontList = async (): Promise<FontListItem[]> => {
  const fontList: FontListItem[] = await chrome.fontSettings.getFontList()
  googleFontsList.forEach((googleFont: GoogleFont) => {
    if (!fontList.some((font) => font.displayName === googleFont.displayName)) {
      const fontId = 'GF-' + googleFont.fontFamily
      fontList.push({ displayName: googleFont.displayName, fontId })
    }
  })
  fontList.sort((a, b) => a.displayName.localeCompare(b.displayName))
  fontList.unshift({ fontId: '', displayName: tl('SETTINGS_FONT_DEFAULT') })
  return fontList
}

const swapSelectValues = (id1: string, id2: string): void => {
  const select1 = document.querySelector(`#${id1}`) as HTMLSelectElement | null
  const select2 = document.querySelector(`#${id2}`) as HTMLSelectElement | null

  if (select1 && select2) {
    const tempValue = select1.value
    select1.value = select2.value
    select2.value = tempValue
  }
}

const initializeSettings = (
  fontSettings: Partial<Settings>,
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
        <section class="settings__inner">
          <div class="settings__item">
            <h2 class="settings__title">${tl('SETTINGS_TITLE_FONTS')}</h2>
            <div class="settings__controls">
              ${resetButton}
              <label>
                <md-switch id="switch" selected @input=${handleSwitchToggle}></md-switch>
              </label>
            </div>
          </div>
          ${['font-default', 'font-mono'].map(
            (id) => html`
              <div class="settings__item">
                <div class="select-label">
                  <span class="select-label__title">
                    ${id === 'font-default' ? tl('FONT_DEFAULT') : tl('FONT_MONOSPACE')}
                  </span>
                  <span class="select-label__description">
                    ${id === 'font-default'
                      ? tl('FONT_DEFAULT_DESCRIPTION')
                      : tl('FONT_MONOSPACE_DESCRIPTION')}
                  </span>
                </div>
                <div class="settings__swap-container">
                  ${SelectComponent({
                    id,
                    value: fontSettings[id as keyof Settings] || '',
                    options: fontList,
                    handleChange: handleSaveSettings,
                  })}
                  ${isAdvancedMode
                    ? html`
                        <div>
                          <md-icon-button @click=${() => handleSwitchButtonClick(id, id + '2')}>
                            ${SwapIcon()}
                          </md-icon-button>
                        </div>
                        ${SelectComponent({
                          id: id + '2',
                          value: fontSettings[id + '2' as keyof Settings] || '',
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
    }) as Partial<Settings>
    const fontList = await updateFontList()

    const storedAdvancedMode = localStorage.getItem('isAdvancedMode')
    if (storedAdvancedMode !== null) {
      isAdvancedMode = JSON.parse(storedAdvancedMode)
    }

    initializeSettings(fontSettings, fontList)
  } catch (error) {
    simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))
  }
})
