---
name: pax-maxstore-html
description: Extend the PAX MAXSTORE animated HTML deck with user-supplied content while preserving its 16:9 visual system, brand artwork, and slide motion.
---

# Extend the PAX MAXSTORE HTML deck

Open `index.html` from this package. Use the supplied brief or draft as the source for claims, dates, metrics and names. The reference roadmap dates and milestone copy are illustrative. Ask for missing facts or label the gaps as placeholders.

## Build from the slide roles

- **Cover** (`data-slide="cover"`) — use a short two-line title, one supporting sentence and an approved date.
- **Agenda** (`agenda`) — match each row to an actual chapter. Use four concise titles and one short description per row.
- **Chapter** (`chapter`) — state a single chapter theme, department and takeaway. Duplicate this slide when a new section needs a divider.
- **Roadmap** (`roadmap`) — use up to five milestones with a date, title and short outcome. Keep the current marker for the confirmed current milestone. Use planned connectors for future work.
- **Closing** (`closing`) — use one short statement across two lines.

Change text in the `data-slot` elements. For a new slide, duplicate the closest role, give `data-slide` a unique identifier and set its `data-label`. Slide navigation discovers the sections in document order.

For the additional layouts, reuse these existing `data-slide` sections:

- `b01b` for a horizontal agenda, and `b03` for a chapter navigator.
- `c02` for a service portfolio, `c03` for architecture layers, and `c04` for stakeholders.
- `c05-outcomes`, `c05-alternate`, `c05-service`, and `c06` for outcome, device service, and scene-card layouts. Replace sample metrics with confirmed values and retain the units.
- `d01` and `d02` for brand convergence and ecosystem relationships, and `e01` for regional coverage. Verify any location claims against the brief.

The additional layouts use native text and positioned Figma layers on a 1920 × 1080 canvas. Keep related layers together when editing. Decorative 3D imagery is separate from text and from logos.

## Preserve the visual system

Keep the 1920 × 1080 proportions, Poppins hierarchy, black canvas, Azure #2A7DE1, Aqua #72D6F1, grid, glass surfaces and original logo artwork. Keep logos proportional and retain their clear space. Use the existing spacing and type rules. Split content into another slide before reducing type. Keep actual text and lists as HTML.

Reuse the entrance classes, step delays, timeline reveal and reduced-motion behavior. Avoid perpetual motion on the text. Keep the assets folder next to index.html so the deck works offline. Preserve the embedded font license.

## Check the result

Open the output in a browser. Review each slide at 1920 × 1080 and in a narrow viewport. Verify slide order, keyboard navigation, logo and image loading, text overflow, and readable contrast. Check that reduced motion leaves all content visible and that each slide prints in sequence. Return the revised HTML and identify any sample content the user still needs to replace.

Source frames, in deck order: 116:26, 192:135, 192:177, 285:409, 285:494, 141:36, 174:80, 218:242, 184:214, 252:357, 323:759, 323:1031, 359:563, 223:273, 245:309, 323:623, 192:204.
