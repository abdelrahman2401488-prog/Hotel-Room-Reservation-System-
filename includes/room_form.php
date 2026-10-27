<?php
/**
 * Room form shared by admin/add_room.php and admin/edit_room.php.
 * Field names match the planned `rooms` table columns.
 *
 * BACKEND INTEGRATION: POST handler at the top of add_room.php /
 * edit_room.php validates, stores the uploaded image and inserts/updates.
 * In edit mode PHP can echo the current values into each field.
 */
?>
                <div class="layout-split">
                    <form class="form" method="post" enctype="multipart/form-data" data-form="room">
                        <input type="hidden" name="room_id" value="">

                        <section class="card">
                            <div class="card-header"><h2 class="text-lg mb-0">Basics</h2></div>
                            <div class="card-body form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required" for="r-number">Room number</label>
                                        <input class="form-control" type="text" id="r-number" name="room_number" required maxlength="6" pattern="[0-9A-Za-z-]+" placeholder="e.g. 305">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-floor">Floor</label>
                                        <input class="form-control" type="number" id="r-floor" name="floor" required min="0" max="50">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-type">Room type</label>
                                        <select class="form-control" id="r-type" name="room_type" required>
                                            <option value="">Choose…</option>
                                            <option value="single">Single</option>
                                            <option value="double">Double</option>
                                            <option value="deluxe">Deluxe</option>
                                            <option value="family">Family</option>
                                            <option value="suite">Suite</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="r-title">Display name</label>
                                    <input class="form-control" type="text" id="r-title" name="title" required minlength="3" maxlength="60" placeholder="e.g. Deluxe Sea View">
                                </div>
                                <div class="form-group">
                                    <label class="form-label required" for="r-description">Description</label>
                                    <textarea class="form-control" id="r-description" name="description" required minlength="20" maxlength="600"></textarea>
                                </div>
                            </div>
                        </section>

                        <section class="card">
                            <div class="card-header"><h2 class="text-lg mb-0">Capacity, price &amp; status</h2></div>
                            <div class="card-body form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required" for="r-capacity">Max guests</label>
                                        <input class="form-control" type="number" id="r-capacity" name="capacity" required min="1" max="8">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-bed">Beds</label>
                                        <input class="form-control" type="text" id="r-bed" name="bed_type" required maxlength="40" placeholder="King bed">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-size">Size (m²)</label>
                                        <input class="form-control" type="number" id="r-size" name="size_sqm" required min="10" max="500">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required" for="r-price">Price per night (<span data-currency-code>EGP</span>)</label>
                                        <input class="form-control" type="number" id="r-price" name="price_per_night" required min="20" max="100000" step="5">
                                        <p class="form-help" data-region="base-rate-hint"></p>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-view">View</label>
                                        <select class="form-control" id="r-view" name="view" required>
                                            <option value="Sea">Sea</option>
                                            <option value="City">City</option>
                                            <option value="Garden">Garden</option>
                                            <option value="Pool">Pool</option>
                                            <option value="Panoramic">Panoramic</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required" for="r-status">Status</label>
                                        <select class="form-control" id="r-status" name="status" required>
                                            <option value="available">Available</option>
                                            <option value="occupied">Occupied</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="card">
                            <div class="card-header"><h2 class="text-lg mb-0">Amenities &amp; photo</h2></div>
                            <div class="card-body form">
                                <fieldset>
                                    <legend>Amenities</legend>
                                    <div class="check-list" data-region="amenity-options"></div>
                                </fieldset>
                                <!-- BACKEND INTEGRATION: room_image is posted as multipart/form-data;
                                     PHP validates type/size again, stores the file and saves its
                                     path in rooms.image_url. The demo keeps a resized copy in
                                     the browser instead (assets/js/admin.js). -->
                                <div class="form-group">
                                    <label class="form-label" for="r-image">Room photo</label>
                                    <input class="form-control" type="file" id="r-image" name="room_image" accept="image/jpeg, image/png, image/webp" aria-describedby="r-image-help">
                                    <p class="form-help" id="r-image-help">JPG, PNG or WebP, up to 5 MB. Choose another file to replace the photo. Demo: the photo is resized and kept in this browser only, not uploaded.</p>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="r-image-alt">Photo description (alt text)</label>
                                    <input class="form-control" type="text" id="r-image-alt" name="image_alt" maxlength="140" placeholder="e.g. King bed facing the balcony and sea view">
                                    <p class="form-help">Describes the photo for screen-reader users. Leave empty to use the room name.</p>
                                </div>
                                <div>
                                    <button class="btn btn-ghost btn-sm" type="button" data-action="remove-photo" hidden>Remove photo</button>
                                </div>
                            </div>
                        </section>

                        <div class="form-actions">
                            <a class="btn btn-ghost" href="manage_rooms.php">Cancel</a>
                            <button class="btn btn-primary btn-lg" type="submit">Save room</button>
                        </div>
                    </form>

                    <aside class="sticky-aside">
                        <h2 class="text-lg">Live preview</h2>
                        <div class="image-preview mb-4" data-region="image-preview" aria-live="polite">No photo selected</div>
                        <div data-region="room-preview"></div>
                    </aside>
                </div>
