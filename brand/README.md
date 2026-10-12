# Bubble Blush — brand assets

Authentic Taiwanese-style bubble tea · Khulna

Everything here is generated vector artwork. All type is converted to
outlines, so no font needs to be installed anywhere for these files to print
correctly. Hand the `.svg` files to any signboard or cup printer.

---

## Decide first

`options/` holds the directions to choose between. Look at these before
anything gets printed:

| File | What it shows |
|---|---|
| `options/00-ALL-OPTIONS.png` | Six versions of the mark, each also shown at 64 px |
| `options/07-WORDMARKS.png` | The name in six fonts |
| `options/08-LOCKUPS.png` | Four complete logos, mark + wordmark together |
| `options/09-PALETTE.png` | The palette with measured contrast |
| `options/10-IN-USE.png` | Signboard, cup, avatar, toppings board, contrast test |

The finished files in `logo/` and `icon/` are built from **direction A**
(brown sugar pearls + Quicksand caps). If a different direction is chosen,
they get regenerated.

---

## Palette

| Role | Hex | Contrast on cream | Use |
|---|---|---|---|
| Ink | `#3F797E` | 4.5 : 1 — safe for text | Logo, body text, menu board, cup print |
| Deep ink | `#2F5F64` | 6.5 : 1 — safe for text | Signage, small text, anywhere needing punch |
| Blush | `#F2B8B5` | 1.6 : 1 — never for text | Sleeves, straws, awning, packaging tape |
| Blush soft | `#F9DCDA` | 1.2 : 1 — never for text | Large fills and backgrounds |
| Brown sugar | `#A87E5A` | 3.3 : 1 — large text only | Pearls, lid collar, warm accents |
| Sage | `#8F9C8B` | 2.6 : 1 — never for text | Supporting only: matcha and green tea items |
| Cream | `#F9F4EF` | — | Paper. The default background |

**Two rules that matter in practice.**

1. **Never print the ink at reduced opacity.** The original logo export had
   every teal element sitting at roughly 45–60% opacity, which rendered as
   `#87AEB3` and measured 2.2 : 1 — unreadable on a menu board or on a phone
   in daylight. Full-strength `#3F797E` measures 4.5 : 1.
2. **Blush and sage are never text colours.** They are accents. All words go
   in ink or deep ink, or reversed in cream on an ink background.

---

## Type

[Quicksand](https://fonts.google.com/specimen/Quicksand) — SemiBold (600) for
the wordmark and headings, Medium (500) for body. Free, open licence.

The wordmark is set in caps at 10% letter-spacing. That spacing is baked into
the outlines in `logo/`, so it cannot drift.

---

## Files

### `logo/` — mark and wordmark together

| File | Use |
|---|---|
| `stacked` | Default. Signboard, menu header, posts |
| `horizontal` | Wide spaces: awning, website header, receipt header |
| `stacked-deep` / `horizontal-deep` | Same, in deep ink, for signage |
| `stacked-reversed` / `horizontal-reversed` | Cream on deep ink |
| `stacked-onecolour` / `horizontal-onecolour` | Single ink, no brown — stamps, embroidery, one-colour printing |

### `icon/` — the B on its own

| File | Use |
|---|---|
| `icon` | General use, full detail |
| `icon-small` | Simplified: two pearls, heavier stroke. **Use this below ~128 px** |
| `avatar-square` | Instagram and Facebook profile pictures |
| `icon-reversed` | Cream on deep ink |
| `icon-onecolour` | Single ink |

Each comes as `.svg` plus `.png` at several widths. PNGs are transparent
except the reversed and avatar files, which carry their background.

---

## Positioning note

Bubble tea is **Taiwanese** — invented in Taichung in the 1980s, not Chinese.
"Authentic Taiwanese-style" is both accurate and reads more premium. Worth
getting right before it goes on a signboard, since the customers most likely
to become regulars are the ones who already know this.

---

## Regenerating

Artwork is generated from scripts, not drawn by hand. The mark's geometry
lives in `mark.py` and the palette in `brandkit.py`. Changing the stroke
weight, pearl colour, or palette means editing one value and re-running,
rather than redrawing anything.

The generators live in `brand/src/`. To run them:

```sh
pip install fonttools brotli cairosvg
./brand/src/fetch-fonts.sh
cd brand/src && python3 render.py && python3 finalize.py \
  && python3 mockups.py && python3 pack.py
```

Output paths inside the scripts are absolute and will need adjusting if the
repository is cloned somewhere else.
