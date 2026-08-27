/* ==========================================================================
   MAIN.JS — Mga Bagay na Ginagamit sa LAHAT ng Pahina
   ==========================================================================
   Mobile nav toggle, footer year, at iba pang shared na functionality.
   I-load ito sa LAHAT ng HTML page bago ang page-specific na script
   (hal. booking.js, contact-form.js).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile nav toggle (hamburger menu) ---- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    /* Isara ang menu pag pinindot ang isang link (sa mobile) */
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---- Taon sa footer — awtomatikong nag-a-update, hindi na kailangang
     i-edit taon-taon ---- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- Simpleng "reveal on scroll" na animation para sa mga card/section ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }
});

/* ==========================================================================
   WHATSAPP CLICK-TO-CHAT
   ==========================================================================
   Ito yung LIBRENG bersyon — bubuksan ang WhatsApp na may paunang mensahe
   na naka-fill in na. Walang kailangang WhatsApp Business API dito, gumagana
   agad. (Yung totoong "automated menu" na chatbot ay kailangan ng
   WhatsApp Business API + provider tulad ng Twilio/360dialog — susunod na
   hakbang yun kapag handa na.)

   PAALALA: palitan ang EMPIRE_WHATSAPP_NUMBER ng totoong number sa
   international format, walang "+" o space. Halimbawa: "971501234567"
   ========================================================================== */
var EMPIRE_WHATSAPP_NUMBER = '971500000000'; // <-- ILAGAY DITO ANG TOTOONG NUMBER

function openWhatsApp(prefilledMessage) {
  var msg = prefilledMessage || "Hi Empire! Gusto ko sanang magtanong tungkol sa mga services niyo.";
  var url = 'https://wa.me/' + EMPIRE_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

document.addEventListener('click', function (e) {
  var target = e.target.closest('[data-whatsapp]');
  if (target) {
    var customMsg = target.getAttribute('data-whatsapp') || '';
    openWhatsApp(customMsg || undefined);
  }
});
