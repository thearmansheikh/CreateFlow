# Responsive Design System

## Date
2025-01-07

## Decision
All pages must be fully responsive down to 320px viewport width. Mobile-first approach with Tailwind's responsive prefixes.

## Breakpoints (Tailwind defaults)
- `sm:` 640px — Small tablets
- `md:` 768px — Tablets
- `lg:` 1024px — Desktop
- `xl:` 1280px — Large desktop

## Patterns

### Navigation
- **Landing navbar:** Hamburger menu on mobile, full links on desktop. Mobile menu slides in as a glassmorphism overlay.
- **Dashboard sidebar:** Collapsible drawer on mobile with overlay backdrop. Hamburger toggle in header.

### Layout
- **Pages with side panels** (create/image, create/video, etc.): Stack vertically on mobile, side-by-side on `lg:`. Use `border-b lg:border-b-0 lg:border-r` for the divider.
- **Calendar page:** Grid view on `sm:` and up, card list view on mobile (`sm:hidden`).
- **Library:** Sidebar panel stacks above content on mobile with collapsible folders.

### Components
- **Buttons on forms:** `w-full sm:w-auto` — full width on mobile, auto on desktop.
- **Page headers:** `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3` for title + action button rows.
- **Cards and modals:** Rounded top corners only on mobile (`rounded-t-2xl sm:rounded-2xl`), sheet-style slide-up from bottom.
- **Touch targets:** Minimum `py-2` on interactive elements for mobile. Increased font sizes for platform badges (`text-sm` instead of `text-xs` on mobile).

### Spacing
- Page padding: `p-4 sm:p-6 lg:p-8`
- Vertical gaps: `space-y-4 sm:space-y-6`
- Landing section padding: `py-16 sm:py-24`

### Typography
- Chart labels: `text-[8px] sm:text-[10px]`
- Secondary labels: `text-[10px] sm:text-xs`
- Page titles: `text-2xl sm:text-3xl`

### Calendar
- Desktop: Full grid with `min-h-[120px]` cells
- Mobile: Card list grouped by day, no grid
