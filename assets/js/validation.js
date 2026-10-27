/**
 * validation.js — client-side form validation (UX only).
 *
 * Forms opt in with HRS.validation.attach(form, { onSubmit }) and describe
 * their rules in markup, so the same fields can later post to PHP:
 *
 *   required                      native attribute
 *   type="email"                  email format
 *   minlength / maxlength         text length
 *   min / max                     numbers and dates
 *   data-rule="phone"             also: card-number, expiry, cvc, password, date-not-past
 *   data-match="password"         must equal the field named "password"
 *   data-after="check_in_date"    date must be after another date field
 *   data-error-required="..."     custom "required" message
 *
 * BACKEND INTEGRATION: the PHP handlers must repeat every check server-side.
 * Client-side validation can be bypassed and is never a security control.
 * Server errors can be shown with HRS.validation.setError(field, message).
 */
(function (HRS) {
  'use strict';

  function labelFor(field) {
    var label = field.id && field.form ? field.form.querySelector('label[for="' + field.id + '"]') : null;
    if (!label && field.closest('fieldset')) label = field.closest('fieldset').querySelector('legend');
    var text = label ? label.textContent : (field.getAttribute('aria-label') || field.name || 'This field');
    return text.replace(/\*/g, '').replace(/\(.*?\)/g, '').trim();
  }

  function otherField(field, name) {
    return field.form ? field.form.elements.namedItem(name) : null;
  }

  function digits(value) { return String(value).replace(/\D/g, ''); }

  function luhn(number) {
    var sum = 0;
    var alt = false;
    for (var i = number.length - 1; i >= 0; i--) {
      var n = parseInt(number.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  var rules = {
    phone: function (value) {
      return /^\+?[\d\s()-]{7,20}$/.test(value) && digits(value).length >= 7 ? '' : 'Enter a valid phone number.';
    },
    password: function (value) {
      if (value.length < 8) return 'Use at least 8 characters.';
      if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use both letters and numbers.';
      return '';
    },
    'card-number': function (value) {
      var n = digits(value);
      return n.length >= 13 && n.length <= 19 && luhn(n) ? '' : 'Enter a valid card number.';
    },
    expiry: function (value) {
      var match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value);
      if (!match) return 'Use the format MM/YY.';
      var month = Number(match[1]);
      var year = 2000 + Number(match[2]);
      if (month < 1 || month > 12) return 'Enter a valid month.';
      var now = new Date();
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'This card has expired.';
      return '';
    },
    cvc: function (value) {
      return /^\d{3,4}$/.test(value) ? '' : 'Enter the 3 or 4 digit security code.';
    },
    'date-not-past': function (value) {
      return value >= HRS.date.today() ? '' : 'Choose today or a later date.';
    }
  };

  function isGroup(field) {
    return field.type === 'radio' || (field.type === 'checkbox' && field.dataset.group !== undefined);
  }

  function groupFields(field) {
    return field.form ? HRS.dom.qsa('[name="' + field.name + '"]', field.form) : [field];
  }

  // Returns an error message, or '' when valid
  function check(field) {
    if (field.disabled || field.type === 'hidden' || field.closest('[hidden]')) return '';
    var name = labelFor(field);

    if (isGroup(field)) {
      var any = groupFields(field).some(function (f) { return f.checked; });
      var required = groupFields(field).some(function (f) { return f.required; });
      return required && !any ? (field.dataset.errorRequired || 'Please choose ' + name.toLowerCase() + '.') : '';
    }

    if (field.type === 'checkbox') {
      return field.required && !field.checked ? (field.dataset.errorRequired || 'Please confirm to continue.') : '';
    }

    var value = (field.value || '').trim();
    if (!value) {
      if (field.required) return field.dataset.errorRequired || name + ' is required.';
      return field._customValidator ? field._customValidator(value, field) || '' : '';
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address.';

    var min = field.getAttribute('minlength');
    if (min && value.length < Number(min)) return name + ' must be at least ' + min + ' characters.';
    var max = field.getAttribute('maxlength');
    if (max && value.length > Number(max)) return name + ' must be at most ' + max + ' characters.';

    if (field.pattern && !new RegExp('^(?:' + field.pattern + ')$').test(value)) {
      return field.dataset.errorPattern || name + ' contains invalid characters.';
    }

    if (field.type === 'number') {
      var num = Number(value);
      if (isNaN(num)) return name + ' must be a number.';
      if (field.min !== '' && num < Number(field.min)) return name + ' must be at least ' + field.min + '.';
      if (field.max !== '' && num > Number(field.max)) return name + ' must be at most ' + field.max + '.';
    }

    if (field.type === 'date') {
      if (!HRS.date.parse(value)) return 'Enter a valid date.';
      if (field.min && value < field.min) return name + ' cannot be before ' + HRS.format.date(field.min) + '.';
      if (field.max && value > field.max) return field.dataset.errorMax || name + ' cannot be after ' + HRS.format.date(field.max) + '.';
    }

    var ruleNames = (field.dataset.rule || '').split(/\s+/).filter(Boolean);
    for (var i = 0; i < ruleNames.length; i++) {
      var rule = rules[ruleNames[i]];
      var message = rule ? rule(value, field) : '';
      if (message) return message;
    }

    if (field.dataset.match) {
      var other = otherField(field, field.dataset.match);
      if (other && other.value !== field.value) return field.dataset.errorMatch || 'Values do not match.';
    }

    if (field.dataset.after) {
      var start = otherField(field, field.dataset.after);
      if (start && start.value && value <= start.value) return field.dataset.errorAfter || name + ' must be after ' + labelFor(start).toLowerCase() + '.';
    }

    if (field._customValidator) {
      var custom = field._customValidator(value, field);
      if (custom) return custom;
    }
    return '';
  }

  function errorElement(field, create) {
    var key = isGroup(field) ? field.name : (field.id || field.name);
    var id = key + '-error';
    var el = document.getElementById(id);
    if (!el && create) {
      el = document.createElement('p');
      el.className = 'form-error';
      el.id = id;
      el.setAttribute('aria-live', 'polite');
      var anchor = isGroup(field) ? (field.closest('fieldset') || field.parentElement) : field;
      var group = anchor.closest('.form-group');
      if (group && !isGroup(field)) group.appendChild(el);
      else anchor.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  function setError(field, message) {
    var targets = isGroup(field) ? groupFields(field) : [field];
    var el = errorElement(field, !!message);
    targets.forEach(function (f) {
      f.classList.toggle('is-invalid', !!message);
      f.classList.toggle('is-valid', !message && !!(f.value && f.type !== 'radio' && f.type !== 'checkbox'));
      if (message) {
        f.setAttribute('aria-invalid', 'true');
        if (el) f.setAttribute('aria-describedby', el.id);
      } else {
        f.removeAttribute('aria-invalid');
      }
    });
    if (el) {
      el.textContent = message || '';
      el.hidden = !message;
    }
    return !message;
  }

  function validateField(field) {
    return setError(field, check(field));
  }

  function fields(form) {
    return HRS.dom.qsa('input, select, textarea', form).filter(function (f) {
      return f.name && f.type !== 'submit' && f.type !== 'button';
    });
  }

  function validateForm(form) {
    var seenGroups = {};
    var firstInvalid = null;
    fields(form).forEach(function (field) {
      if (isGroup(field)) {
        if (seenGroups[field.name]) return;
        seenGroups[field.name] = true;
      }
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // Plain object of form values; repeated names (checkbox groups) become arrays
  function serialize(form) {
    var data = {};
    var multi = {};
    fields(form).forEach(function (f) { if (f.type === 'checkbox' && f.dataset.group !== undefined) multi[f.name] = true; });
    new FormData(form).forEach(function (value, key) {
      if (value instanceof File) return;
      value = typeof value === 'string' ? value.trim() : value;
      if (multi[key]) { (data[key] = data[key] || []).push(value); }
      else data[key] = value;
    });
    Object.keys(multi).forEach(function (key) { if (!data[key]) data[key] = []; });
    return data;
  }

  /**
   * attach(form, {
   *   onSubmit(values, form) -> may return a Promise; errors are toasted
   *   validators: { fieldName: function (value, field) -> message | '' }
   * })
   */
  function attach(form, options) {
    if (!form) return;
    options = options || {};
    form.setAttribute('novalidate', '');

    Object.keys(options.validators || {}).forEach(function (name) {
      var field = form.elements.namedItem(name);
      if (field && !field.length) field._customValidator = options.validators[name];
    });

    form.addEventListener('blur', function (event) {
      var field = event.target;
      if (field.name && field.matches('input, select, textarea') && (field.value || field.classList.contains('is-invalid'))) validateField(field);
    }, true);

    form.addEventListener('input', function (event) {
      if (event.target.classList.contains('is-invalid')) validateField(event.target);
    });

    form.addEventListener('change', function (event) {
      var field = event.target;
      if (isGroup(field) || field.type === 'checkbox' || field.tagName === 'SELECT') validateField(field);
      // Re-check dependants, e.g. check-out after check-in changes
      HRS.dom.qsa('[data-after="' + field.name + '"], [data-match="' + field.name + '"]', form).forEach(function (dep) {
        if (dep.value) validateField(dep);
      });
    });

    form.addEventListener('submit', function (event) {
      // DEMO: everything is handled in the browser. Remove preventDefault
      // (or post via fetch) once the PHP handler for this form exists.
      event.preventDefault();
      if (!validateForm(form)) {
        HRS.ui.toast('Please fix the highlighted fields.', { type: 'error' });
        return;
      }
      if (!options.onSubmit) return;
      var submit = form.querySelector('[type="submit"]');
      Promise.resolve()
        .then(function () { return options.onSubmit(serialize(form), form, submit); })
        .catch(function (error) {
          HRS.ui.setLoading(submit, false);
          if (error && error.field && form.elements.namedItem(error.field)) {
            setError(form.elements.namedItem(error.field), error.message);
            form.elements.namedItem(error.field).focus();
          }
          HRS.ui.toast((error && error.message) || 'Something went wrong.', { type: 'error' });
        });
    });
  }

  function reset(form) {
    form.reset();
    fields(form).forEach(function (f) {
      f.classList.remove('is-invalid', 'is-valid');
      f.removeAttribute('aria-invalid');
    });
    HRS.dom.qsa('.form-error', form).forEach(function (el) { el.textContent = ''; el.hidden = true; });
  }

  // Input masks for payment fields (formatting only)
  function maskCardNumber(input) {
    input.addEventListener('input', function () {
      input.value = digits(input.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }

  function maskExpiry(input) {
    input.addEventListener('input', function () {
      var d = digits(input.value).slice(0, 4);
      input.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    });
  }

  // 0-4 score for the password strength meter
  function passwordScore(value) {
    var score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }

  HRS.validation = {
    rules: rules,
    attach: attach,
    check: check,
    validateField: validateField,
    validateForm: validateForm,
    setError: setError,
    serialize: serialize,
    reset: reset,
    maskCardNumber: maskCardNumber,
    maskExpiry: maskExpiry,
    passwordScore: passwordScore,
    luhn: function (value) { return luhn(digits(value)); }
  };
})(window.HRS);
