---
name: Obsidian Field Ops
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  data-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  touch-target-min: 44px
  edge-margin: 16px
  gutter: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system evolves the Obsidian Enterprise aesthetic into a "Field Operations" framework. It is engineered for field guides and drivers who require extreme reliability and immediate data recognition under variable outdoor lighting conditions. 

The style is **Rugged Minimalism**: it retains the sophisticated dark-mode core of the parent system but introduces structural reinforcements. Visuals are high-density but ergonomically spaced, prioritizing functional utility over decorative flair. The emotional response is one of "command and control"—providing the user with a sense of technical precision and unwavering stability in the field.

## Colors
This design system utilizes a deep-space palette to maintain the "Obsidian" identity while maximizing outdoor legibility through high-contrast accents.

- **Primary (Indigo):** Used exclusively for primary actions and active state indicators.
- **Surface Palette:** The background uses a true black or deep navy (`#020617`) to reduce glare and preserve battery on OLED mobile devices. 
- **Status Indicators:** Unlike the desktop system, the mobile palette utilizes saturated, high-contrast greens, ambers, and reds for "glanceable" status updates (e.g., vehicle health, route status).
- **Contrast Ratio:** All functional text must maintain a minimum 7:1 contrast ratio against background surfaces to ensure readability in direct sunlight.

## Typography
Typography is optimized for "at-a-glance" reading. **Plus Jakarta Sans** provides a modern, clean feel for headers and navigation, while **JetBrains Mono** is reserved for technical data strings, coordinates, and timestamps—ensuring that numerical data is never misread.

For mobile, the scale is tightened. We avoid overly large display type to maximize information density. Line heights are slightly increased for body text to improve legibility during bumpy transit or high-activity movement.

## Layout & Spacing
The layout follows an **Ergonomic Bottom-Heavy** model. Since field users often operate devices with one hand, all primary navigation and critical action triggers are placed within the "natural thumb zone" at the bottom 40% of the screen.

- **Grid:** A 4-column mobile fluid grid with 16px side margins.
- **Touch Targets:** Every interactive element (buttons, toggles, list items) must occupy a minimum of 44x44px of tappable area, regardless of the visual size of the icon or label.
- **Visual Rhythm:** Vertical spacing uses an 8px base unit. Data-heavy lists use 12px gutters to separate information blocks without sacrificing density.

## Elevation & Depth
Elevation is conveyed through **Tonal Layering** rather than traditional shadows, which can wash out in bright light.

- **Level 0 (Base):** Deepest background (`#020617`).
- **Level 1 (Cards/Lists):** Slightly lighter surface (`#1E293B`) with a subtle 1px border in a low-opacity Indigo or Grey.
- **Level 2 (Modals/Overlays):** These use a distinct Indigo-tinted border (`#312E81`) to signal they are "active" layers.

Shadows, if used for the "Rugged" feel, should be hard-edged and low-offset (e.g., 2px vertical) to mimic physical buttons rather than floating soft light.

## Shapes
To reinforce the "Field Operations" aesthetic, the design system utilizes **Soft (0.25rem)** corners. This creates a "tool-like" appearance that feels more durable and engineered than overly rounded, consumer-focused apps. 

Large containers (cards) use `rounded-lg` (0.5rem), while buttons and input fields use the base `rounded` (0.25rem) to maintain a crisp, professional silhouette.

## Components
- **Buttons:** Primary buttons are high-contrast Indigo with white text. They should span the full width of the grid in bottom-action bars to provide the largest possible hit area.
- **Data Cards:** Cards must utilize JetBrains Mono for all variable data. Use high-contrast status strips (4px wide) on the left edge of cards to indicate status (e.g., "Active", "Delayed", "Critical").
- **Inputs:** Form fields should have a distinct "Pressed" or "Active" state with a 2px Indigo border. Placeholder text must be high-contrast to remain visible in sunlight.
- **Bottom Sheets:** Use instead of center-screen modals for all settings and secondary inputs, keeping controls within the thumb zone.
- **Status Chips:** Small, rectangular chips with solid background colors for immediate state recognition. Use `label-caps` typography for clarity.
- **Navigation:** A persistent bottom navigation bar with 4-5 key destinations. Icons should be "Outline" style for clarity, switching to "Solid" and Indigo for active states.