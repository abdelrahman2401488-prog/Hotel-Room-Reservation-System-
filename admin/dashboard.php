<?php
$pageTitle   = 'Admin dashboard';
$pageId      = 'admin-dashboard';
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
                        <h1 class="page-title">Admin dashboard</h1>
                        <p class="text-muted mb-0">Rooms, occupancy and revenue at a glance (demo data).</p>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-outline" href="manage_pricing.php">Pricing</a>
                        <a class="btn btn-accent" href="add_room.php">Add room</a>
                    </div>
                </div>

                <div class="grid grid-4 mb-5" data-region="stats"></div>

                <div class="grid grid-2 items-start mb-5">
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Rooms by status</h2></div>
                        <div class="card-body" data-region="status-chart"></div>
                    </section>
                    <section class="card">
                        <div class="card-header"><h2 class="text-lg mb-0">Revenue by room type</h2></div>
                        <div class="card-body" data-region="type-chart"></div>
                    </section>
                </div>

                <section>
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h2 class="text-xl mb-0">Recent reservations</h2>
                        <a class="btn btn-ghost btn-sm" href="../reservations/manage_bookings.php">View all</a>
                    </div>
                    <div class="table-wrapper">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Reference</th>
                                    <th scope="col">Guest</th>
                                    <th scope="col">Room</th>
                                    <th scope="col">Check-in</th>
                                    <th scope="col" class="num">Total</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody data-region="recent"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
