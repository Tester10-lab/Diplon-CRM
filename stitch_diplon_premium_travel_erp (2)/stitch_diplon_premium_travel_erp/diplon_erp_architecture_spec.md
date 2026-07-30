# Diplon Travel ERP - Frontend Architecture Specification

## 1. Design Vision
Diplon is a high-performance Enterprise Travel ERP tailored for the Nepal travel ecosystem. The UI follows a "Premium SaaS" aesthetic: high contrast (Dark Mode First), glassmorphism, rigorous spacing, and professional typography.

**Inspirations:** Linear (Efficiency), Stripe (Clarity), Vercel (Minimalism), Notion (Flexibility).

## 2. Design Tokens (The Foundation)
| Token Category | Values |
| :--- | :--- |
| **Colors (Dark First)** | Background: Obsidian (#0B0E14), Surface: Slate-900/80 (Glass), Primary: Indigo-600, Accent: Blue-500, Success: Emerald-500 |
| **Typography** | Font: Inter / Geist Sans. Scale: 12px (Tiny), 14px (Base), 16px (Lead), 20px+ (Headings) |
| **Spacing** | 8px Base Grid (4, 8, 16, 24, 32, 48, 64) |
| **Radius** | 12px (Standard), 8px (Inner/Small), 9999px (Pills) |
| **Effects** | Soft shadows (0 10px 15px -3px rgb(0 0 0 / 0.5)), Glassmorphism (Backdrop-blur 12px) |

## 3. Component Hierarchy
### A. Atomic Elements (Base)
- **Button:** Primary, Secondary, Ghost, Danger, Icon-only.
- **Inputs:** Text, Select, Search (Ctrl+K), Date Picker (Range), Checkbox/Switch.
- **Display:** Badge (Status-based), Avatar, Tooltip, Kbd (Keyboard shortcuts).

### B. Shared Layout Components
- **AppShell:** Responsive container with Left Sidebar + Top Bar.
- **Sidebar:** Nested navigation, Role-based visibility, Branding.
- **TopBar:** Global Search, Role Switcher, Notification Bell, Profile.
- **CommandPalette:** Modal-based (Ctrl+K) for instant navigation & quick actions.
- **RightDrawer:** Slide-out for Notifications and Contextual Details (e.g., Booking Details).

### C. Data & Feedback Patterns
- **StatCard:** Value, Trend (Sparkline/Percentage), Icon.
- **DataTable (TanStack Pattern):** Sticky header, Column sorting/filtering, Bulk actions, Pagination.
- **Card:** Glass container for charts, tables, and lists.
- **Timeline:** Vertical activity tracking for Bookings/Tours.

## 4. Page Hierarchy & Routing
- **Dashboard (Role-Based):** `/dashboard` (Redirects based on SuperAdmin/Sales/Ops/Finance).
- **CRM:** `/customers`, `/inquiries`, `/quotations`.
- **Operations:** `/operations/today`, `/operations/dispatch` (DND UI), `/fleet`.
- **Finance:** `/finance/invoices`, `/finance/ledger`, `/finance/payables`.
- **B2B:** `/partners`, `/partners/ledger`.
- **Settings:** `/settings/users`, `/settings/system`.

## 5. User Flows
1. **The Dispatch Flow (Ops):** Drag a Guide/Driver onto a Tour → Capacity Indicator updates → Generate Manifest.
2. **The Booking Flow (Sales):** Inquiry → Quotation (Comparison) → Booking → Payment Link Generation.
3. **The Global Search (All):** `Ctrl+K` → "Inquiry #402" → Instant Preview Drawer.

## 6. Technical Implementation Strategy
- **Framework:** React-inspired HTML/JS (Component-driven).
- **Styling:** Tailwind CSS with custom glassmorphism utilities.
- **Icons:** Lucide (SVG).
- **Charts:** Recharts (SVG/Canvas).
- **State Management:** Context-driven for Theme/Role/Notifications.
