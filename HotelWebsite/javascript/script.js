(function(){
  // Sticky header shadow on scroll
  var header = document.getElementById('siteHeader');
  window.addEventListener('scroll', function(){
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  toggle.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); });
  });

  // Footer year
  document.getElementById('yearNow').textContent = new Date().getFullYear();

  // ---- Booking logic ----
  var inDate = document.getElementById('inDate');
  var outDate = document.getElementById('outDate');
  var roomSelect = document.getElementById('roomSelect');
  var sumRoom = document.getElementById('sumRoom');
  var sumNights = document.getElementById('sumNights');
  var sumRate = document.getElementById('sumRate');
  var sumTax = document.getElementById('sumTax');
  var sumTotal = document.getElementById('sumTotal');
  var bookingMsg = document.getElementById('bookingMsg');

  var todayStr = new Date().toISOString().slice(0,10);
  inDate.setAttribute('min', todayStr);
  outDate.setAttribute('min', todayStr);
  document.getElementById('qcIn').setAttribute('min', todayStr);
  document.getElementById('qcOut').setAttribute('min', todayStr);

  function money(n){ return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

  function nightsBetween(a, b){
    if (!a || !b) return 0;
    var d1 = new Date(a), d2 = new Date(b);
    var diff = Math.round((d2 - d1) / 86400000);
    return diff > 0 ? diff : 0;
  }

  function updateSummary(){
    var nights = nightsBetween(inDate.value, outDate.value);
    var opt = roomSelect.options[roomSelect.selectedIndex];
    var rate = opt ? parseInt(opt.getAttribute('data-rate') || '0', 10) : 0;
    var roomName = opt && opt.value ? opt.value : '—';

    sumRoom.textContent = roomName;
    sumNights.textContent = nights > 0 ? (nights + (nights === 1 ? ' night' : ' nights')) : '—';
    sumRate.textContent = rate ? money(rate) : '—';

    if (nights > 0 && rate > 0) {
      var subtotal = nights * rate;
      var tax = Math.round(subtotal * 0.08);
      sumTax.textContent = money(tax);
      sumTotal.textContent = money(subtotal + tax);
    } else {
      sumTax.textContent = '—';
      sumTotal.textContent = '—';
    }
  }
  [inDate, outDate, roomSelect].forEach(function(el){ el.addEventListener('change', updateSummary); });

  // Keep departure date after arrival date
  inDate.addEventListener('change', function(){
    if (outDate.value && outDate.value <= inDate.value) outDate.value = '';
    outDate.setAttribute('min', inDate.value || todayStr);
  });

  // "Book this room" buttons scroll down and pre-select
  document.querySelectorAll('.book-room').forEach(function(btn){
    btn.addEventListener('click', function(){
      var room = btn.getAttribute('data-room');
      for (var i = 0; i < roomSelect.options.length; i++){
        if (roomSelect.options[i].value === room){ roomSelect.selectedIndex = i; break; }
      }
      updateSummary();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Quick-check widget: carry dates down to the booking form
  document.getElementById('qcSubmit').addEventListener('click', function(){
    var qi = document.getElementById('qcIn').value;
    var qo = document.getElementById('qcOut').value;
    if (qi) inDate.value = qi;
    if (qo) outDate.value = qo;
    outDate.setAttribute('min', inDate.value || todayStr);
    updateSummary();
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });

  // Booking form submit
  document.getElementById('bookingForm').addEventListener('submit', function(e){
    e.preventDefault();
    var nights = nightsBetween(inDate.value, outDate.value);
    bookingMsg.classList.remove('show','ok','err');

    if (!inDate.value || !outDate.value || nights <= 0) {
      bookingMsg.textContent = 'Please choose an arrival date and a later departure date.';
      bookingMsg.classList.add('show','err');
      return;
    }
    if (!roomSelect.value) {
      bookingMsg.textContent = 'Please choose a room.';
      bookingMsg.classList.add('show','err');
      return;
    }
    var name = document.getElementById('nameField').value.trim();
    var email = document.getElementById('emailField').value.trim();
    if (!name || !email) {
      bookingMsg.textContent = 'Please add your name and email so we can confirm.';
      bookingMsg.classList.add('show','err');
      return;
    }

    var ref = 'SC-' + Math.random().toString(36).slice(2,7).toUpperCase();
    bookingMsg.textContent = 'Request received, ' + name.split(' ')[0] + ' — reference ' + ref + '. We\'ll confirm ' + roomSelect.value + ' for ' + nights + ' night' + (nights===1?'':'s') + ' by email within one working day.';
    bookingMsg.classList.add('show','ok');
    this.reset();
    updateSummary();
  });

  // Contact form submit
  document.getElementById('contactForm').addEventListener('submit', function(e){
    e.preventDefault();
    var msg = document.getElementById('contactMsg');
    msg.textContent = 'Thanks — your message has been sent to the front desk. We reply within one working day.';
    msg.classList.add('show','ok');
    msg.style.marginTop = '14px';
    msg.style.fontSize = '.88rem';
    msg.style.padding = '12px 14px';
    msg.style.borderRadius = '3px';
    msg.style.background = '#E4EDE3';
    msg.style.color = '#33512F';
    msg.style.border = '1px solid #B7CDB2';
    this.reset();
  });

  // Newsletter form
  document.getElementById('newsForm').addEventListener('submit', function(e){
    e.preventDefault();
    var input = this.querySelector('input');
    input.value = '';
    input.placeholder = 'Thanks — you\'re on the list';
  });

  updateSummary();
})();
