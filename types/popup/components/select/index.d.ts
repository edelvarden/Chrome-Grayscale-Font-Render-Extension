import { SelectOption } from '@types'
import { LitElement } from 'lit'
export declare class SelectComponent extends LitElement {
  id: string
  value?: string
  options: SelectOption[]
  private handleChange
  static styles: import('lit').CSSResult
  render(): import('lit').TemplateResult<1>
}
