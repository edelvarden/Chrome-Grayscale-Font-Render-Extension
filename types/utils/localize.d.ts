type GetMessageArgs = string | string[] | undefined
declare const getMessage: (messageName: string, args?: GetMessageArgs) => string
declare const onDocumentReady: (callback: () => void) => void
declare const querySelectorAll: <T extends Element>(selectors: string) => NodeListOf<T>
declare const processI18nElements: () => void
declare const processI18nTitleElements: () => void
declare const processI18nValueElements: () => void
