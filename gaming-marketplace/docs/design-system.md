# Design System

## Temporary brand

**VantaBoost** is a temporary working identity. It is intentionally replaceable before launch and should not be treated as cleared production branding.

Brand attributes:

- precise
- premium
- competitive
- trustworthy
- fast
- modern without looking juvenile

## Visual direction

The product uses dark mode as the primary visual environment. The design avoids excessive neon, heavy glassmorphism, and decorative gaming clichés.

### Color roles

- Background: near-black blue-violet neutral
- Surface: slightly elevated cool neutral
- Primary: violet
- Secondary accent: cyan, used sparingly
- Success: green
- Warning: amber
- Danger: rose
- Text: high-contrast off-white with muted cool gray secondary text

Colors are represented through semantic CSS variables so the brand palette can be changed without rewriting component classes.

## Typography

Geist Sans is the primary interface typeface. Geist Mono is reserved for IDs, technical values, and code-like data when appropriate.

Recommended hierarchy:

- Display: 48–72 px depending on viewport
- H1: 40–56 px
- H2: 28–40 px
- H3: 20–24 px
- Body large: 18–20 px
- Body: 14–16 px
- Supporting labels: 12–14 px

Use tighter tracking for large headings and comfortable line-height for long-form content.

## Radius

- Controls: 12 px
- Cards: 16 px
- Large promotional surfaces: 20–24 px
- Pills: fully rounded

## Borders and elevation

Use subtle translucent borders before using heavy shadows. Elevated surfaces may use broad, soft shadows with low opacity. Avoid bright glow around every component.

## Interaction

- Hover: subtle contrast or 1–2 px perceived lift
- Active: small downward translation where appropriate
- Focus: visible violet focus ring
- Disabled: reduced opacity without removing legibility
- Motion: 150–300 ms for most UI transitions

Respect reduced-motion preferences when richer animation is introduced.

## Component philosophy

Use shadcn/ui as a source-owned primitive layer, not as a visual identity. Product components should compose primitives rather than repeatedly restyle low-level elements.

Expected primitive set over the next phases:

- Button
- Badge
- Card
- Input
- Select
- Checkbox
- Radio Group
- Tabs
- Accordion
- Dialog / Sheet
- Dropdown Menu
- Tooltip
- Skeleton
- Toast / Sonner

Do not install all components before they are needed.

## Accessibility baseline

- WCAG-oriented contrast for primary text and controls
- visible keyboard focus
- semantic headings
- proper labels and descriptions for form fields
- no hover-only essential information
- minimum practical touch targets on mobile
- error states communicated through text, not color alone
