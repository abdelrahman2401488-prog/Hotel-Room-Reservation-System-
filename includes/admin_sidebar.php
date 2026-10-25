<?php
/**
 * Side navigation for admin pages. Active link is set by assets/js/main.js.
 */
?>
        <aside class="sidebar" aria-label="Admin">
            <h2 class="sidebar-title">Administration</h2>
            <ul class="sidebar-nav">
                <li><a class="sidebar-link" href="<?= $baseUrl ?>admin/dashboard.php">Dashboard</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>admin/manage_rooms.php">Rooms</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>admin/add_room.php">Add room</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>admin/manage_pricing.php">Pricing</a></li>
            </ul>
            <h2 class="sidebar-title">Business</h2>
            <ul class="sidebar-nav">
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reports/booking_reports.php">Booking reports</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reports/revenue_reports.php">Revenue reports</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reviews/list_reviews.php">Reviews</a></li>
            </ul>
        </aside>
