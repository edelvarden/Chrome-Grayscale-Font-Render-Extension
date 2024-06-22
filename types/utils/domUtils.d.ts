export declare const $: (selector: string, context?: Document | Element) => Element | null;
export declare const $$: (selector: string, context?: Document | Element) => NodeListOf<Element>;
type Attributes = {
    [key: string]: any;
};
type CustomAttributes = {
    [key: string]: string;
};
type CSSStyles = {
    [key: string]: string;
};
export declare const $$$: (tag: string, attributes?: Attributes, customAttributes?: CustomAttributes, css?: CSSStyles) => HTMLElement;
export {};
