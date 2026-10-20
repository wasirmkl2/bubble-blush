'use strict';
/* Sell screen: pick drinks, customise, take payment, print bill + cup stickers. */
Views.pos = (() => {
  const CART_KEY = 'bb-cart';
  let root = null;
  let cat = 'all';
  let search = '';
  let cart = loadCart();
  let printPrefs = null;

  function emptyCart() {
    return { lines: [], discount: null, orderType: null, customerName: '', customerPhone: '', note: '' };
  }
  function loadCart() {
    try { return { ...emptyCart(), ...JSON.parse(localStorage.getItem(CART_KEY) || '{}') }; } catch { return emptyCart(); }
  }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  const st = () => Store.settings;
  const priceRange = (item) => item.sizes.map((s) => {
    const z = Store.size(s.sizeId);
    return `${U.esc(item.sizes.length > 1 ? (z?.short || s.sizeId) : (z?.name || s.sizeId))} ${U.money(s.price)}`;
  }).join(' · ');
  const sugarLabel = (v) => { const l = st().sugarLabels?.[v]; return l ? `${v} · ${l}` : v; };
  const topKey = (t) => `${t.id}|${t.flavourId || ''}`;

  /* ---------- layout ---------- */
  function render(el) {
    root = el;
    cart = loadCart();
    if (!st().orderTypes.includes(cart.orderType)) cart.orderType = null;
    if (!cart.orderType) cart.orderType = st().orderTypes[0] || 'Takeaway';
    if (!printPrefs) printPrefs = { receipt: !!st().printReceiptDefault, kitchen: st().printKitchenDefault !== false, sticker: !!st().printStickerDefault };
    el.innerHTML = `
      <div class="pos">
        <section class="pos-menu">
          <div class="pos-tools">
            <input type="search" id="posSearch" class="search" placeholder="Search drinks…  (press / )" value="${U.esc(search)}">
            <div class="chips" id="posCats"></div>
          </div>
          <div class="item-grid" id="posGrid"></div>
          <div class="queue" id="posQueue"></div>
        </section>
        <aside class="cart" id="posCart"></aside>
      </div>`;
    renderCats();
    renderGrid();
    renderCart();
    renderQueue();
    const s = U.$('#posSearch', el);
    s.addEventListener('input', () => { search = s.value; renderGrid(); });
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = U.$('#posGrid .item-card:not(.off)', el);
        if (first) first.click();
      }
    });
    document.addEventListener('keydown', onKey);
  }
  function hide() { document.removeEventListener('keydown', onKey); }
  function onKey(e) {
    if (U.topModal()) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); U.$('#posSearch', root).focus(); }
    if (e.key === 'F12' && cart.lines.length) { e.preventDefault(); openPay(); }
  }

  function renderCats() {
    const box = U.$('#posCats', root);
    const cats = Store.S.categories.filter((c) => Store.S.items.some((i) => i.catId === c.id));
    box.innerHTML = [`<button class="chip ${cat === 'all' ? 'on' : ''}" data-c="all">All</button>`]
      .concat(cats.map((c) => `<button class="chip ${cat === c.id ? 'on' : ''}" data-c="${c.id}" style="--c:${U.color(c.color)}">${U.esc(c.name)}</button>`)).join('');
    box.onclick = (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      cat = b.dataset.c;
      renderCats();
      renderGrid();
    };
  }

  function renderGrid() {
    const grid = U.$('#posGrid', root);
    const q = search.trim().toLowerCase();
    const items = Store.S.items.filter((i) => (cat === 'all' || i.catId === cat) &&
      (!q || i.name.toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q)) && i.sizes.length);
    if (!items.length) {
      grid.innerHTML = `<div class="empty">No drinks found.${Store.S.items.length ? '' : ' Add drinks in <b>Menu &amp; Pricing</b>.'}</div>`;
      return;
    }
    grid.innerHTML = items.map((i) => {
      const c = Store.S.category[i.catId];
      const missing = i.active ? Store.missingFor(i, i.sizes[0].sizeId) : [];
      return `<button class="item-card ${i.active ? '' : 'off'}" data-id="${i.id}" style="--c:${U.color(c?.color)}" ${i.active ? '' : 'disabled'}>
        <span class="ic-name">${U.esc(i.name)}</span>
        ${i.badge ? `<span class="ic-badge">★ ${U.esc(i.badge)}</span>` : ''}
        <span class="ic-desc">${U.esc(i.desc || (Store.includedNames(i).length ? 'Includes ' + Store.includedNames(i).join(', ') : ''))}</span>
        <span class="ic-price">${priceRange(i)}</span>
        ${!i.active ? '<span class="ic-flag">Sold out</span>' : missing.length ? `<span class="ic-flag warn" title="Low: ${U.esc(missing.join(', '))}">Check stock</span>` : ''}
      </button>`;
    }).join('');
    grid.onclick = (e) => {
      const b = e.target.closest('.item-card');
      if (b && !b.disabled) openItem(Store.S.item[b.dataset.id]);
    };
  }

  /* ---------- item options ---------- */
  function openItem(item, editIndex = null) {
    const existing = editIndex !== null ? cart.lines[editIndex] : null;
    const only = item.sizes.length === 1 ? item.sizes[0] : null; // e.g. Premium Brown Sugar: Large only
    const line = existing ? JSON.parse(JSON.stringify(existing)) : {
      itemId: item.id, name: item.name, sizeId: only ? only.sizeId : null, basePrice: only ? only.price : 0,
      sugar: item.allowSugar ? st().defaultSugar : '', ice: item.allowIce ? st().defaultIce : '', toppings: [], note: '', qty: 1,
    };
    const tops = Store.S.toppings.filter((t) => t.active);
    const included = Store.includedNames(item);
    const promoOn = Store.promoActive();
    const has = (id, fl) => line.toppings.some((x) => topKey(x) === `${id}|${fl || ''}`);
    const body = document.createElement('div');
    body.className = 'opt';
    body.innerHTML = `
      ${item.badge ? `<span class="ic-badge big">★ ${U.esc(item.badge)}</span>` : ''}
      ${item.desc ? `<p class="muted">${U.esc(item.desc)}</p>` : ''}
      ${included.length ? `<p class="incl">✓ Included: <b>${included.map(U.esc).join(', ')}</b> <small class="muted">(no extra charge)</small></p>` : ''}
      <div class="opt-group"><label>Size <span class="req" id="sizeReq">${line.sizeId ? '' : '· choose one'}</span></label><div class="size-row">${item.sizes.map((s, k) => {
        const sz = Store.size(s.sizeId);
        return `<button type="button" class="size-btn ${s.sizeId === line.sizeId ? 'on' : ''}" data-size="${s.sizeId}">
          <b>${U.esc(sz?.name || s.sizeId)}</b>${sz?.volume ? `<small>${U.esc(sz.volume)}</small>` : ''}<span>${U.money(s.price)}</span>${item.sizes.length > 1 ? `<kbd>${k + 1}</kbd>` : ''}</button>`;
      }).join('')}${only ? `<span class="muted small" style="align-self:center">${U.esc(Store.sizeLabel(only.sizeId))} only</span>` : ''}</div></div>
      ${item.allowSugar ? `<div class="opt-group"><label>Sugar</label>${U.seg('sugar', st().sugarLevels.map((v) => ({ v, l: sugarLabel(v) })), line.sugar)}</div>` : ''}
      ${item.allowIce ? `<div class="opt-group"><label>Ice</label>${U.seg('ice', st().iceLevels, line.ice)}</div>` : ''}
      ${item.allowToppings && tops.length ? `<div class="opt-group"><label>Add toppings ${promoOn ? `<span class="promo-pill">🎁 ${U.esc(st().promo.name)}: 1 topping free per drink</span>` : ''}</label>
        <div class="top-row">${tops.filter((t) => !(t.flavours || []).length).map((t) => `
          <button type="button" class="top-btn ${has(t.id) ? 'on' : ''}" data-top="${t.id}">${U.esc(t.name)} <small>+${U.money(t.price)}</small></button>`).join('')}</div>
        ${tops.filter((t) => (t.flavours || []).some((f) => f.active !== false)).map((t) => `
          <div class="fl-group"><span class="fl-name">${U.esc(t.name)} <small>+${U.money(t.price)}</small></span>${t.flavours.filter((f) => f.active !== false).map((f) => `
            <button type="button" class="top-btn ${has(t.id, f.id) ? 'on' : ''}" data-top="${t.id}" data-fl="${f.id}">${U.esc(f.name)}</button>`).join('')}</div>`).join('')}
      </div>` : ''}
      <div class="opt-sum" id="optSum"></div>
      <div class="opt-group two">
        <div><label>Note</label><input type="text" id="optNote" placeholder="e.g. no pearls, extra cold" value="${U.esc(line.note)}"></div>
        <div><label>Qty</label><div class="stepper"><button type="button" data-q="-1">−</button><input id="optQty" type="number" min="1" value="${line.qty}"><button type="button" data-q="1">+</button></div></div>
      </div>`;

    const md = U.modal({
      title: item.name,
      body,
      wide: true,
      actions: [
        { label: 'Cancel' },
        { label: 'Add', cls: 'primary big', onClick: () => commit() },
      ],
    });
    const addBtn = md.el.querySelector('.modal-actions .primary');
    const refresh = () => {
      line.qty = Math.max(1, parseInt(U.$('#optQty', body).value, 10) || 1);
      const pr = Store.linePromo(line, promoOn);
      const net = (Store.lineUnitPrice(line) - pr.amount) * line.qty;
      U.$('#sizeReq', body).textContent = line.sizeId ? '' : '· choose one';
      addBtn.disabled = !line.sizeId;
      addBtn.textContent = !line.sizeId ? 'Choose a size first' : `${existing ? 'Update' : 'Add to order'} — ${U.money(net)}`;
      U.$('#optSum', body).innerHTML = line.toppings.length ? line.toppings.map((t, i) =>
        `<span class="sum-top ${i === pr.index && pr.amount ? 'free' : ''}">+ ${U.esc(t.name)} ${i === pr.index && pr.amount ? `<s>${U.money(t.price)}</s> FREE` : U.money(t.price)}</span>`).join('') : '';
    };
    const pickSize = (sizeId) => {
      const sz = item.sizes.find((s) => s.sizeId === sizeId);
      if (!sz) return;
      line.sizeId = sz.sizeId;
      line.basePrice = sz.price;
      U.$$('.size-btn', body).forEach((b) => b.classList.toggle('on', b.dataset.size === sizeId));
    };
    body.addEventListener('click', (e) => {
      const sb = e.target.closest('[data-size]');
      if (sb) pickSize(sb.dataset.size);
      const tb = e.target.closest('[data-top]');
      if (tb) {
        const t = Store.S.topping[tb.dataset.top];
        const fl = tb.dataset.fl ? (t.flavours || []).find((f) => f.id === tb.dataset.fl) : null;
        const key = `${t.id}|${fl ? fl.id : ''}`;
        const i = line.toppings.findIndex((x) => topKey(x) === key);
        if (i >= 0) line.toppings.splice(i, 1);
        else line.toppings.push({ id: t.id, flavourId: fl ? fl.id : null, name: fl ? `${t.name} (${fl.name})` : t.name, price: t.price });
        tb.classList.toggle('on', i < 0);
      }
      const qb = e.target.closest('[data-q]');
      if (qb) { const qi = U.$('#optQty', body); qi.value = Math.max(1, (parseInt(qi.value, 10) || 1) + Number(qb.dataset.q)); }
      refresh();
    });
    U.$('#optQty', body).addEventListener('input', refresh);
    U.bindSeg(body, 'sugar', (v) => { line.sugar = v; });
    U.bindSeg(body, 'ice', (v) => { line.ice = v; });
    body.addEventListener('keydown', (e) => {
      const typing = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (!typing && /^[1-9]$/.test(e.key) && item.sizes[Number(e.key) - 1]) {
        e.preventDefault(); pickSize(item.sizes[Number(e.key) - 1].sizeId); refresh(); return;
      }
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (!line.sizeId) { U.toast('Choose a size first', 'err'); return; }
        commit(); md.close();
      }
    });
    md.el.addEventListener('keydown', (e) => {
      // size shortcuts also work while the Add button has focus
      if (e.target.closest('.modal-body')) return;
      if (/^[1-9]$/.test(e.key) && item.sizes[Number(e.key) - 1]) { e.preventDefault(); pickSize(item.sizes[Number(e.key) - 1].sizeId); refresh(); }
    });
    refresh();
    setTimeout(() => (line.sizeId ? addBtn : md.el.querySelector('.size-btn'))?.focus(), 30);

    function commit() {
      refresh();
      if (!line.sizeId) { U.toast('Choose a size first', 'err'); return false; }
      line.note = U.$('#optNote', body).value.trim();
      if (existing) cart.lines[editIndex] = line;
      else {
        // merge identical lines
        const key = (l) => JSON.stringify([l.itemId, l.sizeId, l.sugar, l.ice, l.note, l.toppings.map(topKey).sort()]);
        const same = cart.lines.find((l) => key(l) === key(line));
        if (same) same.qty += line.qty; else cart.lines.push(line);
      }
      saveCart();
      renderCart();
      return true;
    }
  }

  /* ---------- cart ---------- */
  function renderCart() {
    const box = U.$('#posCart', root);
    const t = Store.totals(cart.lines, cart.discount);
    box.innerHTML = `
      <div class="cart-head">
        ${U.seg('otype', st().orderTypes, cart.orderType)}
        <button class="icon-btn" id="cartClear" title="Clear order" ${cart.lines.length ? '' : 'disabled'}>🗑</button>
      </div>
      <div class="cart-lines">${cart.lines.length ? cart.lines.map((l, i) => {
        const opts = [l.sugar && `Sugar ${l.sugar}`, l.ice].filter(Boolean).join(' · ');
        const pr = Store.linePromo(l);
        const incl = Store.includedNames(Store.S.item[l.itemId]);
        return `<div class="cl" data-i="${i}">
          <div class="cl-main" data-edit="${i}">
            <div class="cl-name">${U.esc(l.name)} <span class="tag">${U.esc(Store.sizeLabel(l.sizeId))}</span></div>
            ${opts ? `<div class="cl-sub">${U.esc(opts)}</div>` : ''}
            ${incl.length ? `<div class="cl-sub">Included: ${incl.map(U.esc).join(', ')}</div>` : ''}
            ${l.toppings.map((x, k) => `<div class="cl-sub">+ ${U.esc(x.name)} ${U.money(x.price)}${k === pr.index && pr.amount ? ' <b class="free-tag">FREE</b>' : ''}</div>`).join('')}
            ${l.note ? `<div class="cl-sub note">✎ ${U.esc(l.note)}</div>` : ''}
          </div>
          <div class="cl-side">
            <div class="cl-price">${pr.amount ? `<s class="muted">${U.money(Store.lineUnitPrice(l) * l.qty)}</s> ` : ''}${U.money((Store.lineUnitPrice(l) - pr.amount) * l.qty)}</div>
            <div class="stepper sm"><button data-dq="-1" data-i="${i}">−</button><span>${l.qty}</span><button data-dq="1" data-i="${i}">+</button></div>
          </div>
        </div>`;
      }).join('') : `<div class="cart-empty"><img src="assets/icon.png" alt=""><p>Tap a drink to start an order</p></div>`}</div>
      <div class="cart-foot">
        <div class="cart-actions">
          <button class="btn sm ghost" id="cartDisc" ${cart.lines.length ? '' : 'disabled'}>🏷 ${cart.discount ? 'Edit discount' : 'Discount'}</button>
          <button class="btn sm ghost" id="cartNote">✎ ${cart.note ? 'Edit note' : 'Order note'}</button>
        </div>
        <div class="tot-row"><span>Subtotal (${t.cups} cup${t.cups === 1 ? '' : 's'})</span><span>${U.money(t.subtotal)}</span></div>
        ${t.promo ? `<div class="tot-row disc"><span>🎁 ${U.esc(st().promo.name)}</span><span>-${U.money(t.promo)}</span></div>` : ''}
        ${t.discount ? `<div class="tot-row disc"><span>Discount${cart.discount.type === 'pct' ? ` ${cart.discount.value}%` : ''}${cart.discount.reason ? ' · ' + U.esc(cart.discount.reason) : ''}</span><span>-${U.money(t.discount)}</span></div>` : ''}
        ${t.vat ? `<div class="tot-row"><span>VAT ${st().vatPct}%${st().vatMode === 'inclusive' ? ' (incl.)' : ''}</span><span>${U.money(t.vat)}</span></div>` : ''}
        <div class="tot-row grand"><span>Total</span><span>${U.money(t.total)}</span></div>
        <button class="btn primary pay" id="cartPay" ${cart.lines.length ? '' : 'disabled'}>Charge ${U.money(t.total)} <small>F12</small></button>
      </div>`;
    U.bindSeg(box, 'otype', (v) => { cart.orderType = v; saveCart(); });
    box.onclick = async (e) => {
      const dq = e.target.closest('[data-dq]');
      if (dq) {
        const i = Number(dq.dataset.i);
        cart.lines[i].qty += Number(dq.dataset.dq);
        if (cart.lines[i].qty <= 0) cart.lines.splice(i, 1);
        if (!cart.lines.length) cart.discount = null;
        saveCart(); renderCart();
        return;
      }
      const ed = e.target.closest('[data-edit]');
      if (ed) {
        const i = Number(ed.dataset.edit);
        const item = Store.S.item[cart.lines[i].itemId];
        if (item) openItem(item, i); else U.toast('This drink was removed from the menu', 'err');
      }
    };
    U.$('#cartClear', box).onclick = async () => {
      if (await U.confirm('Clear this order?', { ok: 'Clear', danger: true })) { resetCart(); }
    };
    U.$('#cartDisc', box).onclick = openDiscount;
    U.$('#cartNote', box).onclick = () => {
      U.modal({
        title: 'Order note',
        body: `<textarea id="ordNote" rows="3" autofocus placeholder="e.g. Pickup at 5 PM, deliver to…">${U.esc(cart.note)}</textarea>`,
        actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'primary', onClick: (m) => { cart.note = U.$('#ordNote', m.el).value.trim(); saveCart(); renderCart(); } }],
      });
    };
    U.$('#cartPay', box).onclick = openPay;
  }

  function resetCart() {
    const keepType = cart.orderType;
    cart = emptyCart();
    cart.orderType = keepType;
    saveCart();
    renderCart();
  }

  function openDiscount() {
    const d = cart.discount || { type: 'pct', value: 0, reason: '' };
    const presets = st().discountPresets || [];
    const md = U.modal({
      title: 'Discount',
      body: `
        <div class="opt-group"><label>Type</label>${U.seg('dtype', [{ v: 'pct', l: 'Percent %' }, { v: 'flat', l: 'Amount ৳' }], d.type)}</div>
        <div class="opt-group"><label>Value</label><input type="number" id="dVal" min="0" value="${d.value || ''}" autofocus>
          <div class="chips mt">${presets.map((p) => `<button class="chip" data-p="${p}">${p}%</button>`).join('')}</div></div>
        <div class="opt-group"><label>Reason</label><input type="text" id="dReason" placeholder="Opening offer, friend, student…" value="${U.esc(d.reason)}"></div>`,
      actions: [
        { label: 'Remove', cls: 'danger', left: true, onClick: () => { cart.discount = null; saveCart(); renderCart(); } },
        { label: 'Cancel' },
        { label: 'Apply', cls: 'primary', onClick: () => apply() },
      ],
    });
    U.bindSeg(md.el, 'dtype', (v) => { d.type = v; });
    md.el.addEventListener('click', (e) => {
      const p = e.target.closest('[data-p]');
      if (p) {
        d.type = 'pct';
        U.$$('[data-seg="dtype"] button', md.el).forEach((b) => b.classList.toggle('on', b.dataset.v === 'pct'));
        U.$('#dVal', md.el).value = p.dataset.p;
      }
    });
    function apply() {
      const v = U.n(U.$('#dVal', md.el).value);
      if (d.type === 'pct' && v > 100) { U.toast('Percent cannot be above 100', 'err'); return false; }
      cart.discount = v > 0 ? { type: d.type, value: v, reason: U.$('#dReason', md.el).value.trim() } : null;
      saveCart(); renderCart();
      return true;
    }
  }

  /* ---------- payment ---------- */
  function openPay() {
    if (!cart.lines.length) return;
    const t = Store.totals(cart.lines, cart.discount);
    let method = st().payMethods[0] || 'Cash';
    const quick = [...new Set([t.total, Math.ceil(t.total / 100) * 100, Math.ceil(t.total / 500) * 500, 1000].filter((v) => v >= t.total))].slice(0, 4);
    const body = document.createElement('div');
    body.className = 'pay-body';
    body.innerHTML = `
      <div class="pay-total"><span>Total to pay</span><b>${U.money(t.total)}</b></div>
      <div class="opt-group"><label>Payment</label>${U.seg('pm', st().payMethods, method)}</div>
      <div class="opt-group" id="cashBox"><label>Cash received</label>
        <input type="number" id="cashIn" min="0" placeholder="${t.total}" autofocus>
        <div class="chips mt">${quick.map((q) => `<button type="button" class="chip" data-cash="${q}">${q === t.total ? 'Exact ' : ''}${U.money(q)}</button>`).join('')}</div>
        <div class="change" id="changeOut"></div>
      </div>
      <div class="opt-group" id="refBox" hidden><label>Transaction ID (optional)</label><input type="text" id="payRef" placeholder="bKash / Nagad TrxID"></div>
      <div class="opt-group two">
        <div><label>Customer name (optional)</label><input type="text" id="custName" value="${U.esc(cart.customerName)}"></div>
        <div><label>Phone (optional)</label><input type="tel" id="custPhone" value="${U.esc(cart.customerPhone)}" placeholder="01XXXXXXXXX"></div>
      </div>
      <div class="loyal" id="loyal"></div>
      <div class="print-opts">
        <label class="check"><input type="checkbox" id="prReceipt" ${printPrefs.receipt ? 'checked' : ''}> 🧾 Customer bill</label>
        <label class="check"><input type="checkbox" id="prKitchen" ${printPrefs.kitchen ? 'checked' : ''}> 👩‍🍳 Kitchen copy</label>
        ${st().stickersEnabled ? `<label class="check"><input type="checkbox" id="prSticker" ${printPrefs.sticker ? 'checked' : ''}> 🏷 Print cup stickers (${t.cups})</label>` : ''}
      </div>`;
    const md = U.modal({
      title: `Payment · ${cart.orderType}`,
      body,
      wide: true,
      actions: [{ label: 'Back' }, { label: '✓ Complete order', cls: 'primary big', onClick: () => complete() }],
    });
    const cashIn = U.$('#cashIn', body);
    const updateChange = () => {
      const r = U.n(cashIn.value);
      const out = U.$('#changeOut', body);
      if (!cashIn.value) { out.innerHTML = ''; return; }
      out.innerHTML = r >= t.total ? `Change to give: <b>${U.money(r - t.total)}</b>` : `<span class="err">Short by ${U.money(t.total - r)}</span>`;
    };
    const updateMethod = () => {
      U.$('#cashBox', body).hidden = method !== 'Cash';
      U.$('#refBox', body).hidden = !/bkash|nagad|rocket|upay/i.test(method);
    };
    U.bindSeg(body, 'pm', (v) => { method = v; updateMethod(); });
    cashIn.addEventListener('input', updateChange);
    body.addEventListener('click', (e) => {
      const c = e.target.closest('[data-cash]');
      if (c) { cashIn.value = c.dataset.cash; updateChange(); }
    });
    const phone = U.$('#custPhone', body);
    const lookup = U.debounce(async () => {
      const box = U.$('#loyal', body);
      const s = await Store.customerStats(phone.value);
      if (!s) { box.innerHTML = ''; return; }
      if (!s.visits) { box.innerHTML = '🌱 New customer — welcome them!'; return; }
      if (s.name && !U.$('#custName', body).value) U.$('#custName', body).value = s.name;
      const every = Number(st().loyaltyEvery) || 0;
      let loyalty = '';
      if (every > 0) {
        const after = s.cups + t.cups;
        const earned = Math.floor(after / every) - Math.floor(s.cups / every);
        loyalty = earned > 0 ? ` · <b class="gold">🎁 Reached ${every} cups — give a free drink!</b>` : ` · ${every - (after % every)} more cup(s) to a free drink`;
      }
      box.innerHTML = `💙 Returning: ${s.visits} visits · ${s.cups} cups · ${U.money(s.spent)} spent${loyalty}`;
    }, 350);
    phone.addEventListener('input', lookup);
    if (phone.value) lookup();
    updateMethod();
    body.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); md.el.querySelector('.modal-actions .primary').click(); }
    });

    async function complete() {
      const received = method === 'Cash' ? (cashIn.value ? U.n(cashIn.value) : t.total) : t.total;
      if (method === 'Cash' && received < t.total) { U.toast('Cash received is less than the total', 'err'); cashIn.focus(); return false; }
      printPrefs.receipt = !!U.$('#prReceipt', body)?.checked;
      printPrefs.sticker = !!U.$('#prSticker', body)?.checked;
      printPrefs.kitchen = !!U.$('#prKitchen', body)?.checked;
      const ref = U.$('#payRef', body)?.value.trim();
      let order;
      try {
        order = await Store.placeOrder({
          lines: cart.lines,
          discount: cart.discount,
          orderType: cart.orderType,
          customerName: U.$('#custName', body).value,
          customerPhone: phone.value,
          payMethod: method,
          received,
          note: [cart.note, ref ? `TrxID: ${ref}` : ''].filter(Boolean).join(' · '),
        });
      } catch (err) {
        console.error(err);
        await Store.reload();
        U.toast('Could not save the order: ' + (err.message || err), 'err', 6000);
        return false;
      }
      md.close();
      resetCart();
      renderGrid();
      renderQueue();
      App.banners();
      showDone(order);
      if (printPrefs.receipt) await Print.receipt(order);
      if (printPrefs.sticker && st().stickersEnabled) await Print.stickers(order);
      if (printPrefs.kitchen) {
        // No auto-cutter: wait until the customer bill is torn off.
        if (printPrefs.receipt && st().kitchenMode !== 'auto') kitchenPrompt(order);
        else await printKitchen(order);
      }
      return true;
    }
  }

  async function printKitchen(order) {
    await Print.kitchen(order, { reprint: !!order.kitchenAt });
    await Store.markKitchenPrinted(order);
    renderQueue();
  }

  function kitchenPrompt(order) {
    const md = U.modal({
      title: `Order #${order.no} · kitchen copy`,
      body: `<div class="kprompt">
          <div class="kp-step">✂️ Tear off the <b>customer bill</b> first.</div>
          <div class="kp-step">Then print the <b>kitchen copy</b> for #${order.no} (${order.cups} cup${order.cups === 1 ? '' : 's'}).</div>
          <p class="muted small">Press <b>Enter</b> to print · <b>Esc</b> to skip (you can print it later from the “Making now” bar).</p>
        </div>`,
      actions: [
        { label: 'Skip' },
        { label: '👩‍🍳 Print kitchen copy', cls: 'primary big', onClick: () => { printKitchen(order); } },
      ],
      onClose: () => renderQueue(),
    });
    setTimeout(() => md.el.querySelector('.modal-actions .primary')?.focus(), 50);
  }

  function showDone(order) {
    const box = document.createElement('div');
    box.className = 'done-pop';
    box.innerHTML = `<div class="done-no">#${order.no}</div><div>${U.money(order.total)} · ${U.esc(order.payMethod)}${order.change ? ` · Change <b>${U.money(order.change)}</b>` : ''}</div>`;
    document.body.append(box);
    setTimeout(() => box.classList.add('out'), 2600);
    setTimeout(() => box.remove(), 3000);
  }

  /* ---------- queue of drinks being made ---------- */
  async function renderQueue() {
    const box = U.$('#posQueue', root);
    if (!box) return;
    const today = await DB.byIndex('orders', 'dayKey', Store.businessDay());
    const pending = today.filter((o) => o.status === 'paid' && !o.ready).sort((a, b) => a.no - b.no);
    if (!pending.length) { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<span class="q-title">Making now</span>${pending.map((o) => `
      <div class="q-chip" title="${U.esc(o.lines.map((l) => `${l.qty}× ${l.name}`).join(', '))}">
        <b>#${o.no}</b><span>${o.cups} cup${o.cups === 1 ? '' : 's'}${o.customerName ? ' · ' + U.esc(o.customerName) : ''}</span>
        <button class="btn sm ${o.kitchenAt ? 'ghost' : 'gold'}" data-kitchen="${o.id}" title="${o.kitchenAt ? 'Reprint kitchen copy' : 'Kitchen copy not printed yet: print it'}">👩‍🍳${o.kitchenAt ? '' : ' Print'}</button>
        <button class="btn sm primary" data-ready="${o.id}">Ready ✓</button>
      </div>`).join('')}`;
    box.onclick = async (e) => {
      const k = e.target.closest('[data-kitchen]');
      if (k) {
        k.disabled = true;
        await printKitchen(pending.find((x) => x.id === k.dataset.kitchen));
        return;
      }
      const b = e.target.closest('[data-ready]');
      if (!b) return;
      const o = pending.find((x) => x.id === b.dataset.ready);
      await Store.setReady(o, true);
      U.toast(`Order #${o.no} is ready — call the customer!`);
      renderQueue();
    };
  }

  return { render, hide };
})();
