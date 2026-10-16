# NCERT 3D development tracker

Updated 16 October 2026. The user authorized GitHub publication in a new repository named upcoming. Originals remain unchanged. This tracker distinguishes a tested interactive prototype from a production anatomical asset.

## Coverage

- 31 supplied chapters / 458 pages passed text extraction and thumbnail readability audit.
- 302 unique numbered figure references indexed, with 21 selected figure records supporting 14 experiences. This is not 302 completed or manually approved diagrams.
- 62 additional provisional 3D candidates, 24 provisional 2D records, 195 still needing suitability/caption review.
- Class XI Chapter 11 was not supplied. Full manual caption, unnumbered-diagram and NEET topic mapping review remains open.

## Current model audit

All fourteen experiences use shared surface-anchored dots, default hidden names, hover/selection emphasis, collision handling, geometry occlusion, smooth camera focus, clear selection, and optional labels. The membrane retains its renderer but uses the same hotspot/camera utilities. The original 86 structure cards and hotspots were audited on 15 October (`artifacts/overhaul-browser-qa.json`). The four new experiences add 69 cards: all were clicked on desktop and at 390x844; all 69 desktop hotspots were clicked in isolation, with rotation where required. New model checks and responsive-layout evidence are in `artifacts/expansion-browser-qa.json`. These are viewport checks, not physical-device certification.

| Model | Supplied academic source | Geometry / interaction changes | Process status | Review status |
|---|---|---|---|---|
| Membrane (6 parts) | XI Ch8 pp93-94 Fig8.4 | Shared dots, focus, mobile card, clear/reset; instanced bilayer | User-controlled illustrative protein movement | Figure labels inspected; schematic |
| Heart (18 parts) | XI Ch15 p198 Fig15.2; pp199-202; RBC shape p194 | Continuous exterior ventricular envelope; separate internal cavities; open vessel rims and smooth half-lumens; view fades; source-linked selection | 10 circulation stages, 5 cardiac phases, gated cell markers, speed/pause/restart, selected chamber flow shortcut, separate outside-heart map | Topology and sources checked; sculpted surface, detailed valve mechanics and independent editorial review still pending |
| Mitochondrion (5 parts) | XI Ch8 p97 Fig8.7 | Rounded envelope, curved rear-half folds, cutaway, correct surface-dot anchoring | Static structural guides | Source visually inspected; fold geometry remains illustrative |
| Chloroplast (6 parts) | XI Ch8 p98 Fig8.8 | Envelope, stacks, connecting sheets; cutaway and selectable layers | Static structural guides | Source visually inspected; stack number/depth illustrative |
| Nephron (10 parts) | XI Ch16 pp207-209 Fig16.3 | Continuous coiled tubules, glomerular tuft, separate blood pathway; capsule cutaway | Six directed filtrate stages with play/pause/restart/speed/visibility | Source checked; no quantitative reabsorption simulation |
| Neuron (10 parts) | XI Ch18 pp231-233 Fig18.1 | Branching dendrites, soma, myelin/nodes, terminal branches; reduced geometry load | Three impulse-direction stages | Direction markers, not travelling material; source checked |
| DNA (6 parts) | XII Ch5 pp81-82 Figs5.2-5.3 | Right-handed helix, base pairs/bonds, polarity; optimized tubes | Static structural guides | Chirality/antipodality tested; example sequence illustrative |
| Dicot leaf (9 parts) | XI Ch6 pp76-77 Fig6.5(a) | Sectional cell layers, vascular bundle, stoma; instanced surfaces; repaired palisade/xylem anchors | Static structural guides | Sectional extrusion; full external leaf not implemented |
| Respiration (9 parts) | XI Ch14 p184 Fig14.1; p186 Fig14.2 | Airways, lung section, alveolar branches, diaphragm; selecting pleura opens exterior | Inspiration/expiration, reversed direction, play/pause/restart/speed | Rib/intercostal movement and gas kinetics not implemented |
| Flower (7 parts) | XII Ch1 p4 Fig1.1 | Sectional petals/sepals, filaments/anthers, stigma/style/ovary | Static structural guides | Part counts and depth illustrative; no fertilisation simulation |
| Plant cell (18 parts) | XI Ch8 p92 Fig8.3(a), pp95-96 | Nested wall/membrane cutaway; large vacuole, plastids, nucleus/nucleolus, ER/Golgi, ribosomes and other figure labels | Static structural guides | Every label in the supplied plant-cell figure represented; organelle positions/counts and depth illustrative |
| Animal cell (14 parts) | XI Ch8 p92 Fig8.3(b), pp95-96 | Ellipsoidal cutaway, paired centrioles, surface microvilli and shared organelles | Static structural guides | Models the particular source diagram; microvilli/shape not universal claims about animal cells |
| Skeletal framework (30 groups) | XI Ch17 pp224-227 Figs17.6-17.10 | Skull/mandible/hyoid, spine, true/false/floating ribs, girdles and limbs; shoulder/knee location markers; close inspection | Static structural guides | Actual vertebral/rib/hand/foot geometry counts tested; skull grouped, ear ossicles not separately modelled; not a 206-part atlas |
| Sarcomere (7 parts) | XI Ch17 p220 Fig17.2; p223 Fig17.5 | Fixed-length thick/thin filaments, moving Z lines; A/I/H region guides | Four stages, play/pause/restart/speed; A band constant, I/H reduced, relaxation | Geometry invariants tested; optical bands are guides, not extra structures; cross-bridge/ATP chemistry not simulated |

