type Styles = {
    sansStyles: Set<string>;
    monospaceStyles: Set<string>;
};
/**
 * Parses all webpage styles to get selectors for sans and monospace fonts
 */
export declare const getStyles: ((sansFontFamily: string, monospaceFontFamily: string) => Promise<Styles>) & {
    clearCache: () => void;
};
export {};
