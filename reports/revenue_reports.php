<?php
$pageTitle   = 'Revenue reports';
$pageId      = 'revenue-reports';
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
                        <h1 class="page-title">Revenue reports</h1>
                        <p class="text-muted mb-0">Booked, collected and outstanding revenue. Demo figures, not accounting data.</p>
                    </div>
                    <div class="btn-group no-print">
                        <button class="btn btn-outline" type="button" data-action="export">Export CSV</button>
                        <button class="btn btn-ghost" type="button" data-action="print">Print</button>
                    </div>
                </div>

                <!-- BACKEND INTEGRATION: aggregate payments/reservations in SQL. -->
                <form class="toolbar no-print" method="get" action="revenue_reports.php" data-form="report-filters">
                    <div class="form-group">
                        <label class="form-label" for="rv-from">Check-in from</label>
                        <input class="form-control" type="date" id="rv-from" name="from">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rv-to">Check-in to</label>
                        <input class="form-control" type="date" id="rv-to" name="to" data-after="from" data-error-after="End date must be after the start date.">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rv-type">Room type</label>
                        <select class="form-control" id="rv-type" name="room_type">
                            <option value="">All types</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="family">Family</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" type="button" data-action="reset-filters">Reset</button>
                </form>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <div class="grid grid-2 items-start mb-5">
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Revenue by month</h2></div>
                        <div class="card-body" data-region="by-month"></div>
                    </section>
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Revenue by room type</h2></div>
                        <div class="card-body" data-region="by-type"></div>
                    </section>
                </div>

                <h2 class="text-xl">Payments</h2>
                <div class="table-wrapper">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Transaction</th>
                                <th scope="col">Booking</th>
                                <th scope="col">Guest</th>
                                <th scope="col">Method</th>
                                <th scope="col">Date</th>
                                <th scope="col" class="num">Amount</th>
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
