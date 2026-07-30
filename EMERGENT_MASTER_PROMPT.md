# Diplon Travel ERP — Emergent Master Prompt & UI/UX Animation Guide

This document contains a ready-to-use **Master Prompt for Emergent** (and other AI design generators like v0, Galileo, or Figma AI), strictly formatted with **clean professional typography, vector icon references, and real high-resolution imagery specs (no emojis)**.

---

## Part 1: Copy-Paste Master Prompt for Emergent (Emoji-Free & High Realism)

Use the prompt below in **Emergent** to generate state-of-the-art UI/UX mockups and interactive prototypes for **Diplon Travel ERP**:

```text
Design a high-end, clean SaaS Web & Mobile App UI for "Diplon Travel ERP & CRM" — an enterprise travel management platform for tour operators, vehicle dispatchers, B2B agencies, and drivers. Avoid emojis; use crisp Lucide vector icons, real hero photography, and high-definition asset imagery.

Design System & Color Tokens:
- Dark Mode Base: Deep Obsidian Black (#0B0E14)
- Card Containers: Midnight Glass (#111621) with 1px border (#232D42) and subtle 12px blur backdrop
- Primary Brand Highlight: Cyber Neon Lime (#C8FF2D) for active indicators, primary accents, and quick actions
- Interactive CTA Buttons: Electric Indigo Gradient (from #6366F1 to #4F46E5) with glowing hover shadow
- Status Accents: Emerald Green (#10B981) for Active/Confirmed, Warm Amber (#F59E0B) for Overlap Warnings/Leads, Crimson Red (#EF4444) for Locked Dispatches
- Typography: Inter / Outfit / Space Grotesk with bold weight hierarchy and monospace number formats for financial figures (NPR)

Key UI Layout & Imagery Requirements:
1. Desktop Header & Sidebar:
   - Floating glass sidebar navigation with collapsed icon mode (256px wide expanded, 80px collapsed). Active navigation pill highlights in Neon Lime (#C8FF2D) with a smooth sliding indicator pill.
   - Header with greeting ("Hello, Diplon"), role switcher pill (Super Admin, Admin, Agency, Driver), unread notification bell with animated pulse badge, real avatar imagery (Unsplash portraits), and search bar (⌘K shortcut).
2. Mobile Responsiveness (iOS & Android App Feel):
   - Native bottom navigation bar with 5 primary touch vector icons: Home, Bookings, Operations, Packages, Menu.
   - Slide-over glass drawer menu with backdrop blur for secondary items and one-tap sign out.
3. Dashboard Overview Cards:
   - High-impact stat counters (Total Bookings, Active Tours, Gross Revenue in NPR, Vehicle Utilization Rate) with micro sparkline graphs.
   - Real landscape thumbnail images for featured tours (Sailung, Kalinchowk, Upper Mustang, Pokhara).
   - Interactive Operations Reminders & Sticky Notes widget with live local persistence.
   - Dispatch Lock Status overview showing live vehicle dispatches (Bus Tourist Deluxe, EV Electric Vehicle, Passenger Van, 4WD Scorpio Jeep, Overland Trek, Mountain Hike).
4. Tour Departure Scheduler Modal ("Schedule New Tour Departure"):
   - Tour Package selector dropdown with auto-complete from master roster.
   - Automatic Return End Date calculator based on itinerary duration (1N/2D, 2N/3D, 4N/5D).
   - Vehicle & Tour Type selector featuring Bus (Tourist Deluxe), EV (Electric Vehicle), Van (Passenger / HiAce), Jeep (4WD Scorpio), Overland Trek, Mountain Hike.
   - Optional Driver & Tour Guide selectors with "-- None / Unassigned --" fallback.
5. Interactive Data Tables & Cards:
   - Glassmorphic data tables with column toggle dropdown, search filter, CSV export button, and status badges with live pulsing dots.

Aesthetics & Vibe:
- Clean, executive, modern enterprise dashboard aesthetic (inspired by Linear, Vercel, and Stripe dashboards).
- Rich micro-interactions: smooth spring physics, subtle card hover elevations, glow halations on key metrics, and frictionless touch targets.
```

---

## Part 2: Comprehensive Animation Roadmap for Diplon ERP

Below is a detailed guide on **what to animate** across the application to achieve a world-class, dynamic user experience:

### 1. 🔄 Page & Route Transitions
- **Framer Motion `AnimatePresence`**: When switching between main views (Dashboard, Bookings, Operations, Packages, Fleet, Finance), use a smooth fade-and-slide entry (`initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`).
- **Active Navigation Pill Morphing (`layoutId="activeIndicator"`)**: When clicking sidebar tabs, the glowing Neon Lime selection indicator should smoothly morph and slide between items rather than jump abruptly.

### 2. 🎛️ Interactive Controls & Micro-Interactions
- **Button Touch Reactions**:
  - `whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(200, 255, 45, 0.25)' }}`
  - `whileTap={{ scale: 0.96 }}`
- **Role Switcher & Dropdown Menus**:
  - Scale and origin spring animation (`initial={{ opacity: 0, scale: 0.95, y: 8 }}`).
  - Smooth backdrop dimming when dropdowns open.

### 3. 🔒 Live Resource Dispatch Locking & Status Pulse
- **Lock/Unlock Toggle**:
  - When unlocking a dispatched tour in `AssignDispatchModal`, animate the lock icon (`Lock` ➔ `Unlock`) with a 180° rotation and amber border pulse.
- **Pulsing Status Indicators**:
  - Confirmed/Active tours feature a live green pulsing indicator dot (`animate-pulse w-2 h-2 rounded-full bg-emerald-400`).
  - Warning banners (such as driver double-booking alerts) trigger a subtle attention shake (`animate-shake`).

### 4. 📊 Data Visualization & Real-Time Stats
- **Animated Counter Numbers**:
  - When loading financial metrics (e.g. `NPR 650,000`), count up dynamically from 0 to the target number over 0.8s.
- **Progress Bar & Capacity Fillers**:
  - Seat capacity bars in tour departures should fill smoothly from 0% to the reserved percentage with CSS transition `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`.

### 5. 📱 Mobile Navigation Motion
- **Bottom Navigation Bar**:
  - Smooth icon scale-up when active (`scale-110` with neon lime icon fill).
- **Slide-Over Drawer**:
  - Spring-driven slide-in from the left edge (`x: '-100%'` to `x: 0`, stiffness: 350, damping: 30) paired with a gradual dark backdrop fade.

---

## Part 3: UI/UX & Color Design System Tokens

| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| **Obsidian Dark** | `#0B0E14` | Global App Background |
| **Midnight Surface** | `#111621` | Glass Cards, Modals, Tables, Topbar |
| **Cyber Neon Lime** | `#C8FF2D` | Primary Brand Highlight, Active Tabs, Highlights |
| **Electric Indigo** | `#6366F1` | Primary Action Buttons, Modals, Badges |
| **Emerald Glow** | `#10B981` | Paid Status, Active Tours, Revenue Numbers |
| **Warm Amber** | `#F59E0B` | Overlap Warnings, Pending Payments, Leads |
| **Crimson Pulse** | `#EF4444` | Dispatched Resource Lock, Error Alerts |
| **Border Glass** | `rgba(255, 255, 255, 0.1)` | Subtle 1px dividers and container outlines |
