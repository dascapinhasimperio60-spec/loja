---
name: Império das Capinhas
description: A phone-accessories box lit at night; black display wall, graphite slatwall, LED light, yellow acrylic plaques.
colors:
  ink: "#0b0b0c"
  panel: "#131315"
  panel-2: "#1b1b1e"
  panel-3: "#252529"
  groove: "#060607"
  led: "#f6f4ec"
  muted: "#a3a29b"
  faint: "#6f6e69"
  sign: "#ffcc29"
  sign-deep: "#e6b012"
  sign-off: "#2e2810"
  on-sign: "#0b0b0c"
  danger: "#ff6b5e"
  ok: "#7fdc9a"
typography:
  sign:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 10vw, 9rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 125"
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5.4vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 125"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.025em"
    fontVariation: "\"wdth\" 125"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 3.1rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "\"wdth\" 112"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    fontVariation: "\"wdth\" 100"
  card-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 900
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 112"
  action:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 900
    fontVariation: "\"wdth\" 112"
  led:
    fontFamily: "Doto, ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 900
    letterSpacing: "0.12em"
rounded:
  tag: "0.5rem"
  plaque: "0.55rem"
  field: "0.75rem"
  card: "1.1rem"
  wall: "1.5rem"
  block: "1.75rem"
  pill: "999px"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "40px"
  container: "1400px"
  slat: "64px"
  section: "7rem"
  section-lg: "10rem"
components:
  button-primary:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.on-sign}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 24px"
  button-light:
    backgroundColor: "{colors.led}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 24px"
  button-ghost:
    textColor: "{colors.led}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  tab-pill:
    textColor: "{colors.led}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  tab-pill-selected:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.on-sign}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  price-plaque:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.on-sign}"
    rounded: "{rounded.plaque}"
    padding: "8px 12px"
  model-tag:
    backgroundColor: "{colors.panel-3}"
    textColor: "{colors.led}"
    rounded: "{rounded.tag}"
    padding: "8px 14px 8px 15px"
  product-hang:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.led}"
    typography: "{typography.card-title}"
    rounded: "{rounded.card}"
  input-search:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.led}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 16px 0 48px"
  input-field:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.led}"
    rounded: "{rounded.field}"
    height: "48px"
    padding: "0 16px"
---

# Design System: Império das Capinhas

## Overview

**Creative North Star: "The Box Lit at Night"**

The site is the store's box after dark: a black display wall, a graphite slatwall with fine grooves, an LED strip burning over every shelf, and yellow acrylic plaques hung on metal hooks. Every surface is a physical fixture of that box rebuilt in CSS and SVG, not a generic marketplace grid. The storefront lightbox (yellow acrylic, black lettering with a white outline, the white brand band) opens the page because it is the identity customers already know from the street and Instagram.

Density is retail, not editorial: product cells sit two-up on phones and three to four-up on desktop, but each hangs on its own hook under its own LED segment, so the wall reads as merchandise on display. Headlines are shouted in expanded, uppercase Archivo Black; body copy stays in plain, muted, readable Archivo. Motion is physical: the sign stutters on like fluorescent tubes, LED strips scale on as rows enter view, and hanging products swing to rest on a spring.

The system rejects the white marketplace grid with a banner carousel. Yellow is the only accent; there is no second hue in the store.

**Key Characteristics:**
- Near-black wall with tonal graphite panels; no light-mode surface.
- One accent, sign yellow, carried by acrylic plaques, selected states, and primary actions.
- LED white is light, used for text and for the strip glow, never as a large fill.
- Materials are real fixtures: slatwall, LED strip, rail, hook, blister hang-tab, punched-hole plaque and tag.
- Expanded uppercase Archivo Black headlines over normal-width body text.
- Physical motion: flicker, scale-on, spring swing; all disabled under reduced motion.

## Colors

A night palette: black and graphite steps, warm LED white for light, and a single sign yellow that carries every accent.

### Primary
- **Sign Yellow** (sign): the storefront acrylic. Price plaques, selected tabs and model plaques, the primary pill action, the buy-path line, focus rings, text selection, icon tints on dark.
- **Deep Sign Amber** (sign-deep): the lower edge of the acrylic gradient on plaques and the lit sign; never used flat on its own.
- **Unlit Sign** (sign-off): the dark acrylic visible behind the sign before it powers on.
- **Plaque Black** (on-sign): text and inner ink on any yellow surface.

### Neutral
- **Display Black** (ink): page background, the round arrow wells inside pill buttons, punched holes.
- **Graphite Panel** (panel): the slatwall base.
- **Graphite Raised** (panel-2): cards, product hangs, inputs, the repair block, info chips.
- **Graphite High** (panel-3): photo wells, hang-tab gradient top, scrollbar thumb.
- **Groove** (groove): the cut between slatwall boards.
- **LED White** (led): primary text and the LED strip itself; also the light secondary pill.
- **Warm Muted** (muted): body copy and secondary text on dark.
- **Faint** (faint): placeholders and empty-photo text only.

