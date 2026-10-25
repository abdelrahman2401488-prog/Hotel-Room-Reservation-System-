/**
 * main.js — shared frontend core for every page.
 *
 *   HRS.dom      DOM helpers and the escaping `html` template tag
 *   HRS.date     YYYY-MM-DD date helpers (local time, no time zones)
 *   HRS.format   currency / date / label formatting
 *   HRS.url      query-string and link helpers
 *   HRS.ui       toasts, modals, confirm dialog, tabs, loading buttons
 *   HRS.views    reusable markup renderers (status badge, room card, ...)
 *   HRS.session  DEMO sign-in state (localStorage) — NOT authentication
 *   HRS.pages    page modules registered by the page scripts; the one
 *                matching <body data-page="..."> runs on DOMContentLoaded.
 *
 * Load order (see includes/footer.php): main.js, validation.js,
 * mock-data.js, data-service.js, then page scripts.
 */
window.HRS = window.HRS || {};

(function (HRS) {
  'use strict';

  HRS.pages = HRS.pages || {};
  HRS.config = {
    baseUrl: document.body.dataset.baseUrl || '',
    pageId: document.body.dataset.page || '',
    // Roles allowed on this page ("" = public), from $pageRoles in PHP
    pageRoles: (document.body.dataset.roles || '').split(',').map(function (r) { return r.trim(); }).filter(Boolean),
    hotelName: 'The Developers Hotel',
    currency: 'USD',
    locale: 'en-US'
  };

  /* ------------------------------------------------------------------
     DOM helpers
     ------------------------------------------------------------------ */

  function SafeHtml(value) { this.value = value; }
  SafeHtml.prototype.toString = function () { return this.value; };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toHtml(value) {
    if (value === null || value === undefined || value === false) return '';
    if (Array.isArray(value)) return value.map(toHtml).join('');
    if (value instanceof SafeHtml) return value.value;
    return escapeHtml(value);
  }

  // Tagged template: interpolated values are escaped unless they are the
  // result of another html`` call. Arrays are joined.
  function html(strings) {
    var values = Array.prototype.slice.call(arguments, 1);
    var out = '';
    for (var i = 0; i < strings.length; i++) {
      out += strings[i];
      if (i < values.length) out += toHtml(values[i]);
    }
    return new SafeHtml(out);
  }

  HRS.dom = {
    qs: function (selector, root) { return (root || document).querySelector(selector); },
    qsa: function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); },
    escape: escapeHtml,
    html: html,
    raw: function (value) { return new SafeHtml(String(value)); },
    render: function (target, markup) {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.innerHTML = toHtml(markup);
      return el;
    },
    // Delegated event listener: on(container, 'click', '[data-action]', fn)
    on: function (root, type, selector, handler) {
      root.addEventListener(type, function (event) {
        var match = event.target.closest(selector);
        if (match && root.contains(match)) handler(event, match);
      });
    },
    fillSelect: function (select, options, selected) {
      select.innerHTML = toHtml(options.map(function (opt) {
        return html`<option value="${opt.value}"${opt.value === selected ? HRS.dom.raw(' selected') : ''}>${opt.label}</option>`;
      }));
    }
  };

  /* ------------------------------------------------------------------
     Dates (ISO YYYY-MM-DD strings, interpreted as local dates)
     ------------------------------------------------------------------ */

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  HRS.date = {
    toISO: function (date) {
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    },
    parse: function (iso) {
      if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
      var parts = iso.slice(0, 10).split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    },
    today: function () { return HRS.date.toISO(new Date()); },
    addDays: function (iso, days) {
      var d = HRS.date.parse(iso);
      d.setDate(d.getDate() + days);
      return HRS.date.toISO(d);
    },
    diffDays: function (fromIso, toIso) {
      var a = HRS.date.parse(fromIso);
      var b = HRS.date.parse(toIso);
      if (!a || !b) return 0;
      return Math.round((b - a) / 86400000);
    },
    // Each night of a stay: [checkIn, checkOut)
    eachNight: function (checkIn, checkOut) {
      var nights = [];
      for (var d = checkIn; d < checkOut; d = HRS.date.addDays(d, 1)) nights.push(d);
      return nights;
    },
    overlaps: function (startA, endA, startB, endB) {
      return startA < endB && startB < endA;
    },
    monthKey: function (iso) { return iso.slice(0, 7); }
  };

  /* ------------------------------------------------------------------
     Formatting
     ------------------------------------------------------------------ */

  // Whole amounts show no cents ($340); anything else shows exactly two ($995.90)
  var wholeFormatter = new Intl.NumberFormat(HRS.config.locale, {
    style: 'currency', currency: HRS.config.currency, maximumFractionDigits: 0, minimumFractionDigits: 0
  });
  var centsFormatter = new Intl.NumberFormat(HRS.config.locale, {
    style: 'currency', currency: HRS.config.currency, maximumFractionDigits: 2, minimumFractionDigits: 2
  });

  HRS.format = {
    currency: function (amount) {
      var value = Math.round((Number(amount) || 0) * 100) / 100;
      return (Number.isInteger(value) ? wholeFormatter : centsFormatter).format(value);
    },
    number: function (n) { return new Intl.NumberFormat(HRS.config.locale).format(Number(n) || 0); },
    percent: function (ratio) { return Math.round((Number(ratio) || 0) * 100) + '%'; },
    date: function (iso, options) {
      var d = HRS.date.parse(iso);
      if (!d) return '—';
      return d.toLocaleDateString(HRS.config.locale, options || { day: 'numeric', month: 'short', year: 'numeric' });
    },
    dateShort: function (iso) {
      return HRS.format.date(iso, { day: 'numeric', month: 'short' });
    },
    dateTime: function (isoDateTime) {
      var d = new Date(isoDateTime);
      if (isNaN(d)) return '—';
      return d.toLocaleString(HRS.config.locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    monthLabel: function (monthKey) {
      var d = HRS.date.parse(monthKey + '-01');
      return d ? d.toLocaleDateString(HRS.config.locale, { month: 'short', year: 'numeric' }) : monthKey;
    },
    // 'checked-in' -> 'Checked in'
    label: function (value) {
      if (!value) return '';
      var text = String(value).replace(/[-_]/g, ' ');
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    initials: function (name) {
      return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2)
        .map(function (part) { return part.charAt(0).toUpperCase(); }).join('');
    },
    plural: function (count, word) { return count + ' ' + word + (count === 1 ? '' : 's'); }
  };

  /* ------------------------------------------------------------------
     URLs
     ------------------------------------------------------------------ */

  HRS.url = {
    param: function (name) { return new URLSearchParams(window.location.search).get(name); },
    // Current page path relative to the project root, e.g. "guest/book_room.php"
    current: function () {
      var depth = (HRS.config.baseUrl.match(/\.\.\//g) || []).length;
      return window.location.pathname.split('/').slice(-(depth + 1)).join('/');
    },
    // Only relative in-project page paths (optionally with a query) are safe redirect targets
    isSafeRedirect: function (target) {
      return typeof target === 'string' && /^(?:[a-z_]+\/)?[a-z_]+\.php(?:\?[\w=&%.+-]*)?$/.test(target);
    },
    // HRS.url.to('guest/book_room.php', { room_id: 3 })
    to: function (path, params) {
      var query = '';
      if (params) {
        var search = new URLSearchParams();
        Object.keys(params).forEach(function (key) {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') search.set(key, params[key]);
        });
        query = search.toString() ? '?' + search.toString() : '';
      }
      return HRS.config.baseUrl + path + query;
    },
    go: function (path, params) { window.location.href = HRS.url.to(path, params); }
  };

  /* ------------------------------------------------------------------
     UI: toasts, modals, confirm, tabs, buttons
     ------------------------------------------------------------------ */

  var lastFocused = null;

  function toastContainer() {
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
    }
    return container;
  }

  function focusables(root) {
    return HRS.dom.qsa('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  HRS.ui = {
    // type: success | error | warning | info
    toast: function (message, options) {
      options = options || {};
      var type = options.type || 'info';
      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
      toast.innerHTML = toHtml(html`
        <div class="flex-1">
          ${options.title ? html`<div class="toast-title">${options.title}</div>` : ''}
          <div class="toast-message">${message}</div>
        </div>
        <button class="alert-close" type="button" aria-label="Dismiss notification">&times;</button>`);
      var remove = function () {
        toast.classList.add('is-leaving');
        setTimeout(function () { toast.remove(); }, 250);
      };
      toast.querySelector('.alert-close').addEventListener('click', remove);
      toastContainer().appendChild(toast);
      setTimeout(remove, options.timeout || 4500);
      return toast;
    },

    // Toast shown on the NEXT page load (after a redirect)
    flash: function (message, options) {
      try { sessionStorage.setItem('hrs_flash', JSON.stringify({ message: message, options: options || {} })); } catch (e) { /* ignore */ }
    },

    showFlash: function () {
      try {
        var raw = sessionStorage.getItem('hrs_flash');
        if (!raw) return;
        sessionStorage.removeItem('hrs_flash');
        var flash = JSON.parse(raw);
        HRS.ui.toast(flash.message, flash.options);
      } catch (e) { /* ignore */ }
    },

    openModal: function (overlay) {
      if (typeof overlay === 'string') overlay = document.querySelector(overlay);
      if (!overlay) return;
      lastFocused = document.activeElement;
      overlay.hidden = false;
      overlay.classList.add('is-open');
      document.body.classList.add('modal-open');
      var first = focusables(overlay)[0];
      if (first) first.focus();
    },

    closeModal: function (overlay) {
      if (typeof overlay === 'string') overlay = document.querySelector(overlay);
      if (!overlay) return;
      overlay.classList.remove('is-open');
      overlay.hidden = true;
      if (!document.querySelector('.modal-overlay.is-open')) document.body.classList.remove('modal-open');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      overlay.dispatchEvent(new CustomEvent('modal:close'));
    },

    // Promise<boolean>. variant: primary | danger | success
    confirm: function (options) {
      options = options || {};
      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.hidden = true;
        overlay.innerHTML = toHtml(html`
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div class="modal-header">
              <h2 class="modal-title" id="confirm-title">${options.title || 'Are you sure?'}</h2>
              <button class="modal-close" type="button" data-answer="no" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body">
              <p>${options.message || ''}</p>
              ${options.details ? html`<div class="mt-4">${options.details}</div>` : ''}
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" type="button" data-answer="no">${options.cancelText || 'Cancel'}</button>
              <button class="btn btn-${options.variant || 'primary'}" type="button" data-answer="yes">${options.confirmText || 'Confirm'}</button>
            </div>
          </div>`);
        document.body.appendChild(overlay);
        var done = function (answer) {
          HRS.ui.closeModal(overlay);
          overlay.remove();
          resolve(answer);
        };
        overlay.addEventListener('click', function (event) {
          var btn = event.target.closest('[data-answer]');
          if (btn) done(btn.dataset.answer === 'yes');
          else if (event.target === overlay) done(false);
        });
        overlay.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') { event.stopPropagation(); done(false); }
        });
        HRS.ui.openModal(overlay);
        overlay.querySelector('[data-answer="yes"]').focus();
      });
    },

    // Toggle a submit button into a loading state
    setLoading: function (button, loading, text) {
      if (!button) return;
      if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = toHtml(html`<span class="spinner" aria-hidden="true"></span> ${text || 'Working…'}`);
      } else {
        button.disabled = false;
        if (button.dataset.originalText) button.innerHTML = button.dataset.originalText;
      }
    },

    // Wire a .tabs container: buttons with data-tab="panelId"
    tabs: function (tablist, onChange) {
      if (!tablist) return;
      var tabs = HRS.dom.qsa('[role="tab"]', tablist);
      var activate = function (tab) {
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          t.tabIndex = active ? 0 : -1;
          var panel = t.dataset.tab && document.getElementById(t.dataset.tab);
          if (panel) panel.hidden = !active;
        });
        if (onChange) onChange(tab.dataset.value || tab.dataset.tab, tab);
      };
      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { activate(tab); });
        tab.addEventListener('keydown', function (event) {
          var dir = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          var next = tabs[(index + dir + tabs.length) % tabs.length];
          next.focus();
          activate(next);
        });
      });
      var initial = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (initial) activate(initial);
      return { activate: activate };
    },

    // Replace a container with an empty / not-found state
    emptyState: function (target, options) {
      HRS.dom.render(target, html`
        <div class="empty-state">
          <h2 class="text-2xl">${options.title}</h2>
          <p>${options.message || ''}</p>
          ${options.href ? html`<a class="btn btn-primary mt-4" href="${options.href}">${options.action}</a>` : ''}
        </div>`);
    },

    // Fill [data-field="name"] elements inside root from an object
    fillFields: function (root, data) {
      HRS.dom.qsa('[data-field]', root).forEach(function (el) {
        var key = el.dataset.field;
        if (Object.prototype.hasOwnProperty.call(data, key)) el.textContent = data[key];
      });
    },

    // Download text as a file (CSV export)
    download: function (filename, text, mime) {
      var blob = new Blob([text], { type: mime || 'text/csv;charset=utf-8' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 0);
    }
  };

  /* ------------------------------------------------------------------
     Reusable views
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     Media: room photo paths + broken-image fallback
     ------------------------------------------------------------------ */

  HRS.media = {
    // image_url values are project-root relative paths, data:/blob: URLs
    // (admin uploads in the demo) or absolute URLs (future CDN/backend).
    url: function (path) {
      if (!path) return '';
      return /^(data:|blob:|https?:)/.test(path) ? path : HRS.config.baseUrl + path;
    },
    alt: function (room) {
      return room.image_alt || (room.title + ' — ' + HRS.format.label(room.room_type) + ' room ' + room.room_number);
    }
  };

  // A photo that fails to load is hidden so the styled .room-media
  // placeholder (gradient + label) shows instead of a broken image icon.
  document.addEventListener('error', function (event) {
    var img = event.target;
    if (img && img.tagName === 'IMG' && img.classList.contains('room-photo')) {
      img.hidden = true;
      var media = img.closest('.room-media');
      if (media) media.classList.add('is-fallback');
    }
  }, true);

  HRS.views = {
    // A single room photo inside the gradient placeholder frame
    photo: function (url, alt, extraClass, label) {
      return html`<div class="room-media ${extraClass || ''}">
          ${url ? html`<img class="room-photo" src="${HRS.media.url(url)}" alt="${alt}" loading="lazy" decoding="async" width="1280" height="800">` : ''}
          ${label ? html`<span class="room-media-label">${label}</span>` : ''}
        </div>`;
    },

    statusBadge: function (status) {
      return html`<span class="badge status-${status}">${HRS.format.label(status)}</span>`;
    },

    priorityBadge: function (priority) {
      var map = { high: 'badge-error', medium: 'badge-warning', low: 'badge-info' };
      return html`<span class="badge ${map[priority] || ''}">${HRS.format.label(priority)}</span>`;
    },

    stars: function (rating) {
      var value = Math.round(Number(rating) || 0);
      return html`<span class="rating" role="img" aria-label="${value} out of 5 stars">${'★★★★★'.slice(0, value)}${'☆☆☆☆☆'.slice(0, 5 - value)}</span>`;
    },

    // Room photo with type label; falls back to the gradient for rooms
    // without a photo. options: label (string | false), badge, eager
    roomMedia: function (room, extraClass, options) {
      options = options || {};
      var label = options.label === undefined ? HRS.format.label(room.room_type) + ' · Room ' + room.room_number : options.label;
      return html`<div class="room-media room-media-${room.room_type} ${extraClass || ''}">
          ${room.image_url ? html`<img class="room-photo" src="${HRS.media.url(room.image_url)}" alt="${HRS.media.alt(room)}" loading="${options.eager ? 'eager' : 'lazy'}" decoding="async" width="1280" height="800">` : ''}
          ${label ? html`<span class="room-media-label">${label}</span>` : ''}
          ${options.badge || ''}
        </div>`;
    },

    roomCard: function (room, options) {
      options = options || {};
      var href = HRS.url.to('guest/rooms_details.php', Object.assign({ id: room.room_id }, options.params || {}));
      var amenities = (room.amenities || []).slice(0, 4);
      return html`
        <article class="card card-hover room-card">
          ${HRS.views.roomMedia(room, '', { label: HRS.format.label(room.room_type), badge: options.badge })}
          <div class="card-body">
            <h3 class="card-title">${room.title}</h3>
            <ul class="room-meta">
              <li>Room ${room.room_number}</li>
              <li>Up to ${HRS.format.plural(room.capacity, 'guest')}</li>
              <li>${room.size_sqm} m²</li>
              <li>${room.bed_type}</li>
            </ul>
            <ul class="chip-list">${amenities.map(function (a) { return html`<li class="chip">${a}</li>`; })}</ul>
          </div>
          <div class="card-footer flex items-center justify-between gap-3">
            <span><span class="price">${HRS.format.currency(room.price_per_night)}</span> <span class="price-unit">/ night</span></span>
            <a class="btn btn-primary btn-sm" href="${href}">${options.cta || 'View room'}</a>
          </div>
        </article>`;
    },

    reviewCard: function (review) {
      return html`
        <article class="card review-card">
          <div class="card-body">
            <div class="review-header">
              <span class="avatar" aria-hidden="true">${HRS.format.initials(review.guest_name)}</span>
              <div class="flex-1">
                <div class="font-semibold">${review.guest_name}</div>
                <div class="text-xs text-muted">${HRS.format.date(review.created_at)}${review.room_label ? ' · ' + review.room_label : ''}</div>
              </div>
              ${HRS.views.stars(review.rating)}
            </div>
            <h3 class="text-lg mb-0">${review.title}</h3>
            <p class="card-text">${review.comment}</p>
          </div>
        </article>`;
    },

    summaryList: function (quote) {
      if (!quote || !quote.nights) {
        return html`<p class="text-sm text-muted">Select valid dates to see the price.</p>`;
      }
      return html`
        <ul class="summary-list">
          <li><span>${HRS.format.currency(quote.average_rate)} × ${HRS.format.plural(quote.nights, 'night')}</span><span>${HRS.format.currency(quote.subtotal)}</span></li>
          ${quote.adjustments ? html`<li><span>Seasonal pricing</span><span class="${quote.adjustments < 0 ? 'text-success' : ''}">${quote.adjustments > 0 ? '+' : ''}${HRS.format.currency(quote.adjustments)}</span></li>` : ''}
          <li><span>Service charge (${HRS.format.percent(quote.service_rate)})</span><span>${HRS.format.currency(quote.service_fee)}</span></li>
          <li><span>VAT (${HRS.format.percent(quote.tax_rate)})</span><span>${HRS.format.currency(quote.tax)}</span></li>
          <li class="summary-total"><span>Total</span><span>${HRS.format.currency(quote.total)}</span></li>
        </ul>`;
    },

    detailList: function (rows) {
      return html`<dl class="detail-list">${rows.map(function (row) {
        return html`<dt>${row[0]}</dt><dd>${row[1]}</dd>`;
      })}</dl>`;
    },

    // rows: [{ label, value, display }]
    barChart: function (rows, variant) {
      var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
      return html`<ul class="bar-chart">${rows.map(function (row) {
        return html`<li class="bar-row" title="${row.label}: ${row.display || row.value}">
            <span class="truncate">${row.label}</span>
            <progress class="bar ${variant ? 'bar-' + variant : ''}" max="${max}" value="${row.value}" aria-label="${row.label}: ${row.display || row.value}"></progress>
            <span class="bar-value">${row.display || row.value}</span>
          </li>`;
      })}</ul>`;
    }
  };

  /* ------------------------------------------------------------------
     DEMO session — stores the "signed-in" user in localStorage.
     This is NOT authentication: anyone can edit localStorage.
     BACKEND INTEGRATION: replace with the PHP session (includes/auth.php)
     and read the current user from markup rendered by the server.
     ------------------------------------------------------------------ */

  var SESSION_KEY = 'hrs_demo_session';
  var ROLES = ['guest', 'staff', 'admin'];

  function isValidSession(s) {
    return !!s && typeof s === 'object' && typeof s.user_id === 'number' && ROLES.indexOf(s.role) !== -1 &&
      typeof s.email === 'string' && typeof s.full_name === 'string';
  }

  HRS.session = {
    // Returns the demo session, or null. Malformed entries are discarded.
    current: function () {
      var session = null;
      try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { session = false; } // unreadable entry
      if (session !== null && !isValidSession(session)) {
        HRS.session.signOut();
        return null;
      }
      return session;
    },
    // Checks the stored session still matches a demo account (e.g. after
    // "Reset demo data" or manual edits). Resolves to the session or null.
    verify: function () {
      var session = HRS.session.current();
      if (!session) return Promise.resolve(null);
      var invalid = function () {
        HRS.session.signOut();
        HRS.ui.toast('Your demo sign-in was no longer valid and has been cleared.', { type: 'warning' });
        return null;
      };
      return HRS.data.getUser(session.user_id).then(function (user) {
        return user.email === session.email && user.role === session.role ? session : invalid();
      }, invalid);
    },
    signIn: function (user) {
      var session = { user_id: user.user_id, full_name: user.full_name, email: user.email, phone: user.phone || '', role: user.role };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) { /* ignore */ }
      return session;
    },
    signOut: function () {
      try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    },
    hasRole: function (roles) {
      var user = HRS.session.current();
      return !!user && roles.indexOf(user.role) !== -1;
    },
    // Landing page per role: admin and staff have separate dashboards
    homeFor: function (role) {
      return { admin: 'admin/dashboard.php', staff: 'staff/dashboard.php', guest: 'guest/my_bookings.php' }[role] || 'index.php';
    },
    // Guests may only open their own bookings; staff/admin may open any
    canAccessReservation: function (reservation) {
      var user = HRS.session.current();
      if (!user || !reservation) return false;
      if (user.role !== 'guest') return true;
      return String(reservation.user_id) === String(user.user_id) ||
        String(reservation.guest_email).toLowerCase() === user.email.toLowerCase();
    },
    // Renders a "not your booking" state into region and returns true when
    // the current user may not open this reservation.
    // BACKEND INTEGRATION: PHP must check ownership (WHERE user_id = session user).
    denyReservation: function (reservation, region) {
      if (HRS.session.canAccessReservation(reservation)) return false;
      HRS.ui.emptyState(region, {
        title: 'This booking belongs to another guest',
        message: 'Guests can only view and manage their own bookings.',
        href: HRS.url.to('guest/my_bookings.php'), action: 'Go to my bookings'
      });
      return true;
    }
  };

  /* ------------------------------------------------------------------
     Role-based navigation and page guard (DEMO).
     Elements with data-nav="public guest staff admin" are shown only to
     those audiences ("public" = signed out). Pages declare allowed roles
     with $pageRoles; other visitors are redirected.
     BACKEND INTEGRATION: PHP must enforce the same rules server-side
     (session role check before rendering, 302 to login / dashboard).
     A frontend guard is not security — anyone can edit localStorage.
     ------------------------------------------------------------------ */

  function applyRoleNav(user) {
    var audience = user ? user.role : 'public';
    HRS.dom.qsa('[data-nav]').forEach(function (el) {
      el.hidden = el.dataset.nav.split(/\s+/).indexOf(audience) === -1;
    });
    HRS.dom.qsa('[data-user-name]').forEach(function (el) { el.textContent = user ? user.full_name : ''; });
    HRS.dom.qsa('[data-user-initials]').forEach(function (el) { el.textContent = user ? HRS.format.initials(user.full_name) : ''; });
    HRS.dom.qsa('[data-user-role]').forEach(function (el) { el.textContent = user ? HRS.format.label(user.role) + ' (demo)' : ''; });
  }

  // Returns the redirect target for a visitor who may not view this page, or null
  function guardTarget(user) {
    var roles = HRS.config.pageRoles;
    if (!roles.length) return null;
    if (!user) return { path: 'login.php', params: { redirect: HRS.url.current() + window.location.search }, message: 'Please sign in with a demo account to continue.', type: 'info' };
    if (roles.indexOf(user.role) === -1) {
      return { path: HRS.session.homeFor(user.role), message: 'That page is not available to ' + user.role + ' accounts, so you were taken to your dashboard.', type: 'warning' };
    }
    return null;
  }

  function redirectTo(target) {
    document.body.classList.add('is-redirecting');
    HRS.ui.flash(target.message, { type: target.type });
    window.location.replace(HRS.url.to(target.path, target.params));
  }

  HRS.ui.applyRoleNav = applyRoleNav;

  /* ------------------------------------------------------------------
     Page chrome
     ------------------------------------------------------------------ */

  function initNavbar() {
    var toggle = document.querySelector('.navbar-toggle');
    var menu = document.getElementById('navbar-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Highlight links that point at the current page
    var current = window.location.pathname.split('/').slice(-2).join('/');
    HRS.dom.qsa('.navbar-link, .sidebar-link').forEach(function (link) {
      var target = new URL(link.href, window.location.href).pathname.split('/').slice(-2).join('/');
      if (target === current) link.setAttribute('aria-current', 'page');
    });
  }

  function initGlobalHandlers() {
    // Open / close page-defined modals
    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-modal-open]');
      if (opener) { event.preventDefault(); HRS.ui.openModal(opener.dataset.modalOpen); return; }
      var closer = event.target.closest('[data-modal-close]');
      if (closer) { HRS.ui.closeModal(closer.closest('.modal-overlay')); return; }
      if (event.target.classList && event.target.classList.contains('modal-overlay') && event.target.dataset.static === undefined) {
        HRS.ui.closeModal(event.target);
      }
      var alertClose = event.target.closest('.alert > .alert-close');
      if (alertClose) alertClose.parentElement.remove();
    });

    document.addEventListener('keydown', function (event) {
      var open = HRS.dom.qsa('.modal-overlay.is-open').pop();
      if (!open) return;
      if (event.key === 'Escape') { HRS.ui.closeModal(open); return; }
      if (event.key === 'Tab') {
        var items = focusables(open);
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    var reset = document.querySelector('[data-action="reset-demo"]');
    if (reset) {
      reset.addEventListener('click', function () {
        HRS.ui.confirm({
          title: 'Reset demo data?',
          message: 'This restores the original sample rooms, bookings, reviews and requests, and signs you out of the demo session. It only affects this browser.',
          confirmText: 'Reset data',
          variant: 'danger'
        }).then(function (yes) {
          if (!yes) return;
          HRS.data.resetDemoData();
          HRS.session.signOut();
          HRS.ui.flash('Demo data restored to the original sample set.', { type: 'success' });
          window.location.reload();
        });
      });
    }
  }

  // Synchronous first pass with the stored session (before paint), so the
  // right navigation shows immediately and restricted content is hidden.
  var storedUser = HRS.session.current();
  applyRoleNav(storedUser);
  if (guardTarget(storedUser)) document.body.classList.add('is-redirecting');

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initGlobalHandlers();
    HRS.session.verify().then(function (user) {
      applyRoleNav(user);
      var target = guardTarget(user);
      if (target) { redirectTo(target); return; }
      document.body.classList.remove('is-redirecting');
      HRS.ui.showFlash();
      var page = HRS.pages[HRS.config.pageId];
      if (typeof page !== 'function') return;
      return Promise.resolve().then(page);
    }).catch(function (error) {
      console.error(error);
      HRS.ui.toast(error.message || 'Something went wrong loading this page.', { type: 'error' });
    });
  });
})(window.HRS);
