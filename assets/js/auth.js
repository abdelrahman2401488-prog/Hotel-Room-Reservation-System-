/**
 * auth.js — DEMO sign-in, registration and sign-out screens.
 *
 * Credentials are checked in the browser against demo accounts
 * (HRS.data.authenticate). This is NOT secure authentication: the "session"
 * is a localStorage entry (HRS.session in main.js) that anyone can edit.
 * BACKEND INTEGRATION: let the forms POST to login.php / register.php and
 * handle credentials with password_hash()/password_verify() and PHP sessions.
 */
(function (HRS) {
  'use strict';

  var qs = HRS.dom.qs;
  var html = HRS.dom.html;
  var render = function (markup) { return markup.toString(); };

  // Admin -> Admin dashboard, Staff -> Staff dashboard, Guest -> My bookings,
  // unless a safe ?redirect= target the role may open was requested.
  function redirectAfterLogin(user) {
    var redirect = HRS.url.param('redirect');
    HRS.url.go(HRS.url.isSafeRedirect(redirect) ? redirect : HRS.session.homeFor(user.role));
  }

  HRS.pages.login = function () {
    var form = qs('[data-form="login"]');
    var current = HRS.session.current();
    if (current) {
      var notice = document.createElement('div');
      notice.className = 'alert alert-info';
      notice.innerHTML = render(html`<span>You are signed in as <strong>${current.full_name}</strong> (${current.role}, demo).
        <a href="${HRS.url.to(HRS.session.homeFor(current.role))}">Go to your ${current.role === 'guest' ? 'bookings' : 'dashboard'}</a>
        or <a href="${HRS.url.to('logout.php')}">sign out</a> to switch accounts.</span>`);
      form.parentElement.insertBefore(notice, form);
    }

    HRS.dom.on(qs('[data-region="demo-accounts"]'), 'click', '[data-email]', function (event, button) {
      form.elements.email.value = button.dataset.email;
      form.elements.password.value = button.dataset.password;
      HRS.validation.validateField(form.elements.email);
      HRS.validation.validateField(form.elements.password);
      form.querySelector('[type="submit"]').focus();
    });

    HRS.validation.attach(form, {
      onSubmit: function (values, form, submit) {
        HRS.ui.setLoading(submit, true, 'Signing in…');
        return HRS.data.authenticate(values.email, values.password).then(function (user) {
          HRS.session.signIn(user);
          HRS.ui.flash('Signed in as ' + user.full_name + ' (' + user.role + ' demo account).', { type: 'success', title: 'Welcome back' });
          redirectAfterLogin(user);
        }, function (error) {
          form.elements.password.value = '';
          throw error;
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
          HRS.ui.flash('Your demo guest account is ready. You can sign in again with the same email and password.', { type: 'success', title: 'Welcome, ' + user.full_name.split(' ')[0] });
          HRS.url.go(HRS.session.homeFor('guest'));
        });
      }
    });
  };

  HRS.pages.logout = function () {
    HRS.session.signOut();
    HRS.ui.applyRoleNav(null);
  };
})(window.HRS);
