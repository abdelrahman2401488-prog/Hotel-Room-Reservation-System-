/**
 * booking.js — guest booking journey: homepage, room search, room details,
 * booking form, booking confirmation and "My bookings".
 *
 * Also exports HRS.booking.bindStayPricing(), reused by
 * reservations/modify_booking.php for live availability + price estimates.
 *
 * All reads/writes go through HRS.data (assets/js/data-service.js).
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var today = HRS.date.today();

  function setDateLimits(checkIn, checkOut) {
    checkIn.min = today;
    checkOut.min = HRS.date.addDays(checkIn.value || today, 1);
    checkIn.addEventListener('change', function () {
      if (!checkIn.value) return;
      checkOut.min = HRS.date.addDays(checkIn.value, 1);
      if (!checkOut.value || checkOut.value <= checkIn.value) checkOut.value = HRS.date.addDays(checkIn.value, 1);
    });
  }

  function guestOptions(select, capacity, selected) {
    var options = [];
    for (var i = 1; i <= capacity; i++) options.push({ value: String(i), label: HRS.format.plural(i, 'guest') });
    HRS.dom.fillSelect(select, options, String(Math.min(Number(selected) || Math.min(2, capacity), capacity)));
  }

  /**
   * Live availability + price estimate for a stay form.
   * options: form, room, inName, outName, availabilityEl, quoteEl, excludeReservationId
   * Returns { refresh() -> Promise<boolean available> }.
   */
  function bindStayPricing(options) {
    var form = options.form;
    var checkIn = form.elements[options.inName];
    var checkOut = form.elements[options.outName];
    var token = 0;

    function refresh() {
      var room = options.getRoom ? options.getRoom() : options.room;
      var ci = checkIn.value;
      var co = checkOut.value;
      var current = ++token;
      if (!room || !ci || !co || co <= ci) {
        HRS.dom.render(options.availabilityEl, '');
        HRS.dom.render(options.quoteEl, HRS.views.summaryList(null));
        return Promise.resolve(false);
      }
      return HRS.data.isAvailable(room.room_id, ci, co, options.excludeReservationId).then(function (available) {
        if (current !== token) return available;
        HRS.dom.render(options.availabilityEl, available
          ? html`<div class="alert alert-success mb-0"><span>Room ${room.room_number} is available for ${HRS.format.plural(HRS.date.diffDays(ci, co), 'night')}.</span></div>`
          : html`<div class="alert alert-error mb-0"><span>Room ${room.room_number} is not available for these dates. <a href="${HRS.url.to('guest/search_rooms.php', { check_in: ci, check_out: co })}">See other rooms</a>.</span></div>`);
        HRS.dom.render(options.quoteEl, HRS.views.summaryList(HRS.pricing.quote(room, ci, co)));
        if (options.onChange) options.onChange(available);
        return available;
      });
    }

    setDateLimits(checkIn, checkOut);
    form.addEventListener('change', function (event) {
      if ([options.inName, options.outName].indexOf(event.target.name) !== -1 || event.target.dataset.reprice !== undefined) refresh();
    });
    refresh();
    return { refresh: refresh };
  }

  HRS.booking = { bindStayPricing: bindStayPricing, guestOptions: guestOptions };

  /* ---------------- Homepage ---------------- */

  HRS.pages.home = function () {
    var form = qs('[data-form="hero-search"]');
    form.elements.check_in.value = HRS.date.addDays(today, 1);
    form.elements.check_out.value = HRS.date.addDays(today, 3);
    setDateLimits(form.elements.check_in, form.elements.check_out);
    HRS.validation.attach(form, {
      onSubmit: function (values) { HRS.url.go('guest/search_rooms.php', values); }
    });

    HRS.data.getRooms({ bookable: true, sort: 'price_desc' }).then(function (rooms) {
      var picks = ['suite', 'deluxe', 'family'].map(function (type) {
        return rooms.filter(function (r) { return r.room_type === type; }).pop();
      }).filter(Boolean);
      HRS.dom.render('[data-region="featured-rooms"]', picks.map(function (room) { return HRS.views.roomCard(room); }));
    });

    HRS.data.getReviews({ status: 'published', sort: 'highest' }).then(function (reviews) {
      HRS.dom.render('[data-region="home-reviews"]', reviews.slice(0, 3).map(HRS.views.reviewCard));
    });
  };

  /* ---------------- Search rooms ---------------- */

  HRS.pages['search-rooms'] = function () {
    var form = qs('[data-form="room-filters"]');
    var sort = qs('#f-sort');
    var params = new URLSearchParams(window.location.search);

    ['check_in', 'check_out', 'guests', 'room_type', 'min_price', 'max_price'].forEach(function (name) {
      if (params.get(name)) form.elements[name].value = params.get(name);
    });
    var amenities = params.getAll('amenities');
    HRS.dom.qsa('[name="amenities"]', form).forEach(function (box) { box.checked = amenities.indexOf(box.value) !== -1; });
    if (params.get('sort')) sort.value = params.get('sort');
    setDateLimits(form.elements.check_in, form.elements.check_out);

    function currentFilters() {
      var values = HRS.validation.serialize(form);
      values.sort = sort.value;
      values.bookable = true;
      var datesValid = values.check_in && values.check_out && values.check_out > values.check_in;
      if (!datesValid) { delete values.check_in; delete values.check_out; }
      return values;
    }

    function syncUrl(filters) {
      var search = new URLSearchParams();
      Object.keys(filters).forEach(function (key) {
        if (key === 'bookable') return;
        var value = filters[key];
        if (Array.isArray(value)) value.forEach(function (v) { search.append(key, v); });
        else if (value) search.set(key, value);
      });
      history.replaceState(null, '', window.location.pathname + (search.toString() ? '?' + search : ''));
    }

    function render() {
      var filters = currentFilters();
      syncUrl(filters);
      HRS.data.getRooms(filters).then(function (rooms) {
        var nights = filters.check_in ? HRS.date.diffDays(filters.check_in, filters.check_out) : 0;
        qs('[data-region="results-count"]').textContent = HRS.format.plural(rooms.length, filters.check_in ? 'available room' : 'room');
        qs('[data-region="results-summary"]').textContent = filters.check_in
          ? HRS.format.date(filters.check_in) + ' – ' + HRS.format.date(filters.check_out) + ' · ' + HRS.format.plural(nights, 'night')
          : 'Select check-in and check-out dates to see live availability.';

        if (!rooms.length) {
          HRS.ui.emptyState('[data-region="results"]', {
            title: 'No rooms match',
            message: 'Try different dates, fewer filters or a wider price range.'
          });
          return;
        }
        var linkParams = { check_in: filters.check_in, check_out: filters.check_out, guests: filters.guests };
        HRS.dom.render('[data-region="results"]', rooms.map(function (room) {
          return HRS.views.roomCard(room, {
            params: linkParams,
            cta: filters.check_in ? 'Select' : 'View room',
            badge: filters.check_in
              ? html`<span class="badge status-available">${HRS.format.currency(HRS.pricing.quote(room, filters.check_in, filters.check_out).total)} total</span>`
              : ''
          });
        }));
      });
    }

    HRS.validation.attach(form, { onSubmit: render });
    form.addEventListener('change', function (event) {
      if (event.target.type === 'number') return; // wait for submit on typed prices
      render();
    });
    sort.addEventListener('change', render);
    qs('[data-action="clear-filters"]').addEventListener('click', function () {
      HRS.validation.reset(form);
      sort.value = 'price_asc';
      render();
    });
    render();
  };

  /* ---------------- Room details ---------------- */

  HRS.pages['room-details'] = function () {
    var id = HRS.url.param('id');
    return HRS.data.getRoom(id).then(function (room) {
      var page = qs('[data-region="room-page"]');
      document.title = room.title + ' | Aurelia Grand Hotel';
      HRS.ui.fillFields(page, {
        title: room.title,
        type_label: HRS.format.label(room.room_type),
        room_number: room.room_number,
        floor: room.floor,
        price: HRS.format.currency(room.price_per_night),
        description: room.description
      });

      HRS.dom.render('[data-region="gallery"]', [
        HRS.views.roomMedia(room),
        html`<div class="room-media room-media-${room.room_type} room-media-thumb"><span class="room-media-label">${room.view} view</span></div>`,
        html`<div class="room-media room-media-${room.room_type} room-media-thumb"><span class="room-media-label">${room.bed_type}</span></div>`
      ]);
      HRS.dom.render('[data-region="room-facts"]', HRS.views.detailList([
        ['Sleeps', HRS.format.plural(room.capacity, 'guest')],
        ['Beds', room.bed_type],
        ['Size', room.size_sqm + ' m²'],
        ['View', room.view],
        ['Current status', HRS.views.statusBadge(room.status)]
      ]));
      HRS.dom.render('[data-region="amenities"]', room.amenities.map(function (a) { return html`<li>${a}</li>`; }));

      HRS.data.getReviews({ room_id: room.room_id, status: 'published' }).then(function (reviews) {
        if (!reviews.length) {
          HRS.dom.render('[data-region="room-reviews"]', html`<p class="text-muted">No reviews for this room yet.</p>`);
          return;
        }
        var avg = reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length;
        HRS.dom.render('[data-region="rating-average"]', html`${HRS.views.stars(avg)} <span class="text-sm text-muted">${avg.toFixed(1)} · ${HRS.format.plural(reviews.length, 'review')}</span>`);
        HRS.dom.render('[data-region="room-reviews"]', reviews.map(HRS.views.reviewCard));
      });

      var form = qs('[data-form="quick-book"]');
      form.elements.room_id.value = room.room_id;
      form.elements.check_in.value = HRS.url.param('check_in') || HRS.date.addDays(today, 1);
      form.elements.check_out.value = HRS.url.param('check_out') || HRS.date.addDays(form.elements.check_in.value, 2);
      guestOptions(form.elements.guests, room.capacity, HRS.url.param('guests'));

      var submit = form.querySelector('[type="submit"]');
      if (room.status === 'maintenance') {
        submit.disabled = true;
        HRS.dom.render('[data-region="availability"]', html`<div class="alert alert-warning mb-0"><span>This room is closed for maintenance and cannot be booked right now.</span></div>`);
        return;
      }
      var stay = bindStayPricing({
        form: form, room: room, inName: 'check_in', outName: 'check_out',
        availabilityEl: qs('[data-region="availability"]', form),
        quoteEl: qs('[data-region="quote"]', form)
      });
      HRS.validation.attach(form, {
        onSubmit: function (values) {
          return stay.refresh().then(function (available) {
            if (!available) throw new Error('Those dates are not available for this room.');
            HRS.url.go('guest/book_room.php', values);
          });
        }
      });
    }).catch(function () {
      HRS.ui.emptyState('[data-region="room-page"]', {
        title: 'Room not found',
        message: 'The room you are looking for does not exist or was removed.',
        href: HRS.url.to('guest/search_rooms.php'), action: 'Browse rooms'
      });
    });
  };

  /* ---------------- Book room ---------------- */

  HRS.pages['book-room'] = function () {
    var roomId = HRS.url.param('room_id');
    if (!roomId) {
      HRS.ui.emptyState('[data-region="book-page"]', {
        title: 'Choose a room first',
        message: 'Start by picking a room and your dates.',
        href: HRS.url.to('guest/search_rooms.php'), action: 'Search rooms'
      });
      return;
    }

    return HRS.data.getRoom(roomId).then(function (room) {
      var form = qs('[data-form="booking"]');
      var user = HRS.session.current();
      form.elements.room_id.value = room.room_id;
      form.elements.check_in_date.value = HRS.url.param('check_in') || HRS.date.addDays(today, 1);
      form.elements.check_out_date.value = HRS.url.param('check_out') || HRS.date.addDays(form.elements.check_in_date.value, 2);
      guestOptions(form.elements.num_guests, room.capacity, HRS.url.param('guests'));
      if (user) {
        form.elements.guest_name.value = user.full_name;
        form.elements.guest_email.value = user.email;
        form.elements.guest_phone.value = user.phone || '';
      }
      qs('[data-region="back-link"]').href = HRS.url.to('guest/rooms_details.php', { id: room.room_id });

      HRS.dom.render('[data-region="room-summary"]', html`
        ${HRS.views.roomMedia(room)}
        <div class="card-body">
          <h3 class="text-lg mb-1">${room.title}</h3>
          <p class="text-sm text-muted mb-0">Room ${room.room_number} · ${room.bed_type} · ${room.size_sqm} m²</p>
        </div>`);

      var stay = bindStayPricing({
        form: form, room: room, inName: 'check_in_date', outName: 'check_out_date',
        availabilityEl: qs('[data-region="availability"]', form),
        quoteEl: qs('[data-region="quote"]')
      });

      HRS.validation.attach(form, {
        onSubmit: function (values, form, submit) {
          return stay.refresh().then(function (available) {
            if (!available) throw new Error('This room is not available for the selected dates.');
            HRS.ui.setLoading(submit, true, 'Creating booking…');
            values.user_id = user ? user.user_id : null;
            return HRS.data.createReservation(values);
          }).then(function (reservation) {
            HRS.ui.flash('Demo booking ' + reservation.booking_reference + ' created in this browser.', { type: 'success', title: 'Booking received' });
            HRS.url.go('guest/booking_confirmation.php', { ref: reservation.booking_reference });
          });
        }
      });
    }).catch(function () {
      HRS.ui.emptyState('[data-region="book-page"]', {
        title: 'Room not found', message: 'Please choose another room.',
        href: HRS.url.to('guest/search_rooms.php'), action: 'Search rooms'
      });
    });
  };

  /* ---------------- Booking confirmation ---------------- */

  HRS.pages['booking-confirmation'] = function () {
    var ref = HRS.url.param('ref');
    qs('[data-action="print"]').addEventListener('click', function () { window.print(); });
    return HRS.data.getReservation(ref).then(function (r) {
      var paid = r.payment_status === 'paid';
      HRS.ui.fillFields(document, { booking_reference: r.booking_reference });
      if (paid) {
        qs('.receipt-header h1').textContent = 'Booking confirmed';
        HRS.dom.qsa('.steps .step').forEach(function (step, i) {
          step.classList.toggle('is-complete', i < 3);
          step.classList.toggle('is-active', i === 3);
        });
      }
      qs('[data-region="payment-alert"]').hidden = paid || r.status === 'cancelled';
      HRS.dom.render('[data-region="status-badges"]', html`${HRS.views.statusBadge(r.status)} ${HRS.views.statusBadge(r.payment_status)}`);
      HRS.dom.render('[data-region="details"]', HRS.views.detailList([
        ['Room', r.room ? r.room.title + ' · Room ' + r.room.room_number : '—'],
        ['Check-in', HRS.format.date(r.check_in_date) + ' from ' + HRS.mockData.settings.check_in_time],
        ['Check-out', HRS.format.date(r.check_out_date) + ' by ' + HRS.mockData.settings.check_out_time],
        ['Length of stay', HRS.format.plural(r.nights, 'night')],
        ['Guests', r.num_guests],
        ['Lead guest', r.guest_name],
        ['Email', r.guest_email],
        ['Phone', r.guest_phone],
        ['Special requests', r.special_requests || 'None']
      ]));
      HRS.dom.render('[data-region="quote"]', HRS.views.summaryList(HRS.pricing.quote(r.room, r.check_in_date, r.check_out_date)));

      var pay = qs('[data-region="pay-link"]');
      pay.href = HRS.url.to('reservations/payment.php', { ref: r.booking_reference });
      pay.hidden = paid || r.status === 'cancelled';
      qs('[data-region="status-link"]').href = HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference });
    }).catch(function () {
      HRS.ui.emptyState('[data-region="confirmation"]', {
        title: 'Booking not found',
        message: 'We could not find that booking reference in the demo data.',
        href: HRS.url.to('guest/my_bookings.php'), action: 'My bookings'
      });
    });
  };

  /* ---------------- My bookings ---------------- */

  function bookingGroup(r) {
    if (r.status === 'cancelled') return 'cancelled';
    if (r.status === 'checked-out' || r.check_out_date < today) return 'past';
    return 'upcoming';
  }

  function bookingCard(r, reviewedIds) {
    var group = bookingGroup(r);
    var ref = { ref: r.booking_reference };
    var canChange = r.status === 'pending' || r.status === 'confirmed';
    var actions = [
      html`<a class="btn btn-ghost btn-sm" href="${HRS.url.to('reservations/booking_status.php', ref)}">Details</a>`,
      canChange ? html`<a class="btn btn-outline btn-sm" href="${HRS.url.to('reservations/modify_booking.php', ref)}">Modify</a>` : '',
      canChange && r.payment_status !== 'paid' ? html`<a class="btn btn-accent btn-sm" href="${HRS.url.to('reservations/payment.php', ref)}">Pay now</a>` : '',
      canChange ? html`<a class="btn btn-ghost btn-sm" href="${HRS.url.to('reservations/cancel_booking.php', ref)}">Cancel</a>` : '',
      group === 'past' && reviewedIds.indexOf(r.reservation_id) === -1
        ? html`<a class="btn btn-accent btn-sm" href="${HRS.url.to('guest/leave_review.php', ref)}">Write a review</a>` : ''
    ];
    return html`
      <article class="card booking-card">
        <div class="card-body">
          ${r.room ? HRS.views.roomMedia(r.room, 'room-media-thumb') : ''}
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="reference-code text-sm">${r.booking_reference}</span>
              ${HRS.views.statusBadge(r.status)} ${HRS.views.statusBadge(r.payment_status)}
            </div>
            <h2 class="text-xl mb-1">${r.room ? r.room.title : 'Room removed'}</h2>
            <ul class="room-meta">
              <li>${HRS.format.date(r.check_in_date)} – ${HRS.format.date(r.check_out_date)}</li>
              <li>${HRS.format.plural(r.nights, 'night')}</li>
              <li>${HRS.format.plural(r.num_guests, 'guest')}</li>
              <li>Room ${r.room ? r.room.room_number : '—'}</li>
            </ul>
          </div>
          <div class="text-right">
            <div class="price text-xl">${HRS.format.currency(r.total_price)}</div>
            <div class="btn-group justify-end mt-2">${actions}</div>
          </div>
        </div>
      </article>`;
  }

  HRS.pages['my-bookings'] = function () {
    var user = HRS.session.current();
    if (!user) {
      HRS.ui.emptyState('[data-region="bookings-page"]', {
        title: 'Sign in to see your bookings',
        message: 'Use the demo guest account to explore a booking history.',
        href: HRS.url.to('login.php', { redirect: 'guest/my_bookings.php' }), action: 'Sign in (demo)'
      });
      return;
    }
    qs('[data-region="greeting"]').textContent = 'Signed in as ' + user.full_name + ' (' + user.email + ').';

    return Promise.all([
      HRS.data.getReservations({ user_id: user.user_id, guest_email: user.email }),
      HRS.data.getReviews({ user_id: user.user_id })
    ]).then(function (results) {
      var bookings = results[0];
      var reviewedIds = results[1].map(function (rv) { return rv.reservation_id; });
      var groups = { upcoming: [], past: [], cancelled: [] };
      bookings.forEach(function (r) { groups[bookingGroup(r)].push(r); });
      groups.upcoming.sort(function (a, b) { return a.check_in_date.localeCompare(b.check_in_date); });
      Object.keys(groups).forEach(function (key) { qs('[data-count="' + key + '"]').textContent = groups[key].length; });

      HRS.ui.tabs(qs('[role="tablist"]'), function (key) {
        if (!groups[key].length) {
          HRS.ui.emptyState('[data-region="booking-list"]', {
            title: 'Nothing here yet',
            message: key === 'upcoming' ? 'You have no upcoming stays.' : 'No bookings in this group.',
            href: key === 'upcoming' ? HRS.url.to('guest/search_rooms.php') : '', action: 'Find a room'
          });
          return;
        }
        HRS.dom.render('[data-region="booking-list"]', groups[key].map(function (r) { return bookingCard(r, reviewedIds); }));
      });
    });
  };
})(window.HRS);
