<?php
$pageTitle   = 'Book your stay';
$pageId      = 'book-room';
$pageScripts = ['booking.js'];
$pageRoles   = 'guest';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <ol class="steps" aria-label="Booking progress">
            <li class="step is-complete"><span class="step-label">Choose room</span></li>
            <li class="step is-active" aria-current="step"><span class="step-label">Your details</span></li>
            <li class="step"><span class="step-label">Payment</span></li>
            <li class="step"><span class="step-label">Confirmation</span></li>
        </ol>

        <div class="page-header">
            <div>
                <h1 class="page-title">Complete your booking</h1>
                <p class="text-muted mb-0">Review your stay and tell us who is travelling.</p>
            </div>
        </div>

        <div data-region="book-page">
            <div class="layout-split">
                <!-- BACKEND INTEGRATION: POST to this page; re-check availability
                     and recompute the price in PHP inside a transaction, insert
                     into reservations, then redirect to booking_confirmation.php. -->
                <form class="form" method="post" action="book_room.php" data-form="booking">
                    <input type="hidden" name="room_id" value="">

                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Stay details</h2></div>
                        <div class="card-body form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required" for="b-check-in">Check-in</label>
                                    <input class="form-control" type="date" id="b-check-in" name="check_in_date" required data-rule="date-not-past">
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="b-check-out">Check-out</label>
                                    <input class="form-control" type="date" id="b-check-out" name="check_out_date" required data-after="check_in_date" data-error-after="Check-out must be after check-in.">
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="b-guests">Guests</label>
                                    <select class="form-control" id="b-guests" name="num_guests" required></select>
                                </div>
                            </div>
                            <div data-region="availability" aria-live="polite"></div>
                        </div>
                    </section>

                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Lead guest</h2></div>
                        <div class="card-body form">
                            <div class="form-group">
                                <label class="form-label required" for="b-name">Full name</label>
                                <input class="form-control" type="text" id="b-name" name="guest_name" autocomplete="name" required minlength="3">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required" for="b-email">Email</label>
                                    <input class="form-control" type="email" id="b-email" name="guest_email" autocomplete="email" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="b-phone">Phone</label>
                                    <input class="form-control" type="tel" id="b-phone" name="guest_phone" autocomplete="tel" required data-rule="phone">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="b-arrival">Estimated arrival time</label>
                                <select class="form-control" id="b-arrival" name="arrival_time">
                                    <option value="">I don't know yet</option>
                                    <option value="14:00-16:00">14:00 – 16:00</option>
                                    <option value="16:00-18:00">16:00 – 18:00</option>
                                    <option value="18:00-20:00">18:00 – 20:00</option>
                                    <option value="20:00-23:00">20:00 – 23:00</option>
                                    <option value="after-23:00">After 23:00</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="b-requests">Special requests</label>
                                <textarea class="form-control" id="b-requests" name="special_requests" maxlength="500" placeholder="Dietary needs, celebrations, accessibility…"></textarea>
                                <p class="form-help">Requests are subject to availability.</p>
                            </div>
                            <div class="form-group">
                                <label class="form-check" for="b-terms">
                                    <input type="checkbox" id="b-terms" name="accept_terms" value="1" required data-error-required="Please accept the booking and cancellation policy.">
                                    I accept the booking terms and the free-cancellation policy (48 hours before check-in).
                                </label>
                            </div>
                        </div>
                    </section>

                    <div class="form-actions">
                        <a class="btn btn-ghost" href="search_rooms.php" data-region="back-link">Back to rooms</a>
                        <button class="btn btn-accent btn-lg" type="submit">Confirm booking</button>
                    </div>
                </form>

                <aside class="sticky-aside">
                    <div class="card">
                        <div data-region="room-summary"></div>
                        <div class="card-body">
                            <h2 class="text-lg">Price summary</h2>
                            <div data-region="quote" aria-live="polite"></div>
                        </div>
                        <div class="card-footer text-sm text-muted">
                            Estimate only. You will pay on the next step or at the hotel.
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
