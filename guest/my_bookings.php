<?php
$pageTitle   = 'My bookings';
$pageId      = 'my-bookings';
$pageScripts = ['booking.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">My bookings</h1>
                <p class="text-muted mb-0" data-region="greeting">Your upcoming and past stays.</p>
            </div>
            <a class="btn btn-accent" href="search_rooms.php">Book a new stay</a>
        </div>

        <!-- BACKEND INTEGRATION: PHP lists reservations WHERE user_id = the
             session user. The demo filters by the localStorage session. -->
        <div data-region="bookings-page">
            <div class="tabs" role="tablist" aria-label="Booking groups">
                <button class="tab" type="button" role="tab" data-value="upcoming" aria-selected="true">Upcoming <span class="badge" data-count="upcoming">0</span></button>
                <button class="tab" type="button" role="tab" data-value="past">Past stays <span class="badge" data-count="past">0</span></button>
                <button class="tab" type="button" role="tab" data-value="cancelled">Cancelled <span class="badge" data-count="cancelled">0</span></button>
            </div>
            <div class="stack" data-region="booking-list" role="tabpanel" aria-live="polite">
                <p class="text-muted">Loading bookings…</p>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
