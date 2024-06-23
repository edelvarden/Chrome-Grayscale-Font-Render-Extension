type DebounceFunction = (...args: any[]) => void;
/**
* debounce function
*/
export declare const debounce: (func: DebounceFunction, delay: number) => DebounceFunction;
export {};
