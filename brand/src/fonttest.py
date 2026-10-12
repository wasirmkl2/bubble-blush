"""Two tests: which font's letterform matches the mark, and at what weight."""
import cairosvg
import brandkit as bk
from brandkit import INK, BROWN_SUGAR, SAGE, CREAM, WHITE
import mark
from render import place, svg
from finalize import stacked, sized_for_cap

OUT = "/projects/sandbox/bubble-blush/brand/_tests"
import os
os.makedirs(OUT, exist_ok=True)


def txt(text, x, y, size, color, weight=600, tracking=0.0,
        font="Quicksand-var.ttf", anchor="start"):
    d, w = bk.text_to_path(text, font, size, weight, tracking=tracking,
                           word_space=0.06)
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    return f'<g transform="translate({x:.2f},{y:.2f})"><path d="{d}" fill="{color}"/></g>'


# ---------- test 1: does the font's B match the mark's B? ----------
CANDIDATES = [
    ("Quicksand 500", "Quicksand-var.ttf", 500),
    ("Comfortaa 600", "Comfortaa-var.ttf", 600),
    ("Poppins SemiBold", "Poppins-SemiBold.ttf", None),
    ("Nunito 600", "Nunito-var.ttf", 600),
    ("Baloo 2 600", "Baloo2-var.ttf", 600),
]
CW, H0 = 330, 150
W = CW * (len(CANDIDATES) + 1)
H = 560
parts = [txt("letterform match: the mark's B against each font's B",
             W / 2, 70, 34, INK, 600, 0.03, anchor="middle")]
# the mark itself
parts.append(f'<rect x="20" y="{H0}" width="{CW-40}" height="340" rx="20" '
             f'fill="{WHITE}" stroke="{BROWN_SUGAR}" stroke-width="3"/>')
parts.append(place(mark.build(paper=WHITE, pearl=BROWN_SUGAR, show_ring=False),
                   CW / 2, H0 + 150, 230))
parts.append(txt("THE MARK", CW / 2, H0 + 390, 26, BROWN_SUGAR, 600, 0.06,
                 anchor="middle"))
for i, (name, fn, wt) in enumerate(CANDIDATES):
    ox = CW * (i + 1)
    parts.append(f'<rect x="{ox+20}" y="{H0}" width="{CW-40}" height="340" '
                 f'rx="20" fill="{WHITE}" stroke="#E8E2DA" stroke-width="2"/>')
    size = sized_for_cap(fn, wt, 190)
    d, wid = bk.text_to_path("B", fn, size, wt)
    parts.append(f'<g transform="translate({ox + CW/2 - wid/2:.1f},'
                 f'{H0 + 265:.1f})"><path d="{d}" fill="{INK}"/></g>')
    parts.append(txt(name, ox + CW / 2, H0 + 390, 26, SAGE, 500,
                     anchor="middle"))
s = svg(W, H, "\n".join(parts))
open(f"{OUT}/font-letterform.svg", "w").write(s)
cairosvg.svg2png(bytestring=s.encode(), write_to=f"{OUT}/font-letterform.png",
                 output_width=1700)

# ---------- test 2: wordmark weight inside the lockup ----------
WEIGHTS = [400, 500, 600, 700]
CW2, H02 = 560, 150
W2 = CW2 * len(WEIGHTS)
H2 = 980
parts = [txt("wordmark weight: which sits with the mark?", W2 / 2, 70, 34,
             INK, 600, 0.03, anchor="middle")]
for i, wt in enumerate(WEIGHTS):
    ox = CW2 * i
    parts.append(f'<rect x="{ox+20}" y="{H02}" width="{CW2-40}" height="700" '
                 f'rx="22" fill="{WHITE}" stroke="#E8E2DA" stroke-width="2"/>')
    body, cw, ch = stacked(dict(pearl=BROWN_SUGAR, show_ring=True),
                           "Quicksand-var.ttf", wt, "BUBBLE BLUSH", 0.10,
                           cap=92, mark_h=600, paper=WHITE)
    sc = min((CW2 - 120) / cw, 600 / ch)
    parts.append(f'<g transform="translate({ox + (CW2 - cw*sc)/2:.1f},'
                 f'{H02 + 50:.1f}) scale({sc:.5f})">{body}</g>')
    stem = bk.text_to_path("I", "Quicksand-var.ttf", 100, wt)
    parts.append(txt(f"weight {wt}", ox + CW2 / 2, H02 + 760, 30, SAGE, 500,
                     anchor="middle"))
s = svg(W2, H2, "\n".join(parts))
open(f"{OUT}/font-weight.svg", "w").write(s)
cairosvg.svg2png(bytestring=s.encode(), write_to=f"{OUT}/font-weight.png",
                 output_width=1700)
print("tests written")
