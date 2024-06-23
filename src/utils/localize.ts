import { $$ } from "./domUtils"

type GetMessageArgs = string | string[] | undefined

export const tl = (message: string, args: GetMessageArgs = []): string => {
  return chrome.i18n.getMessage(message, args)
}

const onDocumentReady = (callback: () => void): void => {
  if (document.readyState === 'complete') {
    window.setTimeout(callback, 0)
  } else {
    window.addEventListener('DOMContentLoaded', callback, false)
  }
}

const processI18nElements = (): void => {
  const elements = $$('[i18n]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n')
    if (key) {
      element.innerHTML = tl(key)
      element.removeAttribute('i18n')
    }
  })
}

const processI18nTitleElements = (): void => {
  const elements = $$('[i18n_title]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n_title')
    if (key) {
      element.setAttribute('title', tl(key))
      element.removeAttribute('i18n_title')
    }
  })
}

const processI18nValueElements = (): void => {
  const elements = $$('[i18n_value]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n_value')
    if (key) {
      element.setAttribute('value', tl(key))
      element.removeAttribute('i18n_value')
    }
  })
}

export const init = () => {
  onDocumentReady(() => {
    processI18nElements()
    processI18nTitleElements()
    processI18nValueElements()
  }) 
}
