<?php
$pageTitle   = 'Check-in / check-out';
$pageId      = 'checkin-checkout';
$pageScripts = ['staff.js'];
$pageRoles   = 'staff';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/staff_sidebar.php'; ?>
            <div>
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Check-in &amp; check-out</h1>
                        <p class="text-muted mb-0">Welcome arriving guests and settle departures.</p>
                    </div>
                    <div class="form-group">
                        <label class="sr-only" for="cc-search">Search guests</label>
                        <input class="form-control" type="search" id="cc-search" placeholder="Search name, reference or room">
                    </div>
                </div>

                <div class="tabs" role="tablist" aria-label="Front desk lists">
                    <button class="tab" type="button" role="tab" data-value="arrivals" aria-selected="true">Arrivals <span class="badge" data-count="arrivals">0</span></button>
                    <button class="tab" type="button" role="tab" data-value="departures">Departures <span class="badge" data-count="departures">0</span></button>
                    <button class="tab" type="button" role="tab" data-value="in-house">In house <span class="badge" data-count="in-house">0</span></button>
                </div>

                <div class="table-wrapper" role="tabpanel">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Guest</th>
                                <th scope="col">Room</th>
                                <th scope="col">Stay</th>
                                <th scope="col">Payment</th>
                                <th scope="col">Status</th>
                                <th scope="col" class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody data-region="desk-rows"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Check-in modal. BACKEND INTEGRATION: POST updates reservations.status
         and rooms.status in one transaction and records the staff member. -->
    <div class="modal-overlay" id="checkin-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
            <form data-form="checkin" method="post" action="checkin_checkout.php">
                <div class="modal-header">
                    <h2 class="modal-title" id="checkin-title">Check in guest</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="booking_reference" value="">
                    <div data-region="checkin-summary"></div>
                    <label class="form-check" for="ci-id">
                        <input type="checkbox" id="ci-id" name="id_verified" value="1" required data-error-required="Confirm the guest's ID was checked."> Photo ID verified
                    </label>
                    <div class="form-group" data-region="collect-payment">
                        <label class="form-check" for="ci-paid">
                            <input type="checkbox" id="ci-paid" name="payment_collected" value="1"> Payment collected at desk
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="ci-keys">Key cards issued</label>
                        <select class="form-control" id="ci-keys" name="key_cards">
                            <option value="1">1</option>
                            <option value="2" selected>2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-success" type="submit">Complete check-in</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal-overlay" id="checkout-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <form data-form="checkout" method="post" action="checkin_checkout.php">
                <div class="modal-header">
                    <h2 class="modal-title" id="checkout-title">Check out guest</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="booking_reference" value="">
                    <div data-region="checkout-summary"></div>
                    <label class="form-check" for="co-inspect">
                        <input type="checkbox" id="co-inspect" name="room_inspected" value="1" required data-error-required="Confirm the room was inspected."> Room inspected, minibar checked
                    </label>
                    <label class="form-check" for="co-keys">
                        <input type="checkbox" id="co-keys" name="keys_returned" value="1" required data-error-required="Confirm key cards were returned."> Key cards returned
                    </label>
                    <label class="form-check" data-region="settle-balance" for="co-settle">
                        <input type="checkbox" id="co-settle" name="balance_settled" value="1" required data-error-required="The balance must be settled before check-out."> Outstanding balance settled
                    </label>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Complete check-out</button>
                </div>
            </form>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
