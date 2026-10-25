<?php
$pageTitle   = 'Guest reviews';
$pageId      = 'list-reviews';
$pageScripts = ['reviews.js'];
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Guest reviews</h1>
                <p class="text-muted mb-0">Honest feedback from guests who stayed with us (sample reviews).</p>
            </div>
            <a class="btn btn-accent" href="../guest/leave_review.php">Write a review</a>
        </div>

        <section class="card mb-5" aria-label="Rating summary">
            <div class="card-body rating-summary">
                <div class="text-center">
                    <div class="rating-score" data-field="average">–</div>
                    <div data-region="average-stars"></div>
                    <div class="text-sm text-muted" data-field="count"></div>
                </div>
                <div data-region="distribution"></div>
            </div>
        </section>

        <form class="toolbar" data-form="review-filters" role="search">
            <div class="form-group">
                <label class="form-label" for="rf-rating">Rating</label>
                <select class="form-control" id="rf-rating" name="rating">
                    <option value="">All ratings</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="rf-type">Room type</label>
                <select class="form-control" id="rf-type" name="room_type">
                    <option value="">All rooms</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="family">Family</option>
                    <option value="suite">Suite</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="rf-sort">Sort</label>
                <select class="form-control" id="rf-sort" name="sort">
                    <option value="newest">Newest first</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                </select>
            </div>
            <div class="form-group" data-staff-only hidden>
                <label class="form-label" for="rf-status">Visibility (staff)</label>
                <select class="form-control" id="rf-status" name="status">
                    <option value="">All</option>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                </select>
            </div>
        </form>

        <div class="grid grid-2" data-region="reviews" aria-live="polite">
            <p class="text-muted">Loading reviews…</p>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