The common viewer now has structure search, explanations above the structure list, immediate mobile card scrolling, moving-surface hotspot tracking and viewport-aware specimen framing. Selecting a hidden sarcomere band restores its guide. Reset clears structure search. The new framing test checks all generic models at desktop and phone canvas proportions.

## Reference reinspection

The live Anatomy Atelier heart and lungs were inspected again, including an actual right-atrium hotspot card, auto-rotation toggle and cross-section toggle with visible clipping. Its detailed sculpted/textured GLB geometry remains materially more detailed than our procedural specimens. Cross-section there clips a surface; its presence does not establish NCERT internal anatomy. Repository implementation was inspected beyond README. No explicit license grant was found in the inspected checkout, and no reference code or meshes are reused.

## Verification

- 21 targeted tests pass: supplied sources, scoring/storage, finite geometry, source-page integration, DNA chirality, heart directed order, spatial endpoint continuity, cardiac flow gating, required-view geometry, plant/animal distinctions, skeletal geometry counts, sliding-filament length invariants desktop/mobile framing and portable deployment URLs.
- Production build/typecheck pass; rerun after any future edits.
- Original 86 structures retain the prior browser audit. All 69 new structure cards tested at desktop and mobile viewport widths; all 69 new desktop hotspots clicked individually, including occluded structures exposed through isolation/rotation. Representative mobile dots were clicked for all four new models.
- Heart's 10 flow stages and 5 cardiac phases checked in the browser. Internal cell routes do not render external orbit arrows; outside-heart legs appear in a separate simplified map.
- Nephron, neuron and respiratory manual stages, speed, play/pause, restart and arrow visibility checked. Leaf original-PDF fallback disposes WebGL, returns to 3D and navigates to the correct supplied p76/PDF6.
- Original PDF hashes verified unchanged (31 files).
- Screenshots in `artifacts/screenshots/` are actual browser captures. Older screenshots predate this overhaul; use filenames containing `hotspots`, `mobile`, or `heart-exterior` for the new UI.
- CPU submission counters and occasional browser frame counts are diagnostic, not a hardware benchmark. Physical touch gestures, broad GPU/mobile-device performance and full accessibility audits remain open.

## Remaining production work

1. Original sculpted heart geometry and a carefully reconciled cutaway, detailed valve surfaces, source-reviewed camera framing from every angle, and independent academic/editorial validation. Current models do not yet match the reference's surface-detail quality. Ambient-occlusion postprocessing is not implemented; lighting currently uses studio lights and cached soft shadow maps.
2. More detailed, independently reviewed skeletal anatomy: individual cranial/facial bones and ear ossicles; source-supported joint movement. The current framework deliberately groups structures and does not claim all 206 bones.
3. Additional figures: nucleus/ER/Golgi detail views, cross-bridge chemistry, root/stem, more Class XII systems and processes. Cell organelles and sarcomere sliding now exist; remaining inventory entries are not completed models.
4. Full manual diagram/caption audit, unnumbered illustrations and complete NEET topic mapping; expand page-specific practice beyond the membrane section.
5. Physical-device gesture/performance verification and independent review of every anatomical arrangement and process transition.

## Tools and rights

Blender was not found in the inspected installed-software locations; no installation was performed. An original Blender sculpt or a suitably licensed asset with NCERT-only structures would improve the remaining anatomical surface work. The user subsequently requested public GitHub Pages sharing with the supplied textbook PDFs visible. Portable copies now live in public/textbooks; GitHub publication status is recorded below.

## GitHub sharing preparation — 16 October

- Removed the custom local PDF middleware and dependency on the Codex PDF.js runtime. PDF.js is a locked project dependency.
- Packaged all 31 PDFs in public/textbooks and changed chapter file metadata to portable paths. Original filenames remain provenance only.
- Relative app, worker and textbook URLs work under the repository subpath. Added a deployment-path regression test and hash verification for the hosted PDFs.
- Added a GitHub Pages workflow with locked installation, PDF hash checks, tests, build and deployment. No database or spreadsheet is required; user progress remains browser-local.
- Public repository created: https://github.com/dipakdhurve9975-lgtm/upcoming . The initial GitHub Actions build, source-hash verification, 21 tests and Pages deployment succeeded. Live site: https://dipakdhurve9975-lgtm.github.io/upcoming/ .
- PDF.js updated to 6.4.299; dependency audit reports zero vulnerabilities. Font, CMap, colour-profile and image-decoder resources are generated from the locked dependency for complete static serving. Browser production preview verified notes and animated 3D under /upcoming/.
