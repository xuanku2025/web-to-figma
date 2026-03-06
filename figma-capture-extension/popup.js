const STORAGE_KEY = "enableAssetProxyFetch";

const toggle = document.getElementById("assetProxyToggle");
const captureBtn = document.getElementById("captureBtn");
const status = document.getElementById("status");

function setStatus(text) {
  status.textContent = text || "";
}

function setBusy(busy) {
  captureBtn.disabled = busy;
  captureBtn.textContent = busy ? "采集中..." : "开始采集";
}

chrome.storage.local.get({ [STORAGE_KEY]: false }, (res) => {
  toggle.checked = Boolean(res[STORAGE_KEY]);
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked }, () => {
    setStatus(toggle.checked ? "已开启跨域图片代理模式" : "已关闭跨域图片代理模式");
  });
});

captureBtn.addEventListener("click", () => {
  setBusy(true);
  setStatus("");
  chrome.runtime.sendMessage({ type: "FIGMA_CAPTURE_START" }, (res) => {
    setBusy(false);
    const err = chrome.runtime.lastError;
    if (err) {
      setStatus(`采集失败：${err.message}`);
      return;
    }
    if (!res || !res.ok) {
      setStatus(`采集失败：${(res && res.error) || "未知错误"}`);
      return;
    }
    setStatus("已触发采集，请查看下载文件。");
    setTimeout(() => window.close(), 600);
  });
});
