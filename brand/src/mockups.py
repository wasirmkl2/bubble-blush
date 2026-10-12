"""Show the recommended direction in context: signboard, cup, avatar, board."""
import cairosvg
import brandkit as bk
from brandkit import (INK, INK_DEEP, BLUSH, BLUSH_SOFT, BROWN_SUGAR, SAGE,
                      CREAM, WHITE)
import mark
from render import place, label, svg
from finalize import horizontal, stacked, write

MARK_KW = dict(pearl=BROWN_SUGAR, show_ring=True)
QS = "Quicksand-var.ttf"
W, H = 2000, 2010
parts = []


def txt(text, x, y, size, color, weight=600, tracking=0.0, font=QS,
        anchor="start"):
    d, w = bk.text_to_path(text, font, size, weight, tracking=tracking,
                           word_space=0.06)
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    return f'<g transform="translate({x:.2f},{y:.2f})"><path d="{d}" fill="{color}"/></g>'


def sect(name, x, y):
    return txt(name, x, y, 30, BROWN_SUGAR, 600, 0.08)


# ----------------------------------------------------- header
parts.append(txt("IN USE", W / 2, 92, 62, INK, 600, 0.14, anchor="middle"))
parts.append(txt("recommended direction A  ·  brown sugar mark + Quicksand caps",
                 W / 2, 146, 30, SAGE, 500, 0.04, anchor="middle"))

# ----------------------------------------------------- 1. signboard
parts.append(sect("SHOPFRONT SIGNBOARD", 100, 232))
sx, sy, sw_, sh = 100, 262, 1800, 500
parts.append(f'<rect x="{sx}" y="{sy}" width="{sw_}" height="{sh}" rx="26" '
             f'fill="{CREAM}" stroke="#E2DACF" stroke-width="3"/>')
body, cw, ch = horizontal(MARK_KW, QS, 600, "BUBBLE BLUSH", 0.10,
                          cap=92, mark_h=330, paper=CREAM)
sc = min((sw_ - 320) / cw, (sh - 180) / ch)
parts.append(f'<g transform="translate({sx + (sw_ - cw * sc) / 2:.1f},'
             f'{sy + 42:.1f}) scale({sc:.5f})">{body}</g>')
parts.append(txt("AUTHENTIC TAIWANESE BUBBLE TEA   ·   KHULNA", sx + sw_ / 2,
                 sy + sh - 58, 36, SAGE, 500, 0.18, anchor="middle"))

# ----------------------------------------------------- 2. cup
ROW2 = 890
parts.append(sect("CUP & SLEEVE", 100, ROW2 - 32))
cx0, cy0 = 150, ROW2 + 90
g = [f'<g transform="translate({cx0},{cy0})">']
g.append(f'<path d="M 12 62 H 388 L 352 524 A 26 26 0 0 1 326 548 '
         f'H 74 A 26 26 0 0 1 48 524 Z" fill="{BLUSH_SOFT}" '
         f'stroke="{INK}" stroke-width="7"/>')
for px, py, pr in [(120, 505, 24), (182, 518, 20), (240, 505, 22),
                   (296, 516, 18)]:
    g.append(f'<circle cx="{px}" cy="{py}" r="{pr}" fill="{BROWN_SUGAR}"/>')
g.append(f'<path d="M 22.8 200 H 377.2 L 363.2 380 H 36.8 Z" fill="{BLUSH}"/>')
g.append(f'<path d="M 250 44 L 318 -58" stroke="{INK}" stroke-width="26" '
         f'stroke-linecap="round"/>')
g.append(f'<rect x="-6" y="22" width="412" height="44" rx="14" fill="{INK}"/>')
g.append(f'<path d="M 12 62 H 388 L 352 524 A 26 26 0 0 1 326 548 '
         f'H 74 A 26 26 0 0 1 48 524 Z" fill="none" '
         f'stroke="{INK}" stroke-width="7"/>')
g.append("</g>")
parts.append("\n".join(g))
parts.append(place(mark.build(paper=BLUSH, pearl=BROWN_SUGAR, show_ring=False),
                   cx0 + 112, cy0 + 288, 124))
