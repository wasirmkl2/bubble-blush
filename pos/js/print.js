'use strict';
/* Receipt, cup sticker and day-report printing through a hidden iframe. */
const Print = (() => {
  const e = (s) => U.esc(s);
  const m = (n) => U.money(n);
  const nl2br = (s) => e(s).replace(/\n/g, '<br>');

  const BASE_CSS = `
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Arial,"Segoe UI","Nirmala UI",sans-serif}
    img{display:block}
  `;

  function receiptWidths() {
    const paper = Number(Store.settings.paperWidth) === 58 ? 58 : 80;
    return { paper, content: paper === 58 ? 48 : 72 };
  }

  function lineOptions(l) {
    const bits = [];
    if (l.sugar) bits.push(`Sugar ${l.sugar}`);
    if (l.ice) bits.push(l.ice);
    return bits.join(' · ');
  }

  function receiptHTML(order, { reprint = false } = {}) {
    const st = Store.settings;
    const { paper, content } = receiptWidths();
    const fs = Math.max(9, Math.min(16, Number(st.receiptFontPx) || 12));
    const logo = st.logoData || LOGO_PRINT;
    const rows = order.lines.map((l) => `
      <div class="li">
        <div class="row b"><span>${l.qty} × ${e(l.name)} (${e(l.sizeName)})</span><span>${m(l.basePrice * l.qty)}</span></div>
        ${(l.toppings || []).map((t) => `<div class="row sub"><span>+ ${e(t.name)}</span><span>${m(t.price * l.qty)}</span></div>`).join('')}
        ${lineOptions(l) ? `<div class="sub">${e(lineOptions(l))}</div>` : ''}
        ${l.note ? `<div class="sub">Note: ${e(l.note)}</div>` : ''}
      </div>`).join('');
    const disc = order.discount > 0
      ? `<div class="row"><span>Discount${order.discountInfo?.type === 'pct' ? ` (${order.discountInfo.value}%)` : ''}${order.discountInfo?.reason ? ' – ' + e(order.discountInfo.reason) : ''}</span><span>-${m(order.discount)}</span></div>` : '';
    const vat = order.vat > 0
      ? `<div class="row"><span>VAT ${order.vatPct}%${order.vatMode === 'inclusive' ? ' (included)' : ''}</span><span>${m(order.vat)}</span></div>` : '';
    const cash = order.payMethod === 'Cash'
      ? `<div class="row"><span>Cash received</span><span>${m(order.received)}</span></div><div class="row"><span>Change</span><span>${m(order.change)}</span></div>` : '';
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      body{width:${paper}mm;font-size:${fs}px;line-height:1.3}
      .r{width:${content}mm;margin:0 auto;padding:2mm 0 4mm}
      .c{text-align:center}.b{font-weight:700}
      .logo{width:${paper === 58 ? 30 : 38}mm;margin:0 auto 1.5mm}
      .hr{border-top:1px dashed #000;margin:1.5mm 0}
      .row{display:flex;justify-content:space-between;gap:2mm}
      .row span:last-child{white-space:nowrap}
      .li{margin:1mm 0}
      .sub{font-size:.88em;padding-left:3mm}
      .tot{font-size:1.45em;font-weight:800;margin:1mm 0}
      .no{font-size:1.9em;font-weight:800;letter-spacing:.5px}
      .tag{display:inline-block;border:1.5px solid #000;padding:0 2mm;font-weight:700;margin-top:1mm}
      .small{font-size:.85em}
    </style></head><body><div class="r">
      ${st.receiptLogo ? `<img class="logo" src="${logo}" alt="">` : `<div class="c b" style="font-size:1.6em">${e(st.shopName)}</div>`}
      ${st.tagline ? `<div class="c small">${e(st.tagline)}</div>` : ''}
      ${st.address ? `<div class="c small">${e(st.address)}</div>` : ''}
      ${st.phone ? `<div class="c small">${e(st.phone)}</div>` : ''}
      ${st.bin ? `<div class="c small">BIN: ${e(st.bin)}</div>` : ''}
      ${reprint ? '<div class="c"><span class="tag">REPRINT</span></div>' : ''}
      ${order.status === 'void' ? '<div class="c"><span class="tag">VOID – NOT PAID</span></div>' : ''}
      <div class="hr"></div>
      <div class="c">Order</div>
      <div class="c no">#${order.no}</div>
      <div class="c b">${e(order.orderType)}</div>
      <div class="row small"><span>${U.fmtDateTime(order.at)}</span><span>${order.cups} cup${order.cups === 1 ? '' : 's'}</span></div>
      ${order.customerName || order.customerPhone ? `<div class="small">Customer: ${e(order.customerName)} ${e(order.customerPhone)}</div>` : ''}
      <div class="hr"></div>
      ${rows}
      <div class="hr"></div>
      <div class="row"><span>Subtotal</span><span>${m(order.subtotal)}</span></div>
      ${disc}${vat}
      <div class="row tot"><span>TOTAL</span><span>${m(order.total)}</span></div>
      <div class="row"><span>Paid by</span><span>${e(order.payMethod)}</span></div>
      ${cash}
      ${order.note ? `<div class="hr"></div><div class="small">Note: ${e(order.note)}</div>` : ''}
      <div class="hr"></div>
      ${st.receiptFooter ? `<div class="c small">${nl2br(st.receiptFooter)}</div>` : ''}
      ${st.social ? `<div class="c small b" style="margin-top:1mm">${e(st.social)}</div>` : ''}
    </div></body></html>`;
  }

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

  function dayReportHTML(r) {
    const st = Store.settings;
    const { paper, content } = receiptWidths();
    const row = (a, b, cls = '') => `<div class="row ${cls}"><span>${a}</span><span>${b}</span></div>`;
    return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      body{width:${paper}mm;font-size:12px;line-height:1.35}
      .r{width:${content}mm;margin:0 auto;padding:2mm 0 4mm}
      .c{text-align:center}.b{font-weight:700}
      .hr{border-top:1px dashed #000;margin:1.5mm 0}
      .row{display:flex;justify-content:space-between;gap:2mm}
      .big{font-size:1.3em;font-weight:800}
      h3{font-size:1em;margin:1mm 0}
    </style></head><body><div class="r">
      <div class="c b" style="font-size:1.4em">${e(st.shopName)}</div>
      <div class="c b">${e(r.title)}</div>
      <div class="c">${e(r.range)}</div>
      <div class="c" style="font-size:.85em">Printed ${U.fmtDateTime(new Date().toISOString())}</div>
      <div class="hr"></div>
      ${row('Orders', r.orders)}${row('Cups sold', r.cups)}
      ${row('Gross sales', m(r.gross))}${row('Discounts', '-' + m(r.discount))}
      ${r.vat ? row('VAT', m(r.vat)) : ''}
      ${row('NET SALES', m(r.net), 'big')}
      ${r.voids ? row(`Voided (${r.voids})`, m(r.voidValue)) : ''}
      <div class="hr"></div><h3>Payments</h3>
      ${r.payments.map((p) => row(`${e(p.method)} (${p.count})`, m(p.amount))).join('')}
      <div class="hr"></div><h3>Cash drawer</h3>
      ${row('Opening cash', m(r.openingCash || 0))}
      ${row('+ Cash sales', m(r.cashSales))}
      ${row('− Cash expenses', m(r.cashExpenses))}
      ${row('Expected in drawer', m(r.expectedCash), 'b')}
      ${r.countedCash !== null && r.countedCash !== undefined ? row('Counted', m(r.countedCash)) + row('Difference', m(r.countedCash - r.expectedCash), 'b') : ''}
      <div class="hr"></div><h3>Profit (estimate)</h3>
      ${row('Ingredient cost', m(r.cogs))}
      ${row('Gross profit', m(r.grossProfit), 'b')}
      ${row('Expenses', m(r.expenses))}
      ${row('Net profit', m(r.netProfit), 'b')}
      <div class="hr"></div><h3>Top items</h3>
      ${r.topItems.slice(0, 10).map((i) => row(`${i.qty} × ${e(i.name)}`, m(i.sales))).join('')}
      ${r.note ? `<div class="hr"></div><div>Note: ${e(r.note)}</div>` : ''}
      <div class="hr"></div><div class="c">Signature: ____________________</div>
    </div></body></html>`;
  }

  let busy = Promise.resolve();

  function run(html, { paperWidthMm = null, autoHeight = false } = {}) {
    const job = busy.then(() => new Promise((resolve) => {
      const f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true');
      f.style.cssText = `position:fixed;left:-10000px;top:0;border:0;opacity:0;pointer-events:none;height:200px;width:${paperWidthMm ? paperWidthMm + 'mm' : '210mm'}`;
      document.body.append(f);
      const d = f.contentDocument;
      d.open(); d.write(html); d.close();
      const imgs = Array.from(d.images);
      const loaded = Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));
      const timeout = new Promise((r) => setTimeout(r, 2000));
      Promise.race([loaded, timeout]).then(() => {
        if (autoHeight && paperWidthMm) {
          const px = Math.max(d.documentElement.scrollHeight, d.body.scrollHeight);
          const mm = Math.ceil(px * 25.4 / 96) + 6;
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
    run, receiptHTML, stickersHTML, dayReportHTML, menuHTML,
    menu() { return run(menuHTML().replace('<head>', `<head><base href="${location.href.replace(/[^/]*$/, '')}">`)); },
    receipt(order, opts) { return run(receiptHTML(order, opts), { paperWidthMm: receiptWidths().paper, autoHeight: true }); },
    stickers(order, onlyLineIndex = null) {
      return run(stickersHTML(order, onlyLineIndex), { paperWidthMm: Number(Store.settings.stickerW) || 50 });
    },
    dayReport(r) { return run(dayReportHTML(r), { paperWidthMm: receiptWidths().paper, autoHeight: true }); },
  };
})();
