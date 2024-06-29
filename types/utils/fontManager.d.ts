/**
 * Disables the style tag and removes inline styles
 */
export declare const cleanupStyles: () => void
/**
 * Toggles the enabled state of the style tag
 */
export declare const toggleStyleTag: (styleId: string, enable: boolean) => void
/**
 * Creates or updates the style tag's content when different
 */
export declare const createOrUpdateStyleTag: (id: string, content: string) => void
/**
 * Reinitializes settings to start preview by updating injected styles
 */
export declare const preview: () => Promise<void>
/**
 * Initializes main functions
 */
export declare const init: (settings: {
  'font-default': string
  'font-mono': string
}) => Promise<void>
