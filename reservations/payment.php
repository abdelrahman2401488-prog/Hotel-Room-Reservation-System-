<?php
$pageTitle   = 'Payment';
$pageId      = 'payment';
$pageScripts = ['payment.js'];
$pageRoles   = 'guest';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <ol class="steps" aria-label="Booking progress">
            <li class="step is-complete"><span class="step-label">Choose room</span></li>
            <li class="step is-complete"><span class="step-label">Your details</span></li>
            <li class="step is-active" aria-current="step"><span class="step-label">Payment</span></li>
            <li class="step"><span class="step-label">Confirmation</span></li>
        </ol>

        <div class="page-header">
            <div>
                <h1 class="page-title">Secure your booking</h1>
                <p class="text-muted mb-0">Booking <span class="reference-code" data-field="booking_reference">…</span></p>
            </div>
        </div>

        <div class="alert alert-warning" role="note">
            <span><strong>Demo payment screen.</strong> No payment is processed and card details never leave this page. Do not enter a real card &mdash; use the test number <span class="font-mono">4242 4242 4242 4242</span>, any future expiry and any 3-digit code.</span>
        </div>

        <div class="layout-split" data-region="payment-page">
            <!-- BACKEND INTEGRATION: replace the card fields with a payment
                 gateway's hosted fields/tokenisation. PHP must never receive or
                 store raw card numbers; it confirms the gateway token, records
                 the payment and marks the reservation paid. -->
            <form class="card" method="post" action="payment.php" data-form="payment">
                <div class="card-body form">
                    <input type="hidden" name="booking_reference" value="">
                    <fieldset class="option-group">
                        <legend class="form-label mb-2">Payment method</legend>
                        <label class="option-card"><input type="radio" name="payment_method" value="card" checked> Credit / debit card</label>
                        <label class="option-card"><input type="radio" name="payment_method" value="wallet"> Digital wallet</label>
                        <label class="option-card"><input type="radio" name="payment_method" value="pay_at_hotel"> Pay at the hotel</label>
                    </fieldset>

                    <div class="form" data-method-panel="card">
                        <div class="form-group">
                            <label class="form-label required" for="p-name">Name on card</label>
                            <input class="form-control" type="text" id="p-name" name="cardholder_name" autocomplete="off" required minlength="3">
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="p-number">Card number</label>
                            <input class="form-control font-mono" type="text" id="p-number" name="card_number" inputmode="numeric" autocomplete="off" required data-rule="card-number" placeholder="4242 4242 4242 4242" maxlength="23">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required" for="p-expiry">Expiry (MM/YY)</label>
                                <input class="form-control font-mono" type="text" id="p-expiry" name="card_expiry" inputmode="numeric" autocomplete="off" required data-rule="expiry" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="p-cvc">Security code</label>
                                <input class="form-control font-mono" type="password" id="p-cvc" name="card_cvc" inputmode="numeric" autocomplete="off" required data-rule="cvc" maxlength="4">
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-info mb-0" data-method-panel="wallet" hidden>
                        <span>You would be redirected to your wallet provider to approve the payment. In the demo the payment is approved immediately.</span>
                    </div>
                    <div class="alert alert-info mb-0" data-method-panel="pay_at_hotel" hidden>
                        <span>Your room is held and you pay on arrival. The booking is confirmed now and the payment stays pending until check-in.</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label required" for="p-email">Receipt email</label>
                        <input class="form-control" type="email" id="p-email" name="billing_email" required>
                    </div>

                    <div class="form-actions">
                        <a class="btn btn-ghost" href="#" data-region="back-link">Back</a>
                        <button class="btn btn-accent btn-lg" type="submit" data-region="pay-button">Pay</button>
                    </div>
                </div>
            </form>

            <aside class="sticky-aside">
                <div class="card">
                    <div data-region="room-summary"></div>
                    <div class="card-body">
                        <div data-region="stay"></div>
                        <hr>
                        <div data-region="quote"></div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
