# NCERT 3D — Biology learning workspace

Interactive NCERT reading, 3D explanations and source-linked practice, built with React, TypeScript and Three.js.

## Open the website

GitHub Pages publishes this repository at https://dipakdhurve9975-lgtm.github.io/upcoming/ after the **Publish NCERT 3D** workflow succeeds. Share the website link to let someone use the app; the repository link shows its source code.

The website includes all 31 supplied chapter PDFs (458 pages). Textbooks, app assets and the PDF worker use portable URLs, so visitors do not need the creator's computer or files. Only the selected chapter is requested. Reading progress, bookmarks, theme and practice attempts are saved in each visitor's browser; there is no shared account or database.

## Run or build anywhere

Use Node.js 22.13 or newer, then:

```sh
npm ci
npm run dev
```

```sh
npm run verify:books
npm test
npm run build
npm run preview
```

The production output is `dist/`. It contains the app and PDFs and can be served by an ordinary static host. No custom API, Python runtime, Windows paths, local spreadsheet, Codex runtime or environment secret is needed. Relative URLs support repository subpaths such as `/upcoming/`.

## Experiences

Fourteen experiences with 155 selectable structures: membrane; plant cell; animal cell; skeletal framework; sarcomere; heart/double circulation; mitochondrion; chloroplast; nephron; neuron; dicot leaf section; respiratory system; DNA double helix; flower section.

Structure hotspots, explanations, source-page references, optional labels, isolation, camera controls, viewport-aware framing and original-PDF views support inspection. Heart circulation and cardiac phases, sarcomere sliding, nephron filtrate direction, impulse direction and breathing have qualitative playback controls. Structure search and mobile information cards are available in the common viewer.

Eight original NCERT-based practice questions currently cover Chapter 8 pp. 93–94. Other pages show an explicit empty practice state. Revealing an answer does not award a score.

## Sources and limits

The PDFs in `public/textbooks/` are byte-for-byte copies of the supplied textbooks. `src/content/library.json` maps each chapter, printed page, PDF page and source hash. `npm run verify:books` checks all 31 files. Original filename metadata is provenance, not a runtime filesystem dependency. All academic labels and explanations derive from those supplied PDFs; no outside academic notes were imported.

Models are educational schematics, with illustrative colour, proportions, organelle counts, depths and animation timing. They are not expert-certified anatomical assets. The skeleton uses 30 selectable groups rather than 206 individually modelled bones. Detailed heart sculpting/valve mechanics, additional figures and independent academic review remain open. Class XI Chapter 11 was not supplied. Full current NEET syllabus mapping remains pending.

`NCERT_3D_PROGRESS.md` records coverage and remaining work. `ncert-3d-inventory.json` indexes 302 numbered figure references; it does not claim 302 completed diagrams. Historical research/audit documents describe earlier local-only versions.

## Deployment

`.github/workflows/pages.yml` installs locked dependencies, verifies all PDFs, runs tests, builds the static site and deploys it through GitHub Pages. Enable **GitHub Actions** as the Pages publishing source. Pushing `main` republishes the site. No personal access token belongs in the repository or frontend.

## Code

- `src/components/Reader.tsx`: PDF.js rendering, page text, zoom and original-PDF links.
- `src/content/`: chapter metadata, model structures, explanations, guided stages and practice questions.
- `src/viewer/`: original Three.js geometry, shared interaction/rendering, hotspots, camera fitting and process animations.
- `src/lib/`: browser progress and portable textbook URL handling.
- `public/textbooks/`: supplied textbook PDFs, included in the deployed site.
- `tests/`: data/source, scoring, geometry, biological invariants, framing and deployment-path checks.

No reference repository code or GLB models were reused. Source textbook rights remain with their respective owners; this repository does not grant a separate license to those materials.
