<?php
$pageTitle   = 'Manage reservations';
$pageId      = 'manage-bookings';
$pageScripts = ['reservations.js'];
$pageRoles   = 'staff,admin';
$sharedSidebar = true;   // admin and staff each see their own sidebar
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
<?php require __DIR__ . '/../includes/staff_sidebar.php'; ?>
            <div>
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Reservations</h1>
                        <p class="text-muted mb-0">Search, update and cancel bookings.</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline" type="button" data-action="export">Export CSV</button>
                    </div>
                </div>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <!-- GET filters: same names can be read from $_GET by PHP later -->
                <form class="toolbar" method="get" action="manage_bookings.php" data-form="booking-filters" role="search">
                    <div class="form-group">
                        <label class="form-label" for="mb-query">Search</label>
                        <input class="form-control" type="search" id="mb-query" name="query" placeholder="Reference, guest, email, room">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mb-status">Status</label>
                        <select class="form-control" id="mb-status" name="status">
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Checked in</option>
                            <option value="checked-out">Checked out</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mb-payment">Payment</label>
                        <select class="form-control" id="mb-payment" name="payment_status">
                            <option value="">All payments</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mb-from">Stay from</label>
                        <input class="form-control" type="date" id="mb-from" name="from">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mb-to">Stay to</label>
                        <input class="form-control" type="date" id="mb-to" name="to">
                    </div>
                    <button class="btn btn-ghost" type="reset">Clear</button>
                </form>

                <div class="table-wrapper">
                    <table class="table table-hover">
                        <caption class="sr-only">Reservations</caption>
                        <thead>
                            <tr>
                                <th scope="col">Reference</th>
                                <th scope="col">Guest</th>
                                <th scope="col">Room</th>
                                <th scope="col">Stay</th>
                                <th scope="col" class="num">Total</th>
                                <th scope="col">Status</th>
                                <th scope="col">Payment</th>
                                <th scope="col" class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody data-region="booking-rows">
                            <tr><td colspan="8" class="table-empty">Loading reservations…</td></tr>
                        </tbody>
                    </table>
                </div>
                <div data-region="pager"></div>
                <p class="text-sm text-muted mt-2" data-region="row-count"></p>
            </div>
        </div>
    </div>

    <!-- Status change modal -->
    <div class="modal-overlay" id="status-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
            <form data-form="status-change" method="post" action="manage_bookings.php">
                <div class="modal-header">
                    <h2 class="modal-title" id="status-modal-title">Update status</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="booking_reference" value="">
                    <p class="text-sm text-muted mb-0" data-region="status-modal-summary"></p>
                    <div class="form-group">
                        <label class="form-label required" for="sc-status">Booking status</label>
                        <select class="form-control" id="sc-status" name="status" required>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Checked in</option>
                            <option value="checked-out">Checked out</option>
                        </select>
                        <p class="form-help">To cancel, use the Cancel action so refunds are calculated.</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="sc-payment">Payment status</label>
                        <select class="form-control" id="sc-payment" name="payment_status">
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Save status</button>
                </div>
            </form>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
