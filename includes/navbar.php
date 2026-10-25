<?php
/**
 * Main navigation + prototype banner. Included by includes/header.php.
 *
 * The active link (aria-current) and the signed-in / signed-out items are set
 * by assets/js/main.js from the DEMO session in localStorage.
 *
 * BACKEND INTEGRATION: render the auth items from the PHP session and hide
 * admin / staff links for users without those roles.
 */
?>
    <header class="navbar">
        <nav class="container navbar-inner" aria-label="Main">
            <a class="navbar-brand" href="<?= $baseUrl ?>index.php">
                <span class="navbar-brand-mark" aria-hidden="true">A</span>
                Aurelia Grand
            </a>
            <button class="navbar-toggle" type="button" aria-expanded="false" aria-controls="navbar-menu">Menu</button>
            <ul class="navbar-menu" id="navbar-menu">
                <li><a class="navbar-link" href="<?= $baseUrl ?>index.php">Home</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>guest/search_rooms.php">Rooms</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>guest/my_bookings.php">My Bookings</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>reviews/list_reviews.php">Reviews</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>reservations/manage_bookings.php">Reservations</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>staff/dashboard.php">Staff</a></li>
                <li><a class="navbar-link" href="<?= $baseUrl ?>admin/dashboard.php">Admin</a></li>
                <li data-auth="signed-out"><a class="navbar-link" href="<?= $baseUrl ?>login.php">Sign in</a></li>
                <li data-auth="signed-out"><a class="btn btn-accent btn-sm" href="<?= $baseUrl ?>register.php">Register</a></li>
                <li data-auth="signed-in" hidden>
                    <span class="navbar-user"><span class="avatar" data-user-initials></span><span data-user-name></span></span>
                </li>
                <li data-auth="signed-in" hidden><a class="btn btn-ghost btn-sm" href="<?= $baseUrl ?>logout.php">Sign out</a></li>
            </ul>
        </nav>
    </header>
    <div class="demo-banner" role="note">
        <div class="container demo-banner-inner">
            <span><strong>Prototype mode:</strong> all rooms, bookings, payments and accounts are sample data stored in this browser. Nothing is sent to a server.</span>
            <button class="btn btn-ghost btn-sm" type="button" data-action="reset-demo">Reset demo data</button>
        </div>
    </div>
