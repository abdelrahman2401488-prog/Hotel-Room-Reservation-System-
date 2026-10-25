<?php
$pageTitle   = 'Welcome';
$pageId      = 'home';
$pageScripts = ['booking.js'];
require __DIR__ . '/includes/header.php';
?>
<main id="main" class="main-content main-flush">
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <span class="eyebrow">Alexandria &middot; Since 1924</span>
                <h1>A grand stay on the Mediterranean</h1>
                <p class="hero-lead">Sea-view rooms, signature suites and attentive service. Find the room that suits your trip and book it in a few steps.</p>
            </div>

            <!-- Plain GET form: works without JavaScript and maps 1:1 to the
                 query parameters read by guest/search_rooms.php -->
            <form class="hero-search" action="guest/search_rooms.php" method="get" data-form="hero-search">
                <div class="search-row">
                    <div class="form-group">
                        <label class="form-label" for="hero-check-in">Check-in</label>
                        <input class="form-control" type="date" id="hero-check-in" name="check_in" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="hero-check-out">Check-out</label>
                        <input class="form-control" type="date" id="hero-check-out" name="check_out" required data-after="check_in" data-error-after="Check-out must be after check-in.">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="hero-guests">Guests</label>
                        <select class="form-control" id="hero-guests" name="guests">
                            <option value="1">1 guest</option>
                            <option value="2" selected>2 guests</option>
                            <option value="3">3 guests</option>
                            <option value="4">4 guests</option>
                            <option value="5">5 guests</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="hero-type">Room type</label>
                        <select class="form-control" id="hero-type" name="room_type">
                            <option value="">Any type</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="family">Family</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <button class="btn btn-accent btn-lg" type="submit">Check availability</button>
                </div>
            </form>
        </div>
    </section>

    <div class="container">
        <section class="section mt-6" aria-labelledby="featured-title">
            <div class="section-header">
                <span class="eyebrow">Rooms &amp; suites</span>
                <h2 id="featured-title">Featured stays</h2>
                <p class="text-muted">A selection of our most requested rooms. Sample listings for the prototype.</p>
            </div>
            <div class="grid grid-3" data-region="featured-rooms" aria-live="polite">
                <p class="text-muted">Loading rooms…</p>
            </div>
            <div class="text-center mt-6">
                <a class="btn btn-outline" href="guest/search_rooms.php">Browse all rooms</a>
            </div>
        </section>

        <section class="section" aria-labelledby="features-title">
            <div class="section-header">
                <span class="eyebrow">Why Aurelia</span>
                <h2 id="features-title">Everything taken care of</h2>
            </div>
            <div class="grid grid-4">
                <div class="card feature">
                    <div class="feature-icon" aria-hidden="true">&#9728;</div>
                    <h3 class="text-lg">Sea-view rooms</h3>
                    <p class="text-sm text-muted">Most rooms face the Mediterranean, many with private balconies.</p>
                </div>
                <div class="card feature">
                    <div class="feature-icon" aria-hidden="true">&#9734;</div>
                    <h3 class="text-lg">Executive lounge</h3>
                    <p class="text-sm text-muted">Suite guests enjoy afternoon tea and evening canapés.</p>
                </div>
                <div class="card feature">
                    <div class="feature-icon" aria-hidden="true">&#9832;</div>
                    <h3 class="text-lg">Spa &amp; pool</h3>
                    <p class="text-sm text-muted">Heated rooftop pool, hammam and treatment rooms.</p>
                </div>
                <div class="card feature">
                    <div class="feature-icon" aria-hidden="true">&#9742;</div>
                    <h3 class="text-lg">24/7 service</h3>
                    <p class="text-sm text-muted">Room service, concierge and housekeeping on call.</p>
                </div>
            </div>
        </section>

        <section class="section" aria-labelledby="reviews-title">
            <div class="section-header">
                <span class="eyebrow">Guest reviews</span>
                <h2 id="reviews-title">What our guests say</h2>
            </div>
            <div class="grid grid-3" data-region="home-reviews"></div>
            <div class="text-center mt-6">
                <a class="btn btn-ghost" href="reviews/list_reviews.php">Read all reviews</a>
            </div>
        </section>

        <section class="surface text-center" aria-labelledby="cta-title">
            <h2 id="cta-title">Already booked?</h2>
            <p class="text-muted">Check your booking status, change your dates or pay online.</p>
            <div class="btn-group justify-center mt-4">
                <a class="btn btn-primary" href="reservations/booking_status.php">Check booking status</a>
                <a class="btn btn-outline" href="guest/my_bookings.php">My bookings</a>
            </div>
        </section>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
