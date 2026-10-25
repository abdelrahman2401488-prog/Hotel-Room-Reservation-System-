<?php
$pageTitle   = 'Staff dashboard';
$pageId      = 'staff-dashboard';
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
                        <h1 class="page-title">Front desk</h1>
                        <p class="text-muted mb-0" data-field="today">Today</p>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-outline" href="room_service.php">New request</a>
                        <a class="btn btn-accent" href="checkin_checkout.php">Check-in / out</a>
                    </div>
                </div>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <div class="grid grid-2 items-start mb-5">
                    <section class="card">
                        <div class="card-header flex items-center justify-between">
                            <h2 class="text-lg mb-0">Arrivals today</h2>
                            <a class="btn btn-ghost btn-sm" href="checkin_checkout.php">All</a>
                        </div>
                        <div class="table-wrapper">
                            <table class="table">
                                <tbody data-region="arrivals"></tbody>
                            </table>
                        </div>
                    </section>
                    <section class="card">
                        <div class="card-header flex items-center justify-between">
                            <h2 class="text-lg mb-0">Departures today</h2>
                            <a class="btn btn-ghost btn-sm" href="checkin_checkout.php?tab=departures">All</a>
                        </div>
                        <div class="table-wrapper">
                            <table class="table">
                                <tbody data-region="departures"></tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <section class="card mb-5" aria-labelledby="board-title">
                    <div class="card-header flex flex-wrap items-center justify-between gap-2">
                        <h2 class="text-lg mb-0" id="board-title">Room status board</h2>
                        <span class="flex flex-wrap gap-2 text-xs">
                            <span class="badge status-available">Available</span>
                            <span class="badge status-occupied">Occupied</span>
                            <span class="badge status-maintenance">Maintenance</span>
                        </span>
                    </div>
                    <div class="card-body">
                        <p class="text-sm text-muted">Select a room to update its housekeeping status.</p>
                        <div class="room-board" data-region="room-board"></div>
                    </div>
                </section>

                <section class="card">
                    <div class="card-header flex items-center justify-between">
                        <h2 class="text-lg mb-0">Open guest requests</h2>
                        <a class="btn btn-ghost btn-sm" href="room_service.php">Manage</a>
                    </div>
                    <div class="card-body stack" data-region="open-requests"></div>
                </section>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="room-status-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="room-status-title">
            <form data-form="board-status">
                <div class="modal-header">
                    <h2 class="modal-title" id="room-status-title">Room</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="room_id" value="">
                    <p class="text-sm text-muted mb-0" data-region="room-status-summary"></p>
                    <fieldset class="option-group">
                        <legend class="form-label mb-2">Status</legend>
                        <label class="option-card"><input type="radio" name="status" value="available" required> Available</label>
                        <label class="option-card"><input type="radio" name="status" value="occupied"> Occupied</label>
                        <label class="option-card"><input type="radio" name="status" value="maintenance"> Maintenance</label>
                    </fieldset>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Update status</button>
                </div>
            </form>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
