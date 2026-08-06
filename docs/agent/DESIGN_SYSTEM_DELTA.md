# Proposed Design-System Delta

This file describes proposed changes to the current design system. It is not automatically authoritative. Approved changes must be merged into `docs/DESIGN_SYSTEM.md` with tests.

## 1. Surface strategy

### Proposed

- Decorative image surface: hero and contextual promotional regions only.
- Primary surface: opaque, high-contrast cards and reading areas.
- Secondary surface: nested summaries and grouped controls.
- Selected surface: clearly differentiated by fill, border, type and semantics.
- Overlay surface: dialogs and sheets with stable contrast.

### Remove or reduce

- Uncontrolled glass surfaces over variable photography
- Accidental card-color variation caused by background imagery
- Excessive shadow dependence

## 2. Responsive shell

Recommended hybrid target:

- Mobile: full-width app and bottom navigation.
- Tablet: rail/drawer with flexible content.
- Desktop dashboards: responsive content container and persistent sidebar.
- Reader/focused flows: constrained reading measure.

This proposal conflicts with the current wide-viewport mobile-canvas contract and therefore requires an approved decision.

## 3. Spacing

Use the existing 4 px foundation with a documented set:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

Prefer role-based page gutters and component gaps over arbitrary values.

## 4. Radius

Recommended roles:

- 8 px: compact internal elements
- 12–14 px: controls
- 16–20 px: standard cards
- 24 px: major containers and sheets
- Full radius: chips, compact segmented controls and circles only

Reduce full-pill styling on large cards and unrelated controls.

## 5. Elevation

Use three levels only:

1. Flat/bordered surface
2. Raised card
3. Modal/sheet

Avoid applying a large soft shadow to every card.

## 6. Color roles

Gold should primarily indicate:

- Primary action
- Selected state
- Limited brand emphasis

Gold should not be the default for small text, low-contrast metadata, every icon and every border.

Define semantic tokens for:

- Background
- Surface
- Text strong/default/muted
- Primary and on-primary
- Border passive/control
- Focus
- Success/warning/error/info
- Progress track/fill
- Scrim

Every token combination must be validated in light, midnight and dark/OLED modes.

## 7. Typography

Maintain two clear families/roles:

- UI text
- Arabic devotional/reading text

Recommended minimums:

- Body: 16 px
- Metadata: 14 px
- Card title: 18–20 px
- Section title: 24–28 px
- Page title: 28–36 px depending on viewport
- Reader Arabic text: scalable, normally 22–28 px with generous line height

Do not shrink metadata to preserve fixed card heights.

## 8. Component states

Every interactive component should define:

- Default
- Hover where applicable
- Pressed
- Focus-visible
- Selected/checked
- Disabled
- Loading
- Error where applicable

## 9. Transparency and motion preferences

- Add a semantic reduced-transparency treatment if the product exposes the preference.
- Ensure reduced motion affects all nonessential transitions and celebrations.
- Keep functional feedback available without animation.

## 10. Documentation update rule

When a delta is approved and implemented:

1. Update `docs/DESIGN_SYSTEM.md`.
2. Update token/component code.
3. Add visual/regression tests.
4. Add a decision-log entry.
5. Remove or mark the delta section as adopted.
