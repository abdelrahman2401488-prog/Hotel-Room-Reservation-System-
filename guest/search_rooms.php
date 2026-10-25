<?php
$pageTitle   = 'Search rooms';
$pageId      = 'search-rooms';
$pageScripts = ['booking.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Find your room</h1>
                <p class="text-muted mb-0">Choose your dates to see which rooms are free. Availability is calculated from demo bookings.</p>
            </div>
        </div>

        <div class="layout-sidebar">
            <!-- GET form: the same parameters can be read by PHP ($_GET) to
                 render server-side results later. -->
            <aside class="card" aria-label="Search filters">
                <form class="card-body form" method="get" action="search_rooms.php" id="room-filters-form" data-form="room-filters">
                    <h2 class="text-lg mb-0">Filters</h2>
                    <div class="form-group">
                        <label class="form-label" for="f-check-in">Check-in</label>
                        <input class="form-control" type="date" id="f-check-in" name="check_in">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="f-check-out">Check-out</label>
                        <input class="form-control" type="date" id="f-check-out" name="check_out" data-after="check_in" data-error-after="Check-out must be after check-in.">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="f-guests">Guests</label>
                        <select class="form-control" id="f-guests" name="guests">
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="f-type">Room type</label>
                        <select class="form-control" id="f-type" name="room_type">
                            <option value="">All types</option>
                            <option value="single">Single</option>
                            <option value="double">Double</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="family">Family</option>
                            <option value="suite">Suite</option>
                        </select>
                    </div>
                    <fieldset>
                        <legend>Price per night</legend>
                        <div class="grid-2 grid gap-2">
                            <div class="form-group">
                                <label class="form-label" for="f-min">Min</label>
                                <input class="form-control" type="number" id="f-min" name="min_price" min="0" step="10" placeholder="0">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="f-max">Max</label>
                                <input class="form-control" type="number" id="f-max" name="max_price" min="0" step="10" placeholder="1000">
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Amenities</legend>
                        <div class="stack" data-region="amenity-filters">
                            <label class="form-check"><input type="checkbox" name="amenities" value="Sea view" data-group> Sea view</label>
                            <label class="form-check"><input type="checkbox" name="amenities" value="Balcony" data-group> Balcony</label>
                            <label class="form-check"><input type="checkbox" name="amenities" value="Bathtub" data-group> Bathtub</label>
                            <label class="form-check"><input type="checkbox" name="amenities" value="Kitchenette" data-group> Kitchenette</label>
                            <label class="form-check"><input type="checkbox" name="amenities" value="Lounge access" data-group> Lounge access</label>
                            <label class="form-check"><input type="checkbox" name="amenities" value="Jacuzzi" data-group> Jacuzzi</label>
                        </div>
                    </fieldset>
                    <div class="flex flex-col gap-2">
                        <button class="btn btn-primary" type="submit">Update results</button>
                        <button class="btn btn-ghost" type="button" data-action="clear-filters">Clear filters</button>
                    </div>
                </form>
            </aside>

            <section aria-labelledby="results-title">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 class="text-xl mb-0" id="results-title" data-region="results-count">Rooms</h2>
                        <p class="text-sm text-muted mb-0" data-region="results-summary"></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-nowrap" for="f-sort">Sort by</label>
                        <select class="form-control" id="f-sort" name="sort" form="room-filters-form">
                            <option value="price_asc">Price: low to high</option>
                            <option value="price_desc">Price: high to low</option>
                            <option value="capacity">Most guests</option>
                            <option value="size">Largest first</option>
                        </select>
                    </div>
                </div>
                <div class="grid" data-region="results" aria-live="polite">
                    <p class="text-muted">Loading rooms…</p>
                </div>
            </section>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