### Status (admin only)
- **Signal Red** (danger) and **Signal Green** (ok): errors, destructive actions and success toasts in the admin panel. They do not appear on store surfaces.

### Named Rules
**The One Sign Rule.** Sign yellow is the only accent hue in the store. A new emphasis is expressed with yellow, LED white, or weight, never with a second color.

**The LED Is Light Rule.** LED white is text and illumination. It fills small objects (the light pill, the payment ticket, the shipping label) but never a section background.

**The Hairline Rule.** Borders on dark are white at 5-12% alpha (ring or border), never a solid gray stroke.

## Typography

**Display Font:** Archivo, variable width axis (with ui-sans-serif, system-ui)
**Body Font:** Archivo at normal width
**LED Font:** Doto (with ui-monospace), dot-matrix, for the LED ticker and the 404 only

**Character:** One family doing two jobs. Archivo at width 125 and weight 900, uppercase and tightly tracked, is the sign voice; the same family at width 100 is the quiet shop-counter voice. Doto is the dot-matrix scroller hanging in the window.

### Hierarchy
- **Sign** (900, wdth 125, uppercase, outlined black on yellow): the storefront lettering only, built letter by letter.
- **Display** (900, wdth 125, uppercase): section headlines, set in two or three stacked lines with explicit breaks.
- **Headline** (900, wdth 125, uppercase): module titles such as the model picker question.
- **Title** (900, wdth 112, sentence case): the product name on the product page.
- **Card Title** (700, 0.95-1rem): product names in hangs.
- **Body** (400, 1.125rem, relaxed, muted): section paragraphs, held to 34-44ch; product descriptions at 65ch.
- **Label** (900, wdth 112, uppercase, 0.06em tracking): headings of real groups, footer columns and filter groups ("Categoria", "Compatível com"). It names a group, it never sits above a headline.
- **Action** (900, wdth 112, uppercase): text in pill actions.
- **LED** (Doto 900, uppercase, 0.12em, yellow with glow): the marquee ticker.

### Named Rules
**The Width Axis Rule.** Hierarchy comes from the width axis plus weight: expanded (125) for headlines, semi (112) for actions, labels and prices, normal (100) for reading text. Condensed exists but is not used on shipped surfaces.

**The Tabular Price Rule.** Every price, product code, phone number and count uses tabular figures.

## Layout

A single centered container (max 1400px) with gutters of 16px, 24px from small screens and 40px from large. Desktop compositions use a 12-column grid with asymmetric splits (4/8, 7/5, 7/5 or 8/4 catalog). Sections are separated by large dark gaps (7rem, 10rem from small screens) rather than rules or background bands. Product walls are slatwall panels with a 64px board pitch; grids are 2 columns on mobile, 3 on md, 4 on lg in the home wall (3 beside the catalog filters). Headlines stack hard line breaks; paragraphs align to the headline's baseline in the opposite column. The product page puts the gallery in 7 columns and a sticky buy column in 5. Mobile keeps the same order, collapses grids to one column, and the buy action reappears as a sticky bar once the main button scrolls away. The admin is a 16rem sidebar plus content on desktop and a bottom tab bar with a central plaque button on mobile.

## Elevation & Depth

Depth is physical, not Material. Surfaces sit flat in tonal graphite steps; objects that hang or are screwed to the wall cast long, soft, dark drop shadows, and acrylic objects carry an inner top highlight. Light comes from the LED strip: a three-layer white glow plus a soft cone falling onto the products below. Yellow actions cast a yellow-tinted glow, never a gray one.

### Shadow Vocabulary
- **LED glow** (`box-shadow: 0 0 6px rgba(255,250,235,.9), 0 0 22px rgba(255,246,220,.45), 0 10px 48px rgba(255,240,200,.18)`): the strip over every shelf.
- **Acrylic plaque** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.65), inset 0 -2px 0 rgba(120,80,0,.25), 0 6px 14px -4px rgba(0,0,0,.6), 0 18px 30px -12px rgba(0,0,0,.5)`): yellow plaques.
- **Graphite tag** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.4), 0 6px 12px -6px rgba(0,0,0,.8)`): unselected model tags.
- **Hanging card** (`box-shadow: 0 24px 40px -24px rgba(0,0,0,.95)`, hover `0 34px 60px -26px rgba(0,0,0,1)`): product hangs.
- **Sign glow** (`box-shadow: 0 14px 34px -12px rgba(255,204,41,.55)`): the primary yellow pill.

### Named Rules
**The Light Has a Source Rule.** Glow belongs to the LED strip, the sign, the LED ticker and yellow actions. Panels and cards do not glow.

## Shapes

