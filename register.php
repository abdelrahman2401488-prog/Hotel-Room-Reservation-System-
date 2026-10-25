<?php
$pageTitle   = 'Create account';
$pageId      = 'register';
$pageScripts = ['auth.js'];
require __DIR__ . '/includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="auth-layout">
            <div class="auth-aside">
                <span class="eyebrow">Join Aurelia</span>
                <h2>Create your guest account</h2>
                <p>Keep every booking together, pay securely online and receive member-only offers.</p>
                <ul class="check-list">
                    <li>Booking history</li>
                    <li>Online payment</li>
                    <li>Share reviews</li>
                </ul>
            </div>

            <div class="auth-body">
                <h1 class="text-3xl">Create account</h1>
                <p class="text-muted">Already registered? <a href="login.php">Sign in</a></p>

                <div class="alert alert-warning" role="note">
                    <span><strong>Demo registration.</strong> The account is kept only in this browser and your password is not stored.</span>
                </div>

                <!-- BACKEND INTEGRATION: POST to this page; validate again in PHP,
                     hash the password (password_hash) and insert into users. -->
                <form class="form" method="post" action="register.php" data-form="register">
                    <div class="form-group">
                        <label class="form-label required" for="reg-name">Full name</label>
                        <input class="form-control" type="text" id="reg-name" name="full_name" autocomplete="name" required minlength="3" maxlength="80">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="reg-email">Email</label>
                            <input class="form-control" type="email" id="reg-email" name="email" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="reg-phone">Phone</label>
                            <input class="form-control" type="tel" id="reg-phone" name="phone" autocomplete="tel" required data-rule="phone" placeholder="+20 100 000 0000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="reg-password">Password</label>
                        <input class="form-control" type="password" id="reg-password" name="password" autocomplete="new-password" required data-rule="password" aria-describedby="reg-password-help">
                        <div class="strength" id="reg-password-help">
                            <progress class="bar" max="4" value="0" data-region="strength-bar" aria-label="Password strength"></progress>
                            <span data-region="strength-label">8+ characters, letters and numbers</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="reg-confirm">Confirm password</label>
                        <input class="form-control" type="password" id="reg-confirm" name="password_confirm" autocomplete="new-password" required data-match="password" data-error-match="Passwords do not match.">
                    </div>
                    <div class="form-group">
                        <label class="form-check" for="reg-terms">
                            <input type="checkbox" id="reg-terms" name="terms" value="1" required data-error-required="Please accept the terms to continue.">
                            I agree to the terms and privacy policy
                        </label>
                    </div>
                    <button class="btn btn-accent btn-block btn-lg" type="submit">Create account</button>
                </form>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
