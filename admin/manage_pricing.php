<?php
$pageTitle   = 'Pricing';
$pageId      = 'manage-pricing';
$pageScripts = ['admin.js'];
$pageRoles   = 'admin';
require __DIR__ . '/../includes/header.php';
?>
<main id="main" class="main-content">
    <div class="container">
        <div class="layout-sidebar">
<?php require __DIR__ . '/../includes/admin_sidebar.php'; ?>
            <div>
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Pricing</h1>
                        <p class="text-muted mb-0">Base rates per room type and seasonal adjustments.</p>
                    </div>
                    <button class="btn btn-accent" type="button" data-action="new-rule">Add seasonal rule</button>
                </div>

                <!-- NFR-23 hotel settings. BACKEND INTEGRATION: POST to a PHP
                     handler that validates and stores these in a settings table. -->
                <section class="card mb-6" aria-labelledby="settings-title" id="hotel-settings">
                    <div class="card-header"><h2 class="text-lg mb-0" id="settings-title">Hotel settings</h2></div>
                    <form class="card-body form" method="post" action="manage_pricing.php" data-form="hotel-settings">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required" for="hs-check-in">Check-in time</label>
                                <input class="form-control" type="time" id="hs-check-in" name="check_in_time" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="hs-check-out">Check-out time</label>
                                <input class="form-control" type="time" id="hs-check-out" name="check_out_time" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label required" for="hs-currency">Currency</label>
                                <select class="form-control" id="hs-currency" name="currency" required>
                                    <option value="EGP">EGP — Egyptian pound</option>
                                    <option value="USD">USD — US dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                </select>
                            </div>
                        </div>
                        <p class="form-help mb-0">Demo: saved in this browser only. Saving also switches this browser's display currency; visitors can choose a different currency in the navbar. Prices are stored in EGP and converted for display.</p>
                        <div class="form-actions">
                            <button class="btn btn-primary" type="submit">Save settings</button>
                        </div>
                    </form>
                </section>

                <section class="mb-6" aria-labelledby="rates-title">
                    <h2 class="text-xl" id="rates-title">Base rates</h2>
                    <!-- BACKEND INTEGRATION: POST updates room_types.base_price and
                         optionally rooms.price_per_night for that type. -->
                    <form method="post" action="manage_pricing.php" data-form="base-rates">
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Room type</th>
                                        <th scope="col">Rooms</th>
                                        <th scope="col">Current room prices</th>
                                        <th scope="col">Base rate (<span data-currency-code>EGP</span>)</th>
                                        <th scope="col" class="text-right">Save</th>
                                    </tr>
                                </thead>
                                <tbody data-region="rate-rows"></tbody>
                            </table>
                        </div>
                    </form>
                </section>

                <section class="mb-6" aria-labelledby="rules-title">
                    <h2 class="text-xl" id="rules-title">Seasonal rules</h2>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Applies to</th>
                                    <th scope="col">Dates</th>
                                    <th scope="col" class="num">Adjustment</th>
                                    <th scope="col">Active</th>
                                    <th scope="col" class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody data-region="rule-rows"></tbody>
                        </table>
                    </div>
                </section>

                <section class="card" aria-labelledby="preview-title">
                    <div class="card-header"><h2 class="text-lg mb-0" id="preview-title">Price preview</h2></div>
                    <div class="card-body grid grid-2 gap-6">
                        <form class="form" data-form="price-preview">
                            <div class="form-group">
                                <label class="form-label" for="pp-room">Room</label>
                                <select class="form-control" id="pp-room" name="room_id"></select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label" for="pp-in">Check-in</label>
                                    <input class="form-control" type="date" id="pp-in" name="check_in">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="pp-out">Check-out</label>
                                    <input class="form-control" type="date" id="pp-out" name="check_out" data-after="check_in">
                                </div>
                            </div>
                        </form>
                        <div>
                            <div data-region="preview-quote"></div>
                            <div class="mt-4" data-region="preview-nightly"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <!-- Seasonal rule modal -->
    <div class="modal-overlay" id="rule-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="rule-modal-title">
            <form method="post" action="manage_pricing.php" data-form="pricing-rule">
                <div class="modal-header">
                    <h2 class="modal-title" id="rule-modal-title">Seasonal rule</h2>
                    <button class="modal-close" type="button" data-modal-close aria-label="Close">&times;</button>
                </div>
                <div class="modal-body form">
                    <input type="hidden" name="rule_id" value="">
                    <div class="form-group">
                        <label class="form-label required" for="pr-name">Rule name</label>
                        <input class="form-control" type="text" id="pr-name" name="name" required minlength="3" maxlength="50" placeholder="e.g. Summer Peak">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="pr-type">Applies to</label>
                            <select class="form-control" id="pr-type" name="room_type" required>
                                <option value="all">All room types</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="family">Family</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="pr-adjust">Adjustment (%)</label>
                            <input class="form-control" type="number" id="pr-adjust" name="adjustment_percent" required min="-90" max="300" step="1">
                            <p class="form-help">Negative for discounts.</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required" for="pr-start">Start date</label>
                            <input class="form-control" type="date" id="pr-start" name="start_date" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required" for="pr-end">End date</label>
                            <input class="form-control" type="date" id="pr-end" name="end_date" required data-after="start_date" data-error-after="End date must be after the start date.">
                        </div>
                    </div>
                    <label class="form-check" for="pr-active">
                        <input type="checkbox" id="pr-active" name="is_active" value="1" checked> Active
                    </label>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
                    <button class="btn btn-primary" type="submit">Save rule</button>
                </div>
            </form>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>
