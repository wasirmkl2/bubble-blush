"""Build brand/FINAL-3 -- the three recommended directions, ranked.

Also caps every raster in the repository at 2000 px on its longest edge.
The .svg files stay the print masters (resolution-independent, type already
outlined), so nothing is lost by capping the PNGs: 2000 px is still ~170 dpi
across a 300 mm signboard, and anything larger should be printed from vector.

Run:  cd brand/src && python3 final3.py
"""
import os
import re
import shutil
import cairosvg
from PIL import Image, ImageDraw, ImageFont

BRAND = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(BRAND, "directions")
OUT = os.path.join(BRAND, "FINAL-3")
FONT = os.path.join(BRAND, "src", "fonts", "Quicksand-var.ttf")

MAX_PX = 2000          # hard ceiling for any raster we emit

# ---------------------------------------------------------------- the picks
PICKS = [
    dict(
        rank=1, key="04-teal-blush", folder="01-teal-blush",
        title="TEAL + BLUSH",
        oneline="The name and the colour finally agree.",
        why=[
            "Blush drink inside a teal cup, so \"Blush\" is something you can "
            "see rather than a word that has to be explained.",
            "Pearls in boba brown read as tapioca, not as abstract dots.",
            "Most distinctive of the six -- no other bubble tea shop in Khulna "
            "is likely to own a teal-and-blush mark.",
        ],
        watch="Three colours in the artwork, so screen printing costs a little "
              "more than a two-colour mark.",
    ),
    dict(
        rank=2, key="02-brown-sugar", folder="02-brown-sugar",
        title="BROWN SUGAR PEARLS",
        oneline="Your original logo, corrected. The safe choice.",
        why=[
            "Closest to the logo you already have, so nothing about the brand "
            "has to be relearned.",
            "Full-strength ink fixes the real defect in the original export -- "
            "the old file sat at 45-60% opacity and measured 2.2:1 contrast, "
            "unreadable on a menu board in daylight.",
            "Two colours only. Cheapest to print on cups, sleeves and sleeves.",
        ],
        watch="Less ownable than pick 1. It is a well-built mark rather than a "
              "memorable one.",
    ),
    dict(
        rank=3, key="06-minimal", folder="03-minimal",
        title="MINIMAL ICON",
        oneline="The one that survives being small.",
        why=[
            "Two large pearls and a heavier stroke, so it still reads at 32 px "
            "-- a favicon, a WhatsApp avatar, a stamp on a loyalty card.",
            "No lid ring to fill in when embroidered or foil-stamped.",
            "Fewest parts, so it is the quickest of the three for a local "
            "signboard painter to reproduce by hand.",
        ],
        watch="Gives up the lid and collar detail, so at signboard size it "
              "looks plainer than picks 1 and 2.",
    ),
]

CREAM = (249, 244, 239)
WHITE = (255, 255, 255)
INK = (63, 121, 126)
INK_DEEP = (47, 95, 100)
SAGE = (143, 156, 139)
BROWN = (168, 126, 90)
HAIR = (232, 226, 218)


def png_sizes_for(src_dir, stem):
    """The PNG widths that already exist for a stem, with 2400 pulled to 2000."""
    sizes = set()
    pat = re.compile(rf"^{re.escape(stem)}-(\d+)\.png$")
    for fn in os.listdir(src_dir):
        m = pat.match(fn)
        if m:
            sizes.add(int(m.group(1)))
    return sorted({min(s, MAX_PX) for s in sizes}, reverse=True)


def svg_dims(path):
    head = open(path).read(400)
    w = float(re.search(r'width="([\d.]+)"', head).group(1))
    h = float(re.search(r'height="([\d.]+)"', head).group(1))
    return w, h


def render(svg_path, out_base, widths):
    """Re-render PNGs straight from the vector master, capped at MAX_PX."""
    w, h = svg_dims(svg_path)
    data = open(svg_path, "rb").read()
    made = []
    for want in widths:
        # cap on the *longest* edge, not just the width
        scale = min(want / w, MAX_PX / w, MAX_PX / h)
        ow = max(1, round(w * scale))
        target = f"{out_base}-{want}.png"
        cairosvg.svg2png(bytestring=data, write_to=target, output_width=ow)
        made.append(target)
    return made


# ------------------------------------------------------------ build FINAL-3
if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

for p in PICKS:
    s_dir = os.path.join(SRC, p["key"])
    d_dir = os.path.join(OUT, p["folder"])
    os.makedirs(d_dir)
    stems = sorted(f[:-4] for f in os.listdir(s_dir) if f.endswith(".svg"))
    n = 0
    for stem in stems:
        svg_src = os.path.join(s_dir, stem + ".svg")
        shutil.copy2(svg_src, os.path.join(d_dir, stem + ".svg"))
        n += 1
        n += len(render(svg_src, os.path.join(d_dir, stem),
                        png_sizes_for(s_dir, stem)))
    print(f"  pick {p['rank']}  {p['folder']}: {n} files")

