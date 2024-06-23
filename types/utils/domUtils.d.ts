/**
 * Selects a single element that matches the specified selector.
 * @param {string} selector The CSS selector to match the element.
 * @param {Document | Element} [context=document] The context to search within.
 * @returns {Element | null} The first matched element, or null if no match is found.
 */
export declare const $: (selector: string, context?: Document | Element) => Element | null
/**
 * Selects all elements that match the specified selector.
 * @param {string} selector The CSS selector to match the elements.
 * @param {Document | Element} [context=document] The context to search within.
 * @returns {NodeListOf<Element>} A NodeList of matched elements.
 */
export declare const $$: (selector: string, context?: Document | Element) => NodeListOf<Element>
type Attributes = {
  [key: string]: any
}
type CustomAttributes = {
  [key: string]: string
}
type CSSStyles = {
  [key: string]: string
}
/**
 * Creates an HTML element with the specified attributes, custom attributes, and styles.
 * @param {string} tag The tag name of the HTML element to create.
 * @param {Attributes} [attributes={}] Standard attributes to assign to the element.
 * @param {CustomAttributes} [customAttributes={}] Custom attributes to assign to the element.
 * @param {CSSStyles} [css={}] CSS styles to assign to the element.
 * @returns {HTMLElement} The created HTML element.
 */
export declare const $$$: (
  tag: string,
  attributes?: Attributes,
  customAttributes?: CustomAttributes,
  css?: CSSStyles,
) => HTMLElement
export {}
