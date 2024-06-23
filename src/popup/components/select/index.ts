import { SelectOption } from '@types'
import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('select-component')
export class SelectComponent extends LitElement {
  @property({ type: String })
  id: string = ''

  @property({ type: String })
  value?: string

  @property({ type: Array })
  options: SelectOption[] = []

  // Event handler for select change
  private handleChange(event: Event) {
    const select = event.target as HTMLSelectElement
    this.value = select.value
    this.dispatchEvent(new CustomEvent('change', { detail: this.value }))
  }

  static styles = css`
    .select {
      --md-arrow-width: 10px;
      --md-select-bg-color: var(--md-sys-color-surface);
      --md-select-option-bg-color: var(--md-sys-color-surface-container);
      --md-select-side-padding: 8px;
      --md-select-text-color: var(--md-sys-color-on-background);

      --md-select-width: 180px;
    }

    .select {
      margin-left: auto;
      appearance: none;
      background: var(--select-arrow-icon) calc(100% - var(--md-select-side-padding))
        center no-repeat;
      background-color: var(--md-select-bg-color);
      background-size: var(--md-arrow-width);
      border: none;
      border-radius: 4px;
      color: var(--md-select-text-color);
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      max-width: 100%;
      padding-bottom: 6px;
      padding-inline-end: calc(var(--md-select-side-padding) + var(--md-arrow-width) + 3px);
      padding-inline-start: var(--md-select-side-padding);
      padding-top: 6px;
      width: var(--md-select-width, 200px);
    }

    .select option {
      background-color: var(--md-select-option-bg-color);
    }

    .select {
      outline: 3px solid transparent;
      outline-offset: -1px;
    }

    .select:focus {
      outline-color: var(--md-focus-ring-color);
    }
  `

  render() {
    return html`
      <div style="position: relative">
        <select
          id="${this.id}"
          class="select"
          @change=${this.handleChange}
          .value="${this.value ?? ''}"
        >
          ${this.options.map(
            (option) =>
              html`<option value="${option.fontId}" ?selected=${option.fontId === this.value}>
                ${option.displayName}
              </option>`,
          )}
        </select>
      </div>
    `
  }
}
