# Hotel Room Reservation System

Plain PHP project (no framework). Pages live in the root and in `admin/`, `guest/`, `reservations/`, `reports/`, `reviews/`, `staff/`.

## Page structure

```php
<?php
$pageTitle  = 'Search Rooms';
$pageStyles = ['booking.css'];   // optional, page-scoped CSS in assets/css/
require __DIR__ . '/../includes/header.php';   // './includes/header.php' for root pages
?>
<main id="main" class="main-content">
  <div class="container"> ... </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
```

`includes/header.php` always loads `assets/css/global.css` before any `$pageStyles`.

## CSS rules — `assets/css/global.css` is the single source of truth

1. Read `assets/css/global.css` before writing any CSS or markup.
2. Use its tokens (`var(--color-primary)`, `var(--space-4)`, `var(--radius-md)`, ...) — never hardcode colors, font sizes, spacing, radii, shadows or z-indexes.
3. Use its components: `.btn` + variants, `.form`/`.form-group`/`.form-control`, `.card`, `.stat-card`, `.table-wrapper` + `.table`, `.badge` + `.status-*`, `.alert-*`, `.modal-overlay`/`.modal`, `.navbar`, `.sidebar`, layout (`.container`, `.grid`, `.page-header`) and utilities.
4. No inline `style` attributes, no `!important`, no second global stylesheet (`style.css` is unused — do not revive it as a parallel standard).
5. A new reusable token or component goes into `global.css` first (in the matching section), then gets used in pages.
6. Page CSS files (`admin.css`, `auth.css`, `booking.css`, `reports.css`, `reservations.css`, `staff.css`) only hold styles genuinely unique to those pages, scoped under a page-level class, and must use global tokens. Never redefine global components there.
7. Breakpoints (literal values in media queries): 576px, 768px, 992px, 1200px — use `max-width: 767.98px` style, matching `global.css`.
8. JS state classes: `.is-open` (navbar menu, modal overlay), `.is-invalid` / `.is-valid` (form validation), `body.modal-open`.
