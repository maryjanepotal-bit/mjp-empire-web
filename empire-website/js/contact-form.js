/* ==========================================================================
   CONTACT-FORM.JS — Paghawak sa Inquiry Form
   ==========================================================================
   Ngayon: chinicheck lang nito kung kumpleto ang form, tapos nagpapakita
   ng "salamat" na mensahe — WALANG totoong email na pinapadala.

   PARA GUMANA NANG TOTOO (real email + PDF attachment):
   1. Gumawa ng backend endpoint (hal. /api/inquiry) na tumatanggap ng
      form data.
   2. Doon, gamitin ang isang email service (SendGrid, Mailgun, Resend,
      o EmailJS kung gusto ng walang-backend na option) para ipadala
      ang confirmation email.
   3. I-attach ang tamang PDF base sa napiling service (hal. kung
      "Birthday" ang category, i-attach ang birthday-package.pdf).
   4. Palitan ang "fetch(...)" placeholder sa ibaba ng totoong URL ng
      endpoint na yun.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('inquiryForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('cName').value.trim();
    var email = document.getElementById('cEmail').value.trim();
    var service = document.getElementById('cService').value;
    var message = document.getElementById('cMessage').value.trim();
    var statusBox = document.getElementById('formStatus');

    if (!name || !email || !service) {
      statusBox.textContent = 'Punan muna ang Pangalan, Email, at Service bago mag-submit.';
      statusBox.classList.add('show');
      statusBox.style.background = '#f2d9d9';
      return;
    }

    /* ---- DITO IPAPADALA SA TOTOONG BACKEND KAPAG HANDA NA ----
    fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, service: service, message: message })
    });
    ------------------------------------------------------------- */

    statusBox.style.background = 'var(--color-sand-deep)';
    statusBox.textContent = 'Salamat, ' + name + '! Natanggap namin ang inquiry mo tungkol sa ' + service + '. Makakatanggap ka ng email confirmation sa loob ng 24 oras.';
    statusBox.classList.add('show');
    form.reset();
  });
});
