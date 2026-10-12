# Bubble Blush — brand assets

Authentic Taiwanese-style bubble tea · Khulna

All six directions are built out as complete, finished file sets. Everything
is generated vector artwork and all type is converted to outlines, so no font
needs to be installed anywhere for these files to print correctly. Hand the
`.svg` files to any signboard or cup printer.

---

## Start here

**[`options/11-SIX-DIRECTIONS-FINAL.png`](options/11-SIX-DIRECTIONS-FINAL.png)**
— all six finished logos in one view, each shown standard, reversed,
one-colour and horizontal. Every cell in that sheet is a real exported file,
not a preview.

Supporting sheets:

| File | What it shows |
|---|---|
| `options/00-ALL-OPTIONS.png` | The six marks, each also at 64 px |
| `options/09-PALETTE.png` | Palette with measured contrast |
| `options/10-IN-USE.png` | Signboard, cup, avatar, toppings board |
| `options/12-FONT-LETTERFORM.png` | Why Quicksand: the mark's B against five fonts |
| `options/13-FONT-WEIGHT.png` | Why weight 500: four weights in the lockup |

---

## The six directions

Each folder under `directions/` is a complete, usable set — 48 files.

| Folder | What makes it different |
|---|---|
| `01-refined` | Faithful to your original. Teal pearls, gold collar, full-strength ink |
| `02-brown-sugar` | Pearls in boba brown, so they read as tapioca rather than dots |
| `03-tilted-straw` | Straw leans out. Most obviously a straw |
| `04-teal-blush` | Blush drink inside the teal cup. Name and colour agree |
| `05-signage-solid` | Cup body filled solid, pearls knocked out. Strongest at distance |
| `06-minimal` | Two large pearls, heavier stroke. Best at small sizes |

### What's in each folder

| File | Use |
|---|---|
| `stacked` | Default. Signboard, menu header, posts |
| `horizontal` | Wide spaces: awning, website header, receipt header |
| `stacked-deep`, `horizontal-deep` | Deep ink. More punch on signage |
| `stacked-reversed`, `horizontal-reversed` | Cream on deep ink |
| `stacked-onecolour`, `horizontal-onecolour` | Single ink — stamps, embroidery, one-colour printing |
| `icon` | The B alone, full detail |
| `icon-small` | Simplified. **Use below ~128 px** |
| `icon-onecolour`, `icon-reversed` | Single ink, and cream on deep ink |
| `avatar-square` | Instagram and Facebook profile pictures |

Lockups come as `.svg` plus PNG at 2400 and 800 px. Icons come as `.svg` plus
PNG from 512 down to 32 px. PNGs are transparent except the reversed and
avatar files, which carry their background.

---

## Type

**[Quicksand](https://fonts.google.com/specimen/Quicksand), weight 500**, caps,
10% letter-spacing.

Chosen rather than guessed. The mark is monoline — one stroke weight
throughout — with rounded terminals, and its top bowl is smaller than its
bottom bowl. Quicksand is the only candidate that shares all three
properties; see `options/12-FONT-LETTERFORM.png`. Poppins has flat terminals,
Baloo 2 has modulated stroke weight, Nunito is more humanist than geometric,
and Comfortaa is close but noticeably wider.

Weight was tested at 400, 500, 600 and 700 inside the actual lockup
(`options/13-FONT-WEIGHT.png`). 400 is too weak to carry the name, 700
competes with the mark. 500 keeps the monoline character and sits with it.

**Use weight 600 for small text** — cup sleeves, receipts, anything under
about 14 pt — where 500 starts to thin out. The spacing is baked into the
outlines in `directions/`, so it cannot drift.

---

## Palette

| Role | Hex | Contrast on cream | Use |
|---|---|---|---|
| Ink | `#3F797E` | 4.5 : 1 — safe for text | Logo, body text, menu board, cup print |
| Deep ink | `#2F5F64` | 6.5 : 1 — safe for text | Signage, small text, anywhere needing punch |
| Blush | `#F2B8B5` | 1.6 : 1 — never for text | Sleeves, straws, awning, packaging tape |
| Blush soft | `#F9DCDA` | 1.2 : 1 — never for text | Large fills and backgrounds |
| Brown sugar | `#A87E5A` | 3.3 : 1 — large text only | Pearls, collar, warm accents |
| Gold | `#C2A05A` | — | The collar in `01-refined` only |
| Sage | `#8F9C8B` | 2.6 : 1 — never for text | Supporting only: matcha and green tea items |
| Cream | `#F9F4EF` | — | Paper. The default background |

**Two rules that matter in practice.**

1. **Never print the ink at reduced opacity.** The original logo export had
   every teal element at roughly 45–60% opacity, which rendered as `#87AEB3`
   and measured 2.2 : 1 — unreadable on a menu board or on a phone in
   daylight. Full-strength `#3F797E` measures 4.5 : 1.
2. **Blush and sage are never text colours.** They are accents. All words go
   in ink or deep ink, or reversed in cream on an ink background.

---

## Positioning note

Bubble tea is **Taiwanese** — invented in Taichung in the 1980s, not Chinese.
"Authentic Taiwanese-style" is both accurate and reads more premium. Worth
getting right before it goes on a signboard, since the customers most likely
to become regulars are the ones who already know this.

---

## Regenerating

Artwork is generated from scripts in `src/`, not drawn by hand. The mark's
geometry lives in `src/mark.py`, the palette in `src/brandkit.py`, and the six
direction configs in `src/directions.py`. Changing a stroke weight, pearl
colour or palette value is a one-line edit followed by a re-run.

```sh
pip install fonttools brotli cairosvg pillow
./src/fetch-fonts.sh
cd src
python3 render.py      # option sheets
python3 finalize.py    # wordmarks, lockups, palette
python3 mockups.py     # in-use sheet
python3 directions.py  # all six production packs
python3 verify.py      # rebuild the overview from the real exports
```

`src/fontmatch.py` prints the stem-width measurements behind the type choice.
Output paths inside the scripts are absolute and will need adjusting if the
repository is cloned somewhere else.
