'use strict';
/* Business logic: menu cache, costing, orders, stock movements. */
const Store = (() => {
  const S = {
    settings: null,
    categories: [],
    items: [],
    toppings: [],
    ingredients: [],
    ing: {},       // id -> ingredient
    item: {},      // id -> item
    topping: {},   // id -> topping
    category: {},  // id -> category
    listeners: [],
  };

  const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
  const sortBy = (arr) => arr.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || String(a.name).localeCompare(b.name));

  async function loadAll() {
    const [settings, categories, items, toppings, ingredients] = await Promise.all([
      DB.get('settings', 'main'), DB.all('categories'), DB.all('items'), DB.all('toppings'), DB.all('ingredients'),
    ]);
    // Fill in any settings keys added in newer versions.
    S.settings = { ...JSON.parse(JSON.stringify(Seed.SETTINGS)), ...settings };
    if (settings && settings.sizes) S.settings.sizes = settings.sizes;
    S.categories = sortBy(categories);
    S.items = sortBy(items);
    S.toppings = sortBy(toppings);
    S.ingredients = ingredients.sort((a, b) => a.name.localeCompare(b.name));
    S.ing = byId(S.ingredients);
    S.item = byId(S.items);
    S.topping = byId(S.toppings);
    S.category = byId(S.categories);
  }

  async function seed() {
    const d = Seed.build();
    await DB.transact(['settings', 'categories', 'items', 'toppings', 'ingredients'], (o) => {
      o.settings.put(d.settings);
      d.categories.forEach((x) => o.categories.put(x));
      d.items.forEach((x) => o.items.put(x));
      d.toppings.forEach((x) => o.toppings.put(x));
      d.ingredients.forEach((x) => o.ingredients.put(x));
    });
  }

  const api = {
    S,
    async init() {
      await DB.open();
      const existing = await DB.get('settings', 'main');
      if (!existing) await seed();
      await loadAll();
    },
    reload: loadAll,
    onChange(fn) { S.listeners.push(fn); },
    changed(what) { S.listeners.forEach((fn) => { try { fn(what); } catch (e) { console.error(e); } }); },

    get settings() { return S.settings; },
    async saveSettings(patch) {
      S.settings = { ...S.settings, ...patch, id: 'main' };
      await DB.put('settings', S.settings);
      api.changed('settings');
    },

    /* Business day: orders before `dayStartHour` (e.g. 1 AM) belong to the previous day. */
    businessDay(d = new Date()) {
      const h = Number(S.settings?.dayStartHour) || 0;
      return U.dayKey(new Date(d.getTime() - h * 3600 * 1000));
    },

    size(id) { return (S.settings.sizes || []).find((s) => s.id === id); },
    sizeLabel(id) { const s = api.size(id); return s ? s.name : id; },

    /* ---------- costing ---------- */
    recipeCost(recipe = []) {
      return U.sum(recipe, (r) => (U.n(r.qty) * U.n(S.ing[r.ingId]?.costPerUnit)));
    },
    packagingCost(sizeId) { return api.recipeCost(api.size(sizeId)?.packaging || []); },
    itemSizeCost(item, sizeId) {
      const s = item.sizes.find((x) => x.sizeId === sizeId);
      return s ? api.recipeCost(s.recipe) + api.packagingCost(sizeId) : 0;
    },
    toppingCost(t) { return api.recipeCost(t?.recipe || []); },
    /* Price that hits a target food-cost %, rounded up to the next ৳10. */
    suggestPrice(cost, target = 0.3) { return cost > 0 ? Math.ceil(cost / target / 10) * 10 : 0; },
    lineCost(line) {
      const item = S.item[line.itemId];
      const base = item ? api.itemSizeCost(item, line.sizeId) : 0;
      const tops = U.sum(line.toppings || [], (t) => api.toppingCost(S.topping[t.id]));
      return (base + tops) * line.qty;
    },
    lineUnitPrice(line) { return U.n(line.basePrice) + U.sum(line.toppings || [], (t) => t.price); },

    /* Ingredients used by a cart line, as {ingId: qty}. */
    lineUsage(line, into = {}) {
      const add = (recipe, mult) => (recipe || []).forEach((r) => {
        if (!r.ingId) return;
        into[r.ingId] = (into[r.ingId] || 0) + U.n(r.qty) * mult;
      });
      const item = S.item[line.itemId];
      const sz = item?.sizes.find((x) => x.sizeId === line.sizeId);
      add(sz?.recipe, line.qty);
      add(api.size(line.sizeId)?.packaging, line.qty);
      (line.toppings || []).forEach((t) => add(S.topping[t.id]?.recipe, line.qty));
      return into;
    },

    /* ---------- totals ---------- */
    totals(lines, discount) {
      const st = S.settings;
      const subtotal = U.sum(lines, (l) => api.lineUnitPrice(l) * l.qty);
      let discAmt = 0;
      if (discount && discount.value > 0) {
        discAmt = discount.type === 'pct' ? subtotal * discount.value / 100 : discount.value;
      }
      discAmt = Math.min(subtotal, Math.round(discAmt));
      const afterDisc = subtotal - discAmt;
      const pct = U.n(st.vatPct);
      let vat = 0;
      let total = afterDisc;
      if (pct > 0) {
        if (st.vatMode === 'inclusive') vat = U.round(afterDisc - afterDisc / (1 + pct / 100));
        else { vat = Math.round(afterDisc * pct / 100); total = afterDisc + vat; }
      }
      return { subtotal, discount: discAmt, vat, total: Math.round(total), cups: U.sum(lines, (l) => l.qty) };
    },

    /* ---------- orders ---------- */
    async nextOrderNo(dayKey) {
      const today = await DB.byIndex('orders', 'dayKey', dayKey);
      return today.reduce((m, o) => Math.max(m, o.no || 0), 0) + 1;
    },

    async placeOrder({ lines, discount, orderType, customerName, customerPhone, payMethod, received, note }) {
      const now = new Date();
      const dayKey = api.businessDay(now);
      const t = api.totals(lines, discount);
      const no = await api.nextOrderNo(dayKey);
      const orderLines = lines.map((l) => ({
        itemId: l.itemId,
        name: l.name,
        sizeId: l.sizeId,
        sizeName: api.sizeLabel(l.sizeId),
        basePrice: l.basePrice,
        toppings: (l.toppings || []).map((x) => ({ id: x.id, name: x.name, price: x.price })),
        sugar: l.sugar || '',
        ice: l.ice || '',
        note: l.note || '',
        qty: l.qty,
        unitPrice: api.lineUnitPrice(l),
        lineTotal: api.lineUnitPrice(l) * l.qty,
        cost: U.round(api.lineCost(l)),
      }));
      const usage = {};
      lines.forEach((l) => api.lineUsage(l, usage));
      const order = {
        id: U.uid(),
        no,
        dayKey,
        at: now.toISOString(),
        orderType: orderType || 'Takeaway',
        customerName: (customerName || '').trim(),
        customerPhone: (customerPhone || '').replace(/\s+/g, ''),
        note: note || '',
        lines: orderLines,
        cups: t.cups,
        subtotal: t.subtotal,
        discount: t.discount,
        discountInfo: discount && discount.value > 0 ? { ...discount } : null,
        vat: t.vat,
        vatPct: U.n(S.settings.vatPct),
        vatMode: S.settings.vatMode,
        total: t.total,
        cost: U.round(U.sum(orderLines, (l) => l.cost)),
        payMethod: payMethod || 'Cash',
        received: payMethod === 'Cash' ? Math.max(U.n(received), t.total) : t.total,
        change: payMethod === 'Cash' ? Math.max(0, U.n(received) - t.total) : 0,
        status: 'paid',
        ready: false,
        usage,
      };
      await DB.transact(['orders', 'ingredients', 'stockMoves'], (o) => {
        o.orders.put(order);
        Object.entries(usage).forEach(([ingId, qty]) => {
          const ing = S.ing[ingId];
          if (!ing) return;
          ing.stock = U.round(U.n(ing.stock) - qty, 3);
          o.ingredients.put(ing);
          o.stockMoves.put({
            id: U.uid(), ingId, dayKey, at: order.at, type: 'sale', qty: -U.round(qty, 3),
            value: -U.round(qty * U.n(ing.costPerUnit)), orderId: order.id, note: `Order #${no}`,
          });
        });
      });
      api.changed('orders');
      api.changed('stock');
      return order;
    },

    async voidOrder(order, reason, restock = true) {
      if (order.status === 'void') return order;
      const now = new Date();
      order.status = 'void';
      order.voidReason = reason || '';
      order.voidAt = now.toISOString();
      order.restocked = !!restock;
      await DB.transact(['orders', 'ingredients', 'stockMoves'], (o) => {
        o.orders.put(order);
        if (!restock) return;
        Object.entries(order.usage || {}).forEach(([ingId, qty]) => {
          const ing = S.ing[ingId];
          if (!ing) return;
          ing.stock = U.round(U.n(ing.stock) + qty, 3);
          o.ingredients.put(ing);
          o.stockMoves.put({
            id: U.uid(), ingId, dayKey: api.businessDay(now), at: order.voidAt, type: 'void', qty: U.round(qty, 3),
            value: U.round(qty * U.n(ing.costPerUnit)), orderId: order.id, note: `Void #${order.no}`,
          });
        });
      });
      api.changed('orders');
      api.changed('stock');
      return order;
    },

    async setReady(order, ready = true) {
      order.ready = ready;
      order.readyAt = ready ? new Date().toISOString() : null;
      await DB.put('orders', order);
      api.changed('orders');
    },

    ordersBetween(fromDay, toDay) { return DB.byRange('orders', 'dayKey', fromDay, toDay); },
    expensesBetween(fromDay, toDay) { return DB.byRange('expenses', 'dayKey', fromDay, toDay); },
    movesBetween(fromDay, toDay) { return DB.byRange('stockMoves', 'dayKey', fromDay, toDay); },

    async customerStats(phone) {
      const p = (phone || '').replace(/\s+/g, '');
      if (p.length < 6) return null;
      const orders = (await DB.byIndex('orders', 'customerPhone', p)).filter((o) => o.status !== 'void');
      if (!orders.length) return { visits: 0, cups: 0, spent: 0, name: '' };
      orders.sort((a, b) => a.at.localeCompare(b.at));
      return {
        visits: orders.length,
        cups: U.sum(orders, (o) => o.cups),
        spent: U.sum(orders, (o) => o.total),
        name: [...orders].reverse().find((o) => o.customerName)?.customerName || '',
        last: orders[orders.length - 1].at,
      };
    },

    /* ---------- stock ---------- */
    /* Purchase: qty in base units, total cost in ৳. Updates weighted-average cost. */
    async stockIn(ingId, qty, totalCost, note = '', dayKey = api.businessDay()) {
      const ing = S.ing[ingId];
      qty = U.n(qty); totalCost = U.n(totalCost);
      if (!ing || qty <= 0) throw new Error('Enter a quantity above zero');
      const oldStock = Math.max(0, U.n(ing.stock));
      if (totalCost > 0) {
        const newCost = (oldStock * U.n(ing.costPerUnit) + totalCost) / (oldStock + qty);
        ing.costPerUnit = U.round(newCost, 4);
        ing.lastPrice = U.round(totalCost / qty, 4);
      }
      ing.stock = U.round(U.n(ing.stock) + qty, 3);
      await DB.transact(['ingredients', 'stockMoves'], (o) => {
        o.ingredients.put(ing);
        o.stockMoves.put({ id: U.uid(), ingId, dayKey, at: new Date().toISOString(), type: 'purchase', qty, value: totalCost, note });
      });
      api.changed('stock');
    },

    /* Waste / correction: delta can be negative or positive. */
    async adjustStock(ingId, delta, type = 'waste', note = '') {
      const ing = S.ing[ingId];
      delta = U.n(delta);
      if (!ing || !delta) return;
      ing.stock = U.round(U.n(ing.stock) + delta, 3);
      await DB.transact(['ingredients', 'stockMoves'], (o) => {
        o.ingredients.put(ing);
        o.stockMoves.put({
          id: U.uid(), ingId, dayKey: api.businessDay(), at: new Date().toISOString(), type, qty: U.round(delta, 3),
          value: U.round(delta * U.n(ing.costPerUnit)), note,
        });
      });
      api.changed('stock');
    },

    /* Physical count: counts = {ingId: actualQty} */
    async stockCount(counts, note = 'Stock count') {
      const now = new Date().toISOString();
      const dayKey = api.businessDay();
      let changedCount = 0;
      await DB.transact(['ingredients', 'stockMoves'], (o) => {
        Object.entries(counts).forEach(([ingId, actual]) => {
          const ing = S.ing[ingId];
          if (!ing) return;
          const delta = U.round(U.n(actual) - U.n(ing.stock), 3);
          if (!delta) return;
          changedCount++;
          ing.stock = U.round(U.n(actual), 3);
          o.ingredients.put(ing);
          o.stockMoves.put({ id: U.uid(), ingId, dayKey, at: now, type: 'count', qty: delta, value: U.round(delta * U.n(ing.costPerUnit)), note });
        });
      });
      api.changed('stock');
      return changedCount;
    },

    stockStatus(ing) {
      const s = U.n(ing.stock);
      if (s <= 0) return 'out';
      if (s <= U.n(ing.lowAt)) return 'low';
      return 'ok';
    },
    lowStock() { return S.ingredients.filter((i) => i.active !== false && api.stockStatus(i) !== 'ok'); },

    /* Is an item sellable with current stock? Returns ingredients that are out. */
    missingFor(item, sizeId) {
      const sz = item.sizes.find((x) => x.sizeId === sizeId) || item.sizes[0];
      if (!sz) return [];
      const need = [...(sz.recipe || []), ...(api.size(sz.sizeId)?.packaging || [])];
      return need.filter((r) => S.ing[r.ingId] && U.n(S.ing[r.ingId].stock) < U.n(r.qty)).map((r) => S.ing[r.ingId].name);
    },

    /* ---------- generic save helpers ---------- */
    async save(store, obj) {
      await DB.put(store, obj);
      await loadAll();
      api.changed(store);
    },
    async remove(store, id) {
      await DB.del(store, id);
      await loadAll();
      api.changed(store);
    },

    /* ---------- backup ---------- */
    async exportAll() {
      const out = { app: 'bubble-blush-pos', version: 1, exportedAt: new Date().toISOString(), data: {} };
      for (const s of DB.STORES) out.data[s] = await DB.all(s);
      return out;
    },
    async importAll(json) {
      if (!json || json.app !== 'bubble-blush-pos' || !json.data) throw new Error('This is not a Bubble Blush POS backup file.');
      await DB.transact(DB.STORES, (o) => {
        DB.STORES.forEach((s) => {
          o[s].clear();
          (json.data[s] || []).forEach((row) => o[s].put(row));
        });
      });
      await loadAll();
      api.changed('all');
    },
    async clearSales() {
      const stores = ['orders', 'stockMoves', 'expenses', 'dayCloses'];
      await DB.transact(stores, (o) => stores.forEach((s) => o[s].clear()));
      api.changed('all');
    },
    async resetEverything() {
      await DB.transact(DB.STORES, (o) => DB.STORES.forEach((s) => o[s].clear()));
      await seed();
      await loadAll();
      api.changed('all');
    },
  };
  return api;
})();
