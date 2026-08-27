/* ==========================================================================
   BOOKING.JS — Logic ng Event Booking Wizard
   ==========================================================================
   Ito yung "utak" ng book-event.html page:
   1. Pag-navigate sa mga hakbang (steps)
   2. Live na kabuuang halaga (running total) habang pumipili ang user
   3. Mini-calendar na nagpapakita ng "booked" vs "bakante" na araw

   PAALALA (mahalaga): ang calendar dito ay MOCK DATA lang — nasa isang
   JS array sa ibaba (BOOKED_DATES). Para talagang "live" ito at magkaiba
   ang makikita ng bawat customer sa totoong booking status, kailangan
   ng REAL na backend + database (tingnan ang note sa ibaba ng
   book-event.html). Ang structure dito ay ginawa nang madaling
   papalitan ng totoong data mula sa isang API kapag handa na.
   ========================================================================== */

/* ---------------- 1. PRICING CONFIG ----------------
   Dito nakalagay ang lahat ng presyo. Gusto mo bang baguhin ang
   presyo ng isang add-on? DITO ka lang mag-edit. */
var PRICING = {
  tablesChairs:    500,   // set ng tables & chairs
  backdropBase:    500,   // backdrop, base price
  backdrop3D:      180,   // dagdag kapag 3D
  backdropLighting: 120,  // dagdag kapag may lighting
  balloonBase:     300,   // balloon decor, starting price
  souvenirEach:    12,    // average ng 10-15 dirhams kada piraso
  souvenirWrapEach: 3,    // dagdag kapag premium wrap
  trampoline:      450,   // quote-based sa totoo, ito ay paunang tantiya
  slide:           350,
  mc:              600,
  lighting:        400,
  cakeBase:        280,
  cardsTagsEach:   4,
  deliveryFlat:    150    // kapag hiniwalay ang delivery charge
};

var PACKAGES = {
  A: { name: 'Package A — Essentials', price: 1800, includes: ['Tables & chairs', 'Balloon decor', 'Basic backdrop', 'Souvenirs (30 pcs)'] },
  B: { name: 'Package B — Celebration', price: 3200, includes: ['Everything in A', '3D backdrop + lighting', 'MC / host', 'Cake', 'Souvenirs (50 pcs, wrapped)'] },
  C: { name: 'Package C — Full Empire', price: 5400, includes: ['Everything in B', 'Trampoline / play equipment', 'Themed styling', 'Cards & tags', 'Priority delivery'] }
};

/* ---------------- 2. STATE — kung anong napili ng user ngayon ---------------- */
var bookingState = {
  eventType: null,
  guests: null,
  ownVenue: null,
  date: null,
  path: null,          // 'package' o 'custom'
  package: null,        // 'A', 'B', or 'C'
  addons: {
    tablesChairs: false,
    backdrop: false, backdrop3D: false, backdropLighting: false,
    balloon: false,
    souvenirQty: 0, souvenirWrap: false,
    trampoline: false, slide: false, mc: false, lighting: false,
    cake: false, cardsTagsQty: 0
  },
  deliverySeparate: false,
  address: ''
};

/* ---------------- 3. MOCK NA "BOOKED" NA ARAW (para lang sa demo) ---------------- */
var today = new Date();
var BOOKED_DATES = [
  new Date(today.getFullYear(), today.getMonth(), 8),
  new Date(today.getFullYear(), today.getMonth(), 9),
  new Date(today.getFullYear(), today.getMonth(), 17),
  new Date(today.getFullYear(), today.getMonth(), 24),
  new Date(today.getFullYear(), today.getMonth() + 1, 3)
];
var calendarViewDate = new Date(today.getFullYear(), today.getMonth(), 1);

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBooked(date) {
  return BOOKED_DATES.some(function (d) { return isSameDay(d, date); });
}

/* ---------------- 4. I-RENDER ANG CALENDAR ---------------- */
function renderCalendar() {
  var grid = document.getElementById('calGrid');
  var label = document.getElementById('calLabel');
  if (!grid || !label) return;

  var year = calendarViewDate.getFullYear();
  var month = calendarViewDate.getMonth();
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  label.textContent = monthNames[month] + ' ' + year;

  var firstDay = new Date(year, month, 1).getDay();
  var totalDays = new Date(year, month + 1, 0).getDate();

  var html = '<div class="dow">S</div><div class="dow">M</div><div class="dow">T</div><div class="dow">W</div><div class="dow">T</div><div class="dow">F</div><div class="dow">S</div>';

  for (var i = 0; i < firstDay; i++) { html += '<div class="cal-day empty"></div>'; }

  for (var d = 1; d <= totalDays; d++) {
    var thisDate = new Date(year, month, d);
    var classes = 'cal-day';
    if (isBooked(thisDate)) classes += ' booked';
    if (bookingState.date && isSameDay(thisDate, new Date(bookingState.date))) classes += ' selected';
    var isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast) classes += ' booked'; // huwag pabayaang pumili ng nakaraang araw
    html += '<div class="' + classes + '" data-date="' + thisDate.toISOString() + '">' + d + '</div>';
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day:not(.empty):not(.booked)').forEach(function (el) {
    el.addEventListener('click', function () {
      var picked = new Date(el.getAttribute('data-date'));
      bookingState.date = picked.toISOString();
      var dateInput = document.getElementById('eventDate');
      if (dateInput) dateInput.value = picked.toISOString().split('T')[0];
      renderCalendar();
    });
  });
}

