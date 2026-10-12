"""Wordmark options, complete lockups, and the palette sheet."""
import os
import cairosvg
import brandkit as bk
from brandkit import (INK, INK_DEEP, BLUSH, BLUSH_SOFT, BROWN_SUGAR, SAGE,
                      CREAM, WHITE)
import mark
from render import place, BB, BB_W, BB_H, label, svg

OUT = "/projects/sandbox/bubble-blush/brand/options"
os.makedirs(OUT, exist_ok=True)


def write(name, svg_text, png_w=None):
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(svg_text)
    kw = {"output_width": png_w} if png_w else {}
    cairosvg.svg2png(bytestring=svg_text.encode(),
                     write_to=os.path.join(OUT, name + ".png"), **kw)


def sized_for_cap(font, weight, cap):
    """Font size that yields the requested cap height."""
    return cap / (bk.cap_height(font, 100, weight) / 100.0)


# ------------------------------------------------------------- wordmarks
WORDMARKS = [
    ("Quicksand  ·  caps, tracked", "Quicksand-var.ttf", 600, "BUBBLE BLUSH", 0.10,
     "Clean, geometric, calm. Reads premium rather than cute."),
    ("Quicksand  ·  lowercase", "Quicksand-var.ttf", 500, "bubble blush", 0.06,
     "Softer and more modern. Very current cafe feel."),
    ("Comfortaa  ·  caps", "Comfortaa-var.ttf", 700, "BUBBLE BLUSH", 0.06,
     "Roundest of the set. Most obviously 'boba'."),
    ("Baloo 2  ·  caps", "Baloo2-var.ttf", 600, "BUBBLE BLUSH", 0.07,
     "Chunky and friendly. Closest to your current font, but properly spaced."),
    ("Poppins  ·  caps, tracked", "Poppins-SemiBold.ttf", None, "BUBBLE BLUSH", 0.12,
     "Sharpest and most neutral. Confident, slightly fashion."),
    ("Nunito  ·  lowercase", "Nunito-var.ttf", 700, "bubble blush", 0.04,
     "Warm and approachable, a touch more casual."),
]

CW, CH, H0 = 1500, 250, 190
W = CW
H = H0 + CH * len(WORDMARKS) + 40
parts = []
t, _ = label("WORDMARK OPTIONS", W / 2, 96, 64, INK, tracking=0.12)
parts.append(t)
s, _ = label("same name, six voices  ·  all set as vector outlines", W / 2, 148,
             32, SAGE, weight=500, tracking=0.05)
parts.append(s)

for i, (name, font, wt, text, tr, note) in enumerate(WORDMARKS):
    oy = H0 + i * CH
    parts.append(f'<rect x="40" y="{oy}" width="{W-80}" height="{CH-28}" '
                 f'rx="22" fill="{WHITE}" stroke="#E8E2DA" stroke-width="2"/>')
    size = sized_for_cap(font, wt, 76)
    d, wid = bk.text_to_path(text, font, size, wt, tracking=tr, word_space=0.06)
    parts.append(f'<g transform="translate(90,{oy + 128})">'
                 f'<path d="{d}" fill="{INK}"/></g>')
    n, _ = label(name, 90, oy + 186, 28, BROWN_SUGAR, weight=600,
                 tracking=0.03, anchor="start")
    parts.append(n)
    nn, _ = label(note, W - 90, oy + 186, 26, "#8A9693", weight=500,
                  anchor="end")
    parts.append(nn)

write("07-WORDMARKS", svg(W, H, "\n".join(parts)), png_w=1500)


# ------------------------------------------------------------- lockups
def stacked(mark_kw, font, wt, text, tr, cap=96, mark_h=520, gap=104,
            pad=90, paper=WHITE, ink=INK):
    s_ = mark_h / BB_H
    mw = BB_W * s_
    d, tw = bk.text_to_path(text, font, sized_for_cap(font, wt, cap), wt,
                            tracking=tr, word_space=0.06)
    cw = max(mw, tw) + pad * 2
    ch = pad + mark_h + gap + cap + pad
    mkw = dict(mark_kw)
    mkw.setdefault("ink", ink)          # the mark must follow the lockup ink
    mkw.setdefault("paper", paper)
    body = place(mark.build(**mkw), cw / 2, pad + mark_h / 2, mark_h)
    body += (f'\n<g transform="translate({(cw - tw) / 2:.2f},'
             f'{pad + mark_h + gap + cap:.2f})"><path d="{d}" fill="{ink}"/></g>')
    return body, cw, ch


def horizontal(mark_kw, font, wt, text, tr, cap=82, mark_h=300, gap=56,
               pad=70, paper=WHITE, ink=INK):
    s_ = mark_h / BB_H
    mw = BB_W * s_
    d, tw = bk.text_to_path(text, font, sized_for_cap(font, wt, cap), wt,
                            tracking=tr, word_space=0.06)
    cw = pad + mw + gap + tw + pad
    ch = pad + mark_h + pad
    mkw = dict(mark_kw)
    mkw.setdefault("ink", ink)          # the mark must follow the lockup ink
    mkw.setdefault("paper", paper)
    body = place(mark.build(**mkw), pad + mw / 2, pad + mark_h / 2, mark_h)
    body += (f'\n<g transform="translate({pad + mw + gap:.2f},'
             f'{pad + mark_h / 2 + cap / 2:.2f})">'
             f'<path d="{d}" fill="{ink}"/></g>')
    return body, cw, ch


