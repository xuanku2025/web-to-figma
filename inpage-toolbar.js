(() => {
  const ROOT_ID = "__figma_capture_toolbar__";
  const STYLE_ID = "__figma_capture_toolbar_style__";
  const STORAGE_PROXY_KEY = "enableAssetProxyFetch";
  const STORAGE_CONCURRENCY_KEY = "proxyFetchConcurrency";
  const DEFAULT_CONCURRENCY = "8";
  const ALLOWED = new Set(["4", "6", "8", "10", "12", "16", "20", "infinite"]);

  function normalize(value) {
    const str = String(value ?? "");
    return ALLOWED.has(str) ? str : DEFAULT_CONCURRENCY;
  }

  function removeExisting() {
    const oldRoot = document.getElementById(ROOT_ID);
    if (oldRoot) oldRoot.remove();
    const oldStyle = document.getElementById(STYLE_ID);
    if (oldStyle) oldStyle.remove();
  }

  function createStyle() {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        width: 320px;
        z-index: 2147483647;
        border-radius: 14px;
        border: 1px solid #d9dee5;
        background: #ffffff;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111827;
        overflow: hidden;
      }
      #${ROOT_ID} * { box-sizing: border-box; }
      #${ROOT_ID} .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
      }
      #${ROOT_ID} .title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      #${ROOT_ID} .title-logo {
        width: 16px;
        height: 16px;
        display: block;
        flex-shrink: 0;
      }
      #${ROOT_ID} .close {
        border: 0;
        background: transparent;
        cursor: pointer;
        color: #6b7280;
        font-size: 20px;
        line-height: 1;
        border-radius: 6px;
        transition: background 0.15s ease, color 0.15s ease;
      }
      #${ROOT_ID} .close:hover { background: #f3f4f6; color: #374151; }
      #${ROOT_ID} .body { padding: 12px; display: grid; gap: 10px; }
      #${ROOT_ID} .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
      }
      #${ROOT_ID} .switch {
        position: relative;
        display: inline-flex;
        width: 40px;
        height: 22px;
        flex-shrink: 0;
        cursor: pointer;
      }
      #${ROOT_ID} .switch input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      #${ROOT_ID} .switch-slider {
        width: 100%;
        height: 100%;
        border-radius: 999px;
        background: #d1d5db;
        transition: background 0.18s ease;
        position: relative;
      }
      #${ROOT_ID} .switch-slider::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        transition: transform 0.18s ease;
      }
      #${ROOT_ID} .switch input:checked + .switch-slider { background: #111827; }
      #${ROOT_ID} .switch input:checked + .switch-slider::after { transform: translateX(18px); }
      #${ROOT_ID} select {
        min-width: 88px;
        padding: 4px 24px 4px 8px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 8px center;
        -webkit-appearance: none;
        appearance: none;
        font-size: 13px;
        font-weight: 400;
        color: #111827;
        cursor: pointer;
      }
      #${ROOT_ID} .hint { font-size: 12px; color: #6b7280; margin: 0; }
      #${ROOT_ID} .actions { display: grid; gap: 8px; }
      #${ROOT_ID} .capture {
        width: 100%;
        border: 0;
        border-radius: 8px;
        background: #111827;
        color: #fff;
        font-size: 13px;
        padding: 9px 12px;
        cursor: pointer;
        transition: transform 0.08s ease, box-shadow 0.2s ease, background 0.15s ease;
      }
      #${ROOT_ID} .capture:hover { background: #1f2937; box-shadow: 0 6px 16px rgba(17, 24, 39, 0.2); }
      #${ROOT_ID} .capture:active { transform: translateY(1px); }
      #${ROOT_ID} .capture:disabled { opacity: 0.65; cursor: default; }
      #${ROOT_ID} .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 12px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }
      #${ROOT_ID} .credit {
        font-size: 12px;
        color: #6b7280;
        white-space: nowrap;
      }
      #${ROOT_ID} .socials {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      #${ROOT_ID} .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: #111827;
        transition: transform 0.08s ease, opacity 0.15s ease;
      }
      #${ROOT_ID} .social-link:hover { opacity: 0.75; }
      #${ROOT_ID} .social-link:active { transform: translateY(1px); }
      #${ROOT_ID} .social-link svg {
        width: 18px;
        height: 18px;
        display: block;
      }
      #${ROOT_ID} .hidden { display: none !important; }

      #${ROOT_ID} .result-bar {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: inline-flex;
        align-items: center;
        width: fit-content;
        gap: 2px;
        padding: 6px;
        border-radius: 12px;
        background: #1f2937;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #${ROOT_ID} .result-bar button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 0;
        background: transparent;
        color: #e5e7eb;
        font-size: 13px;
        padding: 8px 14px;
        border-radius: 8px;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s ease, color 0.15s ease;
      }
      #${ROOT_ID} .result-bar button:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
      #${ROOT_ID} .result-bar button:active { transform: translateY(1px); }
      #${ROOT_ID} .result-bar button svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      #${ROOT_ID} .result-bar .divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.15);
        margin: 0 2px;
        flex-shrink: 0;
      }
      #${ROOT_ID} .result-bar .close-result {
        padding: 8px 10px;
      }
    `;
    return style;
  }

  function createToolbar() {
    const logoUrl =
      typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL
        ? chrome.runtime.getURL("logo/icon16.png")
        : "";

    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.setAttribute("data-figma-capture-ignore", "1");
    root.innerHTML = `
      <div class="bar" data-figma-capture-ignore="1">
        <div class="title" data-figma-capture-ignore="1">
          <img class="title-logo" src="${logoUrl}" alt="" data-figma-capture-ignore="1" />
          <span data-figma-capture-ignore="1">Web to Figma</span>
        </div>
        <button class="close" type="button" title="关闭" data-figma-capture-ignore="1">×</button>
      </div>
      <div class="body" data-figma-capture-ignore="1">
        <div class="row" data-figma-capture-ignore="1">
          <span data-figma-capture-ignore="1">跨域图片代理模式</span>
          <label class="switch" data-figma-capture-ignore="1">
            <input id="figmaProxyToggle" type="checkbox" data-figma-capture-ignore="1" />
            <span class="switch-slider" data-figma-capture-ignore="1"></span>
          </label>
        </div>
        <label class="row" id="figmaConcurrencyRow" data-figma-capture-ignore="1">
          <span data-figma-capture-ignore="1">图片采集并发</span>
          <select id="figmaProxyConcurrency" data-figma-capture-ignore="1">
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="20">20</option>
            <option value="infinite">无限</option>
          </select>
        </label>
        <p class="hint" data-figma-capture-ignore="1">开启后由插件拉取图片，可减少丢图，但采集会变慢。</p>
        <div class="actions" data-figma-capture-ignore="1">
          <button class="capture" id="figmaCaptureBtn" type="button" data-figma-capture-ignore="1">开始采集</button>
        </div>
      </div>
      <div class="footer" data-figma-capture-ignore="1">
        <a class="credit" href="https://www.zstack.io/" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:#6b7280;cursor:pointer;" data-figma-capture-ignore="1">By ZStack</a>
        <span style="font-size:12px;color:#6b7280;" data-figma-capture-ignore="1">快捷键：<kbd id="figmaShortcutKeyFooter" style="display:inline-block;padding:1px 5px;border:1px solid #d1d5db;border-radius:4px;background:#f3f4f6;color:#374151;font-size:11px;"></kbd></span>
      </div>
    `;
    return root;
  }

  function syncProxyDependentUI(toggleNode, concurrencyRow) {
    concurrencyRow.classList.toggle("hidden", !toggleNode.checked);
  }

  removeExisting();
  document.documentElement.appendChild(createStyle());
  const root = createToolbar();
  document.documentElement.appendChild(root);

  const closeBtn = root.querySelector(".close");
  const toggle = root.querySelector("#figmaProxyToggle");
  const concurrency = root.querySelector("#figmaProxyConcurrency");
  const concurrencyRow = root.querySelector("#figmaConcurrencyRow");
  const captureBtn = root.querySelector("#figmaCaptureBtn");

  closeBtn.addEventListener("click", () => {
    removeExisting();
  });

  chrome.storage.local.get(
    {
      [STORAGE_PROXY_KEY]: false,
      [STORAGE_CONCURRENCY_KEY]: DEFAULT_CONCURRENCY,
    },
    (res) => {
      toggle.checked = Boolean(res[STORAGE_PROXY_KEY]);
      concurrency.value = normalize(res[STORAGE_CONCURRENCY_KEY]);
      syncProxyDependentUI(toggle, concurrencyRow);
    }
  );

  toggle.addEventListener("change", () => {
    syncProxyDependentUI(toggle, concurrencyRow);
    chrome.storage.local.set({ [STORAGE_PROXY_KEY]: toggle.checked });
  });

  concurrency.addEventListener("change", () => {
    const value = normalize(concurrency.value);
    concurrency.value = value;
    chrome.storage.local.set({ [STORAGE_CONCURRENCY_KEY]: value });
  });

  function cleanupTooltips() {
    // 1. 真实滚动抖动 — rc-trigger 监听原生 scroll 事件来关闭 tooltip
    const sy = window.scrollY;
    window.scrollTo(0, sy + 1);
    requestAnimationFrame(() => window.scrollTo(0, sy));
    // 2. 立即移除所有可见的 tooltip DOM 节点
    document.querySelectorAll(
      '.ant-tooltip, .ant-popover, [role="tooltip"], .ant-tooltip-placement-top, .ant-tooltip-placement-bottom, .ant-tooltip-placement-left, .ant-tooltip-placement-right'
    ).forEach((el) => {
      if (el.closest('#' + ROOT_ID)) return;
      el.remove();
    });
    // 3. 延迟再清一次，兑底处理 React 重新渲染的情况
    setTimeout(() => {
      document.querySelectorAll(
        '.ant-tooltip, .ant-popover, [role="tooltip"]'
      ).forEach((el) => {
        if (el.closest('#' + ROOT_ID)) return;
        el.remove();
      });
    }, 500);
    setTimeout(() => {
      document.querySelectorAll(
        '.ant-tooltip, .ant-popover, [role="tooltip"]'
      ).forEach((el) => {
        if (el.closest('#' + ROOT_ID)) return;
        el.remove();
      });
    }, 1500);
  }

  captureBtn.addEventListener("click", () => {
    captureBtn.disabled = true;
    captureBtn.textContent = "采集中…";

    chrome.runtime.sendMessage({ type: "FIGMA_CAPTURE_WITH_DATA" }, (res) => {
      const err = chrome.runtime.lastError;
      captureBtn.disabled = false;
      captureBtn.textContent = "开始采集";

      if (err) {
        console.error("Capture failed:", err.message);
        return;
      }
      if (!res || !res.ok) {
        console.error("Capture failed:", (res && res.error) || "未知错误");
        return;
      }
      // 采集完成后立即清理 tooltip
      cleanupTooltips();
      showResultBar(res.json);
    });
  });

  function showResultBar(json) {
    const old = document.getElementById("__figma_result_bar__");
    if (old) old.remove();

    const bar = document.createElement("div");
    bar.id = "__figma_result_bar__";
    bar.className = "result-bar";
    bar.setAttribute("data-figma-capture-ignore", "1");
    bar.innerHTML = `
      <button class="copy-btn" type="button" data-figma-capture-ignore="1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        复制到剪贴板
      </button>
      <span class="divider"></span>
      <button class="close-result" type="button" title="关闭" data-figma-capture-ignore="1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    bar.querySelector(".copy-btn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(json);
        cleanupTooltips();
        const btn = bar.querySelector(".copy-btn");
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制`;
        setTimeout(() => { bar.remove(); }, 1500);
      } catch (e) {
        console.error("Copy failed:", e);
      }
    });

    bar.querySelector(".close-result").addEventListener("click", () => {
      cleanupTooltips();
      bar.remove();
    });

    root.appendChild(bar);
  }

  // 根据操作系统显示对应快捷键
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
    navigator.userAgent.indexOf("Mac") >= 0;
  const shortcutText = isMac ? "⌃+Shift+C" : "Alt+Shift+C";
  const shortcutKeyFooter = root.querySelector("#figmaShortcutKeyFooter");
  if (shortcutKeyFooter) shortcutKeyFooter.textContent = shortcutText;
})();
