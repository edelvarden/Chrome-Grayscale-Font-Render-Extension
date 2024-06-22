type DebounceFunction = (...args: any[]) => void;
export declare const debounce: (func: DebounceFunction, delay: number) => DebounceFunction;
export {};
