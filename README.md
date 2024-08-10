# Font Customizer

_Force the use of custom fonts on web pages._

## Why did I create it?

Some web pages use poor or unreadable fonts. I created this extension because I wanted more control over the fonts I see on the web.

## Why is my solution better than others?

- Respects monospaced fonts.
- Respects iconic fonts (e.g., "Font Awesome", "Material Icons").
- No dependencies.
- Small content script bundle size (~5 kB │ gzip: 2 kB).
- Works very fast.

## How to install?

1. Download the zip file from the releases.
2. Open the `chrome://extensions` page and enable **Developer mode**.
3. Drag & drop the zip file onto the extensions page.

## How to use it?

Click on the extension icon to open the settings. Select a default font from the drop-down list to instantly update the fonts on web pages.

| Before                                        | After                                        |
| --------------------------------------------- | -------------------------------------------- |
| ![alt text](docs/screenshots/font-before.png) | ![alt text](docs/screenshots/font-after.png) |

## Features

### Extended Font List

By default, the list displays locally installed fonts and prioritizes using them if they exist. Additionally, it includes popular [Google Fonts](https://fonts.google.com/). If a local font is not installed, the extension will fetch it from [Google Fonts](https://fonts.google.com/).

### Advanced Mode

Enable the **Advanced Mode** checkbox to swap between two fonts for easy comparison.

### Ligature Visibility Option

Enable or disable ligatures for monospace fonts (if the font supports them).

### Functionality

The extension parses CSS selectors and variables related to font families from website stylesheets. It replaces them with custom font values and consolidates them into a single style tag injected into the DOM. This approach enhances performance compared to using observers with static selector replacements, especially in dynamic DOM environments where content changes frequently.

## Build and Development

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) (development environment)
- [NodeJS](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)
- Browser

To start development mode, run the following command. Then, open [chrome://extensions](chrome://extensions), enable "Developer mode," click "Load Unpacked," and select the build folder:

```bash
pnpm dev
```

Build command:

```bash
pnpm build
```

Build and pack the extension into a zip file:

```bash
pnpm zip
```
