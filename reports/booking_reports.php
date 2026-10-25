<?php
$pageTitle   = 'Booking reports';
$pageId      = 'booking-reports';
$pageScripts = ['reports.js'];
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
                        <h1 class="page-title">Booking reports</h1>
                        <p class="text-muted mb-0">Volume, stay length and cancellations. Calculated in the browser from demo data.</p>
                    </div>
                    <div class="btn-group no-print">
                        <button class="btn btn-outline" type="button" data-action="export">Export CSV</button>
                        <button class="btn btn-ghost" type="button" data-action="print">Print</button>
                    </div>
                </div>

                <!-- BACKEND INTEGRATION: the same GET filters can drive SQL
                     aggregate queries (GROUP BY month / room_type) in PHP. -->
                <form class="toolbar no-print" method="get" action="booking_reports.php" data-form="report-filters">
                    <div class="form-group">
                        <label class="form-label" for="rp-from">Check-in from</label>
                        <input class="form-control" type="date" id="rp-from" name="from">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rp-to">Check-in to</label>
                        <input class="form-control" type="date" id="rp-to" name="to" data-after="from" data-error-after="End date must be after the start date.">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rp-type">Room type</label>
                        <select class="form-control" id="rp-type" name="room_type">
                            <option value="">All types</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="family">Family</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rp-status">Status</label>
                        <select class="form-control" id="rp-status" name="status">
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Checked in</option>
                            <option value="checked-out">Checked out</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" type="button" data-action="reset-filters">Reset</button>
                </form>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <div class="grid grid-2 items-start mb-5">
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Bookings by month</h2></div>
                        <div class="card-body" data-region="by-month"></div>
                    </section>
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Bookings by room type</h2></div>
                        <div class="card-body" data-region="by-type"></div>
                    </section>
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Bookings by status</h2></div>
                        <div class="card-body" data-region="by-status"></div>
                    </section>
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Average stay by room type</h2></div>
                        <div class="card-body" data-region="stay-length"></div>
                    </section>
                </div>

                <h2 class="text-xl">Bookings in this report</h2>
                <div class="table-wrapper">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Reference</th>
                                <th scope="col">Guest</th>
                                <th scope="col">Room type</th>
                                <th scope="col">Check-in</th>
                                <th scope="col" class="num">Nights</th>
                                <th scope="col" class="num">Total</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody data-region="report-rows"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
