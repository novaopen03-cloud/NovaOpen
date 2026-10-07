// Carosello 3D: rotazione automatica a 360° + trascinamento con mouse/touch
(function () {
  const ring = document.getElementById('ring');
  const scene = document.getElementById('scene');
  if (!ring || !scene) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let angle = 0;
  let dragging = false;
  let startX = 0;
  let startAngle = 0;
  let velocity = 0;
  const auto = reduce ? 0 : 0.18; // gradi per frame

  function radius() {
    // distanza dal centro: dipende dalla larghezza della scheda
    return scene.clientWidth * 1.12;
  }

  function apply() {
    const r = radius();
    ring.style.transform = 'translateZ(' + (-r) + 'px) rotateY(' + angle + 'deg)';
    ring.querySelectorAll('figure').forEach(function (f, i) {
      f.style.transform = 'rotateY(' + (i * 90) + 'deg) translateZ(' + r + 'px)';
    });
  }

  function tick() {
    if (!dragging) {
      angle += auto + velocity;
      velocity *= 0.95;
    }
    apply();
    requestAnimationFrame(tick);
  }

  scene.addEventListener('pointerdown', function (e) {
    dragging = true;
    startX = e.clientX;
    startAngle = angle;
    velocity = 0;
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const next = startAngle + (e.clientX - startX) * 0.4;
    velocity = (next - angle) * 0.3;
    angle = next;
  });
  function end() { dragging = false; }
  scene.addEventListener('pointerup', end);
  scene.addEventListener('pointercancel', end);

  window.addEventListener('resize', apply);
  tick();
})();

// CTA provvisoria: sostituire con link di checkout (Stripe, Shopify, PayPal...)
document.getElementById('cta').addEventListener('click', function (e) {
  e.preventDefault();
  alert('Checkout in arrivo! Collega qui il link di pagamento.');
});
