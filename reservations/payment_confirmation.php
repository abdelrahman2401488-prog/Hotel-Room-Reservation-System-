<?php
$pageTitle   = 'Payment confirmation';
$pageId      = 'payment-confirmation';
$pageScripts = ['payment.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <ol class="steps no-print" aria-label="Booking progress">
            <li class="step is-complete"><span class="step-label">Choose room</span></li>
            <li class="step is-complete"><span class="step-label">Your details</span></li>
            <li class="step is-complete"><span class="step-label">Payment</span></li>
            <li class="step is-active" aria-current="step"><span class="step-label">Confirmation</span></li>
        </ol>

        <div class="receipt" data-region="receipt">
            <div class="receipt-header">
                <div class="success-icon" aria-hidden="true">&#10003;</div>
                <h1 class="text-3xl" data-field="heading">Payment successful</h1>
                <p class="text-muted" data-field="subheading">Thank you. Your booking is confirmed.</p>
            </div>

            <div class="alert alert-warning" role="note">
                <span>Demo receipt: no money was charged and the transaction reference is simulated.</span>
            </div>

            <div class="card mb-5">
                <div class="card-header flex items-center justify-between gap-3">
                    <h2 class="text-lg mb-0">Receipt</h2>
                    <span data-region="badges"></span>
                </div>
                <div class="card-body" data-region="receipt-details"></div>
                <div class="card-footer flex items-center justify-between">
                    <span class="font-semibold">Amount</span>
                    <span class="price text-2xl" data-field="amount"></span>
                </div>
            </div>

            <div class="btn-group justify-center no-print">
                <a class="btn btn-primary" href="#" data-region="status-link">View booking status</a>
                <a class="btn btn-outline" href="../guest/my_bookings.php">My bookings</a>
                <button class="btn btn-ghost" type="button" data-action="print">Print receipt</button>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