parts.append(txt("BUBBLE", cx0 + 182, cy0 + 278, 38, INK, 600, 0.10))
parts.append(txt("BLUSH", cx0 + 182, cy0 + 326, 38, INK, 600, 0.10))

# ----------------------------------------------------- 3. avatar + favicon
parts.append(sect("AVATAR & FAVICON", 640, ROW2 - 32))
ax, ay = 660, ROW2 + 60
parts.append(f'<circle cx="{ax + 150}" cy="{ay + 150}" r="150" fill="{CREAM}" '
             f'stroke="#E2DACF" stroke-width="3"/>')
parts.append(place(mark.build(paper=CREAM, sw=64, simple_pearls=True,
                              show_ring=False, pearl=BROWN_SUGAR),
                   ax + 150, ay + 150, 188))
for i, d_ in enumerate([96, 56, 32]):
    bx, by = ax + 56 + i * 112, ay + 400
    parts.append(f'<circle cx="{bx}" cy="{by}" r="{d_/2 + 13}" fill="{CREAM}" '
                 f'stroke="#E2DACF" stroke-width="2"/>')
    parts.append(place(mark.build(paper=CREAM, sw=70, simple_pearls=True,
                                  show_ring=False, pearl=BROWN_SUGAR),
                       bx, by, d_))
    parts.append(txt(f"{d_} px", bx, by + d_ / 2 + 46, 23, SAGE, 500,
                     anchor="middle"))

# ----------------------------------------------------- 4. toppings board
parts.append(sect("TOPPINGS BOARD  ·  REVERSED", 1100, ROW2 - 32))
bx0, by0 = 1100, ROW2
BW, BH = 800, 600
parts.append(f'<rect x="{bx0}" y="{by0}" width="{BW}" height="{BH}" rx="24" '
             f'fill="{INK_DEEP}"/>')
parts.append(txt("TOPPINGS", bx0 + BW / 2, by0 + 88, 50, CREAM, 600, 0.16,
                 anchor="middle"))
parts.append(txt("choose any two", bx0 + BW / 2, by0 + 132, 27, BLUSH, 500,
                 0.08, anchor="middle"))
parts.append(f'<rect x="{bx0+100}" y="{by0+162}" width="{BW-200}" height="2" '
             f'fill="#5A8A8E"/>')
TOPPINGS = ["Brown sugar boba", "Crystal boba", "Popping boba", "Grass jelly",
            "Cheese foam", "Taro balls", "Red bean", "Aloe vera",
            "Pudding", "Konjac jelly"]
for i, name in enumerate(TOPPINGS):
    col, row = i % 2, i // 2
    parts.append(txt(name, bx0 + 104 + col * 346, by0 + 224 + row * 74,
                     29, CREAM, 500, 0.02))

# ----------------------------------------------------- 5. contrast test
ROW3 = 1620
parts.append(sect("DOES PASTEL ACTUALLY READ?  ·  the same logo, four inks",
                  100, ROW3 - 32))
tests = [
    ("your current export", "#87AEB3", CREAM, "2.2 : 1", BROWN_SUGAR),
    ("full-strength ink", INK, CREAM, "4.5 : 1", BROWN_SUGAR),
    ("deep ink", INK_DEEP, CREAM, "6.5 : 1", BROWN_SUGAR),
    ("reversed on ink", CREAM, INK_DEEP, "6.5 : 1", BLUSH),
]
for i, (name, fg, bg, ratio, pearl) in enumerate(tests):
    ox = 100 + i * 460
    parts.append(f'<rect x="{ox}" y="{ROW3}" width="430" height="310" '
                 f'rx="20" fill="{bg}" stroke="#E2DACF" stroke-width="2"/>')
    parts.append(place(mark.build(paper=bg, ink=fg, pearl=pearl,
                                  show_ring=False),
                       ox + 215, ROW3 + 108, 152))
    parts.append(txt("BUBBLE BLUSH", ox + 215, ROW3 + 230, 31, fg, 600, 0.10,
                     anchor="middle"))
    parts.append(txt(f"{name}   {ratio}", ox + 215, ROW3 + 276, 23,
                     SAGE if fg != CREAM else BLUSH, 500, anchor="middle"))

write("10-IN-USE", svg(W, H, "\n".join(parts)), png_w=1800)
print("mockups written")
