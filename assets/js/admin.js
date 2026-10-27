/**
 * admin.js — admin dashboard, room management (list, add/edit form, delete,
 * details) and pricing (admin/*.php).
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var today = HRS.date.today();
  var ROOM_TYPES = ['single', 'double', 'deluxe', 'family', 'suite'];
  var AMENITIES = ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Coffee machine', 'Work desk', 'Safe', 'Balcony', 'Sea view', 'Bathtub', 'Jacuzzi', 'Kitchenette', 'Lounge access', 'Room service'];

  function isInHouse(r, day) {
    return r.status !== 'cancelled' && r.check_in_date <= day && r.check_out_date > day;
  }

  function stat(label, value, meta, variant) {
    return html`<div class="stat-card ${variant ? 'stat-card-' + variant : ''}">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        ${meta ? html`<div class="stat-meta">${meta}</div>` : ''}
      </div>`;
  }

  function roomNotFound(region) {
    HRS.ui.emptyState(region, {
      title: 'Room not found', message: 'It may have been deleted.',
      href: HRS.url.to('admin/manage_rooms.php'), action: 'Back to rooms'
    });
  }

  /* ---------------- Dashboard ---------------- */

  HRS.pages['admin-dashboard'] = function () {
    return Promise.all([HRS.data.getRooms(), HRS.data.getReservations()]).then(function (results) {
      var rooms = results[0];
      var reservations = results[1];
      var active = reservations.filter(function (r) { return r.status !== 'cancelled'; });
      var inHouse = active.filter(function (r) { return isInHouse(r, today); });
      var month = HRS.date.monthKey(today);
      var monthRevenue = active.filter(function (r) { return HRS.date.monthKey(r.check_in_date) === month; })
        .reduce(function (s, r) { return s + r.total_price; }, 0);
      var arrivals = active.filter(function (r) { return r.check_in_date === today; });

      HRS.dom.render('[data-region="stats"]', [
        stat('Total rooms', rooms.length, rooms.filter(function (r) { return r.status === 'maintenance'; }).length + ' in maintenance', 'primary'),
        stat('Occupancy today', HRS.format.percent(rooms.length ? inHouse.length / rooms.length : 0), inHouse.length + ' rooms occupied', 'success'),
        stat('Arrivals today', arrivals.length, 'Expected check-ins', 'info'),
        stat('Revenue this month', HRS.format.currency(monthRevenue), 'Bookings starting in ' + HRS.format.monthLabel(month), 'warning')
      ]);

      HRS.dom.render('[data-region="status-chart"]', HRS.views.barChart(['available', 'occupied', 'maintenance'].map(function (status) {
        var count = rooms.filter(function (r) { return r.status === status; }).length;
        return { label: HRS.format.label(status), value: count, display: String(count) };
      })));

      HRS.dom.render('[data-region="type-chart"]', HRS.views.barChart(ROOM_TYPES.map(function (type) {
        var total = active.filter(function (r) { return r.room && r.room.room_type === type; }).reduce(function (s, r) { return s + r.total_price; }, 0);
        return { label: HRS.format.label(type), value: Math.round(total), display: HRS.format.currency(total) };
      }), 'accent'));

      var recent = reservations.slice().sort(function (a, b) { return b.created_at.localeCompare(a.created_at); }).slice(0, 6);
      HRS.dom.render('[data-region="recent"]', recent.map(function (r) {
        return html`<tr>
            <td><a class="font-mono" href="${HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference })}">${r.booking_reference}</a></td>
            <td>${r.guest_name}</td>
            <td>${r.room ? r.room.room_number : '—'}</td>
            <td>${HRS.format.date(r.check_in_date)}</td>
            <td class="num">${HRS.format.currency(r.total_price)}</td>
            <td>${HRS.views.statusBadge(r.status)}</td>
          </tr>`;
      }));
    });
  };

  /* ---------------- Manage rooms ---------------- */

  HRS.pages['manage-rooms'] = function () {
    var form = qs('[data-form="room-admin-filters"]');
    var tbody = qs('[data-region="room-rows"]');
    // NFR-19: 10 rooms per page; filters go back to page 1
    var pager = HRS.ui.pager('[data-region="pager"]', { pageSize: 10, onChange: render });

    function render() {
      return HRS.data.getRooms(HRS.validation.serialize(form)).then(function (rooms) {
        qs('[data-region="row-count"]').textContent = HRS.format.plural(rooms.length, 'room') + ' (demo data).';
        var pageRows = pager.slice(rooms);
        if (!rooms.length) {
          HRS.dom.render(tbody, html`<tr><td colspan="6" class="table-empty">No rooms match these filters.</td></tr>`);
          return;
        }
        HRS.dom.render(tbody, pageRows.map(function (room) {
          return html`<tr>
              <td><div class="flex items-center gap-3">
                ${HRS.views.roomMedia(room, 'room-media-table', { label: false })}
                <div><div class="font-semibold">${room.room_number} · ${room.title}</div><div class="text-xs text-muted">Floor ${room.floor} · ${room.view} view</div></div>
              </div></td>
              <td>${HRS.format.label(room.room_type)}</td>
              <td>${room.capacity}</td>
              <td class="num">${HRS.format.currency(room.price_per_night)}</td>
              <td>
                <label class="sr-only" for="status-${room.room_id}">Status of room ${room.room_number}</label>
                <select class="form-control" id="status-${room.room_id}" data-action="status" data-id="${room.room_id}">
                  ${['available', 'occupied', 'maintenance'].map(function (s) {
                    return html`<option value="${s}"${s === room.status ? HRS.dom.raw(' selected') : ''}>${HRS.format.label(s)}</option>`;
                  })}
                </select>
              </td>
              <td><div class="table-actions">
                <a class="btn btn-ghost btn-sm" href="${HRS.url.to('admin/room_details.php', { id: room.room_id })}">View</a>
                <a class="btn btn-ghost btn-sm" href="${HRS.url.to('admin/edit_room.php', { id: room.room_id })}">Edit</a>
                <button class="btn btn-ghost btn-sm" type="button" data-action="delete" data-id="${room.room_id}" data-number="${room.room_number}">Delete</button>
              </div></td>
            </tr>`;
        }));
      });
    }

    tbody.addEventListener('change', function (event) {
      var select = event.target.closest('[data-action="status"]');
      if (!select) return;
      HRS.data.updateRoomStatus(select.dataset.id, select.value).then(function (room) {
        HRS.ui.toast('Room ' + room.room_number + ' set to ' + HRS.format.label(room.status).toLowerCase() + ' (demo).', { type: 'success' });
      });
    });

    HRS.dom.on(tbody, 'click', '[data-action="delete"]', function (event, button) {
      HRS.ui.confirm({
        title: 'Delete room ' + button.dataset.number + '?',
        message: 'The room will be removed from search and management screens. This cannot be undone.',
        confirmText: 'Delete room',
        variant: 'danger'
      }).then(function (yes) {
        if (!yes) return;
        return HRS.data.deleteRoom(button.dataset.id).then(function () {
          HRS.ui.toast('Room ' + button.dataset.number + ' deleted (demo).', { type: 'success' });
          render();
        });
      }).catch(function (error) { HRS.ui.toast(error.message, { type: 'error', title: 'Cannot delete room' }); });
    });

    function refilter() { pager.reset(); return render(); }
    form.addEventListener('input', refilter);
    form.addEventListener('reset', function () { setTimeout(refilter, 0); });
    form.addEventListener('submit', function (event) { event.preventDefault(); refilter(); });
    return render();
  };

  /* ---------------- Add / edit room ---------------- */

  var PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var PHOTO_MAX_BYTES = 5 * 1024 * 1024;
  var PHOTO_MAX = { width: 1280, height: 800 };

  // Decode the chosen file and re-encode it as a JPEG no larger than
  // 1280x800 so the demo copy fits in localStorage (~100-250 KB).
  // BACKEND INTEGRATION: upload the original file instead and let PHP
  // resize/store it; keep only the returned path in rooms.image_url.
  function resizePhoto(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, PHOTO_MAX.width / img.naturalWidth, PHOTO_MAX.height / img.naturalHeight);
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('This file could not be read as an image.'));
      };
      img.src = url;
    });
  }

  HRS.pages['room-form'] = function () {
    var form = qs('[data-form="room"]');
    var id = HRS.url.param('id');
    var isEdit = !!qs('[data-region="edit-page"]');
    var previewBox = qs('[data-region="image-preview"]');
    var removeButton = qs('[data-action="remove-photo"]');
    var roomTypes = [];
    // Photo state: current image_url (path or data: URL) and a pending
    // resize while the admin is choosing a file.
    var photo = { url: '', pending: null };

    HRS.dom.render('[data-region="amenity-options"]', AMENITIES.map(function (a, i) {
      return html`<label class="form-check" for="amenity-${i}"><input type="checkbox" id="amenity-${i}" name="amenities" value="${a}" data-group> ${a}</label>`;
    }));

    function values() {
      var v = HRS.validation.serialize(form);
      return {
        room_id: v.room_id || 0,
        room_number: v.room_number || '—',
        room_type: v.room_type || 'double',
        title: v.title || 'Room name',
        capacity: Number(v.capacity) || 1,
        size_sqm: Number(v.size_sqm) || 0,
        bed_type: v.bed_type || 'Bed type',
        price_per_night: Number(v.price_per_night) || 0,
        amenities: v.amenities,
        status: v.status,
        image_url: photo.url,
        image_alt: v.image_alt
      };
    }

    function renderPhoto(previewUrl) {
      var src = previewUrl || HRS.media.url(photo.url);
      removeButton.hidden = !photo.url && !previewUrl;
      previewBox.classList.toggle('has-image', !!src);
      if (!src) { previewBox.textContent = 'No photo selected — guests will see the styled placeholder.'; return; }
      var img = document.createElement('img');
      img.alt = form.elements.image_alt.value || 'Preview of the selected room photo';
      img.src = src;
      previewBox.replaceChildren(img);
    }

    function preview() {
      var v = values();
      HRS.dom.render('[data-region="room-preview"]', HRS.views.roomCard(v, { badge: HRS.views.statusBadge(v.status), cta: 'Preview' }));
      var type = roomTypes.filter(function (t) { return t.room_type === form.elements.room_type.value; })[0];
      qs('[data-region="base-rate-hint"]').textContent = type ? 'Base rate for ' + type.label + ': ' + HRS.format.currency(type.base_price, 'EGP') : '';
    }

    form.elements.room_type.addEventListener('change', function () {
      var type = roomTypes.filter(function (t) { return t.room_type === form.elements.room_type.value; })[0];
      if (type && !form.elements.price_per_night.value) form.elements.price_per_night.value = type.base_price;
    });
    form.addEventListener('input', preview);
    form.addEventListener('change', preview);

    form.elements.room_image.addEventListener('change', function () {
      var input = form.elements.room_image;
      var file = input.files[0];
      if (!file) return;
      var error = PHOTO_TYPES.indexOf(file.type) === -1 ? 'Choose a JPG, PNG or WebP image.'
        : file.size > PHOTO_MAX_BYTES ? 'This image is ' + (file.size / 1048576).toFixed(1) + ' MB. Choose one under 5 MB.' : '';
      if (error) {
        HRS.validation.setError(input, error);
        input.value = '';
        return;
      }
      HRS.validation.setError(input, '');
      var objectUrl = URL.createObjectURL(file);
      renderPhoto(objectUrl); // instant preview while the resize runs
      photo.pending = resizePhoto(file).then(function (dataUrl) {
        photo.url = dataUrl;
        photo.pending = null;
        URL.revokeObjectURL(objectUrl);
        renderPhoto();
        preview();
      }, function (err) {
        photo.pending = null;
        URL.revokeObjectURL(objectUrl);
        HRS.validation.setError(input, err.message);
        input.value = '';
        renderPhoto();
      });
    });

    form.elements.image_alt.addEventListener('input', function () {
      var img = previewBox.querySelector('img');
      if (img) img.alt = form.elements.image_alt.value || 'Preview of the selected room photo';
    });

    removeButton.addEventListener('click', function () {
      photo.url = '';
      form.elements.room_image.value = '';
      renderPhoto();
      preview();
      HRS.ui.toast('Photo removed. Save the room to apply the change.', { type: 'info' });
    });

    HRS.validation.attach(form, {
      onSubmit: function (data, form, submit) {
        HRS.ui.setLoading(submit, true, 'Saving…');
        return Promise.resolve(photo.pending).then(function () {
          data.image_url = photo.url;
          return HRS.data.saveRoom(data);
        }).then(function (room) {
          if (room.storage_warning) {
            // A session-only photo would be lost on navigation: stay and explain
            HRS.ui.setLoading(submit, false);
            HRS.ui.toast('Room ' + room.room_number + ' saved. ' + room.storage_warning, { type: 'warning', timeout: 9000 });
            return;
          }
          HRS.ui.flash('Room ' + room.room_number + (isEdit ? ' updated' : ' created') + ' (demo, saved in this browser).', { type: 'success' });
          HRS.url.go('admin/room_details.php', { id: room.room_id });
        });
      }
    });

    var load = HRS.data.getRoomTypes().then(function (types) { roomTypes = types; });

    if (!isEdit) {
      return load.then(function () {
        form.elements.status.value = 'available';
        form.elements.floor.value = 1;
        form.elements.capacity.value = 2;
        renderPhoto();
        preview();
      });
    }

    return load.then(function () { return HRS.data.getRoom(id); }).then(function (room) {
      HRS.ui.fillFields(document, { room_number: room.room_number });
      qs('[data-region="details-link"]').href = HRS.url.to('admin/room_details.php', { id: room.room_id });
      ['room_id', 'room_number', 'floor', 'room_type', 'title', 'description', 'capacity', 'bed_type', 'size_sqm', 'price_per_night', 'view', 'status', 'image_alt'].forEach(function (name) {
        form.elements[name].value = room[name] === undefined ? '' : room[name];
      });
      HRS.dom.qsa('[name="amenities"]', form).forEach(function (box) { box.checked = room.amenities.indexOf(box.value) !== -1; });
      photo.url = room.image_url || '';
      renderPhoto();
      preview();
    }).catch(function () { roomNotFound('[data-region="edit-page"]'); });
  };

  /* ---------------- Delete room ---------------- */

  HRS.pages['delete-room'] = function () {
    var id = HRS.url.param('id');
    return Promise.all([HRS.data.getRoom(id), HRS.data.getReservations()]).then(function (results) {
      var room = results[0];
      var active = results[1].filter(function (r) {
        return r.room_id === room.room_id && ['pending', 'confirmed', 'checked-in'].indexOf(r.status) !== -1;
      });
      var form = qs('[data-form="delete-room"]');
      HRS.ui.fillFields(document, { room_number: room.room_number });
      HRS.dom.render('[data-region="room-media"]', HRS.views.roomMedia(room));
      HRS.dom.render('[data-region="room-facts"]', HRS.views.detailList([
        ['Name', room.title], ['Type', HRS.format.label(room.room_type)], ['Price', HRS.format.currency(room.price_per_night) + ' / night'], ['Status', HRS.views.statusBadge(room.status)]
      ]));
      HRS.dom.render('[data-region="reservation-check"]', active.length
        ? html`<div class="alert alert-warning mb-0"><span>${HRS.format.plural(active.length, 'active reservation')} use this room (${active.map(function (r) { return r.booking_reference; }).join(', ')}). Deletion will be blocked.</span></div>`
        : html`<div class="alert alert-success mb-0"><span>No active reservations use this room.</span></div>`);
      form.elements.room_id.value = room.room_id;

      HRS.validation.attach(form, {
        validators: {
          confirm_room_number: function (value) { return value === room.room_number ? '' : 'Type ' + room.room_number + ' exactly to confirm.'; }
        },
        onSubmit: function () {
          return HRS.ui.confirm({
            title: 'Permanently delete room ' + room.room_number + '?',
            message: 'This is your last chance to keep it.',
            confirmText: 'Delete room', variant: 'danger'
          }).then(function (yes) {
            if (!yes) return;
            return HRS.data.deleteRoom(room.room_id).then(function () {
              HRS.ui.flash('Room ' + room.room_number + ' deleted (demo).', { type: 'success' });
              HRS.url.go('admin/manage_rooms.php');
            });
          });
        }
      });
    }).catch(function (error) {
      if (error && error.message === 'Room not found.') roomNotFound('[data-region="delete-page"]');
      else throw error;
    });
  };

  /* ---------------- Room details (admin) ---------------- */

  HRS.pages['admin-room-details'] = function () {
    var id = HRS.url.param('id');
    return Promise.all([HRS.data.getRoom(id), HRS.data.getReservations(), HRS.data.getReviews({ room_id: id })]).then(function (results) {
      var room = results[0];
      var reservations = results[1].filter(function (r) { return r.room_id === room.room_id; });
      var reviews = results[2];
      var active = reservations.filter(function (r) { return r.status !== 'cancelled'; });

      HRS.ui.fillFields(document, { title: room.title, room_number: room.room_number, type_label: HRS.format.label(room.room_type), floor: room.floor, description: room.description });
      qs('[data-region="edit-link"]').href = HRS.url.to('admin/edit_room.php', { id: room.room_id });
      qs('[data-region="public-link"]').href = HRS.url.to('guest/rooms_details.php', { id: room.room_id });
      qs('[data-region="delete-link"]').href = HRS.url.to('admin/delete_room.php', { id: room.room_id });
      HRS.dom.render('[data-region="room-media"]', HRS.views.roomMedia(room));
      HRS.dom.render('[data-region="amenities"]', room.amenities.map(function (a) { return html`<li class="chip">${a}</li>`; }));

      function renderFacts(current) {
        HRS.dom.render('[data-region="room-facts"]', HRS.views.detailList([
          ['Status', HRS.views.statusBadge(current.status)],
          ['Price', HRS.format.currency(current.price_per_night) + ' / night'],
          ['Sleeps', HRS.format.plural(current.capacity, 'guest')],
          ['Beds', current.bed_type], ['Size', current.size_sqm + ' m²'], ['View', current.view]
        ]));
      }
      renderFacts(room);

      var nights = active.reduce(function (s, r) { return s + r.nights; }, 0);
      var avg = reviews.length ? reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length : 0;
      HRS.dom.render('[data-region="room-stats"]', [
        stat('Bookings', active.length, reservations.length - active.length + ' cancelled', 'primary'),
        stat('Nights booked', nights, null, 'info'),
        stat('Revenue', HRS.format.currency(active.reduce(function (s, r) { return s + r.total_price; }, 0)), null, 'success'),
        stat('Rating', reviews.length ? avg.toFixed(1) : '—', HRS.format.plural(reviews.length, 'review'), 'warning')
      ]);

      HRS.dom.render('[data-region="room-reservations"]', reservations.length ? reservations.map(function (r) {
        return html`<tr>
            <td><a class="font-mono" href="${HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference })}">${r.booking_reference}</a></td>
            <td>${r.guest_name}</td>
            <td>${HRS.format.date(r.check_in_date)} – ${HRS.format.date(r.check_out_date)}</td>
            <td class="num">${HRS.format.currency(r.total_price)}</td>
            <td>${HRS.views.statusBadge(r.status)}</td>
          </tr>`;
      }) : html`<tr><td colspan="5" class="table-empty">No reservations for this room yet.</td></tr>`);

      var statusForm = qs('[data-form="room-status"]');
      statusForm.elements.status.value = room.status;
      statusForm.addEventListener('submit', function (event) {
        event.preventDefault();
        HRS.data.updateRoomStatus(room.room_id, statusForm.elements.status.value).then(function (updated) {
          renderFacts(updated);
          HRS.ui.toast('Status updated to ' + HRS.format.label(updated.status).toLowerCase() + ' (demo).', { type: 'success' });
        });
      });
    }).catch(function () { roomNotFound('[data-region="room-admin-page"]'); });
  };

  /* ---------------- Pricing ---------------- */

  HRS.pages['manage-pricing'] = function () {
    var ruleForm = qs('[data-form="pricing-rule"]');
    var previewForm = qs('[data-form="price-preview"]');
    var rooms = [];
    var rules = [];

    function renderRates() {
      return Promise.all([HRS.data.getRoomTypes(), HRS.data.getRooms()]).then(function (results) {
        rooms = results[1];
        HRS.dom.render('[data-region="rate-rows"]', results[0].map(function (type) {
          var ofType = rooms.filter(function (r) { return r.room_type === type.room_type; });
          var prices = ofType.map(function (r) { return r.price_per_night; });
          var range = prices.length ? HRS.format.currency(Math.min.apply(null, prices)) + (Math.min.apply(null, prices) !== Math.max.apply(null, prices) ? ' – ' + HRS.format.currency(Math.max.apply(null, prices)) : '') : '—';
          return html`<tr>
              <td><div class="font-semibold">${type.label}</div><div class="text-xs text-muted">${type.description}</div></td>
              <td>${ofType.length}</td>
              <td>${range}</td>
              <td>
                <label class="sr-only" for="rate-${type.room_type}">Base rate for ${type.label}</label>
                <input class="form-control" type="number" id="rate-${type.room_type}" name="base_price_${type.room_type}" min="20" max="100000" step="5" value="${type.base_price}">
                <label class="form-check text-xs mt-1" for="apply-${type.room_type}"><input type="checkbox" id="apply-${type.room_type}" name="apply_${type.room_type}" value="1"> Apply to all ${type.label.toLowerCase()} rooms</label>
              </td>
              <td class="text-right"><button class="btn btn-outline btn-sm" type="button" data-action="save-rate" data-type="${type.room_type}">Save</button></td>
            </tr>`;
        }));
      });
    }

    function renderRules() {
      return HRS.data.getPricingRules().then(function (list) {
        rules = list;
        HRS.dom.render('[data-region="rule-rows"]', list.length ? list.map(function (rule) {
          var expired = rule.end_date < today;
          return html`<tr>
              <td class="font-semibold">${rule.name}</td>
              <td>${rule.room_type === 'all' ? 'All types' : HRS.format.label(rule.room_type)}</td>
              <td class="text-nowrap">${HRS.format.date(rule.start_date)} – ${HRS.format.date(rule.end_date)}${expired ? html` <span class="badge">Expired</span>` : ''}</td>
              <td class="num ${rule.adjustment_percent < 0 ? 'text-success' : 'text-warning'}">${rule.adjustment_percent > 0 ? '+' : ''}${rule.adjustment_percent}%</td>
              <td><label class="form-check" for="active-${rule.rule_id}"><input type="checkbox" id="active-${rule.rule_id}" data-action="toggle-rule" data-id="${rule.rule_id}"${rule.is_active ? HRS.dom.raw(' checked') : ''}><span class="sr-only">Active</span></label></td>
              <td><div class="table-actions">
                <button class="btn btn-ghost btn-sm" type="button" data-action="edit-rule" data-id="${rule.rule_id}">Edit</button>
                <button class="btn btn-ghost btn-sm" type="button" data-action="delete-rule" data-id="${rule.rule_id}">Delete</button>
              </div></td>
            </tr>`;
        }) : html`<tr><td colspan="6" class="table-empty">No seasonal rules. Base rates apply all year.</td></tr>`);
      });
    }

    function renderPreview() {
      var room = rooms.filter(function (r) { return String(r.room_id) === previewForm.elements.room_id.value; })[0];
      var quote = HRS.pricing.quote(room, previewForm.elements.check_in.value, previewForm.elements.check_out.value);
      HRS.dom.render('[data-region="preview-quote"]', HRS.views.summaryList(quote));
      if (!quote.nights) { HRS.dom.render('[data-region="preview-nightly"]', ''); return; }
      HRS.dom.render('[data-region="preview-nightly"]', html`
        <h3 class="text-lg">Nightly rates</h3>
        ${HRS.views.barChart(quote.nightly.slice(0, 14).map(function (n) {
          return { label: HRS.format.dateShort(n.date) + (n.percent ? ' (' + (n.percent > 0 ? '+' : '') + n.percent + '%)' : ''), value: n.rate, display: HRS.format.currency(n.rate) };
        }))}
        ${quote.nightly.length > 14 ? html`<p class="form-help mt-2">Showing the first 14 nights.</p>` : ''}`);
    }

    function refreshAll() {
      return Promise.all([renderRates(), renderRules()]).then(renderPreview);
    }

    // NFR-23: hotel settings (check-in/out times, currency)
    var settingsForm = qs('[data-form="hotel-settings"]');
    HRS.data.getSettings().then(function (s) {
      settingsForm.elements.check_in_time.value = s.check_in_time;
      settingsForm.elements.check_out_time.value = s.check_out_time;
      settingsForm.elements.currency.value = s.currency;
    });
    HRS.validation.attach(settingsForm, {
      onSubmit: function (values, form, submit) {
        HRS.ui.setLoading(submit, true, 'Saving…');
        return HRS.data.saveSettings(values).then(function (s) {
          HRS.ui.setLoading(submit, false);
          HRS.currency.select(s.currency);
          HRS.ui.flash('Settings saved (demo, this browser): check-in ' + s.check_in_time + ', check-out ' + s.check_out_time + ', prices in ' + s.currency + '.', { type: 'success' });
          window.location.reload();
        });
      }
    });

    function openRule(rule) {
      HRS.validation.reset(ruleForm);
      qs('#rule-modal-title').textContent = rule ? 'Edit seasonal rule' : 'New seasonal rule';
      ruleForm.elements.rule_id.value = rule ? rule.rule_id : '';
      ruleForm.elements.name.value = rule ? rule.name : '';
      ruleForm.elements.room_type.value = rule ? rule.room_type : 'all';
      ruleForm.elements.adjustment_percent.value = rule ? rule.adjustment_percent : 10;
      ruleForm.elements.start_date.value = rule ? rule.start_date : today;
      ruleForm.elements.end_date.value = rule ? rule.end_date : HRS.date.addDays(today, 14);
      ruleForm.elements.is_active.checked = rule ? rule.is_active : true;
      HRS.ui.openModal('#rule-modal');
    }

    qs('[data-action="new-rule"]').addEventListener('click', function () { openRule(null); });

    HRS.dom.on(qs('[data-region="rate-rows"]'), 'click', '[data-action="save-rate"]', function (event, button) {
      var type = button.dataset.type;
      var input = qs('#rate-' + type);
      var apply = qs('#apply-' + type).checked;
      if (!HRS.validation.validateField(input)) return;
      HRS.data.saveRoomTypeRate(type, input.value, apply).then(function (result) {
        HRS.ui.toast(result.room_type.label + ' base rate saved' + (apply ? ' and applied to ' + HRS.format.plural(result.rooms_updated, 'room') : '') + ' (demo).', { type: 'success' });
        refreshAll();
      });
    });

    var rulesBody = qs('[data-region="rule-rows"]');
    HRS.dom.on(rulesBody, 'click', '[data-action="edit-rule"]', function (event, button) {
      openRule(rules.filter(function (r) { return String(r.rule_id) === button.dataset.id; })[0]);
    });
    HRS.dom.on(rulesBody, 'click', '[data-action="delete-rule"]', function (event, button) {
      var rule = rules.filter(function (r) { return String(r.rule_id) === button.dataset.id; })[0];
      HRS.ui.confirm({ title: 'Delete "' + rule.name + '"?', message: 'Prices for these dates go back to the base rate.', confirmText: 'Delete rule', variant: 'danger' })
        .then(function (yes) {
          if (!yes) return;
          return HRS.data.deletePricingRule(rule.rule_id).then(function () {
            HRS.ui.toast('Rule deleted (demo).', { type: 'success' });
            refreshAll();
          });
        });
    });
    rulesBody.addEventListener('change', function (event) {
      var box = event.target.closest('[data-action="toggle-rule"]');
      if (!box) return;
      HRS.data.togglePricingRule(box.dataset.id).then(function (rule) {
        HRS.ui.toast('"' + rule.name + '" ' + (rule.is_active ? 'activated' : 'paused') + ' (demo).', { type: 'success' });
        refreshAll();
      });
    });

    HRS.validation.attach(ruleForm, {
      onSubmit: function (values) {
        values.is_active = ruleForm.elements.is_active.checked;
        return HRS.data.savePricingRule(values).then(function (rule) {
          HRS.ui.closeModal('#rule-modal');
          HRS.ui.toast('Rule "' + rule.name + '" saved (demo).', { type: 'success' });
          refreshAll();
        });
      }
    });

    previewForm.addEventListener('change', renderPreview);
    previewForm.elements.check_in.value = HRS.date.addDays(today, 18);
    previewForm.elements.check_out.value = HRS.date.addDays(today, 23);

    return refreshAll().then(function () {
      HRS.dom.fillSelect(previewForm.elements.room_id, rooms.map(function (r) {
        return { value: String(r.room_id), label: r.room_number + ' · ' + r.title + ' (' + HRS.format.currency(r.price_per_night) + ')' };
      }), String((rooms.filter(function (r) { return r.room_type === 'suite'; })[0] || rooms[0]).room_id));
      renderPreview();
    });
  };

  /* ---------------- Activity log (NFR-26) ---------------- */

  var ACTION_BADGES = { price: 'badge-accent', booking: 'badge-primary', payment: 'badge-info' };

  HRS.pages['activity-log'] = function () {
    var form = qs('[data-form="activity-filters"]');
    var tbody = qs('[data-region="activity-rows"]');
    var entries = [];
    var pager = HRS.ui.pager('[data-region="pager"]', { pageSize: 20, onChange: renderRows });

    function renderRows() {
      var pageRows = pager.slice(entries);
      qs('[data-region="row-count"]').textContent = HRS.format.plural(entries.length, 'entry') + ' (demo, stored in this browser).';
      if (!entries.length) {
        HRS.dom.render(tbody, html`<tr><td colspan="5" class="table-empty">
            <strong>No activity recorded yet.</strong><br>Price changes, bookings and payments made in the demo will appear here.</td></tr>`);
        return;
      }
      HRS.dom.render(tbody, pageRows.map(function (e) {
        var when = new Date(e.created_at);
        var category = e.action.split('.')[0];
        return html`<tr>
            <td class="text-nowrap"><time datetime="${e.created_at}">${HRS.format.date(HRS.date.toISO(when))} ${when.toLocaleTimeString(HRS.config.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time></td>
            <td><span class="badge ${ACTION_BADGES[category] || ''}">${HRS.format.label(e.action.replace('.', ' '))}</span></td>
            <td class="font-mono text-nowrap">${e.reference}</td>
            <td>${e.description}</td>
            <td><div>${e.actor}</div><div class="text-xs text-muted">${HRS.format.label(e.actor_role)}</div></td>
          </tr>`;
      }));
    }

    function load() {
      return HRS.data.getActivityLog(HRS.validation.serialize(form)).then(function (list) {
        entries = list;
        renderRows();
      });
    }

    form.addEventListener('change', function () { pager.reset(); load(); });
    form.addEventListener('submit', function (event) { event.preventDefault(); });
    return load();
  };
})(window.HRS);
