<?php
$pageTitle   = 'Complaints';
$pageId      = 'complaints';
$pageScripts = ['staff.js'];
$pageRole    = 'staff';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/staff_sidebar.php'; ?>
            <div>
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Guest complaints</h1>
                        <p class="text-muted mb-0">Track issues from report to resolution.</p>
                    </div>
                    <button class="btn btn-accent" type="button" data-modal-open="#new-complaint-modal">Log complaint</button>
                </div>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <form class="toolbar" data-form="complaint-filters" role="search">
                    <div class="form-group">
                        <label class="form-label" for="cf-status">Status</label>
                        <select class="form-control" id="cf-status" name="status">
                            <option value="">All</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="cf-priority">Priority</label>
                        <select class="form-control" id="cf-priority" name="priority">
                            <option value="">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="cf-category">Category</label>
                        <select class="form-control" id="cf-category" name="category">
                            <option value="">All</option>
                            <option value="noise">Noise</option>
                            <option value="cleanliness">Cleanliness</option>
                            <option value="service">Service</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="billing">Billing</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </form>

                <div class="table-wrapper">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Complaint</th>
                                <th scope="col">Guest</th>
                                <th scope="col">Category</th>
                                <th scope="col">Priority</th>
                                <th scope="col">Status</th>
                                <th scope="col">Logged</th>
                                <th scope="col" class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody data-region="complaint-rows"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- BACKEND INTEGRATION: POST inserts into complaints. -->
    <div class="modal-overlay" id="new-complaint-modal" hidden>
        <div class="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="new-complaint-title">
            <form method="post" action="complaints.php" data-form="complaint">
                <div class="modal-header">
                    <h2 class="modal-title" id="new-complaint-title">Log a complaint</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="nc-guest">Guest name</label>
                            <input class="form-control" type="text" id="nc-guest" name="guest_name" required minlength="3">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="nc-ref">Booking reference</label>
                            <input class="form-control font-mono" type="text" id="nc-ref" name="booking_reference" pattern="[Hh][Rr][Ss]-[0-9]{5}" data-error-pattern="Use the format HRS-12345." placeholder="HRS-10244">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="nc-room">Room</label>
                            <input class="form-control" type="text" id="nc-room" name="room_number" maxlength="6">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="nc-category">Category</label>
                            <select class="form-control" id="nc-category" name="category" required>
                                <option value="">Choose…</option>
                                <option value="noise">Noise</option>
                                <option value="cleanliness">Cleanliness</option>
                                <option value="service">Service</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="billing">Billing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="nc-priority">Priority</label>
                            <select class="form-control" id="nc-priority" name="priority" required>
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="nc-subject">Subject</label>
                        <input class="form-control" type="text" id="nc-subject" name="subject" required minlength="4" maxlength="80">
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="nc-description">Description</label>
                        <textarea class="form-control" id="nc-description" name="description" required minlength="10" maxlength="1000"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Log complaint</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal-overlay" id="manage-complaint-modal" hidden>
        <div class="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="manage-complaint-title">
            <form method="post" action="complaints.php" data-form="complaint-update">
                <div class="modal-header">
                    <h2 class="modal-title" id="manage-complaint-title">Complaint</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="complaint_id" value="">
                    <div data-region="complaint-details"></div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="mc-status">Status</label>
                            <select class="form-control" id="mc-status" name="status" required>
                                <option value="open">Open</option>
                                <option value="in-progress">In progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="mc-priority">Priority</label>
                            <select class="form-control" id="mc-priority" name="priority" required>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mc-notes">Resolution notes</label>
                        <textarea class="form-control" id="mc-notes" name="resolution_notes" maxlength="1000"></textarea>
                        <p class="form-help">Required when marking a complaint as resolved.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Save</button>
                </div>
            </form>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
