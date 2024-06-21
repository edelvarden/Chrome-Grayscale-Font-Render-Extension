type GetMessageArgs = string | string[] | undefined
declare function getMessage(messageName: string, args?: GetMessageArgs): string
declare function onDocumentReady(callback: () => void): void
declare function querySelectorAll<T extends Element>(selectors: string): NodeListOf<T>
declare function processI18nElements(): void
declare function processI18nTitleElements(): void
declare function processI18nValueElements(): void
