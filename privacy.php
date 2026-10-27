<?php
$pageTitle   = 'Privacy Policy';
$pageId      = 'privacy';
require __DIR__ . '/includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container container-md">
        <div class="page-header">
            <div>
                <h1 class="page-title">Privacy Policy</h1>
                <p class="text-muted mb-0">The Developers Hotel reservation website — frontend prototype. Last updated 27 October 2026.</p>
            </div>
        </div>

        <div class="alert alert-warning" role="note">
            <span><strong>Prototype notice.</strong> This page describes how this demonstration website handles information today. It is not a legal policy for a live hotel service. Before real guests or payments are handled, a full policy must be prepared and reviewed for the backend that is actually deployed.</span>
        </div>

        <div class="card">
            <div class="card-body stack">
                <section aria-labelledby="pp-summary">
                    <h2 class="text-xl" id="pp-summary">Summary</h2>
                    <p>This website is a prototype. It has no database and does not send the information you enter to a server. Everything you create while using it — accounts, bookings, payments, reviews and settings — is saved only in your own web browser on this device, and can be deleted at any time.</p>
                </section>

                <section aria-labelledby="pp-collected">
                    <h2 class="text-xl" id="pp-collected">What is stored in your browser</h2>
                    <p>The website uses your browser's local storage (<code>localStorage</code>) and session storage on this device to remember:</p>
                    <ul class="stack">
                        <li><strong>Accounts you register:</strong> full name, email address and phone number, plus a salted SHA-256 hash of your password. This hashing runs in the browser and is not a secure way to protect passwords, so do not reuse a real password here.</li>
                        <li><strong>Your demo sign-in:</strong> your name, email address and role while you are signed in, the time of your last activity (used to sign you out after 30 minutes of inactivity) and a count of recent failed sign-in attempts (used for the temporary sign-in lockout).</li>
                        <li><strong>Bookings and reviews:</strong> the guest name, email, phone number, dates, special requests and reviews you enter.</li>
                        <li><strong>Payments:</strong> the payment method, amount, status and the last four digits of a card, shown on the receipt. The full card number and security code (CVC) are never stored or sent anywhere; they are cleared from the form when you submit it. No real payment is processed.</li>
                        <li><strong>Staff and admin records:</strong> room-service requests, complaints, room details and photos uploaded by an admin (resized), hotel settings, and an activity log of price, booking and payment actions that includes the email address of the signed-in user who made each change.</li>
                        <li><strong>Preferences:</strong> your chosen language (English or Arabic).</li>
                        <li><strong>Session storage:</strong> short notification messages shown after moving to another page, removed once shown.</li>
                    </ul>
                </section>

                <section aria-labelledby="pp-not">
                    <h2 class="text-xl" id="pp-not">What this website does not do</h2>
                    <ul class="stack">
                        <li>It does not send the information above to a server, database or other company.</li>
                        <li>It does not set cookies of its own and does not use analytics, advertising or tracking scripts.</li>
                        <li>It does not load scripts, fonts or images from third-party servers; room photos are stored with the website (sources are listed in <code>assets/images/rooms/CREDITS.md</code>).</li>
                    </ul>
                    <p>The web server that delivers these pages may keep standard request logs (such as IP address, time and the page requested), depending on how and where the website is run.</p>
                </section>

                <section aria-labelledby="pp-use">
                    <h2 class="text-xl" id="pp-use">How the information is used</h2>
                    <p>The stored information is used only to make the prototype work in your browser: showing your bookings, calculating prices, displaying receipts, separating guest, staff and admin screens, and showing the activity log to admins on the same device.</p>
                </section>

                <section aria-labelledby="pp-choices">
                    <h2 class="text-xl" id="pp-choices">Your choices and deleting your data</h2>
                    <ul class="stack">
                        <li>Use <strong>Reset demo data</strong> in the yellow banner at the top of any page to replace your bookings, accounts, settings and activity log with the original sample data and sign out.</li>
                        <li>To remove everything, including your language preference, clear this website's data in your browser settings (site data / local storage).</li>
                        <li>Data stays on the device and browser where you entered it; other people using the same browser profile can see it.</li>
                    </ul>
                </section>

                <section aria-labelledby="pp-contact">
                    <h2 class="text-xl" id="pp-contact">Contact</h2>
                    <p>Questions about this prototype can be sent to the project team. Sample hotel address: 12 Corniche Road, Alexandria.</p>
                </section>
            </div>
        </div>

        <p class="mt-4"><a href="register.php">Back to registration</a></p>
    </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
