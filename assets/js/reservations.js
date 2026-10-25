/**
 * reservations.js — reservation listing (staff), modification, cancellation
 * and status lookup (reservations/*.php).
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var today = HRS.date.today();

  function isChangeable(r) { return r.status === 'pending' || r.status === 'confirmed'; }

  function notFound(region, ref) {
    HRS.ui.emptyState(region, {
      title: ref ? 'Booking not found' : 'No booking selected',
      message: ref ? 'We could not find booking ' + ref + ' in the demo data.' : 'Open this page from a booking in My bookings or Reservations.',
      href: HRS.url.to('guest/my_bookings.php'), action: 'My bookings'
    });
  }

  function bookingDetails(r) {
    return HRS.views.detailList([
      ['Room', r.room ? r.room.title + ' · Room ' + r.room.room_number : '—'],
      ['Check-in', HRS.format.date(r.check_in_date)],
      ['Check-out', HRS.format.date(r.check_out_date)],
      ['Nights', r.nights],
      ['Guests', r.num_guests],
      ['Lead guest', r.guest_name + ' · ' + r.guest_email],
      ['Total', HRS.format.currency(r.total_price)]
    ]);
  }

  function badges(r) { return html`${HRS.views.statusBadge(r.status)} ${HRS.views.statusBadge(r.payment_status)}`; }

  function refundSummary(terms) {
    return html`
      <ul class="summary-list">
        <li><span>Time until check-in</span><span>${terms.hours_until_check_in > 0 ? HRS.format.plural(terms.hours_until_check_in, 'hour') : 'Check-in has passed'}</span></li>
        <li><span>Cancellation fee</span><span>${HRS.format.currency(terms.cancellation_fee)}</span></li>
        <li class="summary-total"><span>Refund</span><span>${HRS.format.currency(terms.refund_amount)}</span></li>
      </ul>
      <p class="text-sm mt-4 mb-0 ${terms.free_cancellation ? 'text-success' : 'text-warning'}">
        ${terms.free_cancellation ? 'Free cancellation applies.' : 'Less than 48 hours before check-in: one night is charged.'}
        ${terms.paid ? '' : ' No payment was taken, so nothing is refunded.'}
      </p>`;
  }

  /* ---------------- Manage reservations (staff) ---------------- */

  HRS.pages['manage-bookings'] = function () {
    var form = qs('[data-form="booking-filters"]');
    var statusForm = qs('[data-form="status-change"]');
    var rows = [];

    ['status', 'query'].forEach(function (name) { if (HRS.url.param(name)) form.elements[name].value = HRS.url.param(name); });

    function renderStats(all) {
      var active = all.filter(function (r) { return r.status !== 'cancelled'; });
      var weekAhead = HRS.date.addDays(today, 7);
      var arrivals = active.filter(function (r) { return r.check_in_date >= today && r.check_in_date <= weekAhead && r.status !== 'checked-in'; });
      var unpaid = active.filter(function (r) { return r.payment_status === 'pending'; });
      HRS.dom.render('[data-region="stats"]', [
        html`<div class="stat-card stat-card-primary"><div class="stat-label">Active bookings</div><div class="stat-value">${active.length}</div></div>`,
        html`<div class="stat-card stat-card-warning"><div class="stat-label">Pending</div><div class="stat-value">${all.filter(function (r) { return r.status === 'pending'; }).length}</div></div>`,
        html`<div class="stat-card stat-card-info"><div class="stat-label">Arrivals (7 days)</div><div class="stat-value">${arrivals.length}</div></div>`,
        html`<div class="stat-card stat-card-error"><div class="stat-label">Unpaid</div><div class="stat-value">${HRS.format.currency(unpaid.reduce(function (s, r) { return s + r.total_price; }, 0))}</div><div class="stat-meta">${HRS.format.plural(unpaid.length, 'booking')}</div></div>`
      ]);
    }

    function render() {
      var filters = HRS.validation.serialize(form);
      return Promise.all([HRS.data.getReservations(filters), HRS.data.getReservations()]).then(function (results) {
        rows = results[0];
        renderStats(results[1]);
        qs('[data-region="row-count"]').textContent = 'Showing ' + HRS.format.plural(rows.length, 'reservation') + ' (demo data).';
        if (!rows.length) {
          HRS.dom.render('[data-region="booking-rows"]', html`<tr><td colspan="8" class="table-empty">No reservations match these filters.</td></tr>`);
          return;
        }
        HRS.dom.render('[data-region="booking-rows"]', rows.map(function (r) {
          var ref = { ref: r.booking_reference };
          return html`<tr>
              <td><a class="font-mono font-semibold" href="${HRS.url.to('reservations/booking_status.php', ref)}">${r.booking_reference}</a></td>
              <td><div class="font-medium">${r.guest_name}</div><div class="text-xs text-muted">${r.guest_email}</div></td>
              <td>${r.room ? r.room.room_number : '—'} <span class="text-xs text-muted">${r.room ? HRS.format.label(r.room.room_type) : ''}</span></td>
              <td class="text-nowrap">${HRS.format.dateShort(r.check_in_date)} – ${HRS.format.dateShort(r.check_out_date)}<div class="text-xs text-muted">${HRS.format.plural(r.nights, 'night')}</div></td>
              <td class="num">${HRS.format.currency(r.total_price)}</td>
              <td>${HRS.views.statusBadge(r.status)}</td>
              <td>${HRS.views.statusBadge(r.payment_status)}</td>
              <td><div class="table-actions">
                ${r.status !== 'cancelled' ? html`<button class="btn btn-ghost btn-sm" type="button" data-action="status" data-ref="${r.booking_reference}">Status</button>` : ''}
                ${isChangeable(r) ? html`<a class="btn btn-ghost btn-sm" href="${HRS.url.to('reservations/modify_booking.php', ref)}">Modify</a>` : ''}
                ${isChangeable(r) ? html`<button class="btn btn-ghost btn-sm" type="button" data-action="cancel" data-ref="${r.booking_reference}">Cancel</button>` : ''}
              </div></td>
            </tr>`;
        }));
      });
    }

    function find(ref) { return rows.filter(function (r) { return r.booking_reference === ref; })[0]; }

    HRS.dom.on(qs('[data-region="booking-rows"]'), 'click', '[data-action]', function (event, button) {
      var r = find(button.dataset.ref);
      if (!r) return;
      if (button.dataset.action === 'status') {
        statusForm.elements.booking_reference.value = r.booking_reference;
        statusForm.elements.status.value = r.status;
        statusForm.elements.payment_status.value = r.payment_status === 'paid' ? 'paid' : 'pending';
        statusForm.elements.payment_status.disabled = r.payment_status === 'refunded';
        qs('[data-region="status-modal-summary"]').textContent = r.booking_reference + ' · ' + r.guest_name + ' · Room ' + (r.room ? r.room.room_number : '—');
        HRS.ui.openModal('#status-modal');
      }
      if (button.dataset.action === 'cancel') {
        var terms = HRS.pricing.cancellation(r);
        HRS.ui.confirm({
          title: 'Cancel ' + r.booking_reference + '?',
          message: r.guest_name + ' · ' + HRS.format.date(r.check_in_date) + ' – ' + HRS.format.date(r.check_out_date),
          details: refundSummary(terms),
          confirmText: 'Cancel booking',
          cancelText: 'Keep booking',
          variant: 'danger'
        }).then(function (yes) {
          if (!yes) return;
          return HRS.data.cancelReservation(r.booking_reference, 'Cancelled by staff').then(function () {
            HRS.ui.toast(r.booking_reference + ' cancelled (demo). Refund: ' + HRS.format.currency(terms.refund_amount) + '.', { type: 'success' });
            render();
          });
        });
      }
    });

    HRS.validation.attach(statusForm, {
      onSubmit: function (values) {
        var extra = values.payment_status ? { payment_status: values.payment_status } : null;
        return HRS.data.setReservationStatus(values.booking_reference, values.status, extra).then(function (r) {
          HRS.ui.closeModal('#status-modal');
          HRS.ui.toast(r.booking_reference + ' is now ' + HRS.format.label(r.status).toLowerCase() + ' (demo).', { type: 'success' });
          render();
        });
      }
    });

    qs('[data-action="export"]').addEventListener('click', function () {
      var header = ['booking_reference', 'guest_name', 'guest_email', 'room_number', 'check_in_date', 'check_out_date', 'num_guests', 'total_price', 'status', 'payment_status'];
      var csv = [header.join(',')].concat(rows.map(function (r) {
        return [r.booking_reference, r.guest_name, r.guest_email, r.room ? r.room.room_number : '', r.check_in_date, r.check_out_date, r.num_guests, r.total_price, r.status, r.payment_status]
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      })).join('\n');
      HRS.ui.download('reservations-demo.csv', csv);
      HRS.ui.toast('Exported ' + HRS.format.plural(rows.length, 'row') + ' from demo data.', { type: 'success' });
    });

    form.addEventListener('input', function (event) { if (event.target.type === 'search') render(); });
    form.addEventListener('change', render);
    form.addEventListener('reset', function () { setTimeout(render, 0); });
    form.addEventListener('submit', function (event) { event.preventDefault(); render(); });
    return render();
  };

  /* ---------------- Modify booking ---------------- */

  HRS.pages['modify-booking'] = function () {
    var ref = HRS.url.param('ref');
    if (!ref) return notFound('[data-region="modify-page"]');

    return Promise.all([HRS.data.getReservation(ref), HRS.data.getRooms({ bookable: true, sort: 'number' })]).then(function (results) {
      var r = results[0];
      var rooms = results[1];
      if (HRS.session.denyReservation(r, '[data-region="modify-page"]')) return;
      HRS.ui.fillFields(document, { booking_reference: r.booking_reference });
      var statusUrl = HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference });
      qs('[data-region="status-crumb"]').href = statusUrl;
      qs('[data-region="status-crumb"]').textContent = r.booking_reference;

      if (!isChangeable(r)) {
        HRS.ui.emptyState('[data-region="modify-page"]', {
          title: 'This booking can no longer be changed',
          message: 'Bookings that are ' + HRS.format.label(r.status).toLowerCase() + ' cannot be modified online. Please contact reception.',
          href: statusUrl, action: 'View booking status'
        });
        return;
      }

      var form = qs('[data-form="modify"]');
      qs('[data-region="cancel-link"]').href = statusUrl;
      HRS.dom.render('[data-region="current"]', html`${badges(r)}<div class="mt-4">${bookingDetails(r)}</div>`);

      form.elements.booking_reference.value = r.booking_reference;
      form.elements.check_in_date.value = r.check_in_date;
      form.elements.check_out_date.value = r.check_out_date;
      form.elements.special_requests.value = r.special_requests || '';
      if (r.check_in_date < today) form.elements.check_in_date.removeAttribute('data-rule');
      HRS.dom.fillSelect(form.elements.room_id, rooms.map(function (room) {
        return { value: String(room.room_id), label: 'Room ' + room.room_number + ' · ' + room.title + ' · ' + HRS.format.currency(room.price_per_night) + '/night · sleeps ' + room.capacity };
      }), String(r.room_id));

      function selectedRoom() {
        return rooms.filter(function (room) { return String(room.room_id) === form.elements.room_id.value; })[0];
      }
      function syncGuests() {
        HRS.booking.guestOptions(form.elements.num_guests, selectedRoom().capacity, form.elements.num_guests.value || r.num_guests);
      }
      function difference() {
        var quote = HRS.pricing.quote(selectedRoom(), form.elements.check_in_date.value, form.elements.check_out_date.value);
        if (!quote.nights) { HRS.dom.render('[data-region="difference"]', ''); return quote; }
        var diff = Math.round((quote.total - r.total_price) * 100) / 100;
        HRS.dom.render('[data-region="difference"]', html`
          <ul class="summary-list">
            <li><span>Current total</span><span>${HRS.format.currency(r.total_price)}</span></li>
            <li class="summary-total"><span>${diff >= 0 ? 'Extra to pay' : 'Refund due'}</span><span class="${diff < 0 ? 'text-success' : ''}">${HRS.format.currency(Math.abs(diff))}</span></li>
          </ul>`);
        return quote;
      }

      syncGuests();
      form.elements.room_id.addEventListener('change', syncGuests);
      var stay = HRS.booking.bindStayPricing({
        form: form, getRoom: selectedRoom, inName: 'check_in_date', outName: 'check_out_date',
        excludeReservationId: r.reservation_id,
        availabilityEl: qs('[data-region="availability"]'),
        quoteEl: qs('[data-region="quote"]'),
        onChange: difference
      });

      HRS.validation.attach(form, {
        onSubmit: function (values) {
          return stay.refresh().then(function (available) {
            if (!available) throw new Error('The selected room is not available for those dates.');
            var quote = difference();
            var diff = quote.total - r.total_price;
            return HRS.ui.confirm({
              title: 'Save changes to ' + r.booking_reference + '?',
              message: HRS.format.date(values.check_in_date) + ' – ' + HRS.format.date(values.check_out_date) + ' · Room ' + selectedRoom().room_number + ' · ' + HRS.format.plural(Number(values.num_guests), 'guest'),
              details: html`<p class="text-sm mb-0">New total <strong>${HRS.format.currency(quote.total)}</strong> (${diff >= 0 ? 'extra ' : 'refund '}${HRS.format.currency(Math.abs(diff))}).</p>`,
              confirmText: 'Save changes'
            });
          }).then(function (yes) {
            if (!yes) return;
            return HRS.data.updateReservation(r.booking_reference, {
              check_in_date: values.check_in_date,
              check_out_date: values.check_out_date,
              room_id: Number(values.room_id),
              num_guests: Number(values.num_guests),
              special_requests: values.special_requests
            }).then(function (updated) {
              HRS.ui.flash('Booking ' + updated.booking_reference + ' updated (demo).', { type: 'success' });
              HRS.url.go('reservations/booking_status.php', { ref: updated.booking_reference });
            });
          });
        }
      });
    }).catch(function () { notFound('[data-region="modify-page"]', ref); });
  };

  /* ---------------- Cancel booking ---------------- */

  HRS.pages['cancel-booking'] = function () {
    var ref = HRS.url.param('ref');
    if (!ref) return notFound('[data-region="cancel-page"]');

    return HRS.data.getReservation(ref).then(function (r) {
      var statusUrl = HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference });
      if (HRS.session.denyReservation(r, '[data-region="cancel-page"]')) return;
      HRS.ui.fillFields(document, { booking_reference: r.booking_reference });
      if (!isChangeable(r)) {
        HRS.ui.emptyState('[data-region="cancel-page"]', {
          title: 'This booking cannot be cancelled',
          message: 'Its status is ' + HRS.format.label(r.status).toLowerCase() + '.',
          href: statusUrl, action: 'View booking status'
        });
        return;
      }
      var terms = HRS.pricing.cancellation(r);
      var form = qs('[data-form="cancel"]');
      form.elements.booking_reference.value = r.booking_reference;
      qs('[data-region="keep-link"]').href = statusUrl;
      HRS.dom.render('[data-region="badges"]', badges(r));
      HRS.dom.render('[data-region="details"]', bookingDetails(r));
      HRS.dom.render('[data-region="refund"]', refundSummary(terms));

      HRS.validation.attach(form, {
        onSubmit: function (values, form, submit) {
          return HRS.ui.confirm({
            title: 'Cancel booking ' + r.booking_reference + '?',
            message: 'This cannot be undone.',
            details: refundSummary(terms),
            confirmText: 'Yes, cancel booking',
            cancelText: 'Keep booking',
            variant: 'danger'
          }).then(function (yes) {
            if (!yes) return;
            HRS.ui.setLoading(submit, true, 'Cancelling…');
            var reason = values.cancellation_reason + (values.notes ? ' — ' + values.notes : '');
            return HRS.data.cancelReservation(r.booking_reference, reason).then(function (cancelled) {
              HRS.ui.toast('Booking cancelled (demo).', { type: 'success' });
              HRS.dom.render('[data-region="cancel-page"]', html`
                <div class="card">
                  <div class="card-body empty-state">
                    <div class="success-icon" aria-hidden="true">&#10003;</div>
                    <h2>Booking ${cancelled.booking_reference} cancelled</h2>
                    <p>${cancelled.refund.paid ? 'A refund of ' + HRS.format.currency(cancelled.refund.refund_amount) + ' would be returned to the original payment method.' : 'No payment had been taken, so there is nothing to refund.'}</p>
                    <div class="btn-group justify-center mt-4">
                      <a class="btn btn-primary" href="${statusUrl}">View status</a>
                      <a class="btn btn-ghost" href="${HRS.url.to('guest/search_rooms.php')}">Book another stay</a>
                    </div>
                  </div>
                </div>`);
            });
          });
        }
      });
    }).catch(function () { notFound('[data-region="cancel-page"]', ref); });
  };

  /* ---------------- Booking status ---------------- */

  function timeline(r) {
    var steps = [{ title: 'Booking received', meta: HRS.format.dateTime(r.created_at), done: true }];
    if (r.status === 'cancelled') {
      steps.push({ title: 'Cancelled', meta: (r.cancellation_reason || 'Cancelled') + (r.payment_status === 'refunded' ? ' · refund issued' : ''), cancelled: true });
    } else {
      var paid = r.payment_status === 'paid';
      var inHouse = r.status === 'checked-in' || r.status === 'checked-out';
      steps.push({ title: paid ? 'Payment received' : 'Awaiting payment', meta: paid ? 'Booking confirmed' : 'Pay online or at the hotel', done: paid || r.status === 'confirmed', active: !paid && r.status === 'pending' });
      steps.push({ title: 'Check-in', meta: HRS.format.date(r.check_in_date) + ' from ' + HRS.mockData.settings.check_in_time, done: inHouse, active: !inHouse && (paid || r.status === 'confirmed') });
      steps.push({ title: 'Check-out', meta: HRS.format.date(r.check_out_date) + ' by ' + HRS.mockData.settings.check_out_time, done: r.status === 'checked-out', active: r.status === 'checked-in' });
    }
    return html`<ol class="timeline">${steps.map(function (s) {
      var cls = s.cancelled ? 'is-cancelled' : s.done ? 'is-complete' : s.active ? 'is-active' : '';
      return html`<li class="timeline-item ${cls}"><div class="timeline-title">${s.title}</div><div class="timeline-meta">${s.meta}</div></li>`;
    })}</ol>`;
  }

  // Actions depend on the demo role: guests pay / change their own booking,
  // staff and admin can modify or cancel, signed-out visitors are asked to sign in.
  function renderStatus(r) {
    var ref = { ref: r.booking_reference };
    var user = HRS.session.current();
    var canManage = HRS.session.canAccessReservation(r);
    var isGuest = !!user && user.role === 'guest';
    var actions = [];
    if (canManage && isGuest && isChangeable(r) && r.payment_status !== 'paid') actions.push(html`<a class="btn btn-accent" href="${HRS.url.to('reservations/payment.php', ref)}">Pay now</a>`);
    if (canManage && isChangeable(r)) actions.push(html`<a class="btn btn-outline" href="${HRS.url.to('reservations/modify_booking.php', ref)}">Modify</a>`);
    if (canManage && isChangeable(r)) actions.push(html`<a class="btn btn-ghost" href="${HRS.url.to('reservations/cancel_booking.php', ref)}">Cancel booking</a>`);
    if (canManage && isGuest && r.payment_status === 'paid') actions.push(html`<a class="btn btn-ghost" href="${HRS.url.to('reservations/payment_confirmation.php', ref)}">View receipt</a>`);
    if (!user && isChangeable(r)) actions.push(html`<a class="btn btn-primary" href="${HRS.url.to('login.php', { redirect: 'guest/my_bookings.php' })}">Sign in to pay or change this booking</a>`);
    HRS.dom.render('[data-region="status-result"]', html`
      <article class="card">
        <div class="card-header flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl mb-0">Booking <span class="reference-code">${r.booking_reference}</span></h2>
          <span>${badges(r)}</span>
        </div>
        <div class="card-body grid grid-2 gap-6">
          <div>
            <h3 class="text-lg">Progress</h3>
            ${timeline(r)}
          </div>
          <div>
            <h3 class="text-lg">Details</h3>
            ${bookingDetails(r)}
            ${r.special_requests ? html`<p class="text-sm text-muted mt-4 mb-0">Requests: ${r.special_requests}</p>` : ''}
          </div>
        </div>
        ${actions.length ? html`<div class="card-footer btn-group">${actions}</div>` : ''}
      </article>`);
  }

  HRS.pages['booking-status'] = function () {
    var form = qs('[data-form="status-lookup"]');
    var user = HRS.session.current();
    if (user) form.elements.guest_email.value = user.email;

    HRS.validation.attach(form, {
      onSubmit: function (values, form, submit) {
        HRS.ui.setLoading(submit, true, 'Searching…');
        return HRS.data.findReservation(values.booking_reference, values.guest_email).then(function (r) {
          HRS.ui.setLoading(submit, false);
          renderStatus(r);
        }).catch(function (error) {
          HRS.ui.setLoading(submit, false);
          HRS.dom.render('[data-region="status-result"]', html`<div class="alert alert-error"><span>${error.message}</span></div>`);
        });
      }
    });

    // Links from My bookings / Reservations pass ?ref=. Only the booking's
    // owner or staff/admin see it directly; anyone else must use the lookup.
    // BACKEND INTEGRATION: enforce the same ownership check in PHP.
    var ref = HRS.url.param('ref');
    if (ref) {
      form.elements.booking_reference.value = ref;
      return HRS.data.getReservation(ref).then(function (r) {
        if (!HRS.session.canAccessReservation(r)) {
          HRS.dom.render('[data-region="status-result"]', html`<div class="alert alert-info"><span>Enter the email address used for booking ${r.booking_reference} to view its status.</span></div>`);
          return;
        }
        form.elements.booking_reference.value = r.booking_reference;
        form.elements.guest_email.value = r.guest_email;
        renderStatus(r);
      }).catch(function () {
        HRS.dom.render('[data-region="status-result"]', html`<div class="alert alert-error"><span>Booking ${ref} was not found.</span></div>`);
      });
    }
  };
})(window.HRS);
