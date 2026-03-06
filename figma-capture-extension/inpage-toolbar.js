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
        border-radius: 12px;
        border: 1px solid #d0d7de;
        background: #ffffff;
        box-shadow: 0 8px 28px rgba(15, 23, 42, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111827;
      }
      #${ROOT_ID} * { box-sizing: border-box; }
      #${ROOT_ID} .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid #e5e7eb;
      }
      #${ROOT_ID} .title { font-size: 13px; font-weight: 600; }
      #${ROOT_ID} .close {
        border: 0;
        background: transparent;
        cursor: pointer;
        color: #6b7280;
        font-size: 18px;
        line-height: 1;
      }
      #${ROOT_ID} .body { padding: 12px; display: grid; gap: 10px; }
      #${ROOT_ID} .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
      }
      #${ROOT_ID} select {
        min-width: 88px;
        padding: 4px 6px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
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
      }
      #${ROOT_ID} .capture:disabled { opacity: 0.65; cursor: default; }
      #${ROOT_ID} .status { min-height: 16px; margin: 0; font-size: 12px; color: #374151; }
      #${ROOT_ID} .hidden { display: none !important; }
    `;
    return style;
  }

  function createToolbar() {
    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.setAttribute("data-figma-capture-ignore", "1");
    root.innerHTML = `
      <div class="bar" data-figma-capture-ignore="1">
        <div class="title" data-figma-capture-ignore="1">Web to Figma</div>
        <button class="close" type="button" title="关闭" data-figma-capture-ignore="1">×</button>
      </div>
      <div class="body" data-figma-capture-ignore="1">
        <label class="row" data-figma-capture-ignore="1">
          <span data-figma-capture-ignore="1">跨域图片代理模式</span>
          <input id="figmaProxyToggle" type="checkbox" data-figma-capture-ignore="1" />
        </label>
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
        <p class="hint" data-figma-capture-ignore="1">开启后由扩展后台代理拉取跨域图片，减少丢图。</p>
        <div class="actions" data-figma-capture-ignore="1">
          <button class="capture" id="figmaCaptureBtn" type="button" data-figma-capture-ignore="1">开始采集</button>
          <p class="status" id="figmaCaptureStatus" aria-live="polite" data-figma-capture-ignore="1"></p>
        </div>
      </div>
    `;
    return root;
  }

  function setStatus(node, text) {
    node.textContent = text || "";
  }

  function setBusy(button, busy) {
    button.disabled = busy;
    button.textContent = busy ? "采集中..." : "开始采集";
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
  const status = root.querySelector("#figmaCaptureStatus");

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
    chrome.storage.local.set({ [STORAGE_PROXY_KEY]: toggle.checked }, () => {
      setStatus(status, toggle.checked ? "已开启代理模式" : "已关闭代理模式");
    });
  });

  concurrency.addEventListener("change", () => {
    const value = normalize(concurrency.value);
    concurrency.value = value;
    chrome.storage.local.set({ [STORAGE_CONCURRENCY_KEY]: value }, () => {
      setStatus(status, `并发已设为：${value === "infinite" ? "无限" : value}`);
    });
  });

  captureBtn.addEventListener("click", () => {
    // Remove immediately so toolbar is never captured into result.
    removeExisting();

    chrome.runtime.sendMessage({ type: "FIGMA_CAPTURE_START" }, (res) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error("Capture failed:", err.message);
        return;
      }
      if (!res || !res.ok) {
        console.error("Capture failed:", (res && res.error) || "未知错误");
        return;
      }
    });
  });
})();
