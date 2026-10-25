<?php
/**
 * Shared page footer. Closes the document opened by includes/header.php and
 * loads the shared scripts followed by the page's $pageScripts.
 * Link lists use the same data-nav audiences as includes/navbar.php.
 *
 * Script order matters: main.js (helpers/UI) -> validation.js -> mock-data.js
 * (DEMO data) -> data-service.js (data access layer) -> page scripts.
 */
?>
    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <img class="footer-logo" src="<?= $baseUrl ?>assets/images/brand/logo.svg" alt="The Developers Hotel" width="272" height="64">
                    <p class="mt-3">Thoughtfully designed rooms and suites by the sea, with service built around you.</p>
                    <p class="mt-2">12 Corniche Road, Alexandria &middot; +20 3 000 0000 (sample)</p>
                </div>
                <div class="stack">
                    <h2 class="footer-title">Explore</h2>
                    <ul class="footer-links">
                        <li><a href="<?= $baseUrl ?>index.php">Home</a></li>
                        <li><a href="<?= $baseUrl ?>guest/search_rooms.php">Find a room</a></li>
                        <li><a href="<?= $baseUrl ?>reviews/list_reviews.php">Guest reviews</a></li>
                        <li><a href="<?= $baseUrl ?>reservations/booking_status.php">Booking status</a></li>
                    </ul>
                </div>
                <div class="stack">
                    <h2 class="footer-title">Account</h2>
                    <ul class="footer-links">
                        <li data-nav="public"><a href="<?= $baseUrl ?>login.php">Sign in</a></li>
                        <li data-nav="public"><a href="<?= $baseUrl ?>register.php">Create account</a></li>
                        <li data-nav="guest" hidden><a href="<?= $baseUrl ?>guest/my_bookings.php">My bookings</a></li>
                        <li data-nav="guest" hidden><a href="<?= $baseUrl ?>guest/leave_review.php">Review a stay</a></li>
                        <li data-nav="staff" hidden><a href="<?= $baseUrl ?>staff/dashboard.php">Staff dashboard</a></li>
                        <li data-nav="admin" hidden><a href="<?= $baseUrl ?>admin/dashboard.php">Admin dashboard</a></li>
                        <li data-nav="guest staff admin" hidden><a href="<?= $baseUrl ?>logout.php">Sign out</a></li>
                    </ul>
                </div>
                <div class="stack" data-nav="staff admin" hidden>
                    <h2 class="footer-title">Operations</h2>
                    <ul class="footer-links">
                        <li data-nav="staff" hidden><a href="<?= $baseUrl ?>staff/checkin_checkout.php">Check-in / out</a></li>
                        <li data-nav="staff" hidden><a href="<?= $baseUrl ?>staff/room_service.php">Room service</a></li>
                        <li data-nav="admin" hidden><a href="<?= $baseUrl ?>admin/manage_rooms.php">Manage rooms</a></li>
                        <li data-nav="admin" hidden><a href="<?= $baseUrl ?>admin/manage_pricing.php">Pricing</a></li>
                        <li><a href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
                        <li><a href="<?= $baseUrl ?>reports/booking_reports.php">Reports</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <span>&copy; <?= date('Y') ?> The Developers Hotel &middot; Hotel Room Reservation System</span>
                <span>Frontend prototype &middot; demo data only</span>
            </div>
        </div>
    </footer>

    <script src="<?= $baseUrl ?>assets/js/main.js"></script>
    <script src="<?= $baseUrl ?>assets/js/validation.js"></script>
    <script src="<?= $baseUrl ?>assets/js/mock-data.js"></script>
    <script src="<?= $baseUrl ?>assets/js/data-service.js"></script>
<?php foreach ($pageScripts as $script): ?>
    <script src="<?= $baseUrl ?>assets/js/<?= htmlspecialchars($script) ?>"></script>
<?php endforeach; ?>
</body>
</html>
