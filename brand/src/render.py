"""Render the variant options plus comparison sheets."""
import os
import cairosvg
import brandkit as bk
from brandkit import INK, INK_DEEP, BLUSH, BLUSH_SOFT, BROWN_SUGAR, SAGE, CREAM, WHITE
import mark

OUT = "/projects/sandbox/bubble-blush/brand/options"
os.makedirs(OUT, exist_ok=True)

# tight bounding box of the mark inside its 1000x1000 space
BB = (292.0, 96.0, 674.0, 832.0)
BB_W = BB[2] - BB[0]
BB_H = BB[3] - BB[1]


def place(frag, cx, cy, target_h):
    """Scale a mark fragment to target_h and centre it on (cx, cy)."""
    s = target_h / BB_H
    tx = cx - (BB[0] + BB_W / 2) * s
    ty = cy - (BB[1] + BB_H / 2) * s
    return f'<g transform="translate({tx:.2f},{ty:.2f}) scale({s:.5f})">\n{frag}\n</g>'


def svg(w, h, body, bg=CREAM):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">\n'
            f'<rect width="{w}" height="{h}" fill="{bg}"/>\n{body}\n</svg>')


def label(text, x, y, size, color=INK, font="Quicksand-var.ttf", weight=600,
          tracking=0.0, anchor="middle"):
    d, wid = bk.text_to_path(text, font, size, weight, tracking=tracking,
                             word_space=0.05)
    if anchor == "middle":
        x -= wid / 2
    elif anchor == "end":
        x -= wid
    return f'<g transform="translate({x:.2f},{y:.2f})"><path d="{d}" fill="{color}"/></g>', wid


def write(name, svg_text, png_w=None):
    sp = os.path.join(OUT, name + ".svg")
    with open(sp, "w") as f:
        f.write(svg_text)
    pp = os.path.join(OUT, name + ".png")
    kw = {"output_width": png_w} if png_w else {}
    cairosvg.svg2png(bytestring=svg_text.encode(), write_to=pp, **kw)
    return sp, pp


# ---------------------------------------------------------------- 1. each variant on its own
for key, spec in mark.VARIANTS.items():
    frag = mark.build(**spec["kw"])
    body = place(frag, 500, 470, 620)
    lab, _ = label(spec["label"].upper(), 500, 900, 46, INK, tracking=0.08)
    write(key, svg(1000, 1000, body + "\n" + lab), png_w=900)

# ---------------------------------------------------------------- 2. contact sheet
CW, CH = 660, 820
COLS, ROWS = 3, 2
PAD_TOP = 190
W = CW * COLS
H = PAD_TOP + CH * ROWS

parts = []
t, _ = label("BUBBLE BLUSH", W / 2, 96, 72, INK, tracking=0.10)
parts.append(t)
s, _ = label("six directions  ·  same bones  ·  pick one", W / 2, 150, 34,
             SAGE, weight=500, tracking=0.06)
parts.append(s)

for i, (key, spec) in enumerate(mark.VARIANTS.items()):
    col, row = i % COLS, i // COLS
    ox, oy = col * CW, PAD_TOP + row * CH
    parts.append(f'<rect x="{ox + 20}" y="{oy + 16}" width="{CW - 40}" '
                 f'height="{CH - 40}" rx="28" fill="{WHITE}" '
                 f'stroke="#E4DED6" stroke-width="2"/>')
    frag = mark.build(**spec["kw"], paper=WHITE)
    # large
    parts.append(place(frag, ox + CW / 2 - 55, oy + 300, 420))
    # small, to test legibility at avatar size
    parts.append(place(frag, ox + CW - 135, oy + 455, 64))
    parts.append(f'<rect x="{ox + CW - 178}" y="{oy + 492}" width="86" '
                 f'height="2" fill="#D9D2C8"/>')
    sm, _ = label("64 px", ox + CW - 135, oy + 524, 22, SAGE, weight=500)
    parts.append(sm)

    n, _ = label(f"{i + 1}.  {spec['label'].upper()}", ox + CW / 2, oy + 600,
                 34, INK, tracking=0.06)
    parts.append(n)
    # wrap the note
    words, lines, cur = spec["note"].split(), [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if len(trial) > 38:
            lines.append(cur)
            cur = wd
        else:
            cur = trial
    lines.append(cur)
    for j, ln in enumerate(lines[:4]):
        nl, _ = label(ln, ox + CW / 2, oy + 648 + j * 38, 26, "#7C8A86",
                      weight=500)
        parts.append(nl)

write("00-ALL-OPTIONS", svg(W, H, "\n".join(parts)), png_w=1800)
print("variants + contact sheet written")
