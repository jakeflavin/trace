# Features

What the app does, and the decisions behind each behavior. Update this file in the same
commit as any change to them.

## The document

`lib/sheet.ts` is the whole schema: a list of words and a dozen choices. Every edit is a
pure function on it, everything read back from storage is sanitised, and both are
unit-tested. There is one sheet, kept under `trace.sheet`; the words box is the library.

**The words box is the bulk import.** One entry a line. A single pasted line with commas
is split on the commas, because that is how a list arrives from a spreadsheet; several
lines are not, because a sentence has commas in it. A text or CSV file appends to the box.
Blanks and repeats are dropped, the list stops at a hundred and a word at sixty
characters, and the box keeps its own text so a blank line being typed does not vanish.

**A layout is per-word or shared.** Seven give every word its own page, which is how one
document is both "my child's name" and "twenty-five names for the class". Four put the
words on the same pages: the list, sentences, cards and lined paper. The picker says which.

**The heading is the word** on a per-word page, "Handwriting" or "Copy the sentence" on
a shared one, or whatever was typed. Name and Date blanks sit in the corner, in the
sheet's own hand, and can be turned off.

## The lines

Every row is a top line, a dashed midline, a baseline and, when asked, a line for the
tails. The letters are sized so a tall letter reaches the top line exactly and the
midline sits at the font's real x-height. That is the one thing a tracing sheet has to
get right, so the shape of each font is **measured on a canvas** once it has loaded
(`lib/metrics.ts`) rather than read from a table: the ascent of `bdhklB`, the ascent of
`xvwzc` and the descent of `gjpqy`. Until the font is in, the layout uses the font's
declared ratios, which are close enough that the first frame does not jump.

Three sizes: the top line is 70, 50 or 34 pixels above the baseline, which is three
quarters of an inch, a half, and a third on paper. Rows are spaced by the cap, the tail
depth and a gap of a third of the cap, never under 16 pixels.

**A word wider than the line shrinks to fit it**, in every layout, down to a floor. A
sentence wraps instead, and one word of it that still will not fit shrinks that line. In
a flash card a sentence wraps onto up to three lines and only shrinks when even that
will not fit. A letter off the page teaches nothing.

## The eleven layouts

| Layout            | Pages    | Rows                                                      |
| ----------------- | -------- | --------------------------------------------------------- |
| Trace the word    | per word | the word repeated across every line                       |
| Trace, then write | per word | copies fill the left half, the right half is empty        |
| Fade away         | per word | solid model, grey, dotted, blank, round again             |
| Letter by letter  | per word | a line for each letter, then lines of the word            |
| Letter boxes      | per word | a box a letter: a solid row, two traced, the rest empty   |
| Big and small     | per word | CAPITALS on one line, lower case on the next              |
| Rainbow writing   | per word | huge hollow letters, up to 2.3× the size, fitted to width |
| Word list         | shared   | a solid model at the left, traced copies after it         |
| Sentences         | shared   | a traced line, then a blank one; the pair never splits    |
| Flash cards       | shared   | eight a page, cut lines dashed; a short list cycles       |
| Lined paper       | shared   | the first word solid at the top, then empty lines         |

A sheet with no words at all is lined paper. Rainbow writing is always hollow whatever
letter style is chosen, because that is what rainbow writing is.

There is no dot for where the pencil starts. A dot that is not on the right stroke of the
right letter teaches the wrong thing, and putting it on the right one means knowing the
stroke order of every letter in three hands, which the app does not.

## Hands

Three fonts in `lib/fonts.ts`, all open and served from the app: Andika for print, with
its single-storey a and g; Edu VIC WA NT Beginner for a foundation hand with entry and
exit strokes; Cedarville Cursive for joined letters. Print hands carry a little extra
letter spacing so traced letters never touch; cursive carries none, since the joins are
the point. Each declares its bold, so a cursive heading is not smeared by a synthetic one.

## Letters

**A letter to be traced is dots along the spine of each stroke**, the way a tracing
font draws them, so a child follows one line rather than the two edges of an outline.
A font only knows its outlines, so each glyph is drawn to a canvas in the sheet's hand,
thinned to a one-pixel skeleton (Zhang–Suen, in `lib/skeleton.ts`), walked into
polylines, pruned of the stubs thinning grows at corners, simplified and smoothed. The
result is kept per font and letter in em units (`lib/glyphs.ts`), so every size is a
scale of the same spine. The regular weight is thinned rather than the bold: the thinner
the ink, the fewer stubs where strokes meet, and the spine is the same either way.
Without a canvas (jsdom) the page falls back to a dashed outline.

Four ways to draw a letter to be traced: dotted and dashed spines, a grey fill to write
over, and a hollow outline. The spine's weight scales with the letter and is clamped so
a tiny word is still crisp and a huge one is not a cartoon. A solid black `ink` letter is
the model and is never a thing to trace. Case can be as typed, Title, lower or UPPER, and
is applied before the words reach the page.

The picker shows each style as it will print, in the chosen hand, on the chosen lines.

## Pages

Letter or A4, both portrait, laid out at 96 pixels to the inch with a half-inch margin.
`@page` follows the choice and sets zero margin; the page has its own. In print every
page is `100vw` by `100vh`, so the layout fills the real paper, and colours are forced
with `print-color-adjust`. The preview shows the first 24 pages, each with its number, and
says how many more will print; every page prints.

The page is an SVG. Its colours (`lib/palette.ts`) are its own custom properties, written
onto each page, so it is white with the same lines in the preview, in the picker
thumbnails and on paper whatever the editor's theme. Three line palettes: blue top and
midline with a red baseline, all grey, or all black.

## The editor

Two columns above 900px, the form at 420px and the pages beside it; below that the pages
are a strip of fixed height above the form, side by side inside it. Light and dark on
`data-theme`, resolved before the first paint by a script in `index.html`, stored under
`trace.theme`. The header shows the page count and Print; help and the theme live in the
footer on a phone.

## Storage

`trace.sheet` and `trace.theme`, prefixed because every app in the set shares one origin.
Nothing else is stored. Nothing leaves the browser.
