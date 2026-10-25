/**
 * reviews.js — review submission with live preview (guest/leave_review.php)
 * and the public review list with staff moderation (reviews/list_reviews.php).
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;

  /* ---------------- Leave a review ---------------- */

  HRS.pages['leave-review'] = function () {
    var user = HRS.session.current();
    if (!user) {
      HRS.ui.emptyState('[data-region="review-page"]', {
        title: 'Sign in to review your stay',
        message: 'Reviews are linked to a completed booking.',
        href: HRS.url.to('login.php', { redirect: 'guest/leave_review.php' }), action: 'Sign in (demo)'
      });
      return;
    }

    return Promise.all([
      HRS.data.getReservations({ user_id: user.user_id, guest_email: user.email }),
      HRS.data.getReviews({ user_id: user.user_id })
    ]).then(function (results) {
      var reviewed = results[1].map(function (rv) { return rv.reservation_id; });
      var stays = results[0].filter(function (r) {
        return (r.status === 'checked-out' || (r.status !== 'cancelled' && r.check_out_date < HRS.date.today())) &&
          reviewed.indexOf(r.reservation_id) === -1;
      });
      if (!stays.length) {
        HRS.ui.emptyState('[data-region="review-page"]', {
          title: 'No stays waiting for a review',
          message: 'You can review a stay after check-out. Thank you for the reviews you have already shared!',
          href: HRS.url.to('reviews/list_reviews.php'), action: 'Read guest reviews'
        });
        return;
      }

      var form = qs('[data-form="review"]');
      var preselect = HRS.url.param('ref');
      var selected = stays.filter(function (r) { return r.booking_reference === preselect; })[0];
      HRS.dom.fillSelect(form.elements.reservation_id, [{ value: '', label: 'Select a stay…' }].concat(stays.map(function (r) {
        return { value: String(r.reservation_id), label: r.booking_reference + ' · ' + (r.room ? r.room.title : 'Room') + ' · ' + HRS.format.date(r.check_in_date) };
      })), selected ? String(selected.reservation_id) : '');

      function stay() {
        return stays.filter(function (r) { return String(r.reservation_id) === form.elements.reservation_id.value; })[0];
      }

      function preview() {
        var values = HRS.validation.serialize(form);
        var s = stay();
        qs('[data-region="char-count"]').textContent = (values.comment || '').length;
        HRS.dom.render('[data-region="preview"]', HRS.views.reviewCard({
          guest_name: user.full_name,
          created_at: HRS.date.today(),
          room_label: s && s.room ? s.room.title + ' (' + s.room.room_number + ')' : '',
          rating: values.rating || 0,
          title: values.title || 'Your review title',
          comment: values.comment || 'Your comments will appear here as you type.'
        }));
      }
      form.addEventListener('input', preview);
      form.addEventListener('change', preview);
      preview();

      HRS.validation.attach(form, {
        onSubmit: function (values, form, submit) {
          HRS.ui.setLoading(submit, true, 'Publishing…');
          values.user_id = user.user_id;
          values.guest_name = user.full_name;
          return HRS.data.addReview(values).then(function () {
            HRS.ui.flash('Thank you! Your review is published (demo, this browser only).', { type: 'success' });
            HRS.url.go('reviews/list_reviews.php');
          });
        }
      });
    });
  };

  /* ---------------- Review list ---------------- */

  HRS.pages['list-reviews'] = function () {
    var form = qs('[data-form="review-filters"]');
    var canModerate = HRS.session.hasRole(['staff', 'admin']);
    if (canModerate) HRS.dom.qsa('[data-staff-only]').forEach(function (el) { el.hidden = false; });

    function renderSummary() {
      return HRS.data.getReviews({ status: 'published' }).then(function (all) {
        var avg = all.length ? all.reduce(function (s, r) { return s + r.rating; }, 0) / all.length : 0;
        HRS.ui.fillFields(document, { average: avg.toFixed(1), count: HRS.format.plural(all.length, 'review') });
        HRS.dom.render('[data-region="average-stars"]', HRS.views.stars(avg));
        HRS.dom.render('[data-region="distribution"]', HRS.views.barChart([5, 4, 3, 2, 1].map(function (stars) {
          var count = all.filter(function (r) { return r.rating === stars; }).length;
          return { label: stars + ' stars', value: count, display: String(count) };
        }), 'accent'));
      });
    }

    function render() {
      var filters = HRS.validation.serialize(form);
      if (!canModerate) filters.status = 'published';
      return HRS.data.getReviews(filters).then(function (reviews) {
        if (!reviews.length) {
          HRS.ui.emptyState('[data-region="reviews"]', { title: 'No reviews match', message: 'Try another rating or room type.' });
          return;
        }
        HRS.dom.render('[data-region="reviews"]', reviews.map(function (review) {
          var card = HRS.views.reviewCard(review);
          if (!canModerate) return card;
          var next = review.status === 'published' ? 'hidden' : 'published';
          return html`<div class="stack">
              ${card}
              <div class="flex items-center justify-between gap-2">
                ${HRS.views.statusBadge(review.status)}
                <button class="btn btn-ghost btn-sm" type="button" data-action="moderate" data-id="${review.review_id}" data-status="${next}">${next === 'hidden' ? 'Hide review' : 'Publish review'}</button>
              </div>
            </div>`;
        }));
      });
    }

    HRS.dom.on(qs('[data-region="reviews"]'), 'click', '[data-action="moderate"]', function (event, button) {
      HRS.data.setReviewStatus(button.dataset.id, button.dataset.status).then(function () {
        HRS.ui.toast('Review ' + (button.dataset.status === 'hidden' ? 'hidden from guests' : 'published') + ' (demo).', { type: 'success' });
        renderSummary();
        render();
      });
    });

    form.addEventListener('change', render);
    form.addEventListener('submit', function (event) { event.preventDefault(); render(); });
    renderSummary();
    return render();
  };
})(window.HRS);
