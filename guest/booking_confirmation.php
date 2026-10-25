<?php
$pageTitle   = 'Booking confirmation';
$pageId      = 'booking-confirmation';
$pageScripts = ['booking.js'];
$pageRoles   = 'guest';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <ol class="steps no-print" aria-label="Booking progress">
            <li class="step is-complete"><span class="step-label">Choose room</span></li>
            <li class="step is-complete"><span class="step-label">Your details</span></li>
            <li class="step is-active" aria-current="step"><span class="step-label">Payment</span></li>
            <li class="step"><span class="step-label">Confirmation</span></li>
        </ol>

        <div class="receipt" data-region="confirmation">
            <div class="receipt-header">
                <div class="success-icon" aria-hidden="true">&#10003;</div>
                <h1 class="text-3xl">Booking received</h1>
                <p class="text-muted">Your booking reference is <span class="reference-code" data-field="booking_reference">…</span></p>
            </div>

            <div class="alert alert-warning" data-region="payment-alert" hidden>
                <span>Payment is still pending. Your room is held, and the booking is confirmed once payment is received.</span>
            </div>

            <div class="card mb-5">
                <div class="card-header flex items-center justify-between gap-3">
                    <h2 class="text-lg mb-0">Stay summary</h2>
                    <span data-region="status-badges"></span>
                </div>
                <div data-region="room-photo"></div>
                <div class="card-body" data-region="details"></div>
            </div>

            <div class="card mb-5">
                <div class="card-body">
                    <h2 class="text-lg">Price</h2>
                    <div data-region="quote"></div>
                </div>
            </div>

            <div class="btn-group justify-center no-print">
                <a class="btn btn-accent btn-lg" href="#" data-region="pay-link">Pay now</a>
                <a class="btn btn-outline" href="#" data-region="status-link">View status</a>
                <a class="btn btn-ghost" href="my_bookings.php">My bookings</a>
                <button class="btn btn-ghost" type="button" data-action="print">Print</button>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
