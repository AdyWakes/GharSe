# GharSe pitch deck

Hackathon submission deck for Tech4Bharat, GAVS 2026 (Agentic AI track, problem 6.3).

| File | What it is |
|---|---|
| `GharSe_Pitch.pptx` | Editable deck, 16:9, 11 slides, speaker notes on every slide |
| `GharSe_Pitch.pdf` | PDF export with fonts embedded. Use this one for submission |
| `png/slide-NN.png` | Low-res previews of each slide |
| `build/build.js` | Generator (pptxgenjs). Edit content here, not in PowerPoint, so rebuilds stay in sync |
| `fonts/` | DM Serif Display (headings) and Inter (body), both SIL Open Font License |

## Fonts

The .pptx refers to the fonts **DM Serif Display** and **Inter** by name. Install the files in
`fonts/` before opening or presenting the .pptx. Without them PowerPoint substitutes a default
font and line breaks will shift. The PDF already embeds both fonts and looks the same everywhere.

## Rebuild

```bash
cd deck/build
npm install
./render.sh            # builds the .pptx, exports the PDF, writes png/ previews
```

`render.sh` needs LibreOffice (`soffice`) and poppler (`pdftoppm`), with the two fonts installed
(e.g. copy `fonts/*` to `~/.fonts` and run `fc-cache -f`).

## Placeholders to fill

Search the deck for `[`:

- Slide 1: `[Team name]`, `[Founder names]`
- Slide 8: `[₹__/month]` seller plan price
- Slide 10: `[to add]` interview findings, `[__]` pilot seller count (twice: roadmap card and success metric)
- Slide 11: `[email]`, `[GitHub repo link]`

## Sources for slide 3

- 25 lakh unregistered units, 98% of the sector, 66% rural, 80% family-based: Cabinet approval of the
  PMFME scheme, 20 May 2020,
  <https://www.pmindia.gov.in/en/news_updates/cabinet-approves-scheme-for-formalisation-of-micro-food-processing-enterprises-fme/>.
  A later parliamentary reply attributes the estimate to NSSO 73rd round and ASI 2015-16, so it is an
  older estimate, not a current census.
- 1.96 lakh enterprises supported: MoFPI media briefing, May 2026, as reported by KNN India,
  <https://knnindia.co.in/news/newsdetails/sectors/over-196-lakh-micro-food-enterprises-benefit-under-pmfme-scheme-mofpi>.
  We have not found the ministry's own press release yet.

Slide 9 ("FSSAI simplified registration in 2026") relies on secondary reports of the FSSAI
implementation order of 13 March 2026. Verify against the official order before the finale.
