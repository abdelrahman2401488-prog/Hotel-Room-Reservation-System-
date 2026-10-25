<?php
// BACKEND INTEGRATION: destroy the PHP session here (session_unset(),
// session_destroy()) and redirect to login.php. In the prototype,
// assets/js/auth.js clears the DEMO session stored in localStorage.
$pageTitle   = 'Signed out';
$pageId      = 'logout';
$pageScripts = ['auth.js'];
require __DIR__ . '/includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container container-sm">
        <div class="card">
            <div class="card-body empty-state">
                <div class="success-icon" aria-hidden="true">&#10003;</div>
                <h1 class="text-3xl">You have been signed out</h1>
                <p>Your demo session was cleared from this browser.</p>
                <div class="btn-group justify-center mt-4">
                    <a class="btn btn-primary" href="login.php">Sign in again</a>
                    <a class="btn btn-ghost" href="index.php">Back to home</a>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
