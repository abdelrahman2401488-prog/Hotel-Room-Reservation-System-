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
                <img class="auth-logo" src="assets/images/brand/logo-light.svg" alt="The Developers Hotel" width="272" height="64">
                <span class="eyebrow">Welcome back</span>
                <h2>Your stay, in one place</h2>
                <p>Guests manage bookings and payments. Staff run the front desk. Admins manage rooms and pricing. Each role gets its own workspace.</p>
                <ul class="check-list">
                    <li>Manage bookings</li>
                    <li>Front desk tools</li>
                    <li>Room &amp; pricing admin</li>
                </ul>
            </div>

            <div class="auth-body">
                <h1 class="text-3xl">Sign in</h1>
                <p class="text-muted">New here? <a href="register.php">Create a guest account</a></p>

                <div class="alert alert-warning" role="note">
                    <span><strong>DEMO ONLY.</strong> These accounts exist only in this browser for testing the prototype. Credentials are checked in JavaScript, which is not secure authentication; nothing is sent to a server.</span>
                </div>

                <!-- BACKEND INTEGRATION: POST to this page; verify the password
                     hash in PHP (password_verify), regenerate the session id and
                     redirect by role. -->
                <form class="form" method="post" action="login.php" data-form="login">
                    <div class="form-group">
                        <label class="form-label required" for="login-email">Email</label>
                        <input class="form-control" type="email" id="login-email" name="email" autocomplete="username" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label required" for="login-password">Password</label>
                        <input class="form-control" type="password" id="login-password" name="password" autocomplete="current-password" required>
                    </div>
                    <input type="hidden" name="redirect" value="">
                    <button class="btn btn-primary btn-block btn-lg" type="submit">Sign in</button>
                </form>

                <hr>
                <h2 class="text-lg">Demo accounts <span class="badge badge-warning">DEMO ONLY</span></h2>
                <div class="table-wrapper">
                    <table class="table demo-credentials">
                        <caption class="sr-only">Demo credentials</caption>
                        <thead>
                            <tr>
                                <th scope="col">Role</th>
                                <th scope="col">Email &amp; password</th>
                                <th scope="col"><span class="sr-only">Action</span></th>
                            </tr>
                        </thead>
                        <tbody data-region="demo-accounts">
                            <tr>
                                <td><strong>Admin</strong><div class="text-xs text-muted">Admin dashboard</div></td>
                                <td><div class="font-mono">admin@example.com</div><div class="font-mono">Admin@2026</div></td>
                                <td class="text-right"><button class="btn btn-outline btn-sm" type="button" data-email="admin@example.com" data-password="Admin@2026" aria-label="Fill in the admin demo account">Use</button></td>
                            </tr>
                            <tr>
                                <td><strong>Staff</strong><div class="text-xs text-muted">Staff dashboard</div></td>
                                <td><div class="font-mono">staff@example.com</div><div class="font-mono">Staff@2026</div></td>
                                <td class="text-right"><button class="btn btn-outline btn-sm" type="button" data-email="staff@example.com" data-password="Staff@2026" aria-label="Fill in the staff demo account">Use</button></td>
                            </tr>
                            <tr>
                                <td><strong>Guest</strong><div class="text-xs text-muted">My bookings</div></td>
                                <td><div class="font-mono">guest@example.com</div><div class="font-mono">Guest@2026</div></td>
                                <td class="text-right"><button class="btn btn-outline btn-sm" type="button" data-email="guest@example.com" data-password="Guest@2026" aria-label="Fill in the guest demo account">Use</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
