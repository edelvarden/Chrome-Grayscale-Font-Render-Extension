# Font Customizer

_Force the use of custom fonts for web pages._

## Why I created it?

Some web pages use bad or unreadable fonts, I created this extension because I wanted to have more control over the fonts that I see on the web.

## Why is my solution better than others?

- Respects monospaced fonts
- Respects iconic fonts (eg., "Font Awesome", "Material Icons")
- No dependencies
- Small content script bundle size (~ 3.5 kB │ gzip: 1.6 kB)
- Works very fast

## How to install?

1. Download zip file from releases
2. Open [chrome://extensions](chrome://extensions) page and enable **Developer mode**
3. Drag & Drop zip file to extensions page

## How to use it?

Click on the extension icon to open the settings and select a default font from the drop-down list to instantly update it.

| Before                                        | After                                        |
| --------------------------------------------- | -------------------------------------------- |
| ![alt text](docs/screenshots/font-before.png) | ![alt text](docs/screenshots/font-after.png) |

## Extended font list

The list by default displays locally installed fonts, but extended with popular [Google Fonts](https://fonts.google.com/). If you don't have a local font installed, the extension fetches it from [Google Fonts](https://fonts.google.com/).

## Advanced mode

Enable **Advanced mode** to swap between two fonts for comparison.
