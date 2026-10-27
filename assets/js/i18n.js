/**
 * i18n.js — NFR-17 English / Arabic switch with right-to-left layout.
 *
 * Loaded in <head> (includes/header.php) so lang/dir are set before the page
 * paints. The choice is stored in localStorage ("hrs_lang") and restored on
 * every page load.
 *
 * How it works: the page markup stays English. In Arabic mode, text nodes and
 * placeholder / aria-label / title attributes whose text exactly matches a
 * dictionary entry (or a pattern such as "Email is required.") are replaced;
 * content rendered later by the page scripts is translated as it appears
 * (MutationObserver). The English original is kept on each node, so
 * switching back restores it exactly. Room names, booking codes, dates and
 * numbers are not in the dictionary and are never changed. Text inside
 * [data-no-i18n] or .font-mono (codes) is skipped.
 *
 * BACKEND INTEGRATION: PHP could render the chosen language server-side
 * (e.g. a "lang" cookie + translation arrays) using the same keys.
 */
window.HRS = window.HRS || {};

(function (HRS) {
  'use strict';

  var STORAGE_KEY = 'hrs_lang';
  var LANGS = { en: { dir: 'ltr', name: 'English' }, ar: { dir: 'rtl', name: 'العربية' } };

  function storedLang() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return LANGS[value] ? value : 'en';
    } catch (e) { return 'en'; }
  }

  var lang = storedLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGS[lang].dir;

  /* ------------------------------------------------------------------
     Arabic dictionary: main navigation, common buttons, form labels,
     validation messages, room and booking vocabulary.
     ------------------------------------------------------------------ */

  var AR = {
    // Navigation and shared layout
    'Home': 'الرئيسية', 'Rooms': 'الغرف', 'My Bookings': 'حجوزاتي', 'My bookings': 'حجوزاتي', 'Reviews': 'التقييمات',
    'Booking status': 'حالة الحجز', 'Staff Dashboard': 'لوحة الموظفين', 'Admin Dashboard': 'لوحة الإدارة',
    'Check-in / out': 'تسجيل الوصول / المغادرة', 'Room service': 'خدمة الغرف', 'Complaints': 'الشكاوى',
    'Pricing': 'الأسعار', 'Reservations': 'الحجوزات', 'Reports': 'التقارير', 'Sign in': 'تسجيل الدخول',
    'Register': 'إنشاء حساب', 'Sign out': 'تسجيل الخروج', 'Menu': 'القائمة', 'Reset demo data': 'إعادة ضبط البيانات التجريبية',
    'Prototype mode:': 'وضع النموذج التجريبي:',
    'all rooms, bookings, payments and accounts are sample data stored in this browser. Demo sign-in is not real security. Nothing is sent to a server.':
      'جميع الغرف والحجوزات والمدفوعات والحسابات بيانات تجريبية محفوظة في هذا المتصفح. تسجيل الدخول التجريبي ليس حماية حقيقية، ولا يُرسل أي شيء إلى خادم.',
    'Explore': 'استكشف', 'Account': 'الحساب', 'Operations': 'العمليات', 'Find a room': 'ابحث عن غرفة',
    'Guest reviews': 'تقييمات الضيوف', 'Create account': 'إنشاء حساب', 'Review a stay': 'قيّم إقامتك',
    'Staff dashboard': 'لوحة الموظفين', 'Admin dashboard': 'لوحة الإدارة', 'Manage rooms': 'إدارة الغرف',
    'Privacy policy': 'سياسة الخصوصية', 'Privacy Policy': 'سياسة الخصوصية',
    'Thoughtfully designed rooms and suites by the sea, with service built around you.': 'غرف وأجنحة مصممة بعناية على البحر، بخدمة تتمحور حولك.',
    'Frontend prototype · demo data only': 'نموذج واجهة أمامية · بيانات تجريبية فقط',
    // Sidebars
    'Admin console': 'لوحة تحكم الإدارة', 'Staff console': 'لوحة تحكم الموظفين', 'Administration': 'الإدارة', 'Business': 'الأعمال',
    'Dashboard': 'لوحة التحكم', 'Add room': 'إضافة غرفة', 'Booking reports': 'تقارير الحجوزات', 'Revenue reports': 'تقارير الإيرادات',
    'Activity log': 'سجل النشاط', 'Front desk': 'الاستقبال', 'Guest care': 'رعاية الضيوف', 'Insights': 'التحليلات',
    // Common buttons
    'View room': 'عرض الغرفة', 'Select': 'اختيار', 'Book a new stay': 'احجز إقامة جديدة', 'Continue to booking': 'متابعة الحجز',
    'Confirm booking': 'تأكيد الحجز', 'Pay now': 'ادفع الآن', 'Modify': 'تعديل', 'Cancel': 'إلغاء', 'Cancel booking': 'إلغاء الحجز',
    'Details': 'التفاصيل', 'Write a review': 'اكتب تقييمًا', 'Save': 'حفظ', 'Save room': 'حفظ الغرفة', 'Save settings': 'حفظ الإعدادات',
    'Export CSV': 'تصدير CSV', 'Print': 'طباعة', 'Clear': 'مسح', 'Clear filters': 'مسح عوامل التصفية', 'Update results': 'تحديث النتائج',
    'Check availability': 'تحقق من التوفر', 'Find booking': 'ابحث عن الحجز', 'Use': 'استخدام', 'Edit': 'تعديل', 'Delete': 'حذف',
    'View': 'عرض', 'Previous': 'السابق', 'Next': 'التالي', 'Back': 'رجوع', 'Back to rooms': 'العودة إلى الغرف',
    'Keep my booking': 'الإبقاء على حجزي', 'Browse all rooms': 'تصفح جميع الغرف', 'Read all reviews': 'اقرأ جميع التقييمات',
    'Check booking status': 'تحقق من حالة الحجز', 'Check in': 'تسجيل الوصول', 'Check out': 'تسجيل المغادرة', 'Status': 'الحالة',
    'Update': 'تحديث', 'Reset': 'إعادة ضبط', 'Publish review': 'نشر التقييم', 'Add request': 'إضافة طلب', 'Log complaint': 'تسجيل شكوى',
    'Add seasonal rule': 'إضافة قاعدة موسمية', 'View all': 'عرض الكل', 'All': 'الكل', 'Manage': 'إدارة',
    'Discard changes': 'تجاهل التغييرات', 'Review & save changes': 'مراجعة التغييرات وحفظها', 'View booking status': 'عرض حالة الحجز',
    'Print receipt': 'طباعة الإيصال', 'Remove photo': 'إزالة الصورة', 'Pay': 'ادفع', 'Confirm': 'تأكيد',
    // Form labels and placeholders
    'Email': 'البريد الإلكتروني', 'Password': 'كلمة المرور', 'Full name': 'الاسم الكامل', 'Phone': 'رقم الهاتف',
    'Confirm password': 'تأكيد كلمة المرور', 'Check-in': 'تاريخ الوصول', 'Check-out': 'تاريخ المغادرة', 'Guests': 'الضيوف',
    'Room type': 'نوع الغرفة', 'Type': 'النوع', 'Min': 'الأدنى', 'Max': 'الأعلى', 'Amenities': 'المرافق', 'Sort by': 'ترتيب حسب',
    'Payment': 'الدفع', 'Search': 'بحث', 'Stay from': 'الإقامة من', 'Stay to': 'الإقامة حتى', 'Booking reference': 'رقم الحجز',
    'Special requests': 'طلبات خاصة', 'Estimated arrival time': 'وقت الوصول المتوقع', 'Name on card': 'الاسم على البطاقة',
    'Card number': 'رقم البطاقة', 'Expiry (MM/YY)': 'تاريخ الانتهاء (شهر/سنة)', 'Security code': 'رمز الأمان',
    'Receipt email': 'البريد الإلكتروني للإيصال', 'Payment method': 'طريقة الدفع', 'Rating': 'التقييم', 'Title': 'العنوان',
    'Your review': 'تقييمك', 'Reason for cancelling': 'سبب الإلغاء', 'Check-in time': 'وقت تسجيل الوصول',
    'Check-out time': 'وقت تسجيل المغادرة', 'Currency': 'العملة', 'Price per night': 'السعر لليلة', 'Filters': 'عوامل التصفية',
    'Price per night (': 'السعر لليلة (', 'Base rate (': 'السعر الأساسي (', 'Overall rating': 'التقييم العام', 'Stay': 'الإقامة', 'Room': 'الغرفة',
    'Credit / debit card': 'بطاقة ائتمان / خصم', 'Digital wallet': 'محفظة رقمية', 'Pay at the hotel': 'الدفع في الفندق',
    'Keep me signed in': 'تذكرني',
    // Room and booking vocabulary
    'Single': 'مفردة', 'Double': 'مزدوجة', 'Deluxe': 'ديلوكس', 'Family': 'عائلية', 'Suite': 'جناح',
    'Any type': 'أي نوع', 'All types': 'جميع الأنواع', 'Any': 'أي', 'All statuses': 'جميع الحالات', 'All payments': 'جميع المدفوعات',
    'Available': 'متاحة', 'Occupied': 'مشغولة', 'Maintenance': 'صيانة', 'Pending': 'قيد الانتظار', 'Confirmed': 'مؤكد',
    'Checked in': 'تم تسجيل الوصول', 'Checked out': 'تم تسجيل المغادرة', 'Cancelled': 'ملغى', 'Paid': 'مدفوع', 'Refunded': 'مسترد',
    'Published': 'منشور', 'Hidden': 'مخفي', 'Open': 'مفتوح', 'In progress': 'قيد التنفيذ', 'Completed': 'مكتمل', 'Resolved': 'تم الحل',
    '/ night': '/ الليلة', '/ night from': '/ الليلة ابتداءً من', 'Total': 'الإجمالي', 'Seasonal pricing': 'تسعير موسمي',
    'Price summary': 'ملخص السعر', 'Stay details': 'تفاصيل الإقامة', 'Lead guest': 'الضيف الرئيسي', 'Stay summary': 'ملخص الإقامة',
    'Price': 'السعر', 'Reserve this room': 'احجز هذه الغرفة', 'About this room': 'عن هذه الغرفة', 'Upcoming': 'القادمة',
    'Past stays': 'الإقامات السابقة', 'Featured stays': 'إقامات مميزة', 'Rooms & suites': 'الغرف والأجنحة',
    'Wi-Fi': 'واي فاي', 'Air conditioning': 'تكييف', 'Smart TV': 'تلفاز ذكي', 'Mini bar': 'ميني بار', 'Sea view': 'إطلالة على البحر',
    'Balcony': 'شرفة', 'Bathtub': 'حوض استحمام', 'Kitchenette': 'مطبخ صغير', 'Lounge access': 'دخول الصالة', 'Jacuzzi': 'جاكوزي',
    'Coffee machine': 'آلة قهوة', 'Work desk': 'مكتب عمل', 'Safe': 'خزنة', 'Sleeps': 'يتسع لـ', 'Beds': 'الأسرّة', 'Size': 'المساحة',
    'Current status': 'الحالة الحالية', 'Nights': 'الليالي', 'Reference': 'المرجع', 'Guest': 'الضيف',
    'Actions': 'الإجراءات', 'Action': 'الإجراء', 'Booking': 'الحجز', 'Method': 'الطريقة', 'Date': 'التاريخ', 'Amount': 'المبلغ',
    'Transaction': 'المعاملة', 'Time': 'الوقت', 'Description': 'الوصف', 'User': 'المستخدم',
    // Page headings and short texts
    'Choose room': 'اختر الغرفة', 'Your details': 'بياناتك', 'Confirmation': 'التأكيد',
    'Find your room': 'ابحث عن غرفتك', 'Hotel settings': 'إعدادات الفندق', 'Base rates': 'الأسعار الأساسية',
    'Seasonal rules': 'القواعد الموسمية', 'Price preview': 'معاينة السعر', 'Complete your booking': 'أكمل حجزك',
    'Booking received': 'تم استلام الحجز', 'Booking confirmed': 'تم تأكيد الحجز', 'Payment successful': 'تم الدفع بنجاح',
    'Secure your booking': 'أمّن حجزك', 'Review your stay': 'قيّم إقامتك', 'Guest complaints': 'شكاوى الضيوف',
    'Room service & requests': 'خدمة الغرف والطلبات', 'Check-in & check-out': 'تسجيل الوصول والمغادرة',
    'A refined stay on the Mediterranean': 'إقامة راقية على البحر المتوسط', 'Demo accounts': 'الحسابات التجريبية', 'DEMO ONLY': 'تجريبي فقط',
    'Welcome back': 'مرحبًا بعودتك', 'Your stay, in one place': 'إقامتك في مكان واحد', 'What our guests say': 'ماذا يقول ضيوفنا',
    'Everything taken care of': 'كل شيء على ما يرام', 'Already booked?': 'هل حجزت بالفعل؟',
    'Choose your dates to see which rooms are free. Availability is calculated from demo bookings.': 'اختر تواريخك لمعرفة الغرف المتاحة. يُحسب التوفر من الحجوزات التجريبية.',
    'Select check-in and check-out dates to see live availability.': 'اختر تاريخي الوصول والمغادرة لمعرفة التوفر.',
    // Validation and status messages
    'Enter a valid email address.': 'أدخل بريدًا إلكترونيًا صالحًا.', 'Enter a valid phone number.': 'أدخل رقم هاتف صالحًا.',
    'Use at least 8 characters.': 'استخدم 8 أحرف على الأقل.', 'Use both letters and numbers.': 'استخدم أحرفًا وأرقامًا معًا.',
    'Passwords do not match.': 'كلمتا المرور غير متطابقتين.', 'Please fix the highlighted fields.': 'يرجى تصحيح الحقول المحددة.',
    'Check-out must be after check-in.': 'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.', 'Enter a valid date.': 'أدخل تاريخًا صالحًا.',
    'Check-in cannot be in the past.': 'لا يمكن أن يكون تاريخ الوصول في الماضي.', 'Choose today or a later date.': 'اختر اليوم أو تاريخًا لاحقًا.',
    'Please accept the terms to continue.': 'يرجى الموافقة على الشروط للمتابعة.', 'Enter a valid card number.': 'أدخل رقم بطاقة صالحًا.',
    'This card has expired.': 'انتهت صلاحية هذه البطاقة.', 'Use the format MM/YY.': 'استخدم الصيغة شهر/سنة.',
    'Please confirm to continue.': 'يرجى التأكيد للمتابعة.', 'Loading rooms…': 'جارٍ تحميل الغرف…', 'Loading reservations…': 'جارٍ تحميل الحجوزات…',
    'Signing in…': 'جارٍ تسجيل الدخول…', 'Saving…': 'جارٍ الحفظ…', 'No rooms match these filters.': 'لا توجد غرف مطابقة لعوامل التصفية.',
    'No reservations match these filters.': 'لا توجد حجوزات مطابقة لعوامل التصفية.', 'No bookings in this range.': 'لا توجد حجوزات في هذه الفترة.',
    'No payments in this range.': 'لا توجد مدفوعات في هذه الفترة.', 'No activity recorded yet': 'لم يُسجل أي نشاط بعد'
  };

  function ar(text) { return Object.prototype.hasOwnProperty.call(AR, text) ? AR[text] : null; }
  function plural(n, one, many) { return Number(n) === 1 ? one : many; }

  // Composed strings: the parts that are data (numbers, room numbers, dates) are kept
  var PATTERNS = [
    [/^Page (\d+) of (\d+) · (\d+)–(\d+) of (\d+)$/, function (m) { return 'صفحة ' + m[1] + ' من ' + m[2] + ' · ' + m[3] + '–' + m[4] + ' من ' + m[5]; }],
    [/^(.+) is required\.$/, function (m) { return (ar(m[1]) || m[1]) + ' مطلوب.'; }],
    [/^(\d+) guests?$/, function (m) { return m[1] + ' ' + plural(m[1], 'ضيف', 'ضيوف'); }],
    [/^(\d+) nights?$/, function (m) { return m[1] + ' ' + plural(m[1], 'ليلة', 'ليالٍ'); }],
    [/^(\d+) rooms?$/, function (m) { return m[1] + ' ' + plural(m[1], 'غرفة', 'غرف'); }],
    [/^(\d+) available rooms?$/, function (m) { return m[1] + ' ' + plural(m[1], 'غرفة متاحة', 'غرف متاحة'); }],
    [/^Up to (\d+) guests?$/, function (m) { return 'حتى ' + m[1] + ' ' + plural(m[1], 'ضيف', 'ضيوف'); }],
    [/^Room (\S+)$/, function (m) { return 'غرفة ' + m[1]; }],
    [/^Service charge \((\d+%)\)$/, function (m) { return 'رسوم الخدمة (' + m[1] + ')'; }],
    [/^VAT \((\d+%)\)$/, function (m) { return 'ضريبة القيمة المضافة (' + m[1] + ')'; }],
    [/^Stays are limited to (\d+) nights\. Choose a check-out on or before (.+)\.$/, function (m) { return 'الحد الأقصى للإقامة ' + m[1] + ' ليلة. اختر تاريخ مغادرة في موعد أقصاه ' + m[2] + '.'; }],
    [/^Bookings can be made up to (\d+) days in advance \(latest check-in (.+)\)\.$/, function (m) { return 'يمكن الحجز قبل ' + m[1] + ' يومًا كحد أقصى (آخر تاريخ وصول ' + m[2] + ').'; }],
    [/^Incorrect email or password\. (\d+) attempts? left before sign-in is locked for (\d+) minutes\.$/, function (m) { return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تبقى ' + m[1] + ' محاولات قبل قفل تسجيل الدخول لمدة ' + m[2] + ' دقائق.'; }],
    [/^Too many failed sign-in attempts\. Demo sign-in is locked (?:for (\d+) minutes|— try again in (\d+) minutes?)\.$/, function (m) { return 'محاولات فاشلة كثيرة. تم قفل تسجيل الدخول التجريبي لمدة ' + (m[1] || m[2]) + ' دقائق.'; }],
    [/^(.+) \| The Developers Hotel$/, function (m) { return (ar(m[1]) || m[1]) + ' | The Developers Hotel'; }]
  ];

  function translate(text) {
    var trimmed = text.trim();
    if (!trimmed) return text;
    var out = ar(trimmed);
    if (out === null) {
      for (var i = 0; i < PATTERNS.length && out === null; i++) {
        var m = PATTERNS[i][0].exec(trimmed);
        if (m) out = PATTERNS[i][1](m);
      }
    }
    if (out === null) return text;
    // keep surrounding whitespace so inline spacing is unchanged
    return text.slice(0, text.indexOf(trimmed)) + out + text.slice(text.indexOf(trimmed) + trimmed.length);
  }

  var ATTRS = ['placeholder', 'aria-label', 'title'];
  var SKIP = 'script, style, textarea, [data-no-i18n], .font-mono';

  // Stores the English original on the node; re-captures it when page code
  // has replaced our translated value with new English text.
  function applyText(node) {
    if (node.__i18nOut !== node.nodeValue) node.__i18nEn = node.nodeValue;
    var out = lang === 'ar' ? translate(node.__i18nEn) : node.__i18nEn;
    if (out !== node.nodeValue) node.nodeValue = out;
    node.__i18nOut = out;
  }

  function applyAttrs(el) {
    el.__i18nAttrs = el.__i18nAttrs || {};
    ATTRS.forEach(function (attr) {
      if (!el.hasAttribute(attr)) return;
      var store = el.__i18nAttrs[attr] = el.__i18nAttrs[attr] || {};
      var current = el.getAttribute(attr);
      if (store.out !== current) store.en = current;
      var out = lang === 'ar' ? translate(store.en) : store.en;
      if (out !== current) el.setAttribute(attr, out);
      store.out = out;
    });
  }

  function applyTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!root.parentElement || !root.parentElement.closest(SKIP)) applyText(root); return; }
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    applyAttrs(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (n) {
        if (n.nodeType === 1) return n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === 3) applyText(n); else applyAttrs(n);
    }
  }

  var titleEn = null;
  var titleOut = null;
  function applyTitle() {
    if (document.title !== titleOut) titleEn = document.title; // page code set a new title
    titleOut = lang === 'ar' ? translate(titleEn) : titleEn;
    if (document.title !== titleOut) document.title = titleOut;
  }

  function updateSwitch() {
    var other = lang === 'ar' ? 'en' : 'ar';
    Array.prototype.forEach.call(document.querySelectorAll('[data-action="toggle-language"]'), function (button) {
      button.textContent = LANGS[other].name;
      button.setAttribute('lang', other);
      button.setAttribute('aria-label', other === 'ar' ? 'التبديل إلى العربية' : 'Switch to English');
    });
  }

  function applyAll() {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
    applyTree(document.body);
    applyTitle();
    updateSwitch();
  }

  HRS.i18n = {
    lang: function () { return lang; },
    t: function (text) { return lang === 'ar' ? translate(text) : text; },
    set: function (next) {
      if (!LANGS[next] || next === lang) return;
      lang = next;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* not persisted */ }
      applyAll();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyAll();
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-action="toggle-language"]')) HRS.i18n.set(lang === 'ar' ? 'en' : 'ar');
    });
    // Translate content rendered later by page scripts (lists, toasts, modals, errors)
    new MutationObserver(function (mutations) {
      if (lang === 'en') return;
      mutations.forEach(function (m) {
        if (m.type === 'characterData') { if (!m.target.parentElement || !m.target.parentElement.closest(SKIP)) applyText(m.target); }
        else if (m.type === 'attributes') { if (!m.target.closest(SKIP)) applyAttrs(m.target); }
        else Array.prototype.forEach.call(m.addedNodes, applyTree);
      });
      applyTitle();
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  });
})(window.HRS);
