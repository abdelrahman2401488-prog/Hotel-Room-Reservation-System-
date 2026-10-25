/**
 * data-service.js — the frontend's ONLY data access layer.
 *
 * Page scripts never touch localStorage or HRS.mockData directly; they call
 * HRS.data.* which returns Promises, exactly like a future fetch() call to a
 * PHP handler would. In this prototype every method reads and writes DEMO
 * data kept in localStorage (seeded from mock-data.js).
 *
 * BACKEND INTEGRATION: re-implement each method below with fetch() against
 * the PHP pages/handlers (keeping the same names, arguments and return
 * shapes) and the UI will keep working. Each method notes the PHP file that
 * is expected to own that operation. Business rules here (availability,
 * pricing, refunds) are previews only and must be recomputed on the server.
 */
(function (HRS) {
  'use strict';

  var PREFIX = 'hrs_demo_';
  var VERSION = '1';
  var COLLECTIONS = ['users', 'rooms', 'room_types', 'pricing_rules', 'reservations', 'payments', 'reviews', 'service_requests', 'complaints'];
  var state = {};
  var LATENCY = 150; // ms, simulates a network round trip

  /* ------------------------------------------------------------------
     Storage (localStorage with in-memory fallback)
     ------------------------------------------------------------------ */

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }

  function persist(name) {
    try { localStorage.setItem(PREFIX + name, JSON.stringify(state[name])); } catch (e) { /* private mode: keep in memory */ }
  }

  function seed() {
    var mock = clone(HRS.mockData);
    COLLECTIONS.forEach(function (name) { state[name] = mock[name] || []; });

    // Derive totals and payment records so the sample data is consistent
    state.reservations.forEach(function (r) {
      var room = findRoom(r.room_id);
      r.total_price = room ? pricing.quote(room, r.check_in_date, r.check_out_date).total : 0;
      if (r.payment_status === 'paid' || r.payment_status === 'refunded') {
        state.payments.push({
          payment_id: state.payments.length + 1,
          reservation_id: r.reservation_id,
          amount: r.total_price,
          payment_method: 'card',
          card_last4: '4242',
          transaction_ref: 'DEMO-TXN-' + (500000 + r.reservation_id * 137),
          status: r.payment_status,
          paid_at: r.created_at,
          refund_amount: r.payment_status === 'refunded' ? r.total_price : 0
        });
      }
    });

    COLLECTIONS.forEach(persist);
    try { localStorage.setItem(PREFIX + 'version', VERSION); } catch (e) { /* ignore */ }
  }

  function load() {
    var ok = false;
    try {
      ok = localStorage.getItem(PREFIX + 'version') === VERSION;
      if (ok) {
        COLLECTIONS.forEach(function (name) {
          var raw = localStorage.getItem(PREFIX + name);
          if (raw === null) ok = false;
          else state[name] = JSON.parse(raw);
        });
      }
    } catch (e) { ok = false; }
    if (!ok) seed();
  }

  function respond(value) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(clone(value)); }, LATENCY); });
  }

  function fail(message, field) {
    var error = new Error(message);
    if (field) error.field = field;
    return new Promise(function (resolve, reject) { setTimeout(function () { reject(error); }, LATENCY); });
  }

  function nextId(name, key) {
    return state[name].reduce(function (max, item) { return Math.max(max, Number(item[key]) || 0); }, 0) + 1;
  }

  function nowIso() {
    var d = new Date();
    return HRS.date.toISO(d) + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':00';
  }

  function findRoom(id) {
    return state.rooms.filter(function (r) { return String(r.room_id) === String(id); })[0] || null;
  }

  function findReservation(refOrId) {
    return state.reservations.filter(function (r) {
      return r.booking_reference === refOrId || String(r.reservation_id) === String(refOrId);
    })[0] || null;
  }

  function settings() { return HRS.mockData.settings; }

  /* ------------------------------------------------------------------
     Pricing & availability (client-side PREVIEW of server rules)
     ------------------------------------------------------------------ */

  var pricing = {
    // Active seasonal rules for a room type on a given night
    rulesFor: function (roomType, night, rules) {
      return (rules || state.pricing_rules).filter(function (rule) {
        return rule.is_active && (rule.room_type === 'all' || rule.room_type === roomType) &&
          night >= rule.start_date && night <= rule.end_date;
      });
    },

    quote: function (room, checkIn, checkOut, rules) {
      var cfg = settings();
      var nights = HRS.date.diffDays(checkIn, checkOut);
      if (!room || !checkIn || !checkOut || nights <= 0) return { nights: 0, total: 0 };
      var base = Number(room.price_per_night);
      var nightly = HRS.date.eachNight(checkIn, checkOut).map(function (night) {
        var percent = pricing.rulesFor(room.room_type, night, rules).reduce(function (sum, rule) { return sum + Number(rule.adjustment_percent); }, 0);
        return { date: night, rate: Math.round(base * (1 + percent / 100) * 100) / 100, percent: percent };
      });
      var subtotal = base * nights;
      var adjusted = nightly.reduce(function (sum, n) { return sum + n.rate; }, 0);
      var adjustments = Math.round((adjusted - subtotal) * 100) / 100;
      var serviceFee = Math.round(adjusted * cfg.service_rate * 100) / 100;
      var tax = Math.round((adjusted + serviceFee) * cfg.tax_rate * 100) / 100;
      return {
        nights: nights,
        nightly: nightly,
        base_rate: base,
        average_rate: base,
        subtotal: subtotal,
        adjustments: adjustments,
        service_rate: cfg.service_rate,
        service_fee: serviceFee,
        tax_rate: cfg.tax_rate,
        tax: tax,
        total: Math.round((adjusted + serviceFee + tax) * 100) / 100
      };
    },

    // Free cancellation until N hours before check-in, otherwise one night is charged
    cancellation: function (reservation) {
      var cfg = settings();
      var checkIn = HRS.date.parse(reservation.check_in_date);
      checkIn.setHours(Number(cfg.check_in_time.split(':')[0]));
      var hours = (checkIn - new Date()) / 3600000;
      var nights = Math.max(1, HRS.date.diffDays(reservation.check_in_date, reservation.check_out_date));
      var free = hours >= cfg.free_cancellation_hours;
      var fee = free ? 0 : Math.round(reservation.total_price / nights * 100) / 100;
      var paid = reservation.payment_status === 'paid';
      return {
        hours_until_check_in: Math.round(hours),
        free_cancellation: free,
        cancellation_fee: fee,
        refund_amount: paid ? Math.max(0, Math.round((reservation.total_price - fee) * 100) / 100) : 0,
        paid: paid
      };
    }
  };

  function isAvailable(roomId, checkIn, checkOut, excludeReservationId) {
    var room = findRoom(roomId);
    if (!room || room.status === 'maintenance') return false;
    return !state.reservations.some(function (r) {
      return String(r.room_id) === String(roomId) &&
        r.status !== 'cancelled' && r.status !== 'checked-out' &&
        String(r.reservation_id) !== String(excludeReservationId) &&
        HRS.date.overlaps(checkIn, checkOut, r.check_in_date, r.check_out_date);
    });
  }

  function withRoom(reservation) {
    var room = findRoom(reservation.room_id);
    var copy = clone(reservation);
    copy.room = room ? clone(room) : null;
    copy.nights = HRS.date.diffDays(reservation.check_in_date, reservation.check_out_date);
    return copy;
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  load();

  HRS.pricing = pricing;

  HRS.data = {
    getSettings: function () { return respond(settings()); },

    /* ---- Rooms — admin/manage_rooms.php, guest/search_rooms.php ---- */

    // filters: query, room_type, status, guests, min_price, max_price,
    //          amenities[], check_in, check_out, sort
    getRooms: function (filters) {
      filters = filters || {};
      var list = state.rooms.filter(function (room) {
        if (filters.room_type && room.room_type !== filters.room_type) return false;
        if (filters.status && room.status !== filters.status) return false;
        if (filters.guests && room.capacity < Number(filters.guests)) return false;
        if (filters.min_price && room.price_per_night < Number(filters.min_price)) return false;
        if (filters.max_price && room.price_per_night > Number(filters.max_price)) return false;
        if (filters.amenities && filters.amenities.length && !filters.amenities.every(function (a) { return room.amenities.indexOf(a) !== -1; })) return false;
        if (filters.query) {
          var q = filters.query.toLowerCase();
          if ((room.room_number + ' ' + room.title + ' ' + room.room_type + ' ' + room.view).toLowerCase().indexOf(q) === -1) return false;
        }
        if (filters.check_in && filters.check_out && !isAvailable(room.room_id, filters.check_in, filters.check_out)) return false;
        if (filters.bookable && room.status === 'maintenance') return false;
        return true;
      });
      var sorters = {
        price_asc: function (a, b) { return a.price_per_night - b.price_per_night; },
        price_desc: function (a, b) { return b.price_per_night - a.price_per_night; },
        capacity: function (a, b) { return b.capacity - a.capacity; },
        size: function (a, b) { return b.size_sqm - a.size_sqm; },
        number: function (a, b) { return a.room_number.localeCompare(b.room_number); }
      };
      list.sort(sorters[filters.sort] || sorters.number);
      return respond(list);
    },

    getRoom: function (id) {
      var room = findRoom(id);
      return room ? respond(room) : fail('Room not found.');
    },

    // admin/add_room.php and admin/edit_room.php (POST)
    saveRoom: function (data) {
      var duplicate = state.rooms.some(function (r) {
        return r.room_number === data.room_number && String(r.room_id) !== String(data.room_id || '');
      });
      if (duplicate) return fail('Room number ' + data.room_number + ' already exists.', 'room_number');
      var room = {
        room_id: data.room_id ? Number(data.room_id) : nextId('rooms', 'room_id'),
        room_number: data.room_number,
        room_type: data.room_type,
        title: data.title,
        description: data.description || '',
        floor: Number(data.floor),
        capacity: Number(data.capacity),
        bed_type: data.bed_type,
        size_sqm: Number(data.size_sqm),
        view: data.view,
        price_per_night: Number(data.price_per_night),
        status: data.status,
        amenities: data.amenities || []
      };
      var index = state.rooms.findIndex(function (r) { return r.room_id === room.room_id; });
      if (index === -1) state.rooms.push(room); else state.rooms[index] = room;
      persist('rooms');
      return respond(room);
    },

    // admin/delete_room.php (POST)
    deleteRoom: function (id) {
      var upcoming = state.reservations.filter(function (r) {
        return String(r.room_id) === String(id) && ['pending', 'confirmed', 'checked-in'].indexOf(r.status) !== -1;
      });
      if (upcoming.length) return fail('This room has ' + HRS.format.plural(upcoming.length, 'active reservation') + '. Move or cancel them first.');
      state.rooms = state.rooms.filter(function (r) { return String(r.room_id) !== String(id); });
      persist('rooms');
      return respond(true);
    },

    updateRoomStatus: function (id, status) {
      var room = findRoom(id);
      if (!room) return fail('Room not found.');
      room.status = status;
      persist('rooms');
      return respond(room);
    },

    /* ---- Pricing — admin/manage_pricing.php ---- */

    getRoomTypes: function () { return respond(state.room_types); },

    saveRoomTypeRate: function (roomType, basePrice, applyToRooms) {
      var type = state.room_types.filter(function (t) { return t.room_type === roomType; })[0];
      if (!type) return fail('Unknown room type.');
      type.base_price = Number(basePrice);
      var updated = 0;
      if (applyToRooms) {
        state.rooms.forEach(function (room) {
          if (room.room_type === roomType) { room.price_per_night = type.base_price; updated++; }
        });
        persist('rooms');
      }
      persist('room_types');
      return respond({ room_type: type, rooms_updated: updated });
    },

    getPricingRules: function () {
      return respond(state.pricing_rules.slice().sort(function (a, b) { return a.start_date.localeCompare(b.start_date); }));
    },

    savePricingRule: function (data) {
      var rule = {
        rule_id: data.rule_id ? Number(data.rule_id) : nextId('pricing_rules', 'rule_id'),
        name: data.name,
        room_type: data.room_type,
        start_date: data.start_date,
        end_date: data.end_date,
        adjustment_percent: Number(data.adjustment_percent),
        is_active: data.is_active === true || data.is_active === 'on' || data.is_active === '1'
      };
      var index = state.pricing_rules.findIndex(function (r) { return r.rule_id === rule.rule_id; });
      if (index === -1) state.pricing_rules.push(rule); else state.pricing_rules[index] = rule;
      persist('pricing_rules');
      return respond(rule);
    },

    togglePricingRule: function (id) {
      var rule = state.pricing_rules.filter(function (r) { return String(r.rule_id) === String(id); })[0];
      if (!rule) return fail('Rule not found.');
      rule.is_active = !rule.is_active;
      persist('pricing_rules');
      return respond(rule);
    },

    deletePricingRule: function (id) {
      state.pricing_rules = state.pricing_rules.filter(function (r) { return String(r.rule_id) !== String(id); });
      persist('pricing_rules');
      return respond(true);
    },

    quote: function (roomId, checkIn, checkOut) {
      var room = findRoom(roomId);
      return room ? respond(pricing.quote(room, checkIn, checkOut)) : fail('Room not found.');
    },

    isAvailable: function (roomId, checkIn, checkOut, excludeReservationId) {
      return respond(isAvailable(roomId, checkIn, checkOut, excludeReservationId));
    },

    /* ---- Reservations — guest/book_room.php, reservations/*.php ---- */

    // filters: user_id, guest_email, status, payment_status, query, from, to
    getReservations: function (filters) {
      filters = filters || {};
      var list = state.reservations.filter(function (r) {
        if (filters.user_id && String(r.user_id) !== String(filters.user_id) &&
            !(filters.guest_email && r.guest_email.toLowerCase() === filters.guest_email.toLowerCase())) return false;
        if (filters.status && r.status !== filters.status) return false;
        if (filters.payment_status && r.payment_status !== filters.payment_status) return false;
        if (filters.from && r.check_out_date < filters.from) return false;
        if (filters.to && r.check_in_date > filters.to) return false;
        if (filters.query) {
          var room = findRoom(r.room_id);
          var haystack = [r.booking_reference, r.guest_name, r.guest_email, room ? room.room_number : ''].join(' ').toLowerCase();
          if (haystack.indexOf(filters.query.toLowerCase()) === -1) return false;
        }
        return true;
      }).map(withRoom);
      list.sort(function (a, b) { return b.check_in_date.localeCompare(a.check_in_date); });
      return respond(list);
    },

    getReservation: function (refOrId) {
      var r = findReservation(refOrId);
      return r ? respond(withRoom(r)) : fail('Booking ' + refOrId + ' was not found.');
    },

    // reservations/booking_status.php lookup (reference + email)
    findReservation: function (reference, email) {
      var r = findReservation(String(reference || '').trim().toUpperCase());
      if (!r || r.guest_email.toLowerCase() !== String(email || '').trim().toLowerCase()) {
        return fail('No booking matches that reference and email.');
      }
      return respond(withRoom(r));
    },

    // guest/book_room.php (POST)
    createReservation: function (data) {
      var room = findRoom(data.room_id);
      if (!room) return fail('Room not found.');
      if (!isAvailable(room.room_id, data.check_in_date, data.check_out_date)) {
        return fail('Room ' + room.room_number + ' is no longer available for those dates.', 'check_in_date');
      }
      if (Number(data.num_guests) > room.capacity) return fail('This room sleeps up to ' + room.capacity + '.', 'num_guests');
      var id = nextId('reservations', 'reservation_id');
      var maxRef = state.reservations.reduce(function (max, r) { return Math.max(max, Number(r.booking_reference.split('-')[1]) || 0); }, 10240);
      var reservation = {
        reservation_id: id,
        booking_reference: 'HRS-' + (maxRef + 1),
        user_id: data.user_id || null,
        room_id: room.room_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        num_guests: Number(data.num_guests),
        special_requests: data.special_requests || '',
        arrival_time: data.arrival_time || '',
        status: 'pending',
        payment_status: 'pending',
        total_price: pricing.quote(room, data.check_in_date, data.check_out_date).total,
        created_at: nowIso()
      };
      state.reservations.push(reservation);
      persist('reservations');
      return respond(withRoom(reservation));
    },

    // reservations/modify_booking.php (POST)
    updateReservation: function (refOrId, changes) {
      var r = findReservation(refOrId);
      if (!r) return fail('Booking not found.');
      if (['cancelled', 'checked-out'].indexOf(r.status) !== -1) return fail('This booking can no longer be changed.');
      var next = Object.assign({}, r, changes);
      var room = findRoom(next.room_id);
      if (!room) return fail('Room not found.', 'room_id');
      if (!isAvailable(room.room_id, next.check_in_date, next.check_out_date, r.reservation_id)) {
        return fail('Room ' + room.room_number + ' is not available for the new dates.', 'check_in_date');
      }
      if (Number(next.num_guests) > room.capacity) return fail('This room sleeps up to ' + room.capacity + '.', 'num_guests');
      next.room_id = room.room_id;
      next.num_guests = Number(next.num_guests);
      next.total_price = pricing.quote(room, next.check_in_date, next.check_out_date).total;
      next.updated_at = nowIso();
      Object.assign(r, next);
      persist('reservations');
      return respond(withRoom(r));
    },

    // reservations/cancel_booking.php (POST)
    cancelReservation: function (refOrId, reason) {
      var r = findReservation(refOrId);
      if (!r) return fail('Booking not found.');
      if (['cancelled', 'checked-in', 'checked-out'].indexOf(r.status) !== -1) return fail('This booking cannot be cancelled.');
      var terms = pricing.cancellation(r);
      r.status = 'cancelled';
      r.cancellation_reason = reason || '';
      r.cancelled_at = nowIso();
      r.cancellation_fee = terms.cancellation_fee;
      if (terms.paid) {
        r.payment_status = 'refunded';
        state.payments.forEach(function (p) {
          if (p.reservation_id === r.reservation_id && p.status === 'paid') { p.status = 'refunded'; p.refund_amount = terms.refund_amount; }
        });
        persist('payments');
      }
      persist('reservations');
      return respond(Object.assign(withRoom(r), { refund: terms }));
    },

    // staff/checkin_checkout.php, reservations/manage_bookings.php
    setReservationStatus: function (refOrId, status, extra) {
      var r = findReservation(refOrId);
      if (!r) return fail('Booking not found.');
      r.status = status;
      if (extra) Object.assign(r, extra);
      if (status === 'checked-in') { r.checked_in_at = nowIso(); updateRoomStatusSync(r.room_id, 'occupied'); }
      if (status === 'checked-out') { r.checked_out_at = nowIso(); updateRoomStatusSync(r.room_id, 'available'); }
      persist('reservations');
      return respond(withRoom(r));
    },

    /* ---- Payments — reservations/payment.php ---- */

    getPayments: function () {
      return respond(state.payments.map(function (p) {
        var r = findReservation(p.reservation_id);
        return Object.assign({}, p, { reservation: r ? withRoom(r) : null });
      }));
    },

    getPaymentForReservation: function (reservationId) {
      var payment = state.payments.filter(function (p) { return p.reservation_id === Number(reservationId); }).pop();
      return respond(payment || null);
    },

    // DEMO ONLY: no card data is stored or transmitted; only the last 4
    // digits are kept to render the receipt. A real integration must use a
    // payment gateway's hosted fields / tokenisation, never raw card numbers.
    recordPayment: function (refOrId, details) {
      var r = findReservation(refOrId);
      if (!r) return fail('Booking not found.');
      if (r.payment_status === 'paid') return fail('This booking is already paid.');
      if (r.status === 'cancelled') return fail('Cancelled bookings cannot be paid.');
      var payment = {
        payment_id: nextId('payments', 'payment_id'),
        reservation_id: r.reservation_id,
        amount: r.total_price,
        payment_method: details.payment_method,
        card_last4: details.card_last4 || '',
        transaction_ref: 'DEMO-TXN-' + Date.now().toString().slice(-7),
        status: details.payment_method === 'pay_at_hotel' ? 'pending' : 'paid',
        paid_at: nowIso(),
        refund_amount: 0
      };
      state.payments.push(payment);
      if (payment.status === 'paid') r.payment_status = 'paid';
      if (r.status === 'pending') r.status = 'confirmed';
      persist('payments');
      persist('reservations');
      return respond({ payment: payment, reservation: withRoom(r) });
    },

    /* ---- Reviews — reviews/list_reviews.php, guest/leave_review.php ---- */

    getReviews: function (filters) {
      filters = filters || {};
      var list = state.reviews.filter(function (rv) {
        if (filters.status && rv.status !== filters.status) return false;
        if (filters.room_id && String(rv.room_id) !== String(filters.room_id)) return false;
        if (filters.rating && Number(rv.rating) !== Number(filters.rating)) return false;
        if (filters.user_id && String(rv.user_id) !== String(filters.user_id)) return false;
        if (filters.room_type) {
          var room = findRoom(rv.room_id);
          if (!room || room.room_type !== filters.room_type) return false;
        }
        return true;
      }).map(function (rv) {
        var room = findRoom(rv.room_id);
        return Object.assign({}, rv, { room_label: room ? room.title + ' (' + room.room_number + ')' : '', room_type: room ? room.room_type : '' });
      });
      var sorters = {
        newest: function (a, b) { return b.created_at.localeCompare(a.created_at); },
        highest: function (a, b) { return b.rating - a.rating; },
        lowest: function (a, b) { return a.rating - b.rating; }
      };
      list.sort(sorters[filters.sort] || sorters.newest);
      return respond(list);
    },

    addReview: function (data) {
      var r = data.reservation_id ? findReservation(data.reservation_id) : null;
      if (r && state.reviews.some(function (rv) { return rv.reservation_id === r.reservation_id; })) {
        return fail('You have already reviewed this stay.', 'reservation_id');
      }
      var review = {
        review_id: nextId('reviews', 'review_id'),
        reservation_id: r ? r.reservation_id : null,
        user_id: data.user_id || null,
        room_id: r ? r.room_id : Number(data.room_id),
        guest_name: data.guest_name,
        rating: Number(data.rating),
        title: data.title,
        comment: data.comment,
        status: 'published',
        created_at: HRS.date.today()
      };
      state.reviews.push(review);
      persist('reviews');
      return respond(review);
    },

    setReviewStatus: function (id, status) {
      var review = state.reviews.filter(function (rv) { return String(rv.review_id) === String(id); })[0];
      if (!review) return fail('Review not found.');
      review.status = status;
      persist('reviews');
      return respond(review);
    },

    /* ---- Room service — staff/room_service.php ---- */

    getServiceRequests: function () {
      return respond(state.service_requests.slice().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); }));
    },

    saveServiceRequest: function (data) {
      var request = {
        request_id: nextId('service_requests', 'request_id'),
        room_number: data.room_number,
        guest_name: data.guest_name || '',
        request_type: data.request_type,
        details: data.details,
        priority: data.priority,
        status: 'open',
        assigned_to: data.assigned_to || '',
        created_at: nowIso()
      };
      state.service_requests.push(request);
      persist('service_requests');
      return respond(request);
    },

    updateServiceRequest: function (id, changes) {
      var request = state.service_requests.filter(function (s) { return String(s.request_id) === String(id); })[0];
      if (!request) return fail('Request not found.');
      Object.assign(request, changes);
      persist('service_requests');
      return respond(request);
    },

    /* ---- Complaints — staff/complaints.php ---- */

    getComplaints: function () {
      return respond(state.complaints.slice().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); }));
    },

    saveComplaint: function (data) {
      var complaint = {
        complaint_id: nextId('complaints', 'complaint_id'),
        booking_reference: (data.booking_reference || '').toUpperCase(),
        guest_name: data.guest_name,
        room_number: data.room_number || '',
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        status: 'open',
        resolution_notes: '',
        created_at: nowIso()
      };
      state.complaints.push(complaint);
      persist('complaints');
      return respond(complaint);
    },

    updateComplaint: function (id, changes) {
      var complaint = state.complaints.filter(function (c) { return String(c.complaint_id) === String(id); })[0];
      if (!complaint) return fail('Complaint not found.');
      Object.assign(complaint, changes);
      persist('complaints');
      return respond(complaint);
    },

    /* ---- Users — login.php / register.php (DEMO, no passwords stored) ---- */

    findUserByEmail: function (email) {
      var user = state.users.filter(function (u) { return u.email.toLowerCase() === String(email).toLowerCase(); })[0];
      return user ? respond(user) : fail('No demo account uses that email. Try a demo account below or register.', 'email');
    },

    createUser: function (data) {
      if (state.users.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
        return fail('An account with this email already exists.', 'email');
      }
      // The password is deliberately NOT stored: the prototype has no real auth.
      var user = {
        user_id: nextId('users', 'user_id'),
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: 'guest',
        created_at: HRS.date.today()
      };
      state.users.push(user);
      persist('users');
      return respond(user);
    },

    resetDemoData: function () { seed(); }
  };

  function updateRoomStatusSync(roomId, status) {
    var room = findRoom(roomId);
    if (room && room.status !== 'maintenance') { room.status = status; persist('rooms'); }
  }
})(window.HRS);
