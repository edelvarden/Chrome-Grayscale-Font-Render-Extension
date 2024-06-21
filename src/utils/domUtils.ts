export const $ = (selector: string, context: Document | Element = document): Element | null => {
  return context.querySelector(selector)
}

export const $$ = (
  selector: string,
  context: Document | Element = document,
): NodeListOf<Element> => {
  return context.querySelectorAll(selector)
}

// Define types for attributes, customAttributes, and CSS styles
type Attributes = {
  [key: string]: any
}

type CustomAttributes = {
  [key: string]: string
}

type CSSStyles = {
  [key: string]: string
}

// Element creation function
export const $$$ = (
  tag: string,
  attributes: Attributes = {},
  customAttributes: CustomAttributes = {},
  css: CSSStyles = {},
): HTMLElement => {
  const element = document.createElement(tag)
  Object.assign(element, attributes)
  Object.entries(customAttributes).forEach(([key, value]) => element.setAttribute(key, value))
  Object.assign(element.style, css)
  return element
}
