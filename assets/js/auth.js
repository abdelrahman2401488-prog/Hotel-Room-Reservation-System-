/**
 * auth.js — DEMO sign-in, registration and sign-out screens.
 *
 * This is interface behaviour only. No password is verified or stored, and
 * the "session" is a localStorage entry (HRS.session in main.js).
 * BACKEND INTEGRATION: let the forms POST to login.php / register.php and
 * handle credentials with password_hash()/password_verify() and PHP sessions.
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;

  function redirectAfterLogin(user) {
    var redirect = HRS.url.param('redirect');
    // Only allow relative in-project paths (no open redirects)
    if (redirect && /^[a-z_]+\/[a-z_]+\.php$|^[a-z_]+\.php$/.test(redirect)) return HRS.url.go(redirect);
    HRS.url.go(HRS.session.homeFor(user.role));
  }

  HRS.pages.login = function () {
    var form = qs('[data-form="login"]');
    var current = HRS.session.current();
    if (current) {
      HRS.ui.toast('You are already signed in as ' + current.full_name + ' (demo).', { type: 'info' });
    }

    HRS.dom.on(qs('[data-region="demo-accounts"]'), 'click', '[data-email]', function (event, button) {
      form.elements.email.value = button.dataset.email;
      form.elements.password.value = 'demo-password';
      HRS.validation.validateField(form.elements.email);
      HRS.validation.validateField(form.elements.password);
      form.querySelector('[type="submit"]').focus();
    });

    HRS.validation.attach(form, {
      onSubmit: function (values, form, submit) {
        HRS.ui.setLoading(submit, true, 'Signing in…');
        return HRS.data.findUserByEmail(values.email).then(function (user) {
          HRS.session.signIn(user);
          HRS.ui.flash('Signed in as ' + user.full_name + ' (' + user.role + ' demo account).', { type: 'success', title: 'Welcome back' });
          redirectAfterLogin(user);
        });
      }
    });
  };

  HRS.pages.register = function () {
    var form = qs('[data-form="register"]');
    var bar = qs('[data-region="strength-bar"]');
    var label = qs('[data-region="strength-label"]');
    var labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

    form.elements.password.addEventListener('input', function () {
      var value = form.elements.password.value;
      var score = HRS.validation.passwordScore(value);
      bar.value = score;
      bar.className = 'bar ' + (score <= 1 ? 'bar-error' : score === 2 ? 'bar-warning' : 'bar-success');
      label.textContent = value ? labels[score] : '8+ characters, letters and numbers';
    });

    HRS.validation.attach(form, {
      onSubmit: function (values, form, submit) {
        HRS.ui.setLoading(submit, true, 'Creating account…');
        return HRS.data.createUser(values).then(function (user) {
          HRS.session.signIn(user);
          HRS.ui.flash('Your demo guest account is ready.', { type: 'success', title: 'Welcome, ' + user.full_name.split(' ')[0] });
          HRS.url.go('guest/search_rooms.php');
        });
      }
    });
  };

  HRS.pages.logout = function () {
    HRS.session.signOut();
    HRS.dom.qsa('[data-auth]').forEach(function (el) { el.hidden = el.dataset.auth === 'signed-in'; });
  };
})(window.HRS);
