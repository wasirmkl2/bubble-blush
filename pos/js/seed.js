'use strict';
/*
 * Demo data loaded the first time the POS opens.
 * Prices and costs are realistic starting guesses for Khulna (BDT) — calibrate them in
 * Menu and Inventory once you know your real supplier prices.
 */
const Seed = (() => {
  const SETTINGS = {
    id: 'main',
    shopName: 'Bubble Blush',
    tagline: 'Sip. Smile. Blush.',
    address: 'Khulna, Bangladesh',
    phone: '01XXXXXXXXX',
    social: 'facebook.com/bubbleblush',
    bin: '',
    receiptFooter: 'Thank you for visiting Bubble Blush!\nTag us @bubbleblush & follow us for offers.',
    paperWidth: 58,
    printMode: 'direct',      // 'direct' = print helper (exact length, no dialog) · 'browser' = print window
    receiptPrinter: '',       // Windows printer name for bills (auto-detected)
    imageMode: 'raster',      // 'raster' (GS v 0) or 'compat' (ESC *) for older printers
    receiptFeed: 4,           // blank lines after the bill so it clears the tear bar
    receiptCut: false,        // send a cut command (only for printers with an auto-cutter)
    openDrawer: false,        // kick a cash drawer connected to the bill printer
    schema: 2,
    receiptLogo: true,
    receiptFontPx: 12,
    stickersEnabled: true,
    stickerW: 50,
    stickerH: 30,
    stickerShowShop: true,
    printReceiptDefault: true,
    printStickerDefault: true,
    printKitchenDefault: true,  // second copy for the staff making the drinks
    vatPct: 0,
    vatMode: 'exclusive',
    dayStartHour: 4,
    orderTypes: ['Takeaway', 'Dine-in', 'Delivery'],
    payMethods: ['Cash', 'bKash', 'Nagad', 'Card'],
    sugarLevels: ['0%', '25%', '50%', '75%', '100%'],
    iceLevels: ['No ice', 'Less ice', 'Normal ice', 'Extra ice'],
    defaultSugar: '100%',
    defaultIce: 'Normal ice',
    discountPresets: [5, 10, 15, 20],
    loyaltyEvery: 10,
    targetFoodCost: 30,
    pin: '',
    logoData: '',
    lastBackupAt: null,
    sizes: [
      { id: 'R', name: 'Regular', short: 'R', volume: '500 ml', packaging: [['cup500', 1], ['film', 1], ['straw', 1], ['label', 1]] },
      { id: 'L', name: 'Large', short: 'L', volume: '700 ml', packaging: [['cup700', 1], ['film', 1], ['straw', 1], ['label', 1]] },
      { id: 'H', name: 'Hot', short: 'Hot', volume: '350 ml', packaging: [['cuphot', 1], ['label', 1]] },
    ],
  };

  // id, name, unit, costPerUnit (৳ per unit), stock, lowAt, packSize, packLabel
  const INGREDIENTS = [
    ['pearls', 'Tapioca pearls (dry)', 'g', 0.45, 3000, 1000, 1000, '1 kg pack'],
    ['blacktea', 'Black tea leaves (Assam)', 'g', 0.8, 1000, 300, 500, '500 g pack'],
    ['greentea', 'Jasmine green tea', 'g', 1.2, 1000, 300, 500, '500 g pack'],
    ['creamer', 'Non-dairy creamer', 'g', 0.35, 5000, 1500, 1000, '1 kg pack'],
    ['milk', 'Fresh milk', 'ml', 0.11, 10000, 3000, 1000, '1 L pack'],
    ['condensed', 'Condensed milk', 'g', 0.5, 2000, 800, 390, '390 g can'],
    ['syrup', 'Sugar syrup', 'ml', 0.12, 5000, 1500, 1000, '1 L (homemade)'],
    ['brownsyrup', 'Brown sugar syrup', 'ml', 0.35, 3000, 1000, 1000, '1 L bottle'],
    ['taro', 'Taro powder', 'g', 1.1, 2000, 500, 1000, '1 kg pack'],
    ['matcha', 'Matcha powder', 'g', 4, 500, 150, 100, '100 g pack'],
    ['thaitea', 'Thai tea mix', 'g', 1.5, 1000, 300, 400, '400 g pack'],
    ['cocoa', 'Cocoa powder', 'g', 1.2, 1000, 300, 500, '500 g pack'],
    ['mango', 'Mango puree', 'ml', 0.45, 3000, 1000, 1000, '1 L pack'],
    ['lychee', 'Lychee syrup', 'ml', 0.6, 2000, 700, 750, '750 ml bottle'],
    ['passion', 'Passion fruit syrup', 'ml', 0.7, 2000, 700, 750, '750 ml bottle'],
    ['strawberry', 'Strawberry syrup', 'ml', 0.6, 2000, 700, 750, '750 ml bottle'],
    ['peach', 'Peach syrup', 'ml', 0.6, 2000, 700, 750, '750 ml bottle'],
    ['rose', 'Rose syrup', 'ml', 0.5, 1500, 500, 750, '750 ml bottle'],
    ['honey', 'Honey', 'ml', 1.0, 1000, 300, 500, '500 ml bottle'],
    ['lemon', 'Lemon', 'pcs', 5, 40, 15, 1, 'piece'],
    ['khejurgur', 'Khejur gur (date palm jaggery)', 'g', 0.5, 3000, 1000, 1000, '1 kg'],
    ['masala', 'Cha masala mix', 'g', 2, 300, 100, 100, '100 g pack'],
    ['oreo', 'Oreo biscuit', 'pcs', 5, 120, 40, 12, '12-pc pack'],
    ['popping', 'Popping boba', 'g', 0.9, 3000, 1000, 1000, '1 kg jar'],
    ['cocojelly', 'Coconut jelly', 'g', 0.5, 3000, 1000, 1000, '1 kg jar'],
    ['pudding', 'Egg pudding', 'g', 0.6, 2000, 600, 1000, '1 kg'],
    ['cheesefoam', 'Cheese foam powder', 'g', 1.2, 1000, 300, 500, '500 g pack'],
    ['grassjelly', 'Grass jelly', 'g', 0.5, 2000, 600, 1000, '1 kg can'],
    ['cup500', 'Cold cup 500 ml', 'pcs', 6, 500, 150, 50, '50-pc sleeve'],
    ['cup700', 'Cold cup 700 ml', 'pcs', 8, 500, 150, 50, '50-pc sleeve'],
    ['cuphot', 'Hot cup 350 ml + lid', 'pcs', 9, 200, 60, 50, '50-pc sleeve'],
    ['film', 'Sealing film', 'pcs', 1, 2000, 500, 2000, '1 roll'],
    ['straw', 'Boba straw', 'pcs', 1.5, 1000, 300, 100, '100-pc pack'],
    ['label', 'Cup sticker label', 'pcs', 0.5, 1000, 300, 500, '500-pc roll'],
  ];

  const CATEGORIES = [
    ['milktea', 'Milk Tea', '#A8C3C9'],
    ['fruit', 'Fruit Tea', '#F2B8A2'],
    ['signature', 'Khulna Signatures', '#C9A24A'],
    ['blended', 'Smoothies & Frappes', '#B9A7D6'],
    ['hot', 'Hot Drinks', '#8DA196'],
  ];

  // [id, catId, name, description, {R: price, L: price, H: price}, base recipe for Regular (Large = ×1.3), options]
  const ITEMS = [
    ['classic', 'milktea', 'Blush Classic Milk Tea', 'Assam black tea, creamy milk & chewy pearls', { R: 190, L: 230 },
      { blacktea: 5, creamer: 30, milk: 100, syrup: 30, pearls: 30 }],
    ['tiger', 'milktea', 'Brown Sugar Tiger', 'Fresh milk with caramel brown-sugar stripes & pearls', { R: 250, L: 290 },
      { milk: 200, brownsyrup: 40, pearls: 40 }],
    ['taro', 'milktea', 'Taro Cloud', 'Dreamy purple taro milk tea', { R: 240, L: 290 },
      { taro: 25, creamer: 20, milk: 100, syrup: 20, pearls: 30 }],
    ['matcha', 'milktea', 'Matcha Mist', 'Japanese matcha latte with fresh milk', { R: 240, L: 300 },
      { matcha: 6, milk: 180, syrup: 25, pearls: 30 }],
    ['thai', 'milktea', 'Thai Sunset', 'Bold orange Thai tea with condensed milk', { R: 210, L: 250 },
      { thaitea: 8, condensed: 25, milk: 80, syrup: 15, pearls: 30 }],
    ['choco', 'milktea', 'Choco Pearl', 'Rich chocolate milk tea', { R: 220, L: 260 },
      { cocoa: 15, creamer: 20, milk: 100, syrup: 25, pearls: 30 }],
    ['rupsha', 'fruit', 'Rupsha Mango Breeze', 'Mango green tea named after our Rupsha river', { R: 200, L: 240 },
      { greentea: 4, mango: 60, syrup: 20 }],
    ['lychee', 'fruit', 'Lychee Blush', 'Jasmine green tea with sweet lychee', { R: 200, L: 240 },
      { greentea: 4, lychee: 40, syrup: 10 }],
    ['passion', 'fruit', 'Passion Pop', 'Tangy passion fruit tea with popping boba', { R: 220, L: 270 },
      { greentea: 4, passion: 40, popping: 30 }],
    ['strawberry', 'fruit', 'Strawberry Kiss', 'Strawberry green tea, pretty in pink', { R: 210, L: 250 },
      { greentea: 4, strawberry: 40, syrup: 10 }],
    ['peach', 'fruit', 'Peach Garden', 'Peach jasmine tea with coconut jelly', { R: 210, L: 250 },
      { greentea: 4, peach: 40, cocojelly: 30 }],
    ['khejur', 'signature', 'Khejur Gur Boba', 'Fresh milk sweetened with Khulna date-palm jaggery', { R: 260, L: 300 },
      { milk: 200, khejurgur: 35, pearls: 40 }],
    ['sundarban', 'signature', 'Sundarban Honey Lemon', 'Green tea, wild honey & fresh lemon', { R: 190, L: 230 },
      { greentea: 4, honey: 20, lemon: 0.5, syrup: 10 }],
    ['rose', 'signature', 'Rose Blush Milk Tea', 'Floral rose milk tea — our namesake', { R: 220, L: 260 },
      { blacktea: 4, rose: 25, creamer: 25, milk: 100, pearls: 30 }],
    ['masala', 'signature', 'Masala Cha Boba', 'Desi doodh-cha spices meet boba', { R: 180, L: 230 },
      { blacktea: 6, masala: 2, condensed: 20, milk: 120, pearls: 30 }],
    ['mangosmoothie', 'blended', 'Mango Snow Smoothie', 'Thick blended mango with milk', { R: 240, L: 280 },
      { mango: 100, milk: 100, syrup: 20 }],
    ['oreo', 'blended', 'Oreo Cookie Frappe', 'Cookies & cream blended with pearls', { R: 260, L: 300 },
      { oreo: 3, milk: 150, creamer: 20, syrup: 20, pearls: 30 }],
    ['hotclassic', 'hot', 'Hot Blush Milk Tea', 'Warm Assam milk tea', { H: 170 },
      { blacktea: 5, creamer: 25, milk: 150, syrup: 20 }],
    ['hotmatcha', 'hot', 'Hot Matcha Latte', 'Warm matcha with steamed milk', { H: 210 },
      { matcha: 5, milk: 200, syrup: 20 }],
    ['hotchoco', 'hot', 'Hot Chocolate', 'Cosy cocoa with milk', { H: 190 },
      { cocoa: 15, milk: 200, syrup: 20 }],
  ];

  // id, name, price, recipe
  const TOPPINGS = [
    ['t-pearls', 'Extra pearls', 30, { pearls: 30 }],
    ['t-popping', 'Popping boba', 50, { popping: 30 }],
    ['t-cocojelly', 'Coconut jelly', 30, { cocojelly: 30 }],
    ['t-pudding', 'Egg pudding', 50, { pudding: 40 }],
    ['t-grass', 'Grass jelly', 30, { grassjelly: 30 }],
    ['t-cheese', 'Cheese foam', 60, { cheesefoam: 25, milk: 30 }],
    ['t-oreo', 'Oreo crumbs', 30, { oreo: 1 }],
  ];

  // Large cup is 700 ml vs 500 ml, but ice takes space: ~1.3× the ingredients.
  const LARGE_MULT = 1.3;
  const toRecipe = (obj, mult = 1) => Object.entries(obj).map(([ingId, q]) => ({
    ingId, qty: Math.round(q * mult * 10) / 10,
  }));

  function build() {
    const now = new Date().toISOString();
    const ingredients = INGREDIENTS.map(([id, name, unit, cost, stock, lowAt, packSize, packLabel]) => ({
      id, name, unit, costPerUnit: cost, stock, lowAt, packSize, packLabel, active: true, createdAt: now,
    }));
    const categories = CATEGORIES.map(([id, name, color], i) => ({ id, name, color, sort: i }));
    const items = ITEMS.map(([id, catId, name, desc, prices, recipe], i) => ({
      id, catId, name, desc,
      sort: i,
      active: true,
      allowSugar: true,
      allowIce: catId !== 'hot',
      allowToppings: true,
      sizes: Object.entries(prices).map(([sizeId, price]) => ({
        sizeId, price, recipe: toRecipe(recipe, sizeId === 'L' ? LARGE_MULT : 1),
      })),
    }));
    const toppings = TOPPINGS.map(([id, name, price, recipe], i) => ({
      id, name, price, recipe: toRecipe(recipe), active: true, sort: i,
    }));
    const settings = JSON.parse(JSON.stringify(SETTINGS));
    settings.sizes = settings.sizes.map((s) => ({ ...s, packaging: s.packaging.map(([ingId, qty]) => ({ ingId, qty })) }));
    settings.createdAt = now;
    return { settings, ingredients, categories, items, toppings };
  }

  return { build, SETTINGS, LARGE_MULT };
})();
