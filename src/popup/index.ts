import '@material/web/checkbox/checkbox'
import '@material/web/elevation/elevation'
import '@material/web/iconbutton/icon-button'
import '@material/web/switch/switch'
import { FontListItem, GoogleFont, Message } from '@types'
import { googleFontsList } from '@utils/constants'
import { $ } from '@utils/domUtils'
import { initLocalization, tl } from '@utils/localize'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { TemplateResult, html, render } from 'lit'
import './components/icons/reset-icon'
import './components/icons/swap-icon'
import './components/select'
import './index.css'

// Define types for variables
let isOn: boolean = true
let isAdvancedMode: boolean = false
let ligatures: boolean = false

// Type definition for settings
interface Settings {
  'font-default': string
  'font-default2': string
  'font-mono': string
  'font-mono2': string
  ligatures: boolean
}

// Utility function to query active tab
const queryActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs.length > 0 ? tabs[0] : undefined
}

// Function to send message to content script
const sendMessageToContentScript = async (message: Message) => {
  const activeTab = await queryActiveTab()
  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id!, message)
  }
}

// Messaging functions
const startPreview = () => sendMessageToContentScript({ action: 'executePreview' })
const removeEffect = () => sendMessageToContentScript({ action: 'executeCleanup' })

// Storage functions
const saveSettings = (settings: Partial<Settings>): void => {
  CONFIG?.set(settings, () => {
    if (isOn) startPreview()
  })
}

const saveSwitchState = async (state: boolean): Promise<void> => {
  const storageKey = `switch_state`
  CONFIG?.set({ [storageKey]: state })
}

const getSwitchState = async (): Promise<boolean | undefined> => {
  const storageKey = `switch_state`
  return new Promise((resolve) => {
    CONFIG?.get([storageKey], (result) => {
      resolve(result[storageKey])
    })
  })
}

// Settings management functions
const handleSaveSettings = (): void => {
  const settings: any = { ...CONFIG?.get() }
  ;['font-default', 'font-default2', 'font-mono', 'font-mono2'].forEach((id) => {
    const select = $(`#${id}`) as HTMLSelectElement
    if (select) settings[id as keyof Settings] = select.value.trim() || ''
  })
  settings.ligatures = ligatures

  saveSettings(settings)
}

const resetSettings = (): void => {
  CONFIG?.clear(() => {
    removeEffect()
    resetSelectValues()
    if (!isOn) handleSwitchToggle()
    initializeSwitchState()
  })
}

const resetSelectValues = async (): Promise<void> => {
  const selectIds = ['font-default', 'font-default2', 'font-mono', 'font-mono2']

  for (const id of selectIds) {
    const select = $(`#${id}`) as HTMLSelectElement
    if (select) {
      select.value = ''
    }
  }
}

// Switch state functions
const initializeSwitchState = async (): Promise<void> => {
  const switchState = await getSwitchState()
  isOn = switchState !== false
  const switchElement = $('#switch') as HTMLInputElement
  if (switchElement) switchElement.checked = isOn
}

const handleSwitchToggle = (): void => {
  isOn = !isOn
  saveSwitchState(isOn)
  const switchElement = $('#switch') as HTMLInputElement
  LOCAL_CONFIG?.set({ off: !isOn }, () => {
    if (switchElement) switchElement.classList.toggle('on', isOn)
    if (isOn) startPreview()
    else removeEffect()
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
  const fontSettings = await getConfigSettings()
  const fontList = await updateFontList()
  initializeSettings(fontSettings, fontList)
}

const handleLigaturesToggle = (event: Event): void => {
  const checkbox = event.target as HTMLInputElement
  ligatures = checkbox.checked
  saveSettings({ ligatures })
  handleSaveSettings()
}

const getConfigSettings = async (): Promise<Partial<Settings>> => {
  const settings = (await CONFIG?.get({
    'font-default': '',
    'font-default2': '',
    'font-mono': '',
    'font-mono2': '',
    ligatures: false,
  })) as Partial<Settings>

  ligatures = settings.ligatures ?? false

  return settings
}

const updateFontList = async (): Promise<FontListItem[]> => {
  const fontList: FontListItem[] = await chrome.fontSettings.getFontList()
  googleFontsList.forEach((googleFont: GoogleFont) => {
    if (!fontList.some((font) => font.displayName === googleFont.displayName)) {
      const fontId = `GF-${googleFont.fontFamily}`
      fontList.push({ displayName: googleFont.displayName, fontId })
    }
  })
  fontList.sort((a, b) => a.displayName.localeCompare(b.displayName))
  return fontList
}

const swapSelectValues = (id1: string, id2: string): void => {
  const select1 = $(`#${id1}`) as HTMLSelectElement
  const select2 = $(`#${id2}`) as HTMLSelectElement

  if (select1 && select2 && select1.value !== select2.value) {
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
    <md-icon-button
      id="reset"
      title="Reset settings"
      aria-label="reset-settings"
      @click=${resetSettings}
    >
      <reset-icon />
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

  const ligaturesCheckbox: TemplateResult = html`
    <label style="display: flex; flex-direction: row; align-items: center;">
      <md-checkbox
        id="ligaturesCheckbox"
        touch-target="wrapper"
        @change=${handleLigaturesToggle}
        .checked=${ligatures}
      ></md-checkbox>
      Ligatures
    </label>
  `

  // Add (none) option
  fontList.unshift({ fontId: '', displayName: tl('SETTINGS_FONT_DEFAULT') })

  const selectWithStyle = isAdvancedMode ? '--md-select-width: 175px;' : ''

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
                <md-switch id="switch" ?selected=${isOn} @input=${handleSwitchToggle}></md-switch>
              </label>
            </div>
          </div>
          ${['font-default', 'font-mono'].map((id) => {
            return html`
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
                  <select-component
                    id="${id}"
                    .value="${fontSettings[id as keyof Settings] || ''}"
                    .options="${fontList}"
                    style="${selectWithStyle}"
                    @change="${handleSaveSettings}"
                  ></select-component>
                  ${isAdvancedMode
                    ? html`
                        <div>
                          <md-icon-button @click=${() => handleSwitchButtonClick(id, `${id}2`)}>
                            <swap-icon />
                          </md-icon-button>
                        </div>
                        <select-component
                          id="${id}2"
                          .value="${fontSettings[`${id}2` as keyof Settings] || ''}"
                          .options="${fontList}"
                          style="${selectWithStyle}"
                          @change="${handleSaveSettings}"
                        ></select-component>
                      `
                    : ''}
                </div>
              </div>
            `
          })}
          <div class="settings__item" style="padding-left:12px;">${ligaturesCheckbox}</div>
          <div class="settings__item" style="padding-left:12px;">${advancedModeCheckbox}</div>
        </section>
      </div>
    </div>
  `

  const mainElement = $('main') as HTMLElement
  if (mainElement) {
    render(template, mainElement)
  } else {
    console.error('Main element not found!')
  }
}

// Add event listener to load event
window.addEventListener('load', async () => {
  initLocalization()
  initializeSwitchState()
  try {
    const fontSettings = await getConfigSettings()
    const fontList = await updateFontList()

    const storedAdvancedMode = localStorage.getItem('isAdvancedMode')
    if (storedAdvancedMode !== null) {
      isAdvancedMode = JSON.parse(storedAdvancedMode)
    }

    initializeSettings(fontSettings, fontList)
  } catch (error) {
    console.error('❌ ERROR:', error)
  }
})
