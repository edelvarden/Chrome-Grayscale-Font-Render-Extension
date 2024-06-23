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
    .md-select {
      --md-arrow-width: 10px;
      --md-select-bg-color: var(--md-sys-color-surface);
      --md-select-option-bg-color: var(--md-sys-color-surface-container);
      --md-select-side-padding: 8px;
      --md-select-text-color: var(--md-sys-color-on-background);

      --md-select-width: 180px;
    }

    .md-select {
      margin-left: auto;
      appearance: none;
      background: var(--md-select-arrow-icon) calc(100% - var(--md-select-side-padding)) center
        no-repeat;
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

    .md-select option {
      background-color: var(--md-select-option-bg-color);
    }

    .md-select option[data-google-font] {
      color: var(--md-sys-color-primary);
    }

    .md-select {
      outline: 3px solid transparent;
      outline-offset: -1px;
    }

    .md-select:focus {
      outline-color: var(--md-focus-ring-color);
    }
  `

  render() {
    return html`
      <div style="position: relative">
        <select
          id="${this.id}"
          class="md-select"
          .value="${this.value ?? ''}"
          @change=${this.handleChange}
        >
          ${this.options.map(
            (option) =>
              html`<option
                value="${option.fontId}"
                ?data-google-font=${option.fontId.startsWith('GF-')}
                ?selected=${option.fontId === this.value}
              >
                ${option.displayName}
              </option>`,
          )}
        </select>
      </div>
    `
  }
}
