<?php
$pageTitle   = 'Modify booking';
$pageId      = 'modify-booking';
$pageScripts = ['booking.js', 'reservations.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
                <li><a href="../guest/my_bookings.php">My bookings</a></li>
                <li><a href="#" data-region="status-crumb">Booking</a></li>
                <li aria-current="page">Modify</li>
            </ol>
        </nav>
        <div class="page-header">
            <div>
                <h1 class="page-title">Modify booking <span class="reference-code text-lg" data-field="booking_reference">…</span></h1>
                <p class="text-muted mb-0">Change your dates, room or number of guests. The price updates as you go.</p>
            </div>
        </div>

        <div class="layout-split" data-region="modify-page">
            <!-- BACKEND INTEGRATION: POST to this page; lock the reservation
                 row, re-check availability and recompute the price in PHP. -->
            <form class="card" method="post" action="modify_booking.php" data-form="modify">
                <div class="card-body form">
                    <input type="hidden" name="booking_reference" value="">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="m-check-in">Check-in</label>
                            <input class="form-control" type="date" id="m-check-in" name="check_in_date" required data-rule="date-not-past">
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="m-check-out">Check-out</label>
                            <input class="form-control" type="date" id="m-check-out" name="check_out_date" required data-after="check_in_date" data-error-after="Check-out must be after check-in.">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="m-room">Room</label>
                            <select class="form-control" id="m-room" name="room_id" required data-reprice></select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="m-guests">Guests</label>
                            <select class="form-control" id="m-guests" name="num_guests" required></select>
                        </div>
                    </div>
                    <div data-region="availability" aria-live="polite"></div>
                    <div class="form-group">
                        <label class="form-label" for="m-requests">Special requests</label>
                        <textarea class="form-control" id="m-requests" name="special_requests" maxlength="500"></textarea>
                    </div>
                    <div class="form-actions">
                        <a class="btn btn-ghost" href="#" data-region="cancel-link">Discard changes</a>
                        <button class="btn btn-primary" type="submit">Review &amp; save changes</button>
                    </div>
                </div>
            </form>

            <aside class="sticky-aside stack">
                <div class="card">
                    <div class="card-header"><h2 class="text-lg mb-0">Current booking</h2></div>
                    <div class="card-body" data-region="current"></div>
                </div>
                <div class="card">
                    <div class="card-header"><h2 class="text-lg mb-0">New price</h2></div>
                    <div class="card-body">
                        <div data-region="quote" aria-live="polite"></div>
                        <div class="mt-4" data-region="difference" aria-live="polite"></div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
