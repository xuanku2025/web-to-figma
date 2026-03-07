# Web to Figma（Chrome 扩展）

将网页内容采集为可用于 Figma 的设计数据，支持整页采集、元素采集，以及跨域图片代理拉取。

## 功能特性

- 网页内悬浮工具栏，一键开始采集
- 跨域图片代理模式（可选），减少图片丢失
- 图片采集并发可配置（4/6/8/10/12/16/20/无限）
- 支持导出采集结果为 `.json`

## 目录结构

```text
web to figma/
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

## 本地安装（开发者模式）

1. 打开 Chrome 扩展页：`chrome://extensions/`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本目录：`web to figma`

## 使用说明

1. 打开任意网页
2. 点击扩展图标，或使用页面工具栏
3. 按需开启“跨域图片代理模式”
4. 点击“开始采集”
5. 采集完成后下载 `figma-capture-*.json`

## 跨域图片代理说明

- 开启后由扩展后台代理拉取图片，可减少丢图，但采集速度会变慢。
- 可通过“图片采集并发”控制代理并发数：
  - 并发越高：速度更快，但失败风险可能增加
  - 并发越低：更稳定，但速度更慢

## 打包发布

在项目根目录执行：

```bash
zip -r web-to-figma-extension.zip "web to figma" -x "*.DS_Store"
```

## 备注

- `capture.js` 为采集核心脚本，建议保持现有构建产物形态。
- 如需代码混淆，建议仅对发布副本处理，不要覆盖源码。