document.addEventListener('click', function (e) {
  if (e.target.id === 'calPrev') { calendarViewDate.setMonth(calendarViewDate.getMonth() - 1); renderCalendar(); }
  if (e.target.id === 'calNext') { calendarViewDate.setMonth(calendarViewDate.getMonth() + 1); renderCalendar(); }
});

/* ---------------- 5. KWENTAHIN ANG KABUUANG HALAGA ---------------- */
function calculateTotal() {
  var lines = [];
  var total = 0;

  if (bookingState.path === 'package' && bookingState.package) {
    var pkg = PACKAGES[bookingState.package];
    lines.push({ label: pkg.name, amount: pkg.price });
    total += pkg.price;
  } else {
    var a = bookingState.addons;
    if (a.tablesChairs) { lines.push({ label: 'Tables & chairs', amount: PRICING.tablesChairs }); total += PRICING.tablesChairs; }
    if (a.backdrop) {
      var bd = PRICING.backdropBase + (a.backdrop3D ? PRICING.backdrop3D : 0) + (a.backdropLighting ? PRICING.backdropLighting : 0);
      lines.push({ label: 'Backdrop' + (a.backdrop3D ? ' + 3D' : '') + (a.backdropLighting ? ' + lighting' : ''), amount: bd });
      total += bd;
    }
    if (a.balloon) { lines.push({ label: 'Balloon decor', amount: PRICING.balloonBase }); total += PRICING.balloonBase; }
    if (a.souvenirQty > 0) {
      var perPiece = PRICING.souvenirEach + (a.souvenirWrap ? PRICING.souvenirWrapEach : 0);
      var souvTotal = perPiece * a.souvenirQty;
      lines.push({ label: 'Souvenirs × ' + a.souvenirQty + (a.souvenirWrap ? ' (wrapped)' : ''), amount: souvTotal });
      total += souvTotal;
    }
    if (a.trampoline) { lines.push({ label: 'Trampoline', amount: PRICING.trampoline }); total += PRICING.trampoline; }
    if (a.slide) { lines.push({ label: 'Slide', amount: PRICING.slide }); total += PRICING.slide; }
    if (a.mc) { lines.push({ label: 'MC / host', amount: PRICING.mc }); total += PRICING.mc; }
    if (a.lighting) { lines.push({ label: 'Lighting', amount: PRICING.lighting }); total += PRICING.lighting; }
    if (a.cake) { lines.push({ label: 'Cake', amount: PRICING.cakeBase }); total += PRICING.cakeBase; }
    if (a.cardsTagsQty > 0) {
      var ctTotal = PRICING.cardsTagsEach * a.cardsTagsQty;
      lines.push({ label: 'Cards & tags × ' + a.cardsTagsQty, amount: ctTotal });
      total += ctTotal;
    }
  }

  if (bookingState.deliverySeparate) {
    lines.push({ label: 'Delivery', amount: PRICING.deliveryFlat });
    total += PRICING.deliveryFlat;
  }

  return { lines: lines, total: total };
}

function updateSummary() {
  var result = calculateTotal();
  var linesEl = document.getElementById('summaryLines');
  var totalEl = document.getElementById('summaryTotal');
  if (!linesEl || !totalEl) return;

  if (result.lines.length === 0) {
    linesEl.innerHTML = '<div class="summary-line"><span>Wala pang napipiling item</span><span>—</span></div>';
  } else {
    linesEl.innerHTML = result.lines.map(function (l) {
      return '<div class="summary-line"><span>' + l.label + '</span><span>AED ' + l.amount.toLocaleString() + '</span></div>';
    }).join('');
  }
  totalEl.textContent = 'AED ' + result.total.toLocaleString();
}

/* ---------------- 6. STEP NAVIGATION ---------------- */
var currentStep = 1;
var TOTAL_STEPS = 6;

function goToStep(n) {
  document.querySelectorAll('.wizard-step').forEach(function (el) { el.classList.remove('active'); });
  var target = document.getElementById('step-' + n);
  if (target) target.classList.add('active');

  document.querySelectorAll('.step-dot').forEach(function (dot, i) {
    dot.classList.remove('active', 'done');
    if (i + 1 < n) dot.classList.add('done');
    if (i + 1 === n) dot.classList.add('active');
  });

  currentStep = n;
  window.scrollTo({ top: document.getElementById('bookingWizard').offsetTop - 90, behavior: 'smooth' });
}

