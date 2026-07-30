# Diplon Travel ERP - Scalable Frontend Architecture Specification (v2)

## 1. Design Vision & Core Principles
Diplon is a high-performance Enterprise Travel ERP. The UI follows a "Premium SaaS" aesthetic (Linear, Stripe, Vercel) characterized by high density, dark-mode first obsidian themes, and extreme consistency.

- **Feature-Based Architecture:** Moving from flat pages to self-contained features.
- **Atomic Consistency:** Every view is a composition of ~50 standardized building blocks.
- **Nested Routing:** Depth-first navigation structure for complex entity management.
- **Workspace Hierarchy:** Global Workspace > Sidebar > Module > Page.

## 2. Directory Structure (Feature-Based)
```text
src/
├── app/ (Core providers, Global styles, Routes)
├── features/ (Self-contained domain logic)
│   ├── dashboard/ (Widget-based system)
│   ├── customers/
│   ├── inquiries/
│   ├── bookings/
│   ├── operations/ (Dispatch, Manifests)
│   ├── finance/ (Ledger, Invoices)
│   ├── b2b/ (Partner management)
│   ├── fleet/ (Vehicles, Drivers, Guides)
│   ├── calendar/ (Multi-view scheduling)
│   └── settings/
└── shared/ (Cross-cutting primitives)
    ├── ui/ (Atomic components)
    ├── layouts/ (AppShell, PageLayout)
    ├── table/ (TanStack wrappers)
    ├── api/ (Client logic)
    └── utils/
```

## 3. Design Tokens (The Foundation)
| Category | Values |
| :--- | :--- |
| **Colors** | Background: Obsidian (#0B0E14), Surface: Slate-900/80 (Glass), Primary: Indigo-600, Accent: Blue-500, Success: Emerald-500 |
| **Typography** | Inter / Geist Sans. Scale: 12px (Tiny), 14px (Base), 16px (Lead), 20px+ (Headings) |
| **Spacing** | 8px Base Grid (4, 8, 16, 24, 32, 48, 64) |
| **Radius** | 12px (Standard), 8px (Inner/Small), 9999px (Pills) |

## 4. Standardized Page Layout
Every page follows a rigid vertical structure to ensure user familiarity:
1.  **Page Header:** Title, Breadcrumbs, Primary Actions.
2.  **Stat Row:** 3-5 MetricCards/StatCards.
3.  **Filter Bar:** Search, Date Range, Status Filters, Column Toggle.
4.  **Main Content:** DataTable or Grid of Cards.
5.  **Contextual Layers:** Right-side Details Drawer or Bottom Timeline.

## 5. Component Library (The 50 Building Blocks)
- **Navigation:** AppShell, Sidebar, Breadcrumb, Tabs, CommandPalette.
- **Data Display:** DataTable, StatCard, MetricCard, TourCard, BookingCard, Timeline, Badge, StatusBadge, Avatar.
- **Feedback:** LoadingSkeleton, EmptyState, ErrorState, NotificationCenter, Tooltip.
- **Forms/Inputs:** Button, SearchBox, DatePicker, Select, QuickActions (Floating +), Switch.
- **Overlays:** Drawer (Details), Sheet, Dialog (Modal), CommandPalette (Ctrl+K).

## 6. Routing & Navigation Strategy
### Nested Routes Pattern
- `/bookings` (List view)
- `/bookings/:id/overview` (Default detail)
- `/bookings/:id/travellers`
- `/bookings/:id/payments`
- `/bookings/:id/timeline`

### Secondary Navigation
Used for Customers, Bookings, Tours, Partners, Drivers, and Vehicles to allow deep-diving without losing context.

## 7. Global Systems
- **Command Palette (Ctrl+K):** Instant navigation, search for any entity, and quick commands (e.g., "Assign Driver").
- **Dashboard Widget System:** Reusable components (Revenue, Fleet Status, etc.) mapped to user roles.
- **Global Quick Create:** Floating Action Button (FAB) for rapid entry of Inquiries, Bookings, Expenses, etc.
- **Details Drawer:** Right-side slide-out triggered by table row clicks for "peek" functionality.

## 8. Future-Proofing (Module 6 Ready)
The Navigation and UI blocks are designed to support a high-density Calendar module featuring:
- **Views:** Month, Week, Timeline (Resource-based).
- **Scheduling:** Drag-and-drop for Driver/Vehicle/Guide/Tour schedules.
