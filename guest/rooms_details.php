<?php
$pageTitle   = 'Room details';
$pageId      = 'room-details';
$pageScripts = ['booking.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container" data-region="room-page">
        <nav aria-label="Breadcrumb">
            <ol class="breadcrumb">
                <li><a href="../index.php">Home</a></li>
                <li><a href="search_rooms.php">Rooms</a></li>
                <li aria-current="page" data-field="title">Room</li>
            </ol>
        </nav>

        <div class="page-header">
            <div>
                <h1 class="page-title" data-field="title">Loading room…</h1>
                <p class="text-muted mb-0"><span data-field="type_label"></span> &middot; Room <span data-field="room_number"></span> &middot; Floor <span data-field="floor"></span></p>
            </div>
            <div class="text-right">
                <span class="price text-2xl" data-field="price"></span> <span class="price-unit">/ night from</span>
            </div>
        </div>

        <div class="layout-split">
            <div>
                <div class="gallery" data-region="gallery"></div>

                <section class="card mb-5">
                    <div class="card-body">
                        <h2 class="text-xl">About this room</h2>
                        <p data-field="description"></p>
                        <div data-region="room-facts"></div>
                    </div>
                </section>

                <section class="card mb-5">
                    <div class="card-body">
                        <h2 class="text-xl">Amenities</h2>
                        <ul class="check-list" data-region="amenities"></ul>
                    </div>
                </section>

                <section aria-labelledby="room-reviews-title">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h2 class="text-xl mb-0" id="room-reviews-title">Guest reviews</h2>
                        <span data-region="rating-average"></span>
                    </div>
                    <div class="stack" data-region="room-reviews"></div>
                </section>
            </div>

            <aside class="sticky-aside">
                <!-- GET form that hands the selection to guest/book_room.php -->
                <form class="card" method="get" action="book_room.php" data-form="quick-book">
                    <div class="card-header">
                        <h2 class="text-lg mb-0">Reserve this room</h2>
                    </div>
                    <div class="card-body form">
                        <input type="hidden" name="room_id" value="">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required" for="qb-check-in">Check-in</label>
                                <input class="form-control" type="date" id="qb-check-in" name="check_in" required data-rule="date-not-past">
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="qb-check-out">Check-out</label>
                                <input class="form-control" type="date" id="qb-check-out" name="check_out" required data-after="check_in" data-error-after="Check-out must be after check-in.">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="qb-guests">Guests</label>
                            <select class="form-control" id="qb-guests" name="guests"></select>
                        </div>
                        <div data-region="availability" aria-live="polite"></div>
                        <div data-region="quote" aria-live="polite"></div>
                        <button class="btn btn-accent btn-block btn-lg" type="submit">Continue to booking</button>
                        <p class="form-help text-center">Estimated price. Final price is confirmed by the hotel.</p>
                    </div>
                </form>
            </aside>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