document.addEventListener('click', function (e) {
  if (e.target.matches('[data-next]')) {
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  }
  if (e.target.matches('[data-back]')) {
    if (currentStep > 1) goToStep(currentStep - 1);
  }
  if (e.target.matches('[data-goto-step]')) {
    goToStep(parseInt(e.target.getAttribute('data-goto-step'), 10));
  }
});

/* ---------------- 7. I-BIND ANG LAHAT NG INPUT SA STATE ---------------- */
document.addEventListener('DOMContentLoaded', function () {
  renderCalendar();
  updateSummary();

  document.querySelectorAll('input[name="eventType"]').forEach(function (el) {
    el.addEventListener('change', function () { bookingState.eventType = el.value; });
  });
  document.querySelectorAll('input[name="path"]').forEach(function (el) {
    el.addEventListener('change', function () {
      bookingState.path = el.value;
      document.getElementById('customAddonsPanel').style.display = el.value === 'custom' ? 'block' : 'none';
      document.getElementById('packagePanel').style.display = el.value === 'package' ? 'block' : 'none';
      updateSummary();
    });
  });
  document.querySelectorAll('input[name="package"]').forEach(function (el) {
    el.addEventListener('change', function () { bookingState.package = el.value; updateSummary(); });
  });

  var guestsInput = document.getElementById('guestCount');
  if (guestsInput) guestsInput.addEventListener('input', function () { bookingState.guests = guestsInput.value; });

  document.querySelectorAll('input[name="ownVenue"]').forEach(function (el) {
    el.addEventListener('change', function () { bookingState.ownVenue = el.value; });
  });

  /* Simpleng checkboxes (walang qty) */
  ['tablesChairs', 'backdrop', 'backdrop3D', 'backdropLighting', 'balloon', 'trampoline', 'slide', 'mc', 'lighting', 'cake'].forEach(function (key) {
    var el = document.getElementById('addon-' + key);
    if (el) el.addEventListener('change', function () { bookingState.addons[key] = el.checked; updateSummary(); });
  });

  /* Quantity fields (souvenirs, cards/tags) */
  ['souvenirQty', 'cardsTagsQty'].forEach(function (key) {
    var el = document.getElementById('addon-' + key);
    if (el) el.addEventListener('input', function () {
      bookingState.addons[key] = parseInt(el.value, 10) || 0;
      updateSummary();
    });
  });
  var wrapEl = document.getElementById('addon-souvenirWrap');
  if (wrapEl) wrapEl.addEventListener('change', function () { bookingState.addons.souvenirWrap = wrapEl.checked; updateSummary(); });

  var deliveryEl = document.getElementById('deliverySeparate');
  if (deliveryEl) deliveryEl.addEventListener('change', function () { bookingState.deliverySeparate = deliveryEl.checked; updateSummary(); });

  var addressEl = document.getElementById('venueAddress');
  if (addressEl) addressEl.addEventListener('input', function () { bookingState.address = addressEl.value; });

  /* ---- Pag-submit ng buong wizard (kailangan munang tickan ang Terms) ---- */
  var confirmBtn = document.getElementById('confirmBooking');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var agree = document.getElementById('agreeTerms');
      if (!agree.checked) {
        agree.closest('.terms-agree').style.color = '#8c3b3b';
        return;
      }
      /* PAALALA: dito ipapadala ang booking data sa totoong backend/API
         kapag handa na (hal. fetch('/api/bookings', {method:'POST', body: JSON.stringify(bookingState)})).
         Sa ngayon, mock lang ito — ipinapakita lang ang confirmation screen. */
      document.getElementById('step-6').innerHTML = document.getElementById('confirmationTemplate').innerHTML;
      goToStep(6);
    });
  }

  /* ---- +/- na buttons para sa souvenirs at cards/tags quantity ---- */
  document.querySelectorAll('[data-qty-plus], [data-qty-minus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-qty-plus') || btn.getAttribute('data-qty-minus');
      var input = document.getElementById('addon-' + key);
      if (!input) return;
      var val = parseInt(input.value, 10) || 0;
      val = btn.hasAttribute('data-qty-plus') ? val + 1 : Math.max(0, val - 1);
      input.value = val;
      input.dispatchEvent(new Event('input'));
    });
  });

  /* ---- "Send Inquiry Na Lang" shortcut — available kahit anong step ---- */
  document.querySelectorAll('[data-quick-inquiry]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var msg = 'Hi Empire! Gusto ko sanang magtanong tungkol sa event booking' +
        (bookingState.eventType ? ' (' + bookingState.eventType + ')' : '') + '. Wala pa akong sinasagutang form, gusto ko lang mag-inquire muna.';
      openWhatsApp(msg);
    });
  });
});
