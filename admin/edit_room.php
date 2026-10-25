<?php
$pageTitle   = 'Edit room';
$pageId      = 'room-form';
$pageScripts = ['admin.js'];
$pageRoles   = 'admin';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
            <div data-region="edit-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Edit room <span data-field="room_number"></span></h1>
                        <p class="text-muted mb-0">Update details, pricing and availability status.</p>
                    </div>
                    <a class="btn btn-ghost" href="#" data-region="details-link">View room</a>
                </div>
<?php require __DIR__ . '/../includes/room_form.php'; ?>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
