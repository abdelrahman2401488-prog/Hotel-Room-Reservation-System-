<?php
$pageTitle   = 'Manage rooms';
$pageId      = 'manage-rooms';
$pageScripts = ['admin.js'];
$pageRoles   = 'admin';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
            <div>
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Rooms</h1>
                        <p class="text-muted mb-0">Add, edit, price and take rooms out of service.</p>
                    </div>
                    <a class="btn btn-accent" href="add_room.php">Add room</a>
                </div>

                <form class="toolbar" method="get" action="manage_rooms.php" data-form="room-admin-filters" role="search">
                    <div class="form-group">
                        <label class="form-label" for="ar-query">Search</label>
                        <input class="form-control" type="search" id="ar-query" name="query" placeholder="Number, name, view">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="ar-type">Type</label>
                        <select class="form-control" id="ar-type" name="room_type">
                            <option value="">All types</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="family">Family</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="ar-status">Status</label>
                        <select class="form-control" id="ar-status" name="status">
                            <option value="">All statuses</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <button class="btn btn-ghost" type="reset">Clear</button>
                </form>

                <div class="table-wrapper">
                    <table class="table table-hover">
                        <caption class="sr-only">Rooms</caption>
                        <thead>
                            <tr>
                                <th scope="col">Room</th>
                                <th scope="col">Type</th>
                                <th scope="col">Guests</th>
                                <th scope="col" class="num">Price / night</th>
                                <th scope="col">Status</th>
                                <th scope="col" class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody data-region="room-rows">
                            <tr><td colspan="6" class="table-empty">Loading rooms…</td></tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-sm text-muted mt-2" data-region="row-count"></p>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
