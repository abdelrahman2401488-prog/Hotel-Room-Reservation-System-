# Hotel Room Reservation System

Plain PHP project (no framework). Pages live in the root and in `admin/`, `guest/`, `reservations/`, `reports/`, `reviews/`, `staff/`.

## Page structure

```php
<?php
$pageTitle   = 'Search Rooms';
$pageId      = 'search-rooms';     // runs HRS.pages['search-rooms'] from the page script
$pageScripts = ['booking.js'];     // optional, files in assets/js/
$pageRole    = 'admin';            // optional, demo audience hint (admin | staff)
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
