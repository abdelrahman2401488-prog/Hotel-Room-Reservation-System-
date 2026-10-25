<?php
/**
 * Shared page footer. Closes the document opened by includes/header.php and
 * loads the shared scripts followed by the page's $pageScripts.
 *
 * Script order matters: main.js (helpers/UI) -> validation.js -> mock-data.js
 * (DEMO data) -> data-service.js (data access layer) -> page scripts.
 */
?>
    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <p class="footer-brand">Aurelia Grand Hotel</p>
                    <p>Timeless comfort on the Corniche. Rooms, suites and service designed around you.</p>
                    <p class="mt-2">12 Corniche Road, Alexandria &middot; +20 3 000 0000 (sample)</p>
                </div>
                <div class="stack">
                    <h2 class="footer-title">Guests</h2>
                    <ul class="footer-links">
                        <li><a href="<?= $baseUrl ?>guest/search_rooms.php">Find a room</a></li>
                        <li><a href="<?= $baseUrl ?>guest/my_bookings.php">My bookings</a></li>
                        <li><a href="<?= $baseUrl ?>reservations/booking_status.php">Booking status</a></li>
                        <li><a href="<?= $baseUrl ?>reviews/list_reviews.php">Guest reviews</a></li>
                    </ul>
                </div>
                <div class="stack">
                    <h2 class="footer-title">Operations</h2>
                    <ul class="footer-links">
                        <li><a href="<?= $baseUrl ?>staff/dashboard.php">Staff dashboard</a></li>
                        <li><a href="<?= $baseUrl ?>staff/checkin_checkout.php">Check-in / out</a></li>
                        <li><a href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
                        <li><a href="<?= $baseUrl ?>reports/booking_reports.php">Reports</a></li>
                    </ul>
                </div>
                <div class="stack">
                    <h2 class="footer-title">Account</h2>
                    <ul class="footer-links">
                        <li><a href="<?= $baseUrl ?>login.php">Sign in</a></li>
                        <li><a href="<?= $baseUrl ?>register.php">Create account</a></li>
                        <li><a href="<?= $baseUrl ?>admin/dashboard.php">Admin</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <span>&copy; <?= date('Y') ?> Aurelia Grand Hotel &middot; Hotel Room Reservation System</span>
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
