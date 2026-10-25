<?php
$pageTitle   = 'Sign in';
$pageId      = 'login';
$pageScripts = ['auth.js'];
require __DIR__ . '/includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="auth-layout">
            <div class="auth-aside">
                <span class="eyebrow">Welcome back</span>
                <h2>Your stay, in one place</h2>
                <p>Sign in to view upcoming stays, change dates, pay online and share reviews.</p>
                <ul class="check-list">
                    <li>Manage bookings</li>
                    <li>Faster checkout</li>
                    <li>Member rates</li>
                </ul>
            </div>

            <div class="auth-body">
                <h1 class="text-3xl">Sign in</h1>
                <p class="text-muted">New here? <a href="register.php">Create an account</a></p>

                <div class="alert alert-warning" role="note">
                    <span><strong>Demo sign-in.</strong> No password is checked and nothing is sent to a server. Use a demo account below.</span>
                </div>

                <!-- BACKEND INTEGRATION: POST to this page; verify the password
                     hash in PHP, regenerate the session id and redirect by role. -->
                <form class="form" method="post" action="login.php" data-form="login">
                    <div class="form-group">
                        <label class="form-label required" for="login-email">Email</label>
                        <input class="form-control" type="email" id="login-email" name="email" autocomplete="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="login-password">Password</label>
                        <input class="form-control" type="password" id="login-password" name="password" autocomplete="current-password" required minlength="6">
                        <p class="form-help">Any 6+ characters work in the demo.</p>
                    </div>
                    <label class="form-check" for="login-remember">
                        <input type="checkbox" id="login-remember" name="remember" value="1"> Keep me signed in
                    </label>
                    <input type="hidden" name="redirect" value="">
                    <button class="btn btn-primary btn-block btn-lg" type="submit">Sign in</button>
                </form>

                <hr>
                <h2 class="text-lg">Demo accounts</h2>
                <ul class="demo-accounts" data-region="demo-accounts">
                    <li><button class="demo-account" type="button" data-email="guest@example.com"><span><strong>Guest</strong> &middot; Sara Mahmoud</span><span class="text-muted">guest@example.com</span></button></li>
                    <li><button class="demo-account" type="button" data-email="staff@example.com"><span><strong>Staff</strong> &middot; Karim Adel</span><span class="text-muted">staff@example.com</span></button></li>
                    <li><button class="demo-account" type="button" data-email="admin@example.com"><span><strong>Admin</strong> &middot; Mona Hassan</span><span class="text-muted">admin@example.com</span></button></li>
                </ul>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
