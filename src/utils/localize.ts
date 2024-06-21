type GetMessageArgs = string | string[] | undefined

const getMessage = (messageName: string, args?: GetMessageArgs): string => {
  return chrome.i18n.getMessage(messageName, args)
}

const onDocumentReady = (callback: () => void): void => {
  if (document.readyState === 'complete') {
    window.setTimeout(callback, 0)
  } else {
    window.addEventListener('DOMContentLoaded', callback, false)
  }
}

const querySelectorAll = <T extends Element>(selectors: string): NodeListOf<T> => {
  return document.querySelectorAll(selectors)
}

const processI18nElements = (): void => {
  const elements = querySelectorAll<HTMLElement>('[i18n]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n')
    if (key) {
      element.innerHTML = getMessage(key)
      element.removeAttribute('i18n')
    }
  })
}

const processI18nTitleElements = (): void => {
  const elements = querySelectorAll<HTMLElement>('[i18n_title]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n_title')
    if (key) {
      element.setAttribute('title', getMessage(key))
      element.removeAttribute('i18n_title')
    }
  })
}

const processI18nValueElements = (): void => {
  const elements = querySelectorAll<HTMLInputElement>('[i18n_value]')
  elements.forEach((element) => {
    const key = element.getAttribute('i18n_value')
    if (key) {
      element.setAttribute('value', getMessage(key))
      element.removeAttribute('i18n_value')
    }
  })
}

onDocumentReady(() => {
  processI18nElements()
  processI18nTitleElements()
  processI18nValueElements()
})