LOCKUPS = [
    ("A", "Brown sugar  +  Quicksand caps",
     dict(pearl=BROWN_SUGAR, show_ring=True),
     "Quicksand-var.ttf", 600, "BUBBLE BLUSH", 0.10,
     "My recommendation. Calm, confident, unmistakably boba."),
    ("B", "Brown sugar  +  Comfortaa caps",
     dict(pearl=BROWN_SUGAR, show_ring=True),
     "Comfortaa-var.ttf", 700, "BUBBLE BLUSH", 0.06,
     "Rounder and sweeter. Leans younger."),
    ("C", "Teal + blush  +  Quicksand lowercase",
     dict(pearl=BROWN_SUGAR, liquid=BLUSH_SOFT, show_ring=True, ring_color=BLUSH),
     "Quicksand-var.ttf", 500, "bubble blush", 0.06,
     "Softest. The name and the colour finally agree."),
    ("D", "Signage solid  +  Poppins caps",
     dict(solid_bowl=True, show_ring=False, sw=56),
     "Poppins-SemiBold.ttf", None, "BUBBLE BLUSH", 0.12,
     "Boldest. Built to be read from across the street."),
]

CW, CH, H0 = 1000, 880, 200
ART_H = 590          # vertical room for the lockup inside a card
COLS = 2
W = CW * COLS
H = H0 + CH * 2
parts = []
t, _ = label("COMPLETE LOGO LOCKUPS", W / 2, 100, 68, INK, tracking=0.12)
parts.append(t)
s, _ = label("mark + wordmark together  ·  stacked, as you'd use on a signboard",
             W / 2, 156, 32, SAGE, weight=500, tracking=0.04)
parts.append(s)

for i, (tag, name, mkw, font, wt, text, tr, note) in enumerate(LOCKUPS):
    col, row = i % COLS, i // COLS
    ox, oy = col * CW, H0 + row * CH
    parts.append(f'<rect x="{ox+30}" y="{oy+20}" width="{CW-60}" '
                 f'height="{CH-60}" rx="30" fill="{WHITE}" '
                 f'stroke="#E8E2DA" stroke-width="2"/>')
    body, cw, ch = stacked(mkw, font, wt, text, tr, cap=92, mark_h=600)
    # fit to whichever of width/height binds first
    sc = min((CW - 200) / cw, ART_H / ch)
    tx = ox + (CW - cw * sc) / 2
    ty = oy + 60 + (ART_H - ch * sc) / 2
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) '
                 f'scale({sc:.5f})">{body}</g>')
    lab, _ = label(f"{tag}.   {name}", ox + CW / 2, oy + CH - 150, 36, INK,
                   tracking=0.04)
    parts.append(lab)
    nn, _ = label(note, ox + CW / 2, oy + CH - 100, 28, "#8A9693", weight=500)
    parts.append(nn)

write("08-LOCKUPS", svg(W, H, "\n".join(parts)), png_w=1700)


# ------------------------------------------------------------- palette
def luminance(hexv):
    c = [int(hexv[i:i + 2], 16) / 255.0 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


SWATCHES = [
    ("Ink", INK, "Logo, all body text, menu board, cup print"),
    ("Deep ink", INK_DEEP, "Signage, small text, anywhere you need more punch"),
    ("Blush", BLUSH, "Accent: sleeves, straws, awning, packaging tape"),
    ("Blush soft", BLUSH_SOFT, "Large fills and backgrounds"),
    ("Brown sugar", BROWN_SUGAR, "Pearls, lid collar, warm accents"),
    ("Sage", SAGE, "Supporting only: matcha and green tea items"),
    ("Cream", CREAM, "Paper. The default background"),
]

RW, H0 = 150, 210
W = 1500
H = H0 + RW * len(SWATCHES) + 150
parts = []
t, _ = label("PALETTE", W / 2, 100, 68, INK, tracking=0.14)
parts.append(t)
s, _ = label("contrast measured against cream  ·  4.5 or higher is safe for text",
             W / 2, 158, 30, SAGE, weight=500, tracking=0.04)
parts.append(s)

for i, (name, hexv, use) in enumerate(SWATCHES):
    oy = H0 + i * RW
    parts.append(f'<rect x="60" y="{oy}" width="{W-120}" height="{RW-22}" '
                 f'rx="18" fill="{WHITE}" stroke="#E8E2DA" stroke-width="2"/>')
    parts.append(f'<rect x="82" y="{oy+22}" width="{RW-66}" '
                 f'height="{RW-66}" rx="14" fill="{hexv}" '
                 f'stroke="#E0D9D0" stroke-width="2"/>')
    n, _ = label(name.upper(), 240, oy + 62, 32, INK, tracking=0.06,
                 anchor="start")
    parts.append(n)
    hx, _ = label(hexv.upper(), 240, oy + 106, 28, BROWN_SUGAR, weight=600,
                  tracking=0.04, anchor="start")
    parts.append(hx)
    u, _ = label(use, 560, oy + 62, 27, "#7C8A86", weight=500, anchor="start")
    parts.append(u)
    cr = contrast(hexv, CREAM)
    verdict = "safe for text" if cr >= 4.5 else (
        "large text only" if cr >= 3.0 else "never for text")
    c, _ = label(f"{cr:.1f} : 1   ·   {verdict}", 560, oy + 106, 26,
                 INK if cr >= 4.5 else "#B08A6A", weight=500, anchor="start")
    parts.append(c)

note, _ = label("Your original export rendered the ink at about 55% opacity, "
                "which measured 2.2:1 and fails every threshold.",
                W / 2, H - 70, 27, "#8A9693", weight=500)
parts.append(note)
write("09-PALETTE", svg(W, H, "\n".join(parts)), png_w=1500)
print("wordmarks + lockups + palette written")
