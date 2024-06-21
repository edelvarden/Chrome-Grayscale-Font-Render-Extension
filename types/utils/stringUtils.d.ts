type GetMessageArgs = string | string[]
export declare const tl: (message: string, args?: GetMessageArgs) => string
export declare const simpleErrorHandler: (message: string) => boolean
export declare const fixName: (name: string) => string
export declare const addHashSuffix: (prefix: string) => string
export {}
