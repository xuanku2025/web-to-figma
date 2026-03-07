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
        padding: 4px 6px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
        color: #111827;
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
        <label class="row" data-figma-capture-ignore="1">
          <span data-figma-capture-ignore="1">跨域图片代理模式</span>
          <span class="switch" data-figma-capture-ignore="1">
            <input id="figmaProxyToggle" type="checkbox" data-figma-capture-ignore="1" />
            <span class="switch-slider" data-figma-capture-ignore="1"></span>
          </span>
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
        <p class="hint" data-figma-capture-ignore="1">开启后由插件拉取图片，可减少丢图，但采集会变慢。</p>
        <div class="actions" data-figma-capture-ignore="1">
          <button class="capture" id="figmaCaptureBtn" type="button" data-figma-capture-ignore="1">开始采集</button>
        </div>
      </div>
      <div class="footer" data-figma-capture-ignore="1">
        <span class="credit" data-figma-capture-ignore="1">by 派大鑫</span>
        <div class="socials" data-figma-capture-ignore="1">
          <a class="social-link" href="https://www.xiaohongshu.com/user/profile/5a2e96aab1da1465364b727b" target="_blank" rel="noopener noreferrer" aria-label="小红书" title="小红书" data-figma-capture-ignore="1">
            <svg viewBox="0 0 1024 1024" aria-hidden="true" data-figma-capture-ignore="1">
              <path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FD2442"></path>
              <path d="M428.8 767.6928c4.4032-9.2672 8.0896-17.2544 12.032-25.1392a505.0368 505.0368 0 0 0 24.4224-49.8688 30.72 30.72 0 0 1 36.608-22.016c23.0912 1.5872 46.336 0.3584 70.4 0.3584v-289.9456c-16.2304 0-32.2048-0.5632-48.128 0-11.0592 0.5632-14.9504-2.9184-14.6432-14.3872 0.768-27.4432 0-54.9888 0-83.712h225.28v66.56c0 31.3344 0 31.3344-31.488 31.3344h-31.6416v289.9456h68.352c27.5456 0 27.5456 0 27.5456 27.904v58.4704c0 8.0896-2.0992 12.1856-11.1616 12.1856q-160.4096-0.3072-320.8192-0.256a51.2 51.2 0 0 1-6.7584-1.4336z" fill="#FFFFFF"></path>
              <path d="M471.4496 557.6704c-14.08 28.0064-26.4704 52.992-39.424 77.6192a12.3904 12.3904 0 0 1-9.472 4.5568c-31.3344 0-62.8224 1.1776-94.0544-1.0752s-43.776-21.6064-31.3344-51.2c14.2336-34.1504 31.2832-67.1232 47.0528-100.608 0.9728-2.0992 1.7408-4.2496 3.6352-8.96-12.6464 0-23.7568 0.3072-34.816 0a133.888 133.888 0 0 1-26.88-2.3552 30.72 30.72 0 0 1-24.0128-44.2368c18.9952-43.9808 40.2432-87.04 60.7744-130.304 6.7072-14.1824 13.6704-28.2112 21.1968-41.984 1.9456-3.584 6.4-8.1408 9.8304-8.2432 29.3376-0.6656 58.6752-0.3584 90.6752-0.3584-2.7648 6.8608-4.352 11.5712-6.5024 15.9744q-26.9312 54.272-54.016 108.4416c-3.6352 7.3216-8.0384 14.9504 5.5808 20.48 3.6352-18.7904 18.2784-15.36 31.1296-15.36h74.0352c-3.1232 7.1168-5.12 12.0832-7.424 16.8448-22.8352 46.08-46.08 91.8016-68.608 137.7792-9.2672 18.7392-6.144 23.296 15.36 23.5008 11.264-0.4096 22.4768-0.512 37.2736-0.512z" fill="#FFFFFF"></path>
              <path d="M431.1552 671.0784c-17.3568 33.5872-32.8704 63.7952-48.7424 93.7984a10.5984 10.5984 0 0 1-8.0384 4.352q-63.8976-0.768-128-2.304a87.7568 87.7568 0 0 1-17.1008-4.352l23.8592-46.4896c7.7824-15.36 15.36-30.72 23.7056-45.312a14.2336 14.2336 0 0 1 10.24-6.5024c39.1168 1.8944 78.2336 4.5056 117.3504 6.8096 7.8848 0.3584 15.3088 0 26.7264 0z" fill="#FFFFFF"></path>
            </svg>
          </a>
          <a class="social-link" href="https://x.com/xin_pai88825" target="_blank" rel="noopener noreferrer" aria-label="推特" title="推特" data-figma-capture-ignore="1">
            <svg viewBox="0 0 1024 1024" aria-hidden="true" data-figma-capture-ignore="1">
              <path d="M778.41 96h141.142L611.2 448.427 973.952 928H689.92L467.456 637.141 212.906 928H71.68l329.813-376.96L53.504 96h291.243l201.088 265.856z m-49.535 747.52h78.208L302.25 176.043h-83.926z" fill="#2c2c2c"></path>
            </svg>
          </a>
        </div>
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

  captureBtn.addEventListener("click", () => {
    removeExisting();

    chrome.runtime.sendMessage({ type: "FIGMA_CAPTURE_START" }, (res) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error("Capture failed:", err.message);
        return;
      }
      if (!res || !res.ok) {
        console.error("Capture failed:", (res && res.error) || "未知错误");
      }
    });
  });
})();
