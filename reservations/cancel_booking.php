<?php
$pageTitle   = 'Cancel booking';
$pageId      = 'cancel-booking';
$pageScripts = ['reservations.js'];
$pageRoles   = 'guest,staff,admin';   // guests: own bookings only (checked in reservations.js)
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Cancel booking <span class="reference-code text-lg" data-field="booking_reference">…</span></h1>
                <p class="text-muted mb-0">Review the cancellation terms before confirming.</p>
            </div>
        </div>

        <div class="layout-split" data-region="cancel-page">
            <div class="stack">
                <section class="card">
                    <div class="card-header flex items-center justify-between gap-3">
                        <h2 class="text-lg mb-0">Booking</h2>
                        <span data-region="badges"></span>
                    </div>
                    <div class="card-body" data-region="details"></div>
                </section>

                <section class="alert alert-info" aria-label="Cancellation policy">
                    <span><strong>Cancellation policy.</strong> Free cancellation until 48 hours before check-in (14:00). After that, the first night is charged. Refunds go back to the original payment method.</span>
                </section>

                <!-- BACKEND INTEGRATION: POST to this page; PHP recalculates the
                     fee, updates the reservation and issues the refund. -->
                <form class="card" method="post" action="cancel_booking.php" data-form="cancel">
                    <div class="card-body form">
                        <input type="hidden" name="booking_reference" value="">
                        <div class="form-group">
                            <label class="form-label required" for="c-reason">Reason for cancelling</label>
                            <select class="form-control" id="c-reason" name="cancellation_reason" required>
                                <option value="">Choose a reason…</option>
                                <option value="Change of travel plans">Change of travel plans</option>
                                <option value="Found a better price">Found a better price</option>
                                <option value="Booked by mistake">Booked by mistake</option>
                                <option value="Personal or health reasons">Personal or health reasons</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="c-notes">Anything else? (optional)</label>
                            <textarea class="form-control" id="c-notes" name="notes" maxlength="500"></textarea>
                        </div>
                        <label class="form-check" for="c-confirm">
                            <input type="checkbox" id="c-confirm" name="confirm" value="1" required data-error-required="Please confirm you understand the cancellation terms.">
                            I understand this cancellation cannot be undone.
                        </label>
                        <div class="form-actions">
                            <a class="btn btn-ghost" href="#" data-region="keep-link">Keep my booking</a>
                            <button class="btn btn-danger" type="submit">Cancel booking</button>
                        </div>
                    </div>
                </form>
            </div>

            <aside class="sticky-aside">
                <div class="card">
                    <div class="card-header"><h2 class="text-lg mb-0">Refund estimate</h2></div>
                    <div class="card-body" data-region="refund"></div>
                </div>
            </aside>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
