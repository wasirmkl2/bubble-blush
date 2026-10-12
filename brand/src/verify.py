"""Composite the real generated PNGs into one sheet, to check the deliverables."""
import os
from PIL import Image, ImageDraw, ImageFont

BRAND = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT = os.path.join(BRAND, "directions")
OUT = os.path.join(BRAND, "options", "11-SIX-DIRECTIONS-FINAL.png")
FONT = os.path.join(BRAND, "src", "fonts", "Quicksand-var.ttf")
MAX_PX = 2000          # no raster in this repo exceeds this on either edge

DIRS = ["01-refined", "02-brown-sugar", "03-tilted-straw",
        "04-teal-blush", "05-signage-solid", "06-minimal"]
LABELS = {
    "01-refined": "1.  REFINED ORIGINAL",
    "02-brown-sugar": "2.  BROWN SUGAR PEARLS",
    "03-tilted-straw": "3.  TILTED STRAW",
    "04-teal-blush": "4.  TEAL + BLUSH",
    "05-signage-solid": "5.  SIGNAGE SOLID",
    "06-minimal": "6.  MINIMAL ICON",
}
COLS = [("stacked-800.png", "standard"),
        ("stacked-reversed-800.png", "reversed"),
        ("stacked-onecolour-800.png", "one colour"),
        ("horizontal-800.png", "horizontal")]

CELL_W, CELL_H = 380, 290
LABEL_W = 360
PAD = 30
HEAD = 190
W = LABEL_W + len(COLS) * CELL_W + PAD * 2
H = HEAD + len(DIRS) * CELL_H + PAD
assert max(W, H) <= MAX_PX, f"sheet {W}x{H} exceeds the {MAX_PX} px cap"

CREAM = (249, 244, 239)
INK = (63, 121, 126)
SAGE = (143, 156, 139)
BROWN = (168, 126, 90)

sheet = Image.new("RGB", (W, H), CREAM)
dr = ImageDraw.Draw(sheet)
f_title = ImageFont.truetype(FONT, 46)
f_row = ImageFont.truetype(FONT, 26)
f_col = ImageFont.truetype(FONT, 22)

dr.text((PAD + 10, 40), "SIX DIRECTIONS  ·  FINAL FILES", font=f_title,
        fill=INK)
dr.text((PAD + 10, 100), "wordmark: Quicksand 500  ·  every cell is the real "
        "exported PNG", font=f_col, fill=SAGE)

for ci, (fname, cname) in enumerate(COLS):
    cx = PAD + LABEL_W + ci * CELL_W + CELL_W // 2
    tw = dr.textlength(cname.upper(), font=f_col)
    dr.text((cx - tw / 2, HEAD - 32), cname.upper(), font=f_col, fill=BROWN)

for ri, d in enumerate(DIRS):
    oy = HEAD + ri * CELL_H
    dr.text((PAD + 10, oy + CELL_H // 2 - 14), LABELS[d], font=f_row, fill=INK)
    for ci, (fname, _) in enumerate(COLS):
        path = os.path.join(ROOT, d, fname)
        ox = PAD + LABEL_W + ci * CELL_W
        box = (ox + 14, oy + 14, ox + CELL_W - 14, oy + CELL_H - 14)
        dr.rounded_rectangle(box, radius=14, fill=(255, 255, 255),
                             outline=(232, 226, 218), width=2)
        if not os.path.exists(path):
            dr.text((ox + 30, oy + CELL_H // 2), "MISSING", font=f_row,
                    fill=(200, 60, 60))
            continue
        im = Image.open(path).convert("RGBA")
        avail_w, avail_h = CELL_W - 70, CELL_H - 70
        sc = min(avail_w / im.width, avail_h / im.height)
        im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))),
                       Image.LANCZOS)
        px = ox + (CELL_W - im.width) // 2
        py = oy + (CELL_H - im.height) // 2
        sheet.paste(im, (px, py), im)

sheet.save(OUT)
print(f"{OUT}  {sheet.size}")

# sanity: confirm every expected file exists and is non-trivial
missing, tiny = [], []
for d in DIRS:
    for fn in os.listdir(os.path.join(ROOT, d)):
        p = os.path.join(ROOT, d, fn)
        if os.path.getsize(p) < 200:
            tiny.append(os.path.join(d, fn))
    for fname, _ in COLS:
        if not os.path.exists(os.path.join(ROOT, d, fname)):
            missing.append(os.path.join(d, fname))
total = sum(len(os.listdir(os.path.join(ROOT, d))) for d in DIRS)
print(f"total files: {total}   missing: {missing or 'none'}   "
      f"suspiciously small: {tiny or 'none'}")
