(async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!window.figma?.captureForDesign) {
    throw new Error(
      "window.figma.captureForDesign is not available. capture.js may not have loaded."
    );
  }

  const scrollStep = Math.max(400, Math.floor(window.innerHeight * 0.8));
  for (let y = 0; y < document.body.scrollHeight; y += scrollStep) {
    window.scrollTo(0, y);
    await delay(400);
  }

  await delay(1500);
  window.scrollTo(0, 0);

  const images = Array.from(document.images || []);
  await Promise.allSettled(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 10000);
          })
    )
  );

  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, delay(3000)]);
  }

  await delay(1000);

  // ── Tooltip 采集：模拟 hover 触发框架 tooltip 并克隆采集 ────────────
  // Ant Design 等框架的 tooltip 在 hover 前不存在于 DOM 中，
  // 需要模拟 hover 事件让 React 渲染 tooltip，然后克隆保留。

  const TOOLTIP_MAX_TRIGGERS = 80;
  const TOOLTIP_HOVER_DELAY = 400;
  const tooltipClones = [];
  const seenTooltipContents = new Set();
  const forcedVisibleEls = [];

  // ─ Step 1: 寻找 tooltip 触发元素 ─────────────────────────────────
  const tooltipTriggers = new Set();

  // 1a. CSS 选择器匹配常见 Ant Design tooltip 触发图标
  try {
    document.querySelectorAll([
      '.anticon-question-circle',
      '.anticon-info-circle',
      '.anticon-exclamation-circle',
      '.ant-form-item-tooltip',
      '.ant-tooltip-open',
    ].join(',')).forEach((el) => {
      if (tooltipTriggers.size < TOOLTIP_MAX_TRIGGERS) tooltipTriggers.add(el);
    });
  } catch (e) { /* selector may not match anything */ }

  // 1b. 通过 React Fiber 检测被 <Tooltip>/<Popover> 包裹的元素
  try {
    let fiberKey = null;
    const probeEls = document.querySelectorAll('[class*="ant"], [class*="zstack"], [class*="zsphere"]');
    for (const probe of probeEls) {
      fiberKey = Object.keys(probe).find((k) =>
        k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
      );
      if (fiberKey) break;
    }
    if (!fiberKey) {
      // fallback: try body's first child
      const fallback = document.body.querySelector('*');
      if (fallback) {
        fiberKey = Object.keys(fallback).find((k) =>
          k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
        );
      }
    }

    if (fiberKey) {
      // 扫描可能有 tooltip 的交互元素
      const scanSelectors = [
        '.anticon',
        '[class*="icon"]',
        '.ant-form-item-label span',
        '.ant-form-item-label svg',
        '[role="img"]',
        'button .anticon',
        'a .anticon',
      ].join(',');

      const scanEls = document.querySelectorAll(scanSelectors);
      for (const el of scanEls) {
        if (tooltipTriggers.size >= TOOLTIP_MAX_TRIGGERS) break;
        const fiber = el[fiberKey];
        if (!fiber) continue;

        // 向上遍历 fiber 树，查找 Tooltip/Popover 祖先
        let current = fiber.return;
        let depth = 0;
        while (current && depth < 15) {
          const type = current.type;
          let name = '';
          if (typeof type === 'function') {
            name = type.displayName || type.name || '';
          } else if (typeof type === 'object' && type !== null) {
            name = type.displayName || type.name ||
              type.render?.displayName || type.render?.name || '';
          }
          if (/^(Tooltip|InternalTooltip|Popover|InternalPopover)$/i.test(name)) {
            tooltipTriggers.add(el);
            break;
          }
          // rc-trigger based tooltip
          if (/trigger/i.test(name) && current.memoizedProps?.popup) {
            tooltipTriggers.add(el);
            break;
          }
          current = current.return;
          depth++;
        }
      }
    }
  } catch (e) { /* fiber detection may fail, that's ok */ }

  // ─ Step 2: 逐个模拟 hover，克隆渲染出的 tooltip ──────────────────
  for (const trigger of tooltipTriggers) {
    const rect = trigger.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 模拟完整的 hover 事件序列（兼容 React 16~18+ / pointer events）
    trigger.dispatchEvent(new PointerEvent('pointerenter', {
      bubbles: false, cancelable: true, clientX: cx, clientY: cy, view: window, composed: true,
    }));
    trigger.dispatchEvent(new MouseEvent('mouseover', {
      bubbles: true, cancelable: true, clientX: cx, clientY: cy, view: window, composed: true,
    }));
    trigger.dispatchEvent(new MouseEvent('mouseenter', {
      bubbles: false, cancelable: true, clientX: cx, clientY: cy, view: window, composed: true,
    }));

    await delay(TOOLTIP_HOVER_DELAY);

    // 查找当前可见的 tooltip 节点
    document.querySelectorAll(
      '.ant-tooltip, .ant-popover, .el-tooltip__popper, [role="tooltip"]'
    ).forEach((tooltip) => {
      if (tooltip.hasAttribute('data-figma-tooltip-clone')) return;
      const cs = window.getComputedStyle(tooltip);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (tooltip.classList.contains('ant-tooltip-hidden')) return;
      if (parseFloat(cs.opacity) < 0.1) return;

      const content = tooltip.textContent?.trim();
      if (!content || content.length < 2 || seenTooltipContents.has(content)) return;
      seenTooltipContents.add(content);

      const tr = tooltip.getBoundingClientRect();
      if (tr.width === 0 || tr.height === 0) return;

      // 克隆 tooltip 并锁定位置
      const clone = tooltip.cloneNode(true);
      clone.setAttribute('data-figma-tooltip-clone', '1');
      Object.assign(clone.style, {
        position: 'absolute',
        top: `${window.scrollY + tr.top}px`,
        left: `${window.scrollX + tr.left}px`,
        width: `${tr.width}px`,
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'none',
        zIndex: '2147483646',
        transform: 'none',
        animation: 'none',
        transition: 'none',
      });
      clone.classList.remove('ant-tooltip-hidden', 'ant-popover-hidden');
      tooltipClones.push(clone);
    });

    // 模拟 hover 离开
    trigger.dispatchEvent(new PointerEvent('pointerleave', {
      bubbles: false, cancelable: true, view: window, composed: true,
    }));
    trigger.dispatchEvent(new MouseEvent('mouseleave', {
      bubbles: false, cancelable: true, view: window, composed: true,
    }));
    trigger.dispatchEvent(new MouseEvent('mouseout', {
      bubbles: true, cancelable: true, view: window, composed: true,
    }));

    await delay(150);
  }

  // ─ Step 3: 强制显示已在 DOM 中但隐藏的 tooltip ───────────────────
  ['.ant-tooltip', '.ant-popover', '.el-tooltip__popper', '.el-popover', '.tippy-box'].forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.hasAttribute('data-figma-tooltip-clone')) return;
      const cs = window.getComputedStyle(el);
      const isHidden =
        cs.display === 'none' ||
        cs.visibility === 'hidden' ||
        cs.opacity === '0' ||
        el.classList.contains('ant-tooltip-hidden');
      if (isHidden) {
        const content = el.textContent?.trim();
        if (content && content.length >= 2 && !seenTooltipContents.has(content)) {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.classList.remove('ant-tooltip-hidden');
          forcedVisibleEls.push(el);
          seenTooltipContents.add(content);
        }
      }
    });
  });

  // ─ Step 4: 将克隆的 tooltip 挂载到页面 ───────────────────────────
  tooltipClones.forEach((clone) => document.body.appendChild(clone));

  await delay(300);
  // ── Tooltip 采集结束 ─────────────────────────────────────────────

  let result;
  try {
    result = await window.figma.captureForDesign({ selector: "body" });
  } finally {
    // 清理克隆的 tooltip
    tooltipClones.forEach((el) => el.remove());
    // 恢复被强制显示的框架 tooltip
    forcedVisibleEls.forEach((el) => {
      el.style.removeProperty("display");
      el.style.removeProperty("visibility");
      el.style.removeProperty("opacity");
    });
  }

  return result;
})();
