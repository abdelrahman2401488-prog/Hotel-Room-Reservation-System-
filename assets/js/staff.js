/**
 * staff.js — front desk dashboard, check-in/check-out, room service board
 * and complaints (staff/*.php).
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var today = HRS.date.today();

  // Front desk groupings for the current day
  function isArrival(r) { return (r.status === 'confirmed' || r.status === 'pending') && r.check_in_date <= today && r.check_out_date > today; }
  function isDeparture(r) { return r.status === 'checked-in' && r.check_out_date <= today; }
  function isInHouse(r) { return r.status === 'checked-in'; }

  function guestCell(r) {
    return html`<div class="font-medium">${r.guest_name}</div><div class="text-xs text-muted font-mono">${r.booking_reference}</div>`;
  }

  function stat(label, value, meta, variant) {
    return html`<div class="stat-card stat-card-${variant}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div>${meta ? html`<div class="stat-meta">${meta}</div>` : ''}</div>`;
  }

  /* ---------------- Check-in / check-out modals (shared) ---------------- */

  function bindDeskModals(onDone) {
    var checkinForm = qs('[data-form="checkin"]');
    var checkoutForm = qs('[data-form="checkout"]');
    var current = null;

    function summary(r) {
      return HRS.views.detailList([
        ['Guest', r.guest_name], ['Reference', r.booking_reference],
        ['Room', r.room ? r.room.room_number + ' · ' + r.room.title : '—'],
        ['Stay', HRS.format.date(r.check_in_date) + ' – ' + HRS.format.date(r.check_out_date)],
        ['Guests', r.num_guests],
        ['Balance', r.payment_status === 'paid' ? 'Paid in full' : HRS.format.currency(r.total_price) + ' due'],
        ['Requests', r.special_requests || 'None']
      ]);
    }

    function open(action, r) {
      current = r;
      var form = action === 'checkin' ? checkinForm : checkoutForm;
      HRS.validation.reset(form);
      form.elements.booking_reference.value = r.booking_reference;
      HRS.dom.render(qs('[data-region="' + action + '-summary"]', form), summary(r));
      if (action === 'checkin') qs('[data-region="collect-payment"]').hidden = r.payment_status === 'paid';
      else qs('[data-region="settle-balance"]').hidden = r.payment_status === 'paid';
      HRS.ui.openModal('#' + action + '-modal');
    }

    HRS.validation.attach(checkinForm, {
      onSubmit: function (values) {
        var extra = values.payment_collected ? { payment_status: 'paid' } : null;
        return HRS.data.setReservationStatus(current.booking_reference, 'checked-in', extra).then(function (r) {
          HRS.ui.closeModal('#checkin-modal');
          HRS.ui.toast(r.guest_name + ' checked in to room ' + r.room.room_number + ' (demo).', { type: 'success', title: 'Checked in' });
          onDone();
        });
      }
    });
    HRS.validation.attach(checkoutForm, {
      onSubmit: function (values) {
        var extra = values.balance_settled ? { payment_status: 'paid' } : null;
        return HRS.data.setReservationStatus(current.booking_reference, 'checked-out', extra).then(function (r) {
          HRS.ui.closeModal('#checkout-modal');
          HRS.ui.toast(r.guest_name + ' checked out. Room ' + r.room.room_number + ' is available again (demo).', { type: 'success', title: 'Checked out' });
          onDone();
        });
      }
    });
    return { open: open };
  }

  function deskButton(action, r) {
    return action === 'checkin'
      ? html`<button class="btn btn-success btn-sm" type="button" data-desk="checkin" data-ref="${r.booking_reference}">Check in</button>`
      : html`<button class="btn btn-primary btn-sm" type="button" data-desk="checkout" data-ref="${r.booking_reference}">Check out</button>`;
  }

  /* ---------------- Staff dashboard ---------------- */

  HRS.pages['staff-dashboard'] = function () {
    var list = [];
    var rooms = [];
    var boardForm = qs('[data-form="board-status"]');
    qs('[data-field="today"]').textContent = HRS.format.date(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    function find(ref) { return list.filter(function (r) { return r.booking_reference === ref; })[0]; }
    var desk = bindDeskModals(function () { render(); });

    function rowsFor(items, action, empty) {
      if (!items.length) return html`<tr><td class="table-empty">${empty}</td></tr>`;
      return items.map(function (r) {
        return html`<tr><td>${guestCell(r)}</td><td>Room ${r.room ? r.room.room_number : '—'}</td><td>${HRS.views.statusBadge(r.payment_status)}</td><td class="text-right">${deskButton(action, r)}</td></tr>`;
      });
    }

    function render() {
      return Promise.all([HRS.data.getReservations(), HRS.data.getRooms(), HRS.data.getServiceRequests(), HRS.data.getComplaints()]).then(function (results) {
        list = results[0];
        rooms = results[1];
        var requests = results[2].filter(function (s) { return s.status !== 'completed'; });
        var complaints = results[3].filter(function (c) { return c.status !== 'resolved'; });
        var arrivals = list.filter(isArrival);
        var departures = list.filter(isDeparture);
        var inHouse = list.filter(isInHouse);

        HRS.dom.render('[data-region="stats"]', [
          stat('Arrivals', arrivals.length, 'Due today', 'info'),
          stat('Departures', departures.length, 'Due today', 'warning'),
          stat('In house', inHouse.length, HRS.format.plural(inHouse.reduce(function (s, r) { return s + r.num_guests; }, 0), 'guest'), 'success'),
          stat('Open issues', requests.length + complaints.length, requests.length + ' requests · ' + complaints.length + ' complaints', 'error')
        ]);
        HRS.dom.render('[data-region="arrivals"]', rowsFor(arrivals, 'checkin', 'No more arrivals today.'));
        HRS.dom.render('[data-region="departures"]', rowsFor(departures, 'checkout', 'No more departures today.'));

        HRS.dom.render('[data-region="room-board"]', rooms.map(function (room) {
          var guest = inHouse.filter(function (r) { return r.room_id === room.room_id; })[0];
          return html`<button class="room-tile status-${room.status}" type="button" data-room="${room.room_id}" aria-label="Room ${room.room_number}, ${HRS.format.label(room.status)}">
              <span class="room-tile-number">${room.room_number}</span>
              <span class="room-tile-meta">${HRS.format.label(room.room_type)} · ${HRS.format.label(room.status)}</span>
              <span class="room-tile-meta truncate">${guest ? guest.guest_name : ' '}</span>
            </button>`;
        }));

        HRS.dom.render('[data-region="open-requests"]', requests.length ? requests.slice(0, 4).map(function (s) {
          return html`<div class="flex flex-wrap items-center justify-between gap-2">
              <div><span class="font-semibold">Room ${s.room_number}</span> · ${HRS.format.label(s.request_type)} <div class="text-sm text-muted">${s.details}</div></div>
              <span class="flex gap-2">${HRS.views.priorityBadge(s.priority)} ${HRS.views.statusBadge(s.status)}</span>
            </div>`;
        }) : html`<p class="text-muted mb-0">All requests are complete.</p>`);
      });
    }

    HRS.dom.on(document, 'click', '[data-desk]', function (event, button) { desk.open(button.dataset.desk, find(button.dataset.ref)); });

    HRS.dom.on(qs('[data-region="room-board"]'), 'click', '[data-room]', function (event, tile) {
      var room = rooms.filter(function (r) { return String(r.room_id) === tile.dataset.room; })[0];
      qs('#room-status-title').textContent = 'Room ' + room.room_number;
      qs('[data-region="room-status-summary"]').textContent = room.title + ' · currently ' + HRS.format.label(room.status).toLowerCase();
      boardForm.elements.room_id.value = room.room_id;
      HRS.dom.qsa('[name="status"]', boardForm).forEach(function (radio) { radio.checked = radio.value === room.status; });
      HRS.ui.openModal('#room-status-modal');
    });

    HRS.validation.attach(boardForm, {
      onSubmit: function (values) {
        return HRS.data.updateRoomStatus(values.room_id, values.status).then(function (room) {
          HRS.ui.closeModal('#room-status-modal');
          HRS.ui.toast('Room ' + room.room_number + ' marked ' + HRS.format.label(room.status).toLowerCase() + ' (demo).', { type: 'success' });
          render();
        });
      }
    });

    return render();
  };

  /* ---------------- Check-in / check-out ---------------- */

  HRS.pages['checkin-checkout'] = function () {
    var list = [];
    var tab = HRS.url.param('tab') || 'arrivals';
    var search = qs('#cc-search');
    var tbody = qs('[data-region="desk-rows"]');
    var desk = bindDeskModals(function () { load(); });
    var groups = { arrivals: isArrival, departures: isDeparture, 'in-house': isInHouse };

    function renderRows() {
      var q = search.value.trim().toLowerCase();
      var rows = list.filter(groups[tab]).filter(function (r) {
        return !q || [r.guest_name, r.booking_reference, r.room ? r.room.room_number : ''].join(' ').toLowerCase().indexOf(q) !== -1;
      });
      if (!rows.length) {
        HRS.dom.render(tbody, html`<tr><td colspan="6" class="table-empty">Nobody in this list${q ? ' matches “' + q + '”' : ''}.</td></tr>`);
        return;
      }
      HRS.dom.render(tbody, rows.map(function (r) {
        var action = tab === 'arrivals' ? deskButton('checkin', r)
          : r.check_out_date <= today || tab === 'departures' ? deskButton('checkout', r)
          : html`<button class="btn btn-ghost btn-sm" type="button" data-desk="checkout" data-ref="${r.booking_reference}">Early check-out</button>`;
        return html`<tr>
            <td>${guestCell(r)}</td>
            <td>${r.room ? r.room.room_number : '—'} <span class="text-xs text-muted">${r.room ? r.room.title : ''}</span></td>
            <td class="text-nowrap">${HRS.format.dateShort(r.check_in_date)} – ${HRS.format.dateShort(r.check_out_date)}</td>
            <td>${HRS.views.statusBadge(r.payment_status)}</td>
            <td>${HRS.views.statusBadge(r.status)}</td>
            <td class="text-right">${action}</td>
          </tr>`;
      }));
    }

    function load() {
      return HRS.data.getReservations().then(function (all) {
        list = all;
        Object.keys(groups).forEach(function (key) { qs('[data-count="' + key + '"]').textContent = all.filter(groups[key]).length; });
        renderRows();
      });
    }

    HRS.dom.qsa('[role="tab"]').forEach(function (t) { t.setAttribute('aria-selected', t.dataset.value === tab ? 'true' : 'false'); });
    HRS.ui.tabs(qs('[role="tablist"]'), function (value) { tab = value; renderRows(); });
    search.addEventListener('input', renderRows);
    HRS.dom.on(tbody, 'click', '[data-desk]', function (event, button) {
      desk.open(button.dataset.desk, list.filter(function (r) { return r.booking_reference === button.dataset.ref; })[0]);
    });
    return load();
  };

  /* ---------------- Room service board ---------------- */

  var NEXT_STATUS = { open: 'in-progress', 'in-progress': 'completed' };

  HRS.pages['room-service'] = function () {
    var form = qs('[data-form="service-request"]');
    var inHouse = [];

    function taskCard(s) {
      var next = NEXT_STATUS[s.status];
      return html`<article class="task-card">
          <div class="flex items-center justify-between gap-2">
            <strong>Room ${s.room_number}</strong>
            ${HRS.views.priorityBadge(s.priority)}
          </div>
          <div class="font-medium">${HRS.format.label(s.request_type)}</div>
          <p class="text-muted mb-0">${s.details}</p>
          <div class="text-xs text-muted">${s.guest_name ? s.guest_name + ' · ' : ''}${HRS.format.dateTime(s.created_at)}${s.assigned_to ? ' · ' + s.assigned_to : ''}</div>
          ${next ? html`<button class="btn btn-outline btn-sm" type="button" data-advance="${s.request_id}" data-next="${next}">${next === 'in-progress' ? 'Start' : 'Mark complete'}</button>` : ''}
        </article>`;
    }

    function render() {
      return HRS.data.getServiceRequests().then(function (requests) {
        ['open', 'in-progress', 'completed'].forEach(function (status) {
          var items = requests.filter(function (s) { return s.status === status; });
          qs('[data-count="' + status + '"]').textContent = items.length;
          HRS.dom.render(qs('[data-column="' + status + '"]'), items.length ? items.map(taskCard) : html`<p class="text-sm text-muted mb-0">Nothing here.</p>`);
        });
      });
    }

    HRS.data.getReservations({ status: 'checked-in' }).then(function (list) {
      inHouse = list;
      HRS.data.getRooms({ sort: 'number' }).then(function (rooms) {
        HRS.dom.fillSelect(form.elements.room_number, [{ value: '', label: 'Choose room…' }].concat(rooms.map(function (room) {
          var guest = inHouse.filter(function (r) { return r.room_id === room.room_id; })[0];
          return { value: room.room_number, label: room.room_number + (guest ? ' · ' + guest.guest_name : '') };
        })), '');
      });
    });

    form.elements.room_number.addEventListener('change', function () {
      var guest = inHouse.filter(function (r) { return r.room && r.room.room_number === form.elements.room_number.value; })[0];
      form.elements.guest_name.value = guest ? guest.guest_name : '';
    });

    HRS.dom.on(qs('[data-region="kanban"]'), 'click', '[data-advance]', function (event, button) {
      var changes = { status: button.dataset.next };
      if (button.dataset.next === 'in-progress') changes.assigned_to = (HRS.session.current() || { full_name: 'Front desk' }).full_name;
      HRS.data.updateServiceRequest(button.dataset.advance, changes).then(function (s) {
        HRS.ui.toast('Request for room ' + s.room_number + ' is ' + HRS.format.label(s.status).toLowerCase() + ' (demo).', { type: 'success' });
        render();
      });
    });

    HRS.validation.attach(form, {
      onSubmit: function (values) {
        return HRS.data.saveServiceRequest(values).then(function (s) {
          HRS.validation.reset(form);
          form.elements.priority.value = 'medium';
          HRS.ui.toast('Request added for room ' + s.room_number + ' (demo).', { type: 'success' });
          render();
        });
      }
    });
    return render();
  };

  /* ---------------- Complaints ---------------- */

  HRS.pages.complaints = function () {
    var filters = qs('[data-form="complaint-filters"]');
    var newForm = qs('[data-form="complaint"]');
    var updateForm = qs('[data-form="complaint-update"]');
    var tbody = qs('[data-region="complaint-rows"]');
    var all = [];

    function render() {
      return HRS.data.getComplaints().then(function (list) {
        all = list;
        var f = HRS.validation.serialize(filters);
        HRS.dom.render('[data-region="stats"]', [
          stat('Open', list.filter(function (c) { return c.status === 'open'; }).length, null, 'error'),
          stat('In progress', list.filter(function (c) { return c.status === 'in-progress'; }).length, null, 'warning'),
          stat('Resolved', list.filter(function (c) { return c.status === 'resolved'; }).length, null, 'success'),
          stat('High priority', list.filter(function (c) { return c.priority === 'high' && c.status !== 'resolved'; }).length, 'Unresolved', 'primary')
        ]);
        var rows = list.filter(function (c) {
          return (!f.status || c.status === f.status) && (!f.priority || c.priority === f.priority) && (!f.category || c.category === f.category);
        });
        HRS.dom.render(tbody, rows.length ? rows.map(function (c) {
          return html`<tr>
              <td><div class="font-medium">${c.subject}</div><div class="text-xs text-muted">${c.booking_reference || 'No booking'}${c.room_number ? ' · Room ' + c.room_number : ''}</div></td>
              <td>${c.guest_name}</td>
              <td>${HRS.format.label(c.category)}</td>
              <td>${HRS.views.priorityBadge(c.priority)}</td>
              <td>${HRS.views.statusBadge(c.status)}</td>
              <td class="text-nowrap">${HRS.format.dateTime(c.created_at)}</td>
              <td class="text-right"><button class="btn btn-ghost btn-sm" type="button" data-manage="${c.complaint_id}">Manage</button></td>
            </tr>`;
        }) : html`<tr><td colspan="7" class="table-empty">No complaints match these filters.</td></tr>`);
      });
    }

    HRS.dom.on(tbody, 'click', '[data-manage]', function (event, button) {
      var c = all.filter(function (x) { return String(x.complaint_id) === button.dataset.manage; })[0];
      HRS.validation.reset(updateForm);
      qs('#manage-complaint-title').textContent = c.subject;
      updateForm.elements.complaint_id.value = c.complaint_id;
      updateForm.elements.status.value = c.status;
      updateForm.elements.priority.value = c.priority;
      updateForm.elements.resolution_notes.value = c.resolution_notes || '';
      HRS.dom.render('[data-region="complaint-details"]', html`
        ${HRS.views.detailList([
          ['Guest', c.guest_name], ['Booking', c.booking_reference || '—'], ['Room', c.room_number || '—'],
          ['Category', HRS.format.label(c.category)], ['Logged', HRS.format.dateTime(c.created_at)]
        ])}
        <p class="surface mt-4 mb-0">${c.description}</p>`);
      HRS.ui.openModal('#manage-complaint-modal');
    });

    HRS.validation.attach(newForm, {
      onSubmit: function (values) {
        return HRS.data.saveComplaint(values).then(function (c) {
          HRS.ui.closeModal('#new-complaint-modal');
          HRS.validation.reset(newForm);
          HRS.ui.toast('Complaint "' + c.subject + '" logged (demo).', { type: 'success' });
          render();
        });
      }
    });

    HRS.validation.attach(updateForm, {
      validators: {
        resolution_notes: function (value) {
          return updateForm.elements.status.value === 'resolved' && !value ? 'Add resolution notes before resolving.' : '';
        }
      },
      onSubmit: function (values) {
        return HRS.data.updateComplaint(values.complaint_id, {
          status: values.status, priority: values.priority, resolution_notes: values.resolution_notes
        }).then(function (c) {
          HRS.ui.closeModal('#manage-complaint-modal');
          HRS.ui.toast('Complaint updated: ' + HRS.format.label(c.status).toLowerCase() + ' (demo).', { type: 'success' });
          render();
        });
      }
    });

    filters.addEventListener('change', render);
    return render();
  };
})(window.HRS);
