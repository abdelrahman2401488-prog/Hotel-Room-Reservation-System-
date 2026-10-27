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
  // Bump when the seed data shape changes so browsers reseed (v2: photos, demo passwords)
  var VERSION = '2';
  var COLLECTIONS = ['users', 'rooms', 'room_types', 'pricing_rules', 'reservations', 'payments', 'reviews', 'service_requests', 'complaints'];
  var state = {};
  var LATENCY = 150; // ms, simulates a network round trip

  /* ------------------------------------------------------------------
     Storage (localStorage with in-memory fallback)
     ------------------------------------------------------------------ */

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }

  // Returns false when the browser refuses the write (quota exceeded or
  // storage disabled); the data then lives in memory for this page only.
  function persist(name) {
    try { localStorage.setItem(PREFIX + name, JSON.stringify(state[name])); return true; } catch (e) { return false; }
  }

  // Photos that did not fit in localStorage: kept in memory for this page view.
  var sessionImages = {};

  /* ------------------------------------------------------------------
     SHA-256 (pure JS so it also works on non-HTTPS hosts where
     crypto.subtle is unavailable). DEMO credential check only — real
     password hashing must happen server-side (password_hash in PHP).
     ------------------------------------------------------------------ */

  function sha256(message) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var bytes = Array.from(new TextEncoder().encode(message));
    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var s = 56; s >= 0; s -= 8) bytes.push(s >= 32 ? Math.floor(bitLength / Math.pow(2, s)) & 0xff : (bitLength >>> s) & 0xff);
    var rotr = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (var i = 0; i < bytes.length; i += 64) {
      var w = [];
      for (var t = 0; t < 64; t++) {
        if (t < 16) w[t] = (bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3];
        else {
          var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
          var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
        }
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0;
        var t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H = [H[0] + a, H[1] + b, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map(function (v) { return v | 0; });
    }
    return H.map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }

  function demoPasswordHash(email, password) {
    return sha256('hrs-demo:' + String(email).trim().toLowerCase() + ':' + password);
  }

  // Never expose password hashes to page code
  function publicUser(user) {
    var copy = clone(user);
    delete copy.password_hash;
    return copy;
  }

  function seed() {
    var mock = clone(HRS.mockData);
    COLLECTIONS.forEach(function (name) { state[name] = mock[name] || []; });
    // Reset demo data also restores default settings and an empty activity log
    state.settings = clone(HRS.mockData.settings);
    state.audit_log = [];

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
    persist('settings');
    persist('audit_log');
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
    else loadExtraStores();
  }

  function respond(value) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(clone(value)); }, LATENCY); });
  }

  function fail(message, field, extra) {
    var error = new Error(message);
    if (field) error.field = field;
    if (extra) Object.assign(error, extra);
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

  // Copy of a room with any session-only photo applied
  function withImage(room) {
    var copy = clone(room);
    if (sessionImages[room.room_id]) copy.image_url = sessionImages[room.room_id];
    return copy;
  }

  function findReservation(refOrId) {
    return state.reservations.filter(function (r) {
      return r.booking_reference === refOrId || String(r.reservation_id) === String(refOrId);
    })[0] || null;
  }

  function settings() { return state.settings; }

  /* ------------------------------------------------------------------
     Stores added after data version 2 (hotel settings, activity log) are
     kept under their own keys, so adding them does not reseed existing
     demo data. Missing keys fall back to defaults.
     ------------------------------------------------------------------ */

  var CURRENCIES = ['EGP', 'USD', 'EUR'];

  function readStore(name, fallback) {
    try {
      var raw = localStorage.getItem(PREFIX + name);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) { /* unreadable: use the fallback */ }
    return clone(fallback);
  }

  function loadExtraStores() {
    state.settings = Object.assign(clone(HRS.mockData.settings), readStore('settings', {}));
    if (CURRENCIES.indexOf(state.settings.currency) === -1) state.settings.currency = HRS.mockData.settings.currency;
    state.audit_log = readStore('audit_log', []);
    if (!Array.isArray(state.audit_log)) state.audit_log = [];
  }

  /* ------------------------------------------------------------------
     NFR-26 Activity log (DEMO). Records price, booking and payment
     actions with a timestamp, reference and short description. Never
     records passwords or card details. Logging must never break the
     action being logged, so every failure is swallowed.
     BACKEND INTEGRATION: write these rows in PHP (activity_log table) in
     the same transaction as the action itself.
     ------------------------------------------------------------------ */

  var AUDIT_MAX = 500;

  function logActivity(action, reference, description) {
    try {
      var user = HRS.session && HRS.session.current ? HRS.session.current() : null;
      var lastId = state.audit_log.reduce(function (max, e) { return Math.max(max, Number(e.log_id) || 0); }, 0);
      state.audit_log.unshift({
        log_id: lastId + 1,
        action: action,
        reference: reference === undefined || reference === null ? '' : String(reference),
        description: description,
        actor: user ? user.email : 'Signed-out visitor',
        actor_role: user ? user.role : 'public',
        created_at: new Date().toISOString()
      });
      if (state.audit_log.length > AUDIT_MAX) state.audit_log.length = AUDIT_MAX;
      if (!persist('audit_log')) {
        // Storage full: keep the newest entries only, in memory if necessary
        state.audit_log.length = Math.min(state.audit_log.length, 100);
        persist('audit_log');
      }
    } catch (e) { /* never block the logged action */ }
  }

  function money(amount) {
    return HRS.format && HRS.format.currency ? HRS.format.currency(amount) : String(amount);
  }

  /* ------------------------------------------------------------------
     NFR-23 / NFR-24 / NFR-11 constants (DEMO policy values)
     ------------------------------------------------------------------ */

  var BOOKING_RULES = { max_advance_days: 365, max_nights: 30 };
  var LOGIN_POLICY = { max_attempts: 5, lock_minutes: 5 };
  var memoryLoginGuard = { failures: 0, locked_until: 0 };

  function readLoginGuard() {
    var guard = readStore('login_guard', memoryLoginGuard);
    return { failures: Number(guard.failures) || 0, locked_until: Number(guard.locked_until) || 0 };
  }

  function writeLoginGuard(guard) {
    memoryLoginGuard = guard;
    try { localStorage.setItem(PREFIX + 'login_guard', JSON.stringify(guard)); } catch (e) { /* memory only */ }
  }

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

    rules: BOOKING_RULES,

    // NFR-24: check-in within the next 365 days, check-out after check-in,
    // at most 30 nights. Returns { field, message } or null. Used by the
    // date inputs (booking.js) AND by createReservation/updateReservation,
    // so bypassing the browser's min/max cannot create an invalid stay.
    // options.allowPastCheckIn: keep an existing booking's past check-in.
    // BACKEND INTEGRATION: PHP must apply the same rules.
    validateStay: function (checkIn, checkOut, options) {
      options = options || {};
      var today = HRS.date.today();
      var latestCheckIn = HRS.date.addDays(today, BOOKING_RULES.max_advance_days);
      if (!HRS.date.parse(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn)) return { field: 'check_in_date', message: 'Enter a valid check-in date.' };
      if (!HRS.date.parse(checkOut) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return { field: 'check_out_date', message: 'Enter a valid check-out date.' };
      if (!options.allowPastCheckIn && checkIn < today) return { field: 'check_in_date', message: 'Check-in cannot be in the past.' };
      if (checkIn > latestCheckIn) {
        return { field: 'check_in_date', message: 'Bookings can be made up to ' + BOOKING_RULES.max_advance_days + ' days in advance (latest check-in ' + HRS.format.date(latestCheckIn) + ').' };
      }
      if (checkOut <= checkIn) return { field: 'check_out_date', message: 'Check-out must be after check-in.' };
      if (HRS.date.diffDays(checkIn, checkOut) > BOOKING_RULES.max_nights) {
        return { field: 'check_out_date', message: 'Stays are limited to ' + BOOKING_RULES.max_nights + ' nights. Choose a check-out on or before ' + HRS.format.date(HRS.date.addDays(checkIn, BOOKING_RULES.max_nights)) + '.' };
      }
      return null;
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
    copy.room = room ? withImage(room) : null;
    copy.nights = HRS.date.diffDays(reservation.check_in_date, reservation.check_out_date);
    return copy;
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  load();

  HRS.pricing = pricing;

  // Live read-only view of the hotel settings for synchronous formatting
  // (currency in HRS.format.currency, check-in/out times in the UI).
  Object.defineProperty(HRS, 'settings', { configurable: true, get: function () { return clone(state.settings); } });

  HRS.data = {
    getSettings: function () { return respond(settings()); },

    // NFR-23: admin/manage_pricing.php "Hotel settings" form (DEMO, localStorage)
    // BACKEND INTEGRATION: POST to a PHP handler that validates and stores settings.
    saveSettings: function (data) {
      var time = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!time.test(data.check_in_time || '')) return fail('Enter a valid check-in time (HH:MM).', 'check_in_time');
      if (!time.test(data.check_out_time || '')) return fail('Enter a valid check-out time (HH:MM).', 'check_out_time');
      if (CURRENCIES.indexOf(data.currency) === -1) return fail('Choose one of: ' + CURRENCIES.join(', ') + '.', 'currency');
      var before = clone(state.settings);
      state.settings.check_in_time = data.check_in_time;
      state.settings.check_out_time = data.check_out_time;
      state.settings.currency = data.currency;
      if (!persist('settings')) {
        state.settings = before;
        return fail('Settings could not be saved because this browser\'s storage is unavailable or full.');
      }
      return respond(settings());
    },

    currencies: function () { return CURRENCIES.slice(); },

    // NFR-26: admin/activity_log.php. filters: category ('price' | 'booking' | 'payment')
    getActivityLog: function (filters) {
      filters = filters || {};
      return respond(state.audit_log.filter(function (e) {
        return !filters.category || e.action.split('.')[0] === filters.category;
      }));
    },

    // NFR-11: lockout state for the login page (DEMO)
    getLoginLock: function () {
      var guard = readLoginGuard();
      return respond({ locked: guard.locked_until > Date.now(), locked_until: guard.locked_until, failures: guard.failures, max_attempts: LOGIN_POLICY.max_attempts, lock_minutes: LOGIN_POLICY.lock_minutes });
    },

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
      return respond(list.map(withImage));
    },

    getRoom: function (id) {
      var room = findRoom(id);
      return room ? respond(withImage(room)) : fail('Room not found.');
    },

    // admin/add_room.php and admin/edit_room.php (POST)
    // data.image_url: existing path, a data: URL from the admin photo picker,
    // or '' to remove the photo.
    // BACKEND INTEGRATION: send the photo as multipart/form-data (room_image)
    // to the PHP handler, which validates it, stores it under assets/images/rooms
    // (or object storage) and saves the resulting path in rooms.image_url.
    saveRoom: function (data) {
      var duplicate = state.rooms.some(function (r) {
        return r.room_number === data.room_number && String(r.room_id) !== String(data.room_id || '');
      });
      if (duplicate) return fail('Room number ' + data.room_number + ' already exists.', 'room_number');
      var existing = data.room_id ? findRoom(data.room_id) : null;
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
        amenities: data.amenities || [],
        image_url: data.image_url !== undefined ? data.image_url : (existing ? existing.image_url : ''),
        image_alt: data.image_alt || (data.title + ' — ' + data.room_type + ' room ' + data.room_number),
        gallery: existing ? existing.gallery || [] : []
      };
      var index = state.rooms.findIndex(function (r) { return r.room_id === room.room_id; });
      if (index === -1) state.rooms.push(room); else state.rooms[index] = room;
      delete sessionImages[room.room_id];

      var warning = '';
      if (!persist('rooms') && /^data:/.test(room.image_url)) {
        // Quota exceeded: persist the room without its photo and keep the
        // photo in memory (overlaid by withImage) until the page is left.
        sessionImages[room.room_id] = room.image_url;
        room.image_url = '';
        warning = persist('rooms')
          ? 'The photo is too large for this browser\'s demo storage, so it is shown only until you leave this page.'
          : 'This browser\'s demo storage is full; changes are kept only until you leave this page.';
      }
      if (!existing) {
        logActivity('price.created', 'Room ' + room.room_number, 'Room ' + room.room_number + ' (' + room.title + ') added at ' + money(room.price_per_night) + ' per night.');
      } else if (Number(existing.price_per_night) !== room.price_per_night) {
        logActivity('price.updated', 'Room ' + room.room_number, 'Nightly price changed from ' + money(existing.price_per_night) + ' to ' + money(room.price_per_night) + '.');
      }
      return respond(Object.assign(withImage(room), { storage_warning: warning }));
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
      var previous = type.base_price;
      type.base_price = Number(basePrice);
      var updated = 0;
      if (applyToRooms) {
        state.rooms.forEach(function (room) {
          if (room.room_type === roomType) { room.price_per_night = type.base_price; updated++; }
        });
        persist('rooms');
      }
      persist('room_types');
      logActivity('price.updated', type.label + ' base rate', 'Base rate changed from ' + money(previous) + ' to ' + money(type.base_price) +
        (applyToRooms ? ' and applied to ' + HRS.format.plural(updated, 'room') : '') + '.');
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
      logActivity(index === -1 ? 'price.rule_created' : 'price.rule_updated', 'Rule ' + rule.rule_id,
        'Seasonal rule "' + rule.name + '": ' + (rule.adjustment_percent > 0 ? '+' : '') + rule.adjustment_percent + '% for ' +
        (rule.room_type === 'all' ? 'all room types' : rule.room_type + ' rooms') + ', ' + rule.start_date + ' to ' + rule.end_date +
        (rule.is_active ? '' : ' (inactive)') + '.');
      return respond(rule);
    },

    togglePricingRule: function (id) {
      var rule = state.pricing_rules.filter(function (r) { return String(r.rule_id) === String(id); })[0];
      if (!rule) return fail('Rule not found.');
      rule.is_active = !rule.is_active;
      persist('pricing_rules');
      logActivity('price.rule_updated', 'Rule ' + rule.rule_id, 'Seasonal rule "' + rule.name + '" ' + (rule.is_active ? 'activated' : 'paused') + '.');
      return respond(rule);
    },

    deletePricingRule: function (id) {
      var removed = state.pricing_rules.filter(function (r) { return String(r.rule_id) === String(id); })[0];
      state.pricing_rules = state.pricing_rules.filter(function (r) { return String(r.rule_id) !== String(id); });
      persist('pricing_rules');
      if (removed) logActivity('price.rule_deleted', 'Rule ' + removed.rule_id, 'Seasonal rule "' + removed.name + '" deleted.');
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
      var stayError = pricing.validateStay(data.check_in_date, data.check_out_date);
      if (stayError) return fail(stayError.message, stayError.field);
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
      logActivity('booking.created', reservation.booking_reference, 'Booking for room ' + room.room_number + ', ' +
        reservation.check_in_date + ' to ' + reservation.check_out_date + ', ' + HRS.format.plural(reservation.num_guests, 'guest') +
        ', total ' + money(reservation.total_price) + ' (pending payment).');
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
      // Same NFR-24 rules; an unchanged past check-in (booking in progress) stays allowed
      var stayError = pricing.validateStay(next.check_in_date, next.check_out_date, { allowPastCheckIn: next.check_in_date === r.check_in_date });
      if (stayError) return fail(stayError.message, stayError.field);
      if (!isAvailable(room.room_id, next.check_in_date, next.check_out_date, r.reservation_id)) {
        return fail('Room ' + room.room_number + ' is not available for the new dates.', 'check_in_date');
      }
      if (Number(next.num_guests) > room.capacity) return fail('This room sleeps up to ' + room.capacity + '.', 'num_guests');
      next.room_id = room.room_id;
      next.num_guests = Number(next.num_guests);
      next.total_price = pricing.quote(room, next.check_in_date, next.check_out_date).total;
      next.updated_at = nowIso();
      var previousTotal = r.total_price;
      Object.assign(r, next);
      persist('reservations');
      logActivity('booking.modified', r.booking_reference, 'Changed to room ' + room.room_number + ', ' + r.check_in_date + ' to ' + r.check_out_date +
        ', ' + HRS.format.plural(r.num_guests, 'guest') + '; total ' + money(previousTotal) + ' → ' + money(r.total_price) + '.');
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
      logActivity('booking.cancelled', r.booking_reference, 'Booking cancelled' + (reason ? ' (' + reason + ')' : '') +
        '; cancellation fee ' + money(terms.cancellation_fee) + '.');
      if (terms.paid) logActivity('payment.refunded', r.booking_reference, 'Payment status paid → refunded; refund ' + money(terms.refund_amount) + ' (demo, no money moved).');
      return respond(Object.assign(withRoom(r), { refund: terms }));
    },

    // staff/checkin_checkout.php, reservations/manage_bookings.php
    setReservationStatus: function (refOrId, status, extra) {
      var r = findReservation(refOrId);
      if (!r) return fail('Booking not found.');
      var previousStatus = r.status;
      var previousPayment = r.payment_status;
      r.status = status;
      if (extra) Object.assign(r, extra);
      if (status === 'checked-in') { r.checked_in_at = nowIso(); updateRoomStatusSync(r.room_id, 'occupied'); }
      if (status === 'checked-out') { r.checked_out_at = nowIso(); updateRoomStatusSync(r.room_id, 'available'); }
      persist('reservations');
      if (previousStatus !== status) {
        logActivity(status === 'confirmed' ? 'booking.confirmed' : 'booking.status_changed', r.booking_reference,
          'Booking status ' + previousStatus + ' → ' + status + '.');
      }
      if (previousPayment !== r.payment_status) {
        logActivity('payment.status_changed', r.booking_reference, 'Payment status ' + previousPayment + ' → ' + r.payment_status + ' (recorded by staff).');
      }
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
    // Activity log: one "attempted" entry, then the real outcome. Only the
    // payment method is logged — never card numbers, CVC or last digits.
    recordPayment: function (refOrId, details) {
      var r = findReservation(refOrId);
      var method = { card: 'card', wallet: 'digital wallet', pay_at_hotel: 'pay at hotel' }[details.payment_method] || 'unknown method';
      logActivity('payment.attempted', r ? r.booking_reference : refOrId, 'Payment attempt via ' + method + (r ? ' for ' + money(r.total_price) : '') + '.');
      var reason = !r ? 'Booking not found.' : r.payment_status === 'paid' ? 'This booking is already paid.' : r.status === 'cancelled' ? 'Cancelled bookings cannot be paid.' : '';
      if (reason) {
        logActivity('payment.failed', r ? r.booking_reference : refOrId, 'Payment rejected: ' + reason);
        return fail(reason);
      }
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
      var previousStatus = r.status;
      if (payment.status === 'paid') r.payment_status = 'paid';
      if (r.status === 'pending') r.status = 'confirmed';
      persist('payments');
      persist('reservations');
      if (payment.status === 'paid') {
        logActivity('payment.succeeded', r.booking_reference, 'Simulated demo payment of ' + money(payment.amount) + ' via ' + method + ' recorded as paid (no money charged); payment status pending → paid.');
      } else {
        logActivity('payment.pending', r.booking_reference, 'Pay at hotel selected; payment status remains pending.');
      }
      if (previousStatus !== r.status) logActivity('booking.confirmed', r.booking_reference, 'Booking status ' + previousStatus + ' → ' + r.status + ' after payment step.');
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

    /* ---- Users — login.php / register.php (DEMO credentials only) ---- */

    // BACKEND INTEGRATION: POST email + password to login.php; PHP verifies
    // with password_verify(), starts the session and returns the user/role.
    // NFR-11 (DEMO): after 5 consecutive failed sign-ins in this browser,
    // sign-in is locked for 5 minutes. Stored in localStorage, so it is a
    // demonstration only — real lockout/rate limiting must be server-side.
    authenticate: function (email, password) {
      var now = Date.now();
      var guard = readLoginGuard();
      if (guard.locked_until > now) {
        var minutes = Math.ceil((guard.locked_until - now) / 60000);
        return fail('Too many failed sign-in attempts. Demo sign-in is locked — try again in ' + HRS.format.plural(minutes, 'minute') + '.', 'password', { locked: true, locked_until: guard.locked_until });
      }
      if (guard.locked_until) guard = { failures: 0, locked_until: 0 }; // lock expired
      var user = state.users.filter(function (u) { return u.email.toLowerCase() === String(email).trim().toLowerCase(); })[0];
      // Same message for unknown email and wrong password (no account enumeration)
      if (!user || !user.password_hash || user.password_hash !== demoPasswordHash(email, password)) {
        guard.failures += 1;
        if (guard.failures >= LOGIN_POLICY.max_attempts) {
          var until = now + LOGIN_POLICY.lock_minutes * 60000;
          writeLoginGuard({ failures: 0, locked_until: until });
          return fail('Too many failed sign-in attempts. Demo sign-in is locked for ' + LOGIN_POLICY.lock_minutes + ' minutes.', 'password', { locked: true, locked_until: until });
        }
        writeLoginGuard(guard);
        var left = LOGIN_POLICY.max_attempts - guard.failures;
        return fail('Incorrect email or password. ' + HRS.format.plural(left, 'attempt') + ' left before sign-in is locked for ' + LOGIN_POLICY.lock_minutes + ' minutes.', 'password');
      }
      writeLoginGuard({ failures: 0, locked_until: 0 }); // success resets the counter
      return respond(publicUser(user));
    },

    // Used to validate the stored demo session on every page load
    getUser: function (userId) {
      var user = state.users.filter(function (u) { return String(u.user_id) === String(userId); })[0];
      return user ? respond(publicUser(user)) : fail('User not found.');
    },

    createUser: function (data) {
      if (state.users.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
        return fail('An account with this email already exists.', 'email');
      }
      var user = {
        user_id: nextId('users', 'user_id'),
        full_name: data.full_name,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        role: 'guest',
        created_at: HRS.date.today(),
        // DEMO: salted SHA-256 in localStorage is NOT secure storage
        password_hash: demoPasswordHash(data.email, data.password)
      };
      state.users.push(user);
      persist('users');
      return respond(publicUser(user));
    },

    resetDemoData: function () { seed(); }
  };

  function updateRoomStatusSync(roomId, status) {
    var room = findRoom(roomId);
    if (room && room.status !== 'maintenance') { room.status = status; persist('rooms'); }
  }
})(window.HRS);
