<?php
$pageTitle   = 'Delete room';
$pageId      = 'delete-room';
$pageScripts = ['admin.js'];
$pageRoles   = 'admin';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
            <div data-region="delete-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Delete room <span data-field="room_number"></span></h1>
                        <p class="text-muted mb-0">Deleting removes the room from search and management screens.</p>
                    </div>
                </div>

                <div class="alert alert-error" role="note">
                    <span><strong>This action cannot be undone.</strong> Rooms with active reservations cannot be deleted. Consider setting the status to Maintenance instead.</span>
                </div>

                <div class="grid grid-2 items-start">
                    <div class="card">
                        <div data-region="room-media"></div>
                        <div class="card-body" data-region="room-facts"></div>
                    </div>
                    <!-- BACKEND INTEGRATION: POST with a CSRF token; PHP checks for
                         active reservations before deleting. -->
                    <form class="card" method="post" action="delete_room.php" data-form="delete-room">
                        <div class="card-body form">
                            <input type="hidden" name="room_id" value="">
                            <div data-region="reservation-check"></div>
                            <div class="form-group">
                                <label class="form-label required" for="d-confirm">Type the room number to confirm</label>
                                <input class="form-control" type="text" id="d-confirm" name="confirm_room_number" required autocomplete="off">
                            </div>
                            <div class="form-actions">
                                <a class="btn btn-ghost" href="manage_rooms.php">Keep room</a>
                                <button class="btn btn-danger" type="submit">Delete room</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
