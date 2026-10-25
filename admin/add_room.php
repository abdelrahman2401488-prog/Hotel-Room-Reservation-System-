<?php
$pageTitle   = 'Add room';
$pageId      = 'room-form';
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
                        <h1 class="page-title">Add a room</h1>
                        <p class="text-muted mb-0">Create a new room listing. It appears in guest search once saved.</p>
                    </div>
                </div>
<?php require __DIR__ . '/../includes/room_form.php'; ?>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
