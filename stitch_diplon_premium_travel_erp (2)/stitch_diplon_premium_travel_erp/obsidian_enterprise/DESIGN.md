---
name: Obsidian Enterprise
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb695'
  on-tertiary: '#571f00'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
  surface-glass: rgba(15, 23, 42, 0.8)
  success: '#10B981'
  danger: '#F43F5E'
  warning: '#F59E0B'
  border-subtle: rgba(255, 255, 255, 0.08)
  text-muted: '#94A3B8'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  lead:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

This design system is engineered for high-performance, expert-level ERP workflows. It prioritizes technical authority, speed, and information density. The brand personality is professional and focused, designed to minimize eye strain during long working sessions through a sophisticated dark-first aesthetic.

The design style is **Minimalist / Modern** with a strong emphasis on **Glassmorphism** for layered depth. It draws inspiration from precision tools (Linear, Stripe) using ultra-fine borders, subtle backdrop blurs, and a rigid geometric structure. The visual language conveys a sense of a "high-performance cockpit"—dark, sleek, and highly responsive.

## Colors

The palette is anchored by the **Obsidian** background (`#0B0E14`), providing a true black-adjacent canvas for maximum contrast and depth. 

- **Primary (Indigo-600):** Reserved for primary actions, active navigation states, and critical focus indicators.
- **Accent (Blue-500):** Used for secondary emphasis, data visualizations, and interactive highlights.
- **Glass Surfaces:** Containers use Slate-900 at 80% opacity with a `20px` backdrop-blur to create a sense of stacked hierarchy.
- **Functional Colors:** Emerald (Success), Rose (Danger), and Amber (Warning) are used strictly for status indicators and feedback loops to ensure visual clarity in data-dense tables.

## Typography

The typography system utilizes **Inter** across all levels to maintain a systematic, utilitarian aesthetic. 

For high-density ERP data, the 14px "Body-base" is the workhorse for table content and inputs. Captions and metadata leverage 12px or 11px labels with increased letter spacing to maintain legibility at small scales. Headings use tighter letter spacing and semi-bold weights to command attention without excessive size, preserving vertical space for content.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy with high-density spacing. The rhythm is dictated by an 8px base unit.

- **Desktop:** A structured 12-column grid. Layouts follow a standard vertical stack: Page Header > Stat Row > Filter Bar > Main Content (DataTable/Grid).
- **Reflow:** On smaller screens, the side navigation collapses into a rail, and the "Details Drawer" shifts from a peek-pane (33% width) to a full-screen sheet.
- **Density:** High-density components use 4px (xs) and 8px (sm) internal padding to ensure maximum information visibility without clutter.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Backdrop Blurs** rather than heavy shadows.

1.  **Level 0 (Background):** Obsidian (`#0B0E14`), the base canvas.
2.  **Level 1 (Cards/Containers):** Glassmorphic surfaces with a `1px` border of `rgba(255, 255, 255, 0.08)`.
3.  **Level 2 (Drawers/Modals):** Increased blur (`40px`) and a very subtle ambient shadow (0px 8px 24px rgba(0,0,0,0.5)) to lift the element above the main content.
4.  **Level 3 (Command Palette/Tooltips):** Pure black surfaces with crisp Indigo borders to ensure absolute focus during keyboard-driven navigation.

## Shapes

The shape language is precise and modern. The standard `12px` (rounded-lg) radius is applied to major containers and cards to soften the technical layout. For nested interactive elements like buttons and input fields, a tighter `8px` (rounded) radius is used to maintain a sharp, professional appearance. Status badges and avatars use a fully circular "pill" shape to distinguish them from structural UI components.

## Components

- **Buttons:** Primary buttons use a solid Indigo-600 fill with white text. Secondary buttons use a "ghost" style: a subtle white border (8%) with a hover state that lightens the background.
- **Input Fields:** Darker than the surface (`#000000` or deep Slate), with an 8px radius. The active state features a 1px Blue-500 border and a subtle blue outer glow.
- **DataTables:** The core of the ERP. Rows have a 1px bottom border (`border-subtle`). On hover, the entire row adopts a subtle glass highlight. Use `mono-data` typography for numerical values.
- **Details Drawer:** Slides in from the right. It should use the glassmorphic surface treatment to maintain context of the underlying table.
- **Command Palette (Ctrl+K):** A centered modal with a search-first interface. It uses high-contrast typography and a semi-transparent backdrop to dim the rest of the application.
- **Status Badges:** Compact, pill-shaped markers. Use low-saturation background tints with high-saturation text (e.g., Emerald-900 background with Emerald-500 text).