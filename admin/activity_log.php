<?php
$pageTitle   = 'Activity log';
$pageId      = 'activity-log';
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
                        <h1 class="page-title">Activity log</h1>
                        <p class="text-muted mb-0">Price, booking and payment actions recorded by the demo (this browser only, newest first).</p>
                    </div>
                </div>

                <!-- BACKEND INTEGRATION: read from an activity_log table written by
                     the PHP handlers; restrict to admins server-side. -->
                <form class="toolbar" data-form="activity-filters" role="search">
                    <div class="form-group">
                        <label class="form-label" for="al-category">Show</label>
                        <select class="form-control" id="al-category" name="category">
                            <option value="">All activity</option>
                            <option value="price">Prices</option>
                            <option value="booking">Bookings</option>
                            <option value="payment">Payments</option>
                        </select>
                    </div>
                </form>

                <div class="table-wrapper">
                    <table class="table table-striped">
                        <caption class="sr-only">Activity log</caption>
                        <thead>
                            <tr>
                                <th scope="col">Time</th>
                                <th scope="col">Action</th>
                                <th scope="col">Reference</th>
                                <th scope="col">Description</th>
                                <th scope="col">User</th>
                            </tr>
                        </thead>
                        <tbody data-region="activity-rows">
                            <tr><td colspan="5" class="table-empty">Loading activity…</td></tr>
                        </tbody>
                    </table>
                </div>
                <div data-region="pager"></div>
                <p class="text-sm text-muted mt-2" data-region="row-count"></p>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
