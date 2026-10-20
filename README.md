# Bubble Blush 🧋

Business toolkit for **Bubble Blush**, a bubble tea shop in Khulna, Bangladesh.

| Folder | What's inside |
|---|---|
| `pos/` | **Bubble Blush POS**: offline point-of-sale for Windows 11 (orders, bill + cup-sticker printing, inventory, expenses, reports) |
| `brand/` | Logo and brand colours |
| `docs/GUIDE.md` | Setup, printers, daily routine, and how to calibrate menu prices |

## Bubble Blush POS — quick start (Windows 11)

1. On GitHub click **Code → Download ZIP**, then extract it to a permanent folder such as `C:\BubbleBlush`. Don't run it from inside the ZIP.
2. Double-click **`Create Desktop Shortcut.bat`** (one time only).
3. Open **Bubble Blush POS** from the Desktop. It opens as an app window in Microsoft Edge. No internet or installation needed.

It comes with the **Bubble Blush menu**: 12 drinks in 4 categories, Medium/Large, and 5 toppings (Popping Balls and Crystal Balls with flavours). It also has 5 sugar levels, 3 ice levels, and the **Opening Day Free Topping** promotion. Prices are final. Recipes (grams/ml) and ingredient costs are estimates for stock and profit tracking, so:

- **Inventory** → put in your real supplier pack prices and stock.
- **Menu & Pricing** → correct each drink's recipe (cost and cost % update automatically).
- **Settings** → shop phone/address, printers, promotion dates. Then **Delete test orders & expenses** before the real opening.

See **[docs/GUIDE.md](docs/GUIDE.md)** for printer setup and the daily routine.

### What it does

- **Sell**: tap drinks, then pick size, sugar, ice, toppings, and notes. Discounts, Cash/bKash/Nagad/Card, change calculator, customer phone with loyalty count, and a "making now" queue with *Ready* buttons.
- **Printing**: the 58/80 mm **bill** prints directly to the receipt printer with no print window, and the paper stops right after the bill. Tear it off, press Enter, and a **kitchen copy** prints (drinks, sugar/ice, toppings, notes, no prices). Optional **cup stickers** (one per cup, any label size), plus an A4 **menu card**.
- **Inventory**: stock goes down automatically with every drink sold. You get low-stock alerts, purchases (with average cost), waste/staff drinks, stock counts, and a WhatsApp-ready shopping list.
- **Menu & Pricing**: recipe costing per size (packaging included), cost %, profit per cup, and a suggested price for your target.
- **Expenses**: rent, salary, bills, and other costs, so profit is real profit.
- **Reports**: sales, profit, best and slowest sellers, busy hours, weekdays, payments, toppings, customers, ingredients used, CSV export, and an end-of-day **cash drawer close** with a printed Z-report.
- **Safety**: manager PIN, one-click backup/restore, and daily backup reminders.

All data stays on the laptop (in `%LOCALAPPDATA%\BubbleBlushPOS`). **Back up every night** and keep a copy on Google Drive or a pen drive.

### Updating the POS later

Download the new ZIP and extract it **over the same folder**. Your data is not stored in the folder, so it is kept. Make a backup first anyway.
