# Web to Figma (Chrome Extension)

## Demo

[Watch Demo](https://x.com/xin_pai88825/status/2029792800653594675)

Capture web pages and export them as data for Figma workflows.  
Supports full-page capture, element capture, and optional cross-origin image proxy fetching.

## Features

- In-page floating toolbar with one-click capture
- Optional cross-origin image proxy mode to reduce missing images
- Configurable image fetch concurrency (`4/6/8/10/12/16/20/infinite`)
- Export capture result as `.json`

## Project Structure

```text
.
├── manifest.json
├── background.js
├── capture.js
├── runner.js
├── inpage-toolbar.js
├── popup.html
├── popup.css
├── popup.js
└── logo/
```

## Local Installation (Developer Mode)

1. Open `chrome://extensions/`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this repository root directory

## Usage

1. Open any webpage
2. Click the extension icon (or use the in-page toolbar)
3. Enable `Cross-origin image proxy mode` if needed
4. Click `Start Capture`
5. Download the generated `figma-capture-*.json`

## Cross-Origin Image Proxy Notes

- When enabled, the extension fetches images through the background proxy.
- This improves image completeness but can make capture slower.
- Use `Image Fetch Concurrency` to balance speed and stability.

## Packaging

Run in repository root:

```bash
zip -r web-to-figma-extension.zip . -x "*.DS_Store" -x ".git/*"
```

## Notes

- `capture.js` is the core capture runtime.
- If you obfuscate code, do it on a release copy, not on source files.

## Disclaimer

- This project is provided for learning, research, and productivity use only.
- You are responsible for complying with website terms, copyright rules, privacy laws, and applicable local regulations.
- Do not use this tool to capture or distribute unauthorized, sensitive, or illegal content.
- The authors and contributors are not liable for misuse, data loss, or any direct/indirect damages caused by this project.

## License

This project is open-sourced under the [MIT License](./LICENSE).
