'use strict';
/* Browser printing (cup stickers, menu card, and the bill fallback) through an off-screen iframe. */
const Print = (() => {
  const e = (s) => U.esc(s);

  const BASE_CSS = `
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Arial,"Segoe UI","Nirmala UI",sans-serif}
    img{display:block}
  `;

  function stickersHTML(order, onlyLineIndex = null) {
    const st = Store.settings;
    const W = Number(st.stickerW) || 50;
    const H = Number(st.stickerH) || 30;
    const scale = Math.min(W / 50, H / 30);
    const fs = (px) => `${(px * Math.max(0.75, Math.min(1.6, scale))).toFixed(1)}px`;
    const labels = [];
    const total = order.cups;
    let k = 0;
    order.lines.forEach((l, idx) => {
      for (let i = 0; i < l.qty; i++) {
        k++;
        if (onlyLineIndex !== null && idx !== onlyLineIndex) continue;
        const opts = [l.sizeName, l.sugar ? `Sugar ${l.sugar}` : '', l.ice].filter(Boolean).join(' · ');
        const tops = (l.toppings || []).map((t) => t.name).join(', ');
        labels.push(`<div class="lb">
          <div class="top"><span class="no">#${order.no}</span><span>${k}/${total} · ${U.fmtTime(order.at)}</span></div>
          <div class="nm">${e(l.name)}</div>
          <div class="op">${e(opts)}</div>
          ${tops ? `<div class="op b">+ ${e(tops)}</div>` : ''}
          ${l.note ? `<div class="op">✎ ${e(l.note)}</div>` : ''}
          <div class="ft"><span class="b">${e(order.customerName || order.orderType)}</span>${st.stickerShowShop ? `<span>${e(st.shopName)}</span>` : ''}</div>
        </div>`);
      }
    });
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      @page{size:${W}mm ${H}mm;margin:0}
      .lb{width:${W}mm;height:${H}mm;padding:1.6mm 2mm;overflow:hidden;display:flex;flex-direction:column;page-break-after:always;break-after:page;font-size:${fs(10)};line-height:1.2}
      .lb:last-child{page-break-after:auto;break-after:auto}
      .top{display:flex;justify-content:space-between;align-items:baseline;font-size:${fs(9)}}
      .no{font-size:${fs(15)};font-weight:800}
      .nm{font-weight:800;font-size:${fs(12)};margin-top:.4mm;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .op{font-size:${fs(9.5)};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b{font-weight:700}
      .ft{margin-top:auto;display:flex;justify-content:space-between;gap:2mm;font-size:${fs(8.5)};border-top:1px solid #000;padding-top:.4mm}
      .ft span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    </style></head><body>${labels.join('')}</body></html>`;
  }

  let busy = Promise.resolve();

  function run(html, { paperWidthMm = null, autoHeight = false } = {}) {
    const job = busy.then(() => new Promise((resolve) => {
      const f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true');
      // Off-screen but NOT invisible: some printers get a blank page from hidden frames.
      f.style.cssText = `position:fixed;left:-10000px;top:0;border:0;pointer-events:none;height:200px;width:${paperWidthMm ? paperWidthMm + 'mm' : '210mm'}`;
      document.body.append(f);
      const d = f.contentDocument;
      d.open(); d.write(html); d.close();
      const imgs = Array.from(d.images);
      const loaded = Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));
      const timeout = new Promise((r) => setTimeout(r, 2000));
      Promise.race([loaded, timeout]).then(() => {
        if (autoHeight && paperWidthMm) {
          // Page exactly as tall as the bill (measured), so the printer stops at the end.
          const box = d.getElementById('r') || d.body;
          const px = box.getBoundingClientRect().height;
          const mm = Math.ceil(px * 25.4 / 96) + 2;
          const style = d.createElement('style');
          style.textContent = `@page{size:${paperWidthMm}mm ${mm}mm;margin:0}`;
          d.head.append(style);
        }
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          setTimeout(() => { f.remove(); resolve(); }, 300);
        };
        f.contentWindow.addEventListener('afterprint', finish);
        setTimeout(finish, 60000);
        f.contentWindow.focus();
        f.contentWindow.print();
      });
    }));
    busy = job.catch(() => {});
    return job;
  }

  function menuHTML() {
    const st = Store.settings;
    const sizes = st.sizes || [];
    const cats = Store.S.categories.map((c) => ({ c, items: Store.S.items.filter((i) => i.catId === c.id && i.active) })).filter((x) => x.items.length);
    const tops = Store.S.toppings.filter((t) => t.active);
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      @page{size:A4;margin:12mm}
      body{color:#2F3E44;font-family:"Segoe UI","Nirmala UI",Arial,sans-serif}
      .hd{text-align:center;margin-bottom:6mm}.hd img{width:42mm;margin:0 auto}
      .tg{color:#6B7F72;font-size:13px;margin-top:2mm}
      .cols{columns:2;column-gap:10mm}
      .cat{break-inside:avoid;margin-bottom:6mm}
      .cat h2{font-size:17px;color:#4E7F87;border-bottom:2px solid #A8C3C9;padding-bottom:1mm;margin-bottom:2mm;letter-spacing:.5px;text-transform:uppercase}
      .it{display:flex;justify-content:space-between;gap:4mm;padding:1.4mm 0;border-bottom:1px dotted #cfdfe3}
      .nm{font-weight:700;font-size:13.5px}.ds{font-size:11px;color:#6B7F72}
      .pr{display:flex;gap:4mm;white-space:nowrap;font-weight:700;font-size:13px;text-align:center}.pr span{min-width:11mm}.pr small{display:block;font-weight:400;color:#6B7F72;font-size:10px}
      .tops{break-inside:avoid;margin-top:2mm;background:#EFF9FC;border-radius:3mm;padding:3mm 4mm;font-size:12.5px}
      .tops b{color:#4E7F87}.ft{text-align:center;color:#6B7F72;font-size:11px;margin-top:6mm}
    </style></head><body>
      <div class="hd"><img src="assets/logo.png" alt=""><div class="tg">${e(st.tagline || '')}</div></div>
      <div class="cols">${cats.map(({ c, items }) => `<div class="cat"><h2>${e(c.name)}</h2>${items.map((i) => `
        <div class="it"><div><div class="nm">${e(i.name)}</div><div class="ds">${e(i.desc || '')}</div></div>
        <div class="pr">${i.sizes.map((s) => `<span>${U.money(s.price)}<small>${e(sizes.find((z) => z.id === s.sizeId)?.name || s.sizeId)}</small></span>`).join('')}</div></div>`).join('')}
      </div>`).join('')}
      ${tops.length ? `<div class="tops"><b>ADD TOPPINGS</b><br>${tops.map((t) => `${e(t.name)} ${U.money(t.price)}`).join(' · ')}</div>` : ''}
      ${st.sugarLevels?.length ? `<div class="tops"><b>MAKE IT YOURS</b><br>Sugar: ${st.sugarLevels.map(e).join(' / ')}<br>Ice: ${st.iceLevels.map(e).join(' / ')}</div>` : ''}
      </div>
      <div class="ft">${e(st.address || '')} ${st.phone ? '· ' + e(st.phone) : ''} ${st.social ? '· ' + e(st.social) : ''}</div>
    </body></html>`;
  }

  return {
    run, stickersHTML, menuHTML,
    receiptHTML: (order, opts) => Receipt.html(Receipt.receiptOps(order, opts)),
    menu() { return run(menuHTML().replace('<head>', `<head><base href="${location.href.replace(/[^/]*$/, '')}">`)); },
    receipt: (order, opts) => Receipt.receipt(order, opts),
    kitchen: (order, opts) => Receipt.kitchen(order, opts),
    stickers(order, onlyLineIndex = null) {
      return run(stickersHTML(order, onlyLineIndex), { paperWidthMm: Number(Store.settings.stickerW) || 50 });
    },
    dayReport: (r) => Receipt.dayReport(r),
  };
})();
