# Hotel Room Reservation System

Plain PHP project (no framework). Pages live in the root and in `admin/`, `guest/`, `reservations/`, `reports/`, `reviews/`, `staff/`.

## Page structure

```php
<?php
$pageTitle   = 'Search Rooms';
$pageId      = 'search-rooms';     // runs HRS.pages['search-rooms'] from the page script
$pageScripts = ['booking.js'];     // optional, files in assets/js/
$pageRoles   = 'staff,admin';      // optional, roles allowed on the page ('' = public)
require __DIR__ . '/../includes/header.php';   // './includes/header.php' for root pages
?>
<main id="main" class="main-content">
  <div class="container"> ... </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```

`includes/header.php` loads `assets/css/global.css` only — it is the single stylesheet for the whole site.
`includes/footer.php` loads `main.js`, `validation.js`, `mock-data.js`, `data-service.js`, then `$pageScripts`.

## Frontend prototype (no backend yet)

- All data is DEMO data: `assets/js/mock-data.js` (seed) persisted in localStorage by `assets/js/data-service.js`.
- Page scripts only talk to `HRS.data.*` (Promise-based). Backend integration = re-implement those methods with `fetch()` to PHP; keep names and return shapes.
- `HRS.session` (main.js) is a demo sign-in, not authentication. Search `BACKEND INTEGRATION` for every integration point.
- Field names are snake_case and match the planned MySQL columns (see the header of mock-data.js).
- Brand: **The Developers Hotel**. Logos in `assets/images/brand/` (`logo.svg` light bg, `logo-light.svg` dark bg, `logo-emblem.svg`, `logo-mark.svg`/`assets/favicon.svg`, PNG exports). Do not reintroduce text-only brand marks.

## Roles (demo)

- Demo accounts (DEMO ONLY, listed on login.php): admin@example.com / Admin@2026, staff@example.com / Staff@2026, guest@example.com / Guest@2026.
- Landing pages: admin → `admin/dashboard.php`, staff → `staff/dashboard.php`, guest → `guest/my_bookings.php`.
- Access: `admin/*` admin only; `staff/*` staff only; reservations list + `reports/*` staff and admin; booking flow, payment, my bookings, reviews submission guest only; modify/cancel guest (own bookings) + staff + admin. Everything else is public.
- Navigation items carry `data-nav="public guest staff admin"` (any subset); main.js shows only the current role's items. Never add admin links to staff/guest navigation.
- Pages shared by admin and staff set `$sharedSidebar = true` and include both `admin_sidebar.php` and `staff_sidebar.php`.

## Room photos

- Rooms have `image_url` (project-relative path), `image_alt` and `gallery[]` (`{ url, alt }`), set in mock-data.js `room_photos`. Files live in `assets/images/rooms/` with sources and licenses in `CREDITS.md` — add an entry for every new photo.
- Render photos with `HRS.views.roomMedia()` / `HRS.views.photo()` (alt text, lazy loading, `object-fit: cover`, gradient fallback on load errors). Do not write raw `<img>` tags for rooms.

## CSS rules — `assets/css/global.css` is the single source of truth

1. Read `assets/css/global.css` before writing any CSS or markup.
2. Use its tokens (`var(--color-primary)`, `var(--space-4)`, `var(--radius-md)`, ...) — never hardcode colors, font sizes, spacing, radii, shadows or z-indexes.
3. Use its components: `.btn` + variants, `.form`/`.form-group`/`.form-control`, `.card`, `.stat-card`, `.table-wrapper` + `.table`, `.badge` + `.status-*`, `.alert-*`, `.modal-overlay`/`.modal`, `.navbar`, `.sidebar`, layout (`.container`, `.grid`, `.page-header`) and utilities.
4. No inline `style` attributes, no `!important`, no second global stylesheet (`style.css` is unused — do not revive it as a parallel standard).
5. A new reusable token or component goes into `global.css` first (in the matching section), then gets used in pages.
6. Styles genuinely unique to one page also live in `global.css`, scoped under a page-level class, using global tokens. The legacy page CSS files (`admin.css`, `auth.css`, `booking.css`, `reports.css`, `reservations.css`, `staff.css`) are empty and not loaded — do not add styles to them.
7. Breakpoints (literal values in media queries): 576px, 768px, 992px, 1200px — use `max-width: 767.98px` style, matching `global.css`.
8. JS state classes: `.is-open` (navbar menu, modal overlay), `.is-invalid` / `.is-valid` (form validation), `.is-active` / `.is-complete` (tabs, steps, timeline), `.is-leaving` (toasts), `body.modal-open`.
9. Dynamic markup is built with the escaping `HRS.dom.html` template tag; data-driven widths use `<progress class="bar">`, never style attributes.
