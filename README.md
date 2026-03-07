# Web to Figma (Chrome Extension)

[中文介绍](#中文介绍)

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

---

## 中文介绍

本插件用于采集网页内容并导出为可用于 Figma 工作流的数据，支持整页采集、元素采集，以及可选的跨域图片代理拉取。

### 功能

- 网页内悬浮工具栏，一键开始采集
- 可选“跨域图片代理模式”，减少丢图
- 图片采集并发可配置（`4/6/8/10/12/16/20/无限`）
- 采集结果可导出为 `.json`

### 本地安装

1. 打开 `chrome://extensions/`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择仓库根目录

### 打包命令

```bash
zip -r web-to-figma-extension.zip . -x "*.DS_Store" -x ".git/*"
```
