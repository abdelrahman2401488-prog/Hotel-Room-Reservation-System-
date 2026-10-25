<?php
$pageTitle   = 'Booking status';
$pageId      = 'booking-status';
$pageScripts = ['reservations.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container container-md">
        <div class="page-header">
            <div>
                <h1 class="page-title">Booking status</h1>
                <p class="text-muted mb-0">Look up a booking with its reference and the email used to book.</p>
            </div>
        </div>

        <!-- BACKEND INTEGRATION: POST (not GET) the lookup to PHP so emails
             are not exposed in URLs; rate-limit the endpoint. -->
        <form class="toolbar" method="post" action="booking_status.php" data-form="status-lookup">
            <div class="form-group">
                <label class="form-label required" for="s-ref">Booking reference</label>
                <input class="form-control font-mono" type="text" id="s-ref" name="booking_reference" required placeholder="HRS-10242" maxlength="12">
            </div>
            <div class="form-group">
                <label class="form-label required" for="s-email">Email</label>
                <input class="form-control" type="email" id="s-email" name="guest_email" required placeholder="you@example.com">
            </div>
            <button class="btn btn-primary" type="submit">Find booking</button>
        </form>
        <p class="form-help mb-5">Demo tip: try <span class="font-mono">HRS-10242</span> with <span class="font-mono">guest@example.com</span>.</p>

        <div data-region="status-result" aria-live="polite"></div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
