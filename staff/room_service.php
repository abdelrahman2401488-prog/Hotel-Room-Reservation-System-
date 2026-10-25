<?php
$pageTitle   = 'Room service';
$pageId      = 'room-service';
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
                        <h1 class="page-title">Room service &amp; requests</h1>
                        <p class="text-muted mb-0">Log guest requests and move them through to completion.</p>
                    </div>
                </div>

                <!-- BACKEND INTEGRATION: POST inserts into service_requests. -->
                <form class="card mb-5" method="post" action="room_service.php" data-form="service-request">
                    <div class="card-header"><h2 class="text-lg mb-0">New request</h2></div>
                    <div class="card-body form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required" for="sr-room">Room</label>
                                <select class="form-control" id="sr-room" name="room_number" required></select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="sr-guest">Guest</label>
                                <input class="form-control" type="text" id="sr-guest" name="guest_name" maxlength="80">
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="sr-type">Type</label>
                                <select class="form-control" id="sr-type" name="request_type" required>
                                    <option value="">Choose…</option>
                                    <option value="food">Food &amp; drink</option>
                                    <option value="housekeeping">Housekeeping</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="amenities">Amenities</option>
                                    <option value="transport">Transport</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="sr-priority">Priority</label>
                                <select class="form-control" id="sr-priority" name="priority" required>
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="sr-details">Details</label>
                            <textarea class="form-control" id="sr-details" name="details" required minlength="5" maxlength="300" placeholder="e.g. Two club sandwiches and sparkling water"></textarea>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-primary" type="submit">Add request</button>
                        </div>
                    </div>
                </form>

                <div class="kanban" data-region="kanban">
                    <section class="kanban-column" aria-labelledby="col-open">
                        <div class="kanban-header"><h3 id="col-open">Open</h3><span class="badge status-open" data-count="open">0</span></div>
                        <div class="stack" data-column="open"></div>
                    </section>
                    <section class="kanban-column" aria-labelledby="col-progress">
                        <div class="kanban-header"><h3 id="col-progress">In progress</h3><span class="badge status-in-progress" data-count="in-progress">0</span></div>
                        <div class="stack" data-column="in-progress"></div>
                    </section>
                    <section class="kanban-column" aria-labelledby="col-done">
                        <div class="kanban-header"><h3 id="col-done">Completed</h3><span class="badge status-completed" data-count="completed">0</span></div>
                        <div class="stack" data-column="completed"></div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
