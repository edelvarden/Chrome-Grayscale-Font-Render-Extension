/**
 * Disable style tag and remove inline styles
 */
export declare const cleanupStyles: () => void
/**
 * Toggle style tag enabled state
 */
export declare const toggleStyleTag: (styleId: string, enable: boolean) => void
/**
 * Create style tag or update styles content when different
 */
export declare const createOrUpdateStyleTag: (id: string, content: string) => void
/**
 * Reinitialize settings to start preview by updating injected styles
 */
export declare const preview: () => Promise<void>
/**
 * Initialize main functions
 */
export declare const init: (settings: { 'font-default': string; 'font-mono': string }) => void
