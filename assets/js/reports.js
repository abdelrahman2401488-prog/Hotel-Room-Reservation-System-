/**
 * reports.js — booking and revenue reports (reports/*.php).
 *
 * Aggregates are computed in the browser from DEMO data.
 * BACKEND INTEGRATION: compute the same aggregates with SQL in PHP and return
 * rows of { label, value } so the chart and table renderers can be reused.
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var TYPES = ['single', 'double', 'deluxe', 'family', 'suite'];
  var METHOD_LABELS = { card: 'Card', wallet: 'Digital wallet', pay_at_hotel: 'Pay at hotel' };

  function stat(label, value, meta, variant) {
    return html`<div class="stat-card stat-card-${variant}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div>${meta ? html`<div class="stat-meta">${meta}</div>` : ''}</div>`;
  }

  function matches(r, f) {
    if (f.from && r.check_in_date < f.from) return false;
    if (f.to && r.check_in_date > f.to) return false;
    if (f.room_type && (!r.room || r.room.room_type !== f.room_type)) return false;
    if (f.status && r.status !== f.status) return false;
    return true;
  }

  function groupBy(items, keyFn, valueFn) {
    var out = {};
    items.forEach(function (item) {
      var key = keyFn(item);
      out[key] = (out[key] || 0) + valueFn(item);
    });
    return out;
  }

  function monthRows(items, valueFn, formatter) {
    var totals = groupBy(items, function (r) { return HRS.date.monthKey(r.check_in_date); }, valueFn);
    return Object.keys(totals).sort().map(function (key) {
      return { label: HRS.format.monthLabel(key), value: Math.round(totals[key]), display: formatter(totals[key]) };
    });
  }

  function typeRows(items, valueFn, formatter) {
    var totals = groupBy(items, function (r) { return r.room ? r.room.room_type : 'other'; }, valueFn);
    return TYPES.map(function (type) {
      return { label: HRS.format.label(type), value: Math.round(totals[type] || 0), display: formatter(totals[type] || 0) };
    });
  }

  function chart(region, rows, variant) {
    if (!rows.length) { HRS.dom.render(region, html`<p class="text-muted mb-0">No data for these filters.</p>`); return; }
    HRS.dom.render(region, HRS.views.barChart(rows, variant));
  }

  function toCsv(header, rows) {
    return [header.join(',')].concat(rows.map(function (row) {
      return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    })).join('\n');
  }

  // Shared filter wiring: default range covers the demo data window
  function bindFilters(render) {
    var form = qs('[data-form="report-filters"]');
    var defaults = { from: HRS.date.addDays(HRS.date.today(), -90), to: HRS.date.addDays(HRS.date.today(), 60) };
    function applyDefaults() { form.elements.from.value = defaults.from; form.elements.to.value = defaults.to; }
    applyDefaults();
    HRS.validation.attach(form, { onSubmit: function () { render(HRS.validation.serialize(form)); } });
    form.addEventListener('change', function () {
      if (form.elements.to.value && form.elements.from.value && form.elements.to.value <= form.elements.from.value) return;
      render(HRS.validation.serialize(form));
    });
    qs('[data-action="reset-filters"]').addEventListener('click', function () {
      HRS.validation.reset(form);
      applyDefaults();
      render(HRS.validation.serialize(form));
    });
    qs('[data-action="print"]').addEventListener('click', function () { window.print(); });
    return function () { return HRS.validation.serialize(form); };
  }

  /* ---------------- Booking report ---------------- */

  HRS.pages['booking-reports'] = function () {
    var current = [];
    // NFR-19: 10 rows per page; Previous/Next only redraws the table, filters reset to page 1
    var pager = HRS.ui.pager('[data-region="pager"]', { pageSize: 10, onChange: renderRows });

    function renderRows() {
      HRS.dom.render('[data-region="report-rows"]', current.length ? pager.slice(current).map(function (r) {
        return html`<tr>
            <td class="font-mono">${r.booking_reference}</td>
            <td>${r.guest_name}</td>
            <td>${r.room ? HRS.format.label(r.room.room_type) : '—'}</td>
            <td>${HRS.format.date(r.check_in_date)}</td>
            <td class="num">${r.nights}</td>
            <td class="num">${HRS.format.currency(r.total_price)}</td>
            <td>${HRS.views.statusBadge(r.status)}</td>
          </tr>`;
      }) : (pager.slice([]), html`<tr><td colspan="7" class="table-empty">No bookings in this range.</td></tr>`));
    }

    function render(f) {
      pager.reset();
      return HRS.data.getReservations().then(function (all) {
        current = all.filter(function (r) { return matches(r, f); })
          .sort(function (a, b) { return a.check_in_date.localeCompare(b.check_in_date); });
        var active = current.filter(function (r) { return r.status !== 'cancelled'; });
        var nights = active.reduce(function (s, r) { return s + r.nights; }, 0);
        var cancelled = current.length - active.length;

        HRS.dom.render('[data-region="stats"]', [
          stat('Bookings', current.length, active.length + ' active', 'primary'),
          stat('Room nights', nights, 'Excluding cancellations', 'info'),
          stat('Avg. stay', active.length ? (nights / active.length).toFixed(1) + ' n' : '—', 'Nights per booking', 'success'),
          stat('Cancellation rate', HRS.format.percent(current.length ? cancelled / current.length : 0), HRS.format.plural(cancelled, 'cancellation'), 'error')
        ]);

        var count = function () { return 1; };
        var asCount = function (n) { return String(Math.round(n)); };
        chart('[data-region="by-month"]', monthRows(current, count, asCount));
        chart('[data-region="by-type"]', typeRows(current, count, asCount), 'accent');
        chart('[data-region="by-status"]', ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map(function (s) {
          var n = current.filter(function (r) { return r.status === s; }).length;
          return { label: HRS.format.label(s), value: n, display: String(n) };
        }));
        chart('[data-region="stay-length"]', TYPES.map(function (type) {
          var ofType = active.filter(function (r) { return r.room && r.room.room_type === type; });
          var avg = ofType.length ? ofType.reduce(function (s, r) { return s + r.nights; }, 0) / ofType.length : 0;
          return { label: HRS.format.label(type), value: Math.round(avg * 10), display: avg ? avg.toFixed(1) + ' nights' : '—' };
        }), 'accent');

        renderRows();
      });
    }

    var filters = bindFilters(render);
    qs('[data-action="export"]').addEventListener('click', function () {
      HRS.ui.download('booking-report-demo.csv', toCsv(
        ['booking_reference', 'guest_name', 'room_type', 'check_in_date', 'check_out_date', 'nights', 'total_price', 'status'],
        current.map(function (r) { return [r.booking_reference, r.guest_name, r.room ? r.room.room_type : '', r.check_in_date, r.check_out_date, r.nights, r.total_price, r.status]; })
      ));
      HRS.ui.toast('Booking report exported (demo data).', { type: 'success' });
    });
    return render(filters());
  };

  /* ---------------- Revenue report ---------------- */

  HRS.pages['revenue-reports'] = function () {
    var payments = [];
    // NFR-19: 10 payments per page; Previous/Next only redraws the table, filters reset to page 1
    var pager = HRS.ui.pager('[data-region="pager"]', { pageSize: 10, onChange: renderRows });

    function renderRows() {
      HRS.dom.render('[data-region="report-rows"]', payments.length ? pager.slice(payments).map(function (p) {
        return html`<tr>
            <td class="font-mono text-xs">${p.transaction_ref}</td>
            <td class="font-mono">${p.reservation.booking_reference}</td>
            <td>${p.reservation.guest_name}</td>
            <td>${METHOD_LABELS[p.payment_method] || p.payment_method}${p.card_last4 ? ' ·' + p.card_last4 : ''}</td>
            <td>${HRS.format.date(p.paid_at)}</td>
            <td class="num">${HRS.format.currency(p.amount)}</td>
            <td>${HRS.views.statusBadge(p.status)}</td>
          </tr>`;
      }) : (pager.slice([]), html`<tr><td colspan="7" class="table-empty">No payments in this range.</td></tr>`));
    }

    function render(f) {
      pager.reset();
      return Promise.all([HRS.data.getReservations(), HRS.data.getPayments()]).then(function (results) {
        var bookings = results[0].filter(function (r) { return matches(r, f); });
        var active = bookings.filter(function (r) { return r.status !== 'cancelled'; });
        payments = results[1].filter(function (p) { return p.reservation && matches(p.reservation, f); })
          .sort(function (a, b) { return b.paid_at.localeCompare(a.paid_at); });

        var booked = active.reduce(function (s, r) { return s + r.total_price; }, 0);
        var collected = payments.filter(function (p) { return p.status === 'paid'; }).reduce(function (s, p) { return s + p.amount; }, 0);
        var outstanding = active.filter(function (r) { return r.payment_status !== 'paid'; }).reduce(function (s, r) { return s + r.total_price; }, 0);
        var refunds = payments.reduce(function (s, p) { return s + (p.refund_amount || 0); }, 0);
        var nights = active.reduce(function (s, r) { return s + r.nights; }, 0);

        HRS.dom.render('[data-region="stats"]', [
          stat('Booked revenue', HRS.format.currency(booked), HRS.format.plural(active.length, 'booking'), 'primary'),
          stat('Collected', HRS.format.currency(collected), 'Paid payments', 'success'),
          stat('Outstanding', HRS.format.currency(outstanding), 'Awaiting payment', 'warning'),
          stat('Avg. daily rate', nights ? HRS.format.currency(booked / nights) : '—', 'Refunded ' + HRS.format.currency(refunds), 'info')
        ]);

        var revenue = function (r) { return r.total_price; };
        chart('[data-region="by-month"]', monthRows(active, revenue, HRS.format.currency));
        chart('[data-region="by-type"]', typeRows(active, revenue, HRS.format.currency), 'accent');

        renderRows();
      });
    }

    var filters = bindFilters(render);
    qs('[data-action="export"]').addEventListener('click', function () {
      HRS.ui.download('revenue-report-demo.csv', toCsv(
        ['transaction_ref', 'booking_reference', 'guest_name', 'payment_method', 'paid_at', 'amount', 'status', 'refund_amount'],
        payments.map(function (p) { return [p.transaction_ref, p.reservation.booking_reference, p.reservation.guest_name, p.payment_method, p.paid_at, p.amount, p.status, p.refund_amount || 0]; })
      ));
      HRS.ui.toast('Revenue report exported (demo data).', { type: 'success' });
    });
    return render(filters());
  };
})(window.HRS);
