# Bubble Blush — the final three

Six directions were built out. Three survived. **Pick one of these three.**

**[`00-PICK-ONE.png`](00-PICK-ONE.png)** — all three side by side, each shown
standard, reversed, one-colour, at actual 96 px, and as an avatar. Every cell
in that sheet is a real exported file, not a preview.

---

## 1. Teal + blush — `01-teal-blush/` ← recommended

**The name and the colour finally agree.**

- Blush drink inside a teal cup, so "Blush" becomes something a customer can
  see instead of a word that has to be explained.
- Pearls in boba brown read as tapioca rather than abstract dots.
- The most ownable of the three. A teal-and-blush mark is unlikely to collide
  with another bubble tea shop in Khulna.

**Trade-off:** three colours in the artwork, so screen printing on cups and
sleeves costs slightly more than a two-colour mark.

## 2. Brown sugar pearls — `02-brown-sugar/`

**Your original logo, corrected. The safe choice.**

- Closest to the logo you already have — nothing about the brand has to be
  relearned, and anything already printed stays on-brand.
- Fixes the real defect in the original export: that file sat at roughly
  45–60% opacity, which rendered as `#87AEB3` and measured 2.2 : 1 contrast —
  unreadable on a menu board in daylight. Full-strength `#3F797E` measures
  4.5 : 1.
- Two colours only, so it is the cheapest of the three to print.

**Trade-off:** less distinctive than pick 1. A well-built mark rather than a
memorable one.

## 3. Minimal icon — `03-minimal/`

**The one that survives being small.**

- Two large pearls and a heavier stroke, so it still reads at 32 px — favicon,
  WhatsApp avatar, a stamp on a loyalty card.
- No lid ring to clog up when embroidered or foil-stamped.
- Fewest parts, so it is the quickest for a local signboard painter to
  reproduce by hand.

**Trade-off:** gives up the lid and collar detail, so at signboard size it
looks plainer than picks 1 and 2.

---

## Why the other three were cut

| Direction | Why it did not make the cut |
|---|---|
| `01-refined` | The gold collar adds a third colour that earns nothing, and teal pearls in a teal cup read as abstract dots rather than tapioca. Pick 2 is the same idea done better |
| `03-tilted-straw` | The leaning straw crosses the bowl and crowds the counter of the B. It fixes a problem — B reading as H — that the upright versions do not actually have |
| `05-signage-solid` | Filling the cup solid kills the drink. The straw and knocked-out pearls read as an exclamation mark over three dots, not as bubble tea |

---

## What is in each folder

48 files per folder — identical structure, so you can swap your choice later
without relearning the filenames.

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

**The `.svg` is the master.** Type is already converted to outlines, so no
font needs to be installed anywhere and these files print correctly from any
shop. Hand the `.svg` to any signboard or cup printer.

PNGs are provided for convenience at 2000 and 800 px for lockups, and 512 down
to 32 px for icons. Every raster in this repository is capped at 2000 px on its
longest edge; print anything larger from the `.svg`, which has no resolution
limit. PNGs are transparent except the reversed and avatar files, which carry
their background.

---

## Once you have chosen

Tell me the number and I will promote that folder to `brand/logo/`, make it the
default across the repo, and retire the rest. Type and palette are unchanged
across all three — Quicksand 500 and the same ink, so the decision is only
about the mark.

Regenerate this folder with `cd brand/src && python3 final3.py`.
