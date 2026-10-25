<?php
$pageTitle   = 'Leave a review';
$pageId      = 'leave-review';
$pageScripts = ['reviews.js'];
$pageRoles   = 'guest';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">Review your stay</h1>
                <p class="text-muted mb-0">Your feedback helps future guests and our team.</p>
            </div>
            <a class="btn btn-ghost" href="my_bookings.php">Back to my bookings</a>
        </div>

        <div class="layout-split" data-region="review-page">
            <!-- BACKEND INTEGRATION: POST to this page; check in PHP that the
                 signed-in user owns the completed reservation before inserting. -->
            <form class="card" method="post" action="leave_review.php" data-form="review">
                <div class="card-body form">
                    <div class="form-group">
                        <label class="form-label required" for="rv-stay">Stay</label>
                        <select class="form-control" id="rv-stay" name="reservation_id" required data-error-required="Choose the stay you are reviewing."></select>
                        <p class="form-help">Only completed stays can be reviewed.</p>
                    </div>

                    <fieldset class="rating-input" aria-describedby="rating-error">
                        <legend class="form-label required">Overall rating</legend>
                        <input type="radio" id="rating-5" name="rating" value="5" required><label for="rating-5" title="Excellent">&#9733;<span class="sr-only">5 stars</span></label>
                        <input type="radio" id="rating-4" name="rating" value="4"><label for="rating-4" title="Very good">&#9733;<span class="sr-only">4 stars</span></label>
                        <input type="radio" id="rating-3" name="rating" value="3"><label for="rating-3" title="Good">&#9733;<span class="sr-only">3 stars</span></label>
                        <input type="radio" id="rating-2" name="rating" value="2"><label for="rating-2" title="Fair">&#9733;<span class="sr-only">2 stars</span></label>
                        <input type="radio" id="rating-1" name="rating" value="1"><label for="rating-1" title="Poor">&#9733;<span class="sr-only">1 star</span></label>
                    </fieldset>
                    <p class="form-error" id="rating-error" hidden></p>

                    <div class="form-group">
                        <label class="form-label required" for="rv-title">Title</label>
                        <input class="form-control" type="text" id="rv-title" name="title" required minlength="4" maxlength="80" placeholder="Sum up your stay in a few words">
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="rv-comment">Your review</label>
                        <textarea class="form-control" id="rv-comment" name="comment" required minlength="20" maxlength="1000" placeholder="What did you enjoy? What could be better?"></textarea>
                        <p class="form-help"><span data-region="char-count">0</span> / 1000 characters</p>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-accent" type="submit">Publish review</button>
                    </div>
                </div>
            </form>

            <aside class="sticky-aside">
                <h2 class="text-lg">Preview</h2>
                <div data-region="preview"></div>
                <p class="form-help mt-2">Demo: published reviews are stored only in this browser.</p>
            </aside>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
