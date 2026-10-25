<?php
/**
 * Side navigation for staff pages. Active link is set by assets/js/main.js.
 * Contains no admin (room / pricing management) links.
 */
?>
        <aside class="sidebar" aria-label="Staff" data-nav="staff">
            <div class="sidebar-brand">
                <img src="<?= $baseUrl ?>assets/images/brand/logo-mark.svg" alt="" width="32" height="32">
                <span>Staff console</span>
            </div>
            <h2 class="sidebar-title">Front desk</h2>
            <ul class="sidebar-nav">
                <li><a class="sidebar-link" href="<?= $baseUrl ?>staff/dashboard.php">Dashboard</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>staff/checkin_checkout.php">Check-in / out</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
            </ul>
            <h2 class="sidebar-title">Guest care</h2>
            <ul class="sidebar-nav">
                <li><a class="sidebar-link" href="<?= $baseUrl ?>staff/room_service.php">Room service</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>staff/complaints.php">Complaints</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reviews/list_reviews.php">Reviews</a></li>
            </ul>
            <h2 class="sidebar-title">Insights</h2>
            <ul class="sidebar-nav">
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reports/booking_reports.php">Booking reports</a></li>
                <li><a class="sidebar-link" href="<?= $baseUrl ?>reports/revenue_reports.php">Revenue reports</a></li>
            </ul>
        </aside>
