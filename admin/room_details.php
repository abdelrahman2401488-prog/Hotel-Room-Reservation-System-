<?php
$pageTitle   = 'Room details';
$pageId      = 'admin-room-details';
$pageScripts = ['admin.js'];
$pageRoles   = 'admin';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
            <div data-region="room-admin-page">
                <nav aria-label="Breadcrumb">
                    <ol class="breadcrumb">
                        <li><a href="manage_rooms.php">Rooms</a></li>
                        <li aria-current="page">Room <span data-field="room_number"></span></li>
                    </ol>
                </nav>
                <div class="page-header">
                    <div>
                        <h1 class="page-title" data-field="title">Room</h1>
                        <p class="text-muted mb-0">Room <span data-field="room_number"></span> &middot; <span data-field="type_label"></span> &middot; Floor <span data-field="floor"></span></p>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-outline" href="#" data-region="edit-link">Edit room</a>
                        <a class="btn btn-ghost" href="#" data-region="public-link">Guest view</a>
                        <a class="btn btn-danger" href="#" data-region="delete-link">Delete</a>
                    </div>
                </div>

                <div class="grid grid-4 mb-5" data-region="room-stats"></div>

                <div class="grid grid-2 items-start mb-5">
                    <div class="card">
                        <div data-region="room-media"></div>
                        <div class="card-body">
                            <p data-field="description"></p>
                            <ul class="chip-list" data-region="amenities"></ul>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Details &amp; status</h2></div>
                        <div class="card-body stack">
                            <div data-region="room-facts"></div>
                            <form class="flex items-end gap-2" data-form="room-status">
                                <div class="form-group flex-1">
                                    <label class="form-label" for="rd-status">Change status</label>
                                    <select class="form-control" id="rd-status" name="status">
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" type="submit">Update</button>
                            </form>
                        </div>
                    </div>
                </div>

                <h2 class="text-xl">Reservations for this room</h2>
                <div class="table-wrapper">
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Reference</th>
                                <th scope="col">Guest</th>
                                <th scope="col">Stay</th>
                                <th scope="col" class="num">Total</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody data-region="room-reservations"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
