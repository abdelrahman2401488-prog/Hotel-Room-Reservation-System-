<?php
/**
 * Main navigation + prototype banner. Included by includes/header.php.
 *
 * Each item lists its audiences in data-nav: "public" (signed out), "guest",
 * "staff", "admin". assets/js/main.js shows only the current demo role's
 * items; without JavaScript the public items show. The active link
 * (aria-current) is also set by main.js.
 *
 * BACKEND INTEGRATION: render only the current session role's items in PHP.
 */
?>
    <header class="navbar">
        <nav class="container navbar-inner" aria-label="Main">
            <a class="navbar-brand" href="<?= $baseUrl ?>index.php">
                <img class="navbar-logo" src="<?= $baseUrl ?>assets/images/brand/logo-light.svg" alt="The Developers Hotel" width="272" height="64">
            </a>
            <button class="navbar-toggle" type="button" aria-expanded="false" aria-controls="navbar-menu">Menu</button>
            <ul class="navbar-menu" id="navbar-menu">
                <li data-nav="public guest"><a class="navbar-link" href="<?= $baseUrl ?>index.php">Home</a></li>
                <li data-nav="public guest"><a class="navbar-link" href="<?= $baseUrl ?>guest/search_rooms.php">Rooms</a></li>
                <li data-nav="guest" hidden><a class="navbar-link" href="<?= $baseUrl ?>guest/my_bookings.php">My Bookings</a></li>
                <li data-nav="public guest"><a class="navbar-link" href="<?= $baseUrl ?>reviews/list_reviews.php">Reviews</a></li>
                <li data-nav="public"><a class="navbar-link" href="<?= $baseUrl ?>reservations/booking_status.php">Booking status</a></li>

                <li data-nav="staff" hidden><a class="navbar-link" href="<?= $baseUrl ?>staff/dashboard.php">Staff Dashboard</a></li>
                <li data-nav="staff" hidden><a class="navbar-link" href="<?= $baseUrl ?>staff/checkin_checkout.php">Check-in / out</a></li>
                <li data-nav="staff" hidden><a class="navbar-link" href="<?= $baseUrl ?>staff/room_service.php">Room service</a></li>
                <li data-nav="staff" hidden><a class="navbar-link" href="<?= $baseUrl ?>staff/complaints.php">Complaints</a></li>

                <li data-nav="admin" hidden><a class="navbar-link" href="<?= $baseUrl ?>admin/dashboard.php">Admin Dashboard</a></li>
                <li data-nav="admin" hidden><a class="navbar-link" href="<?= $baseUrl ?>admin/manage_rooms.php">Rooms</a></li>
                <li data-nav="admin" hidden><a class="navbar-link" href="<?= $baseUrl ?>admin/manage_pricing.php">Pricing</a></li>

                <li data-nav="staff admin" hidden><a class="navbar-link" href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
                <li data-nav="staff admin" hidden><a class="navbar-link" href="<?= $baseUrl ?>reports/booking_reports.php">Reports</a></li>

                <li><button class="btn btn-ghost btn-sm" type="button" data-action="toggle-language" data-no-i18n lang="ar" aria-label="التبديل إلى العربية">العربية</button></li>
                <li>
                    <label class="sr-only" for="currency-select">Currency</label>
                    <select class="navbar-currency" id="currency-select" data-action="select-currency" data-no-i18n>
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </li>
                <li data-nav="public"><a class="navbar-link" href="<?= $baseUrl ?>login.php">Sign in</a></li>
                <li data-nav="public"><a class="btn btn-accent btn-sm" href="<?= $baseUrl ?>register.php">Register</a></li>
                <li data-nav="guest staff admin" hidden>
                    <span class="navbar-user">
                        <span class="avatar" data-user-initials aria-hidden="true"></span>
                        <span class="navbar-user-text"><span class="navbar-user-name" data-user-name></span><span class="navbar-user-role" data-user-role></span></span>
                    </span>
                </li>
                <li data-nav="guest staff admin" hidden><a class="btn btn-ghost btn-sm" href="<?= $baseUrl ?>logout.php">Sign out</a></li>
            </ul>
        </nav>
    </header>
    <div class="demo-banner" role="note">
        <div class="container demo-banner-inner">
            <span><strong>Prototype mode:</strong> all rooms, bookings, payments and accounts are sample data stored in this browser. Demo sign-in is not real security. Nothing is sent to a server.</span>
            <button class="btn btn-ghost btn-sm" type="button" data-action="reset-demo">Reset demo data</button>
        </div>
    </div>
