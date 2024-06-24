export declare const cleanupStyles: () => void
export declare const toggleStyleTag: (styleId: string, enable: boolean) => void
export declare const createOrUpdateStyleTag: (id: string, content: string) => void
export declare const invokeReplacer: () => void
export declare const invokeObserver: () => void
export declare const preview: () => Promise<void>
export declare const init: (settings: { 'font-default': string; 'font-mono': string }) => void