# --------------------------------------------------- cap rasters everywhere
print("\ncapping oversize rasters at", MAX_PX, "px")
capped = 0
for sub in ("directions", "logo"):
    root = os.path.join(BRAND, sub)
    for dirpath, _, files in os.walk(root):
        for fn in sorted(files):
            m = re.match(r"^(.*)-2400\.png$", fn)
            if not m:
                continue
            stem = m.group(1)
            svg_src = os.path.join(dirpath, stem + ".svg")
            old = os.path.join(dirpath, fn)
            if os.path.exists(svg_src):
                render(svg_src, os.path.join(dirpath, stem), [MAX_PX])
            else:                                  # no master: downscale
                im = Image.open(old)
                sc = MAX_PX / max(im.size)
                im.resize((round(im.width * sc), round(im.height * sc)),
                          Image.LANCZOS).save(
                    os.path.join(dirpath, f"{stem}-{MAX_PX}.png"))
            os.remove(old)
            capped += 1
print(f"  replaced {capped} files: *-2400.png -> *-{MAX_PX}.png")

# ------------------------------------------------------- the decision sheet
f_title = ImageFont.truetype(FONT, 54)
f_sub = ImageFont.truetype(FONT, 25)
f_rank = ImageFont.truetype(FONT, 28)
f_one = ImageFont.truetype(FONT, 22)
f_col = ImageFont.truetype(FONT, 19)

# native=True -> never enlarge, so the cell shows the file at its true size
COLS = [("stacked-800.png", "standard", False),
        ("stacked-reversed-800.png", "reversed", False),
        ("stacked-onecolour-800.png", "one colour", False),
        ("icon-small-96.png", "actual size, 96 px", True),
        ("avatar-square-256.png", "avatar", False)]

PAD, HEAD = 34, 176
LABEL_W, CELL_W, CELL_H = 326, 320, 400


def wrap(dr, text, font, width):
    lines, line = [], ""
    for wd in text.split():
        t = (line + " " + wd).strip()
        if line and dr.textlength(t, font=font) > width:
            lines.append(line)
            line = wd
        else:
            line = t
    if line:
        lines.append(line)
    return lines
W = PAD * 2 + LABEL_W + len(COLS) * CELL_W
H = HEAD + len(PICKS) * CELL_H + PAD
assert max(W, H) <= MAX_PX, (W, H)

sheet = Image.new("RGB", (W, H), CREAM)
dr = ImageDraw.Draw(sheet)
dr.text((PAD + 8, 34), "BUBBLE BLUSH  ·  FINAL THREE", font=f_title, fill=INK)
dr.text((PAD + 8, 100), "ranked recommendation  ·  pick one  ·  every cell is "
        "a real exported file", font=f_sub, fill=SAGE)

for ci, (_, cname, _n) in enumerate(COLS):
    cx = PAD + LABEL_W + ci * CELL_W + CELL_W // 2
    t = cname.upper()
    dr.text((cx - dr.textlength(t, font=f_col) / 2, HEAD - 30), t,
            font=f_col, fill=BROWN)

for ri, p in enumerate(PICKS):
    oy = HEAD + ri * CELL_H
    head = [f"{p['rank']}.  {p['title']}"]
    if dr.textlength(head[0], font=f_rank) > LABEL_W - 24:
        head = wrap(dr, head[0], f_rank, LABEL_W - 24)
    body = wrap(dr, p["oneline"], f_one, LABEL_W - 24)
    ty = oy + CELL_H // 2 - (len(head) * 36 + len(body) * 29) // 2
    for ln in head:
        dr.text((PAD + 8, ty), ln, font=f_rank, fill=INK)
        ty += 36
    ty += 6
    for ln in body:
        dr.text((PAD + 8, ty), ln, font=f_one, fill=SAGE)
        ty += 29

    for ci, (fname, _, native) in enumerate(COLS):
        ox = PAD + LABEL_W + ci * CELL_W
        dr.rounded_rectangle((ox + 10, oy + 12, ox + CELL_W - 10,
                              oy + CELL_H - 12), radius=14, fill=WHITE,
                             outline=HAIR, width=2)
        path = os.path.join(OUT, p["folder"], fname)
        if not os.path.exists(path):
            dr.text((ox + 28, oy + CELL_H // 2), "MISSING", font=f_rank,
                    fill=(200, 60, 60))
            continue
        im = Image.open(path).convert("RGBA")
        sc = min((CELL_W - 64) / im.width, (CELL_H - 64) / im.height)
        if native:
            sc = min(sc, 1.0)          # shrink if it must, never enlarge
        if sc != 1.0:
            im = im.resize((max(1, int(im.width * sc)),
                            max(1, int(im.height * sc))), Image.LANCZOS)
        sheet.paste(im, (ox + (CELL_W - im.width) // 2,
                         oy + (CELL_H - im.height) // 2), im)

sheet_path = os.path.join(OUT, "00-PICK-ONE.png")
sheet.save(sheet_path)
print(f"\n{sheet_path}  {sheet.size}")