Three form families. Fixtures are softly rounded rectangles: cards 1.1rem, slatwall panels 1.5rem, the repair panel 1.75rem. Actions and tabs are full pills, usually with a round black arrow well on the right end. Signage objects are small acrylic forms: plaques at 0.55rem with a punched round hole at the left, and model tags cut to a price-tag silhouette (pointed left end, 0.5rem right corners) carrying the hole. Recurring real-world details: the blister hang-tab with its euro slot, screw heads in the corners of the yellow plate, the metal rail and SVG hook, the torn edge of the payment ticket. Small rotations (about -3 to 3 degrees) are applied to hung plaques and tickets so they read as hung by hand.

## Components

### Buttons
- **Shape:** full pill (999px), round 40px arrow well (ink with yellow arrow) inset on the right.
- **Primary:** sign yellow, plaque black uppercase action text, yellow glow. The arrow well nudges right on hover; press scales to 0.98.
- **Light:** LED white with ink text, same anatomy; used for "see the whole wall" and when buying is unavailable (WhatsApp).
- **Ghost:** transparent with a white 12% ring, LED text, white 5% fill on hover.
- **Buy (product):** primary anatomy, larger, with a white sheen sweeping across on hover.
- **Text link action:** yellow uppercase with a 40% yellow underline that goes solid on hover.

### Chips
- **Tab pills:** brand filters. Unselected LED text at 75%; the selected pill slides between tabs as a yellow spring-animated layer.
- **Category chips:** graphite raised with a white 8% ring; active is solid yellow.
- **Active filters:** shown as yellow plaques with a close mark.

### Cards / Containers
- **Product hang:** graphite raised card (1.1rem) hanging on a metal SVG hook from a hang-tab with a euro slot; 4:5 photo, second photo on hover, code chip, title, compatible model in yellow. A small yellow price plaque hangs over the photo corner. Enters with a spring swing and nudges on pointer.
- **Slatwall panel:** the product wall container; each cell carries its own LED segment that joins into one strip per row.
- **Info chips:** graphite raised, 0.75rem radius, yellow filled icon, short text.

### Inputs / Fields
- **Style:** graphite raised fill, white 8-10% ring, LED text, faint placeholder. Search is a 52px pill with a leading icon; admin fields are 48px at 0.75rem radius.
- **Focus:** the ring becomes 2px sign yellow; global focus-visible is a 2px yellow outline offset 3px.
- **Error:** admin only, danger text with a danger-tinted ring.

### Navigation
- **Header:** sticky, ink, 68px; on scroll it becomes 92% ink with blur and a hairline. Links are semibold LED at 80% in pills with a white 6% hover; the WhatsApp action is a yellow-outlined pill that fills yellow on hover.
- **Mobile:** full-screen ink sheet with huge expanded uppercase links separated by hairlines and a yellow plaque WhatsApp action at the bottom.

### Price Plaque (signature)
The yellow acrylic price tag: punched hole, small "R$", large tabular integer, raised cents, struck-through previous price above, and an ink block with the yellow discount percent. Three sizes (card, default, product page) with a slight tilt.

### Model Tag (signature)
Graphite price-tag silhouette with a punched hole for each phone model; hover lifts it and tints the text yellow; the active model becomes a yellow plaque.

### Storefront Sign (signature)
The lightbox rebuilt: metal frame, unlit acrylic that powers on with a fluorescent stutter, outlined black lettering assembling letter by letter, the white brand band and the contact strip. Used once, at the top of the home page.

### LED Strip and Ticker (signature)
The strip is a 3px LED bar with glow and light cone over every shelf, switching on with a scale and flicker. The ticker is a dot-matrix Doto marquee in yellow on a black dot grid, pausing on hover.

## Do's and Don'ts

### Do:
- **Do** keep sign yellow as the only accent and put plaque black on every yellow surface.
- **Do** hang products: hook, hang-tab, LED segment above, price plaque over the photo.
- **Do** set section headlines in Archivo 900 at width 125, uppercase, stacked with explicit breaks, with leading 0.88-0.95.
- **Do** use tabular figures for every price, code and phone number.
- **Do** separate dark surfaces with white hairlines at 5-12% alpha and tonal graphite steps.
- **Do** give every motion a reduced-motion end state that shows the final, lit frame.
- **Do** use real store photography for products and the physical store.

### Don't:
- **Don't** use a white page, a white product grid, or a banner carousel.
- **Don't** introduce a second accent hue on store surfaces; danger and ok stay inside the admin.
- **Don't** fill section backgrounds with LED white; it is light, not paint.
- **Don't** add glow to panels or cards; only the LED strip, the sign, the ticker and yellow actions emit light.
- **Don't** place small uppercase tracked labels above headlines; the label style names groups only.
- **Don't** use Doto outside the LED ticker and LED-style status moments such as the 404.
