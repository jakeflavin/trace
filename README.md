# Trace

Handwriting worksheets you print. Type a word, and a child traces it.

Live at <https://portfolio-4b9fe.web.app/trace/>, as part of
[the portfolio](https://github.com/jakeflavin/portfolio).

## What it is

A parent or a teacher types a word, usually a name, picks a layout, and prints. The child
gets a sheet of dotted letters on handwriting lines to write over. The app keeps nothing
and asks for nothing.

**Eleven layouts.** The word over and over; trace then write; a fade from a solid model to
nothing; one line per letter; letter boxes; capitals and lower case; huge hollow letters for
rainbow writing; a word list; sentences with a blank line under each; flash cards to cut
out; and plain lined paper with a model at the top. Each layout in the picker is drawn from
the words in the box, so the thumbnails are the actual pages.

**Three hands.** Plain print, a foundation hand with entry and exit strokes, and joined
cursive. Each is an open font served from the app, measured in the browser so a tall letter
lands exactly on the top line and a small one on the dashed midline.

**A whole class at once.** Paste a list, one name a line, or import a text or CSV file. A
per-word layout makes a sheet for every name; the list, cards and sentence layouts put them
together. Print sends every page at once.

**Letters a child can follow.** Traced letters are dots or dashes along the spine of
each stroke, found by thinning the font's own glyphs in the browser, so they read like a
tracing font in every hand rather than a dashed outline.

**Letter, or A4.** Dotted, dashed, grey or hollow letters. Three sizes. Blue-and-red, grey or
black lines, a dashed midline, a line for the tails, a
heading, and Name and Date blanks in the corner.

It stores the sheet in the browser and nowhere else. No account, no server.

## Running it

```bash
npm install
npm run dev
```

`npm test`, `npm run lint` and `npm run typecheck` are what CI runs before a release.
`npm run icons` regenerates the favicon and home-screen PNGs.

## Credits

Type is [Andika](https://software.sil.org/andika/) by SIL,
[Edu VIC WA NT Beginner](https://fonts.google.com/specimen/Edu+VIC+WA+NT+Beginner) and
[Cedarville Cursive](https://fonts.google.com/specimen/Cedarville+Cursive), all under the
SIL Open Font License and served from the app.
