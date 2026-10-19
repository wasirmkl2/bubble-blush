# Bubble Blush POS — Owner's Guide

## 1. Hardware for the counter

| Item | Recommended | Notes |
|---|---|---|
| Bill printer | 80 mm USB thermal printer (e.g. Xprinter XP-80 / XP-N160II, Rongta RP80) | Common in Khulna/Dhaka markets. 58 mm also works (set it in Settings). |
| Sticker printer (optional) | Thermal label printer with **50×30 mm** or 40×30 mm labels (e.g. Xprinter XP-365B / XP-420B) | Use *direct thermal* labels; no ink or ribbon needed. |
| Cash drawer (optional) | RJ11 drawer that plugs into the bill printer | Turn on "open drawer" in the printer driver settings. |

## 2. Printer setup (one time)

1. Install each printer's Windows driver (from the CD or the maker's website). Print a Windows test page.
2. **Label printer driver:** open *Printing Preferences* and set the paper/stock to your label size (e.g. 50 mm × 30 mm, gap 2 mm). Then run the printer's *calibrate* (usually: hold the feed button).
3. In the POS, open **Settings** and set the bill paper width and sticker size. Click **Test print bill** and **Test print sticker**.
4. In Edge's print window, choose **More settings** and set:
   - **Paper size**: your roll (80 mm) or label (50×30 mm)
   - **Margins**: None
   - **Scale**: Default (100)
   - **Headers and footers**: off

Edge remembers these settings for the next print.

### Fast printing (no print window)

`Bubble Blush POS (fast print)` prints straight to the **Windows default printer** with no dialog.

- Use it if you print **only bills** or **only stickers**, or if one printer does both.
- If you use two printers (bill + sticker), use the normal shortcut and pick the printer in the print window. Edge pre-selects the one you used last.
- Set the default printer here: Windows Settings → Bluetooth & devices → Printers → turn off "Let Windows manage my default printer" → choose the printer → *Set as default*.
- Close every POS window before switching between normal and fast mode.

## 3. Before the real opening

1. **Inventory**: for every ingredient, use **Edit** to enter what you really pay (pack size and pack price). Delete what you don't use. Add anything missing.
2. **Menu & Pricing**: open each drink.
   - Fix the recipe grams/ml to what your staff actually puts in. Weigh one cup to check.
   - Look at the cost %. Green means at or under your target (30% by default). Amber or red means raise the price or reduce the recipe.
   - Turn off drinks you won't sell yet.
3. **Sizes & packaging**: enter your real cup, film, straw, and sticker costs.
4. **Settings**: add your phone, address, Facebook page, and bill footer. Set a **Manager PIN** before staff use the laptop.
5. **Settings → Delete test orders & expenses**. Then **Inventory → Stock count** with what is really on the shelf.
6. **Menu & Pricing → Print menu card** to print an A4 menu for the counter.

## 4. Daily routine

**Opening**
- Open the POS. Count the coins and notes in the drawer (the *opening float*).
- Check the low-stock banner. Prepare pearls for the day.

**During service**
- `F2` Sell · `/` search · `Enter` add · `F12` charge · `Esc` close.
- Ask for the **phone number** at every order. It builds your customer list and the loyalty count (free drink every 10 cups by default).
- Press **Ready ✓** in the "Making now" bar when a drink is handed over.
- Use Inventory → **− Waste** for spilled drinks, staff drinks, and free samples, so stock stays correct.
- Wrong order? Go to **Orders**, open it, and choose **Void** (with the PIN). Tick "put ingredients back" if the drink was not made.

**Closing**
1. **Expenses**: add anything paid today (gas cylinder, cleaning, delivery…). Leave "Taken from drawer" ticked if it came from the cash drawer.
2. **Reports → Today → Close the day**: enter the opening float and the cash you counted. The POS tells you whether the drawer matches.
3. It prints the Z-report and downloads a backup. **Copy the backup file** (in *Downloads*) to Google Drive or WhatsApp it to yourself.

## 5. Weekly / monthly

- **Weekly**: run an Inventory **Stock count**, then use **Shopping list → Copy for WhatsApp** to send it to your supplier.
- **Weekly**: Reports → *Last 7 days*. Check best/slowest sellers, busy hours, and topping attach rate.
- **Monthly**: add rent, salaries, and electricity in Expenses. Reports → *This month* shows your real **net profit**.
- **When supplier prices change**: record purchases with the real price. Average costs update automatically, and Menu & Pricing shows which drinks need a new price.

## 6. Understanding the numbers

- **Ingredient cost (COGS)**: the recipe cost of every drink sold, including the cup, straw, film, and sticker. Aim for **25–32%** of sales.
- **Gross profit** = sales − ingredient cost.
- **Net profit** = gross profit − expenses (rent, salary, bills). Stock purchases are **not** counted again here, because they already appear as ingredient cost when you sell.
- **Stock purchased** is shown separately so you can see the cash spent on stock.
- **VAT** is off by default (0%). If you register for VAT, set the rate and mode in Settings and add your BIN. Check the current rate with your accountant.

## 7. Data & safety

- Data lives on this laptop in a dedicated Edge profile (`%LOCALAPPDATA%\BubbleBlushPOS`). Always open the POS with the shortcut.
- Use **Backup now** (Settings) at least daily. **Restore from backup** brings everything back on a new laptop.
- Don't use Windows "Disk Clean-up" on that folder. Don't uninstall Edge.
