# Bubble Blush POS — Owner's Guide

## 1. Hardware for the counter

| Item | Recommended | Notes |
|---|---|---|
| Bill printer | 58 mm or 80 mm USB thermal printer (e.g. Rongta RP58, Xprinter XP-58 / XP-80) | Set the paper width in Settings. |
| Sticker printer (optional) | Thermal label printer with **50×30 mm** or 40×30 mm labels (e.g. Xprinter XP-365B / XP-420B) | Use *direct thermal* labels; no ink or ribbon needed. |
| Cash drawer (optional) | RJ11 drawer that plugs into the bill printer | Tick **Open cash drawer** in Settings. |

## 2. Printer setup (one time)

### Bill printer (e.g. Rongta RP58, 58 mm)

Bills print **directly** to the printer through a small *print helper* that starts with the POS. Because the POS sends the bill as raw printer commands, the paper stops right after the last line. You don't get a print window or a long blank feed, whatever paper size the Windows driver is set to.

1. Install the printer's Windows driver and print a Windows test page.
2. Open the POS with the **Bubble Blush POS** desktop shortcut. The shortcut also starts the helper.
3. **Settings → Bill (receipt) printer**:
   - Printing method: **Direct to printer**. It should say "✓ Print helper is running".
   - Bill printer: pick your printer, e.g. *RONGTA RP58 Printer*.
   - Paper width: **58 mm**.
   - Click **Save settings**, then **Test print bill**.
4. If Edge asks to allow access to apps or devices on this computer, click **Allow**.

**If something is wrong:**

| Problem | Fix |
|---|---|
| "Print helper is not running" | Close every POS window and open it again with the desktop shortcut. Still failing? Double-click `pos\helper\Run print helper (troubleshoot).bat` and photograph the error. |
| Bill prints strange symbols or garbage | Settings → Image mode → **Compatibility** → Save → test again. |
| Paper doesn't come out far enough to tear | Increase "Blank lines after bill" (e.g. 5–6). |
| Text cut off at the edge | Check Paper width matches your roll (58 mm). |

If you switch to the **Browser print window** method instead, the printer driver's paper size decides how far the paper feeds. Rongta's default long-roll size (58 × 3276 mm) feeds metres of blank paper, which is why Direct is the default.

### Cup sticker printer (optional)

Stickers use the Edge print window. Labels are a fixed size, so the length is never a problem.

1. In the label printer's *Printing Preferences*, set the label size (e.g. 50 mm × 30 mm, gap 2 mm). Run its calibration (usually by holding the feed button).
2. **Settings → Cup sticker printer**: set the same size and click **Test print sticker**.
3. In Edge's print window choose the label printer. Under **More settings**, set Margins: None, Scale: Default, and Headers and footers: off. Edge remembers these settings.

With the **fast print** shortcut, stickers skip the print window and go to the **Windows default printer**. Make the label printer the default; bills still go to the bill printer through the helper.

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
- Every order prints the **customer bill** and then a **kitchen copy**: big order number, each drink with size, sugar, ice, toppings and notes, and no prices. Tear the kitchen copy off for whoever makes the drinks. Untick either one in the payment window if you don't need it. Reprint from **Orders → open order → Kitchen copy**.
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
