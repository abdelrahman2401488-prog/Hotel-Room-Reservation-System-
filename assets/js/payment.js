/**
 * payment.js — DEMO payment interface and receipt
 * (reservations/payment.php, reservations/payment_confirmation.php).
 *
 * Card fields are validated and formatted in the browser only. The full card
 * number and security code are never stored or sent anywhere; only the last
 * four digits are kept for the demo receipt.
 * BACKEND INTEGRATION: use a payment gateway's hosted fields / tokens and
 * confirm the payment server-side before marking the reservation paid.
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;

  var METHOD_LABELS = { card: 'Card', wallet: 'Digital wallet', pay_at_hotel: 'Pay at the hotel' };

  HRS.pages.payment = function () {
    var ref = HRS.url.param('ref');
    var form = qs('[data-form="payment"]');
    var payButton = qs('[data-region="pay-button"]');

    return HRS.data.getReservation(ref).then(function (r) {
      HRS.ui.fillFields(document, { booking_reference: r.booking_reference });
      if (r.payment_status === 'paid' || r.status === 'cancelled') {
        HRS.ui.emptyState('[data-region="payment-page"]', {
          title: r.status === 'cancelled' ? 'This booking was cancelled' : 'This booking is already paid',
          message: 'No payment is needed for ' + r.booking_reference + '.',
          href: HRS.url.to(r.status === 'cancelled' ? 'reservations/booking_status.php' : 'reservations/payment_confirmation.php', { ref: r.booking_reference }),
          action: r.status === 'cancelled' ? 'View booking' : 'View receipt'
        });
        return;
      }

      form.elements.booking_reference.value = r.booking_reference;
      form.elements.billing_email.value = r.guest_email;
      form.elements.cardholder_name.value = r.guest_name;
      qs('[data-region="back-link"]').href = HRS.url.to('guest/booking_confirmation.php', { ref: r.booking_reference });

      if (r.room) HRS.dom.render('[data-region="room-summary"]', HRS.views.roomMedia(r.room));
      HRS.dom.render('[data-region="stay"]', html`
        <h2 class="text-lg mb-1">${r.room ? r.room.title : 'Room'}</h2>
        <p class="text-sm text-muted mb-0">${HRS.format.date(r.check_in_date)} – ${HRS.format.date(r.check_out_date)} · ${HRS.format.plural(r.nights, 'night')} · ${HRS.format.plural(r.num_guests, 'guest')}</p>`);
      HRS.dom.render('[data-region="quote"]', HRS.views.summaryList(HRS.pricing.quote(r.room, r.check_in_date, r.check_out_date)));

      HRS.validation.maskCardNumber(form.elements.card_number);
      HRS.validation.maskExpiry(form.elements.card_expiry);

      function syncMethod() {
        var method = form.elements.payment_method.value;
        HRS.dom.qsa('[data-method-panel]', form).forEach(function (panel) { panel.hidden = panel.dataset.methodPanel !== method; });
        payButton.textContent = method === 'pay_at_hotel' ? 'Confirm booking' : 'Pay ' + HRS.format.currency(r.total_price);
      }
      HRS.dom.qsa('[name="payment_method"]', form).forEach(function (radio) { radio.addEventListener('change', syncMethod); });
      syncMethod();

      HRS.validation.attach(form, {
        onSubmit: function (values, form, submit) {
          HRS.ui.setLoading(submit, true, values.payment_method === 'pay_at_hotel' ? 'Confirming…' : 'Processing payment…');
          var details = {
            payment_method: values.payment_method,
            card_last4: values.payment_method === 'card' ? values.card_number.replace(/\D/g, '').slice(-4) : ''
          };
          // Clear sensitive fields immediately; they are never persisted.
          form.elements.card_number.value = '';
          form.elements.card_cvc.value = '';
          return new Promise(function (resolve) { setTimeout(resolve, 1200); })
            .then(function () { return HRS.data.recordPayment(r.booking_reference, details); })
            .then(function () { HRS.url.go('reservations/payment_confirmation.php', { ref: r.booking_reference }); });
        }
      });
    }).catch(function () {
      HRS.ui.emptyState('[data-region="payment-page"]', {
        title: 'Booking not found',
        message: 'Open the payment page from your booking confirmation or My bookings.',
        href: HRS.url.to('guest/my_bookings.php'), action: 'My bookings'
      });
    });
  };

  HRS.pages['payment-confirmation'] = function () {
    var ref = HRS.url.param('ref');
    qs('[data-action="print"]').addEventListener('click', function () { window.print(); });

    return HRS.data.getReservation(ref).then(function (r) {
      return HRS.data.getPaymentForReservation(r.reservation_id).then(function (payment) {
        if (!payment) {
          HRS.ui.emptyState('[data-region="receipt"]', {
            title: 'No payment recorded yet',
            message: 'Booking ' + r.booking_reference + ' has not been paid.',
            href: HRS.url.to('reservations/payment.php', { ref: r.booking_reference }), action: 'Pay now'
          });
          return;
        }
        var atHotel = payment.payment_method === 'pay_at_hotel';
        HRS.ui.fillFields(document, {
          heading: atHotel ? 'Booking confirmed' : payment.status === 'refunded' ? 'Payment refunded' : 'Payment successful',
          subheading: atHotel ? 'Your room is held. Please pay at reception on arrival.' : 'Thank you. A receipt has been prepared for ' + r.guest_email + ' (demo, no email sent).',
          amount: HRS.format.currency(payment.amount)
        });
        HRS.dom.render('[data-region="badges"]', HRS.views.statusBadge(payment.status));
        HRS.dom.render('[data-region="receipt-details"]', HRS.views.detailList([
          ['Transaction', html`<span class="font-mono">${payment.transaction_ref}</span>`],
          ['Booking', html`<span class="font-mono">${r.booking_reference}</span>`],
          ['Date', HRS.format.dateTime(payment.paid_at)],
          ['Method', METHOD_LABELS[payment.payment_method] + (payment.card_last4 ? ' ending ' + payment.card_last4 : '')],
          ['Guest', r.guest_name],
          ['Stay', (r.room ? r.room.title + ' · ' : '') + HRS.format.date(r.check_in_date) + ' – ' + HRS.format.date(r.check_out_date)],
          payment.refund_amount ? ['Refunded', HRS.format.currency(payment.refund_amount)] : ['Booking status', HRS.format.label(r.status)]
        ]));
        qs('[data-region="status-link"]').href = HRS.url.to('reservations/booking_status.php', { ref: r.booking_reference });
      });
    }).catch(function () {
      HRS.ui.emptyState('[data-region="receipt"]', {
        title: 'Receipt not found', message: 'We could not find that booking.',
        href: HRS.url.to('guest/my_bookings.php'), action: 'My bookings'
      });
    });
  };
})(window.HRS);
