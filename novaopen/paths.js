// Sfondo di linee nere animate, disegnate su canvas (molto più leggero dell'SVG animato).
// Si ferma quando la landing copre lo schermo o la scheda non è visibile.
(function () {
  const host = document.getElementById('bg-paths');
  if (!host) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Per misurare la lunghezza di ogni curva
  const NS = 'http://www.w3.org/2000/svg';
  const probeSvg = document.createElementNS(NS, 'svg');
  probeSvg.setAttribute('width', '0');
  probeSvg.setAttribute('height', '0');
  probeSvg.style.position = 'absolute';
  const probe = document.createElementNS(NS, 'path');
  probeSvg.appendChild(probe);
  host.appendChild(probeSvg);

  const items = [];
  [1, -1].forEach(function (p) {
    for (let i = 0; i < 36; i += 2) {
      const a = 380 - i * 5 * p;
      const d =
        'M-' + a + ' -' + (189 + i * 6) +
        'C-' + a + ' -' + (189 + i * 6) + ' -' + (312 - i * 5 * p) + ' ' + (216 - i * 6) + ' ' + (152 - i * 5 * p) + ' ' + (343 - i * 6) +
        'C' + (616 - i * 5 * p) + ' ' + (470 - i * 6) + ' ' + (684 - i * 5 * p) + ' ' + (875 - i * 6) + ' ' + (684 - i * 5 * p) + ' ' + (875 - i * 6);
      probe.setAttribute('d', d);
      const len = probe.getTotalLength();
      const dur = 20 + Math.random() * 10; // secondi per un giro
      items.push({
        path: new Path2D(d),
        len: len,
        width: 0.5 + i * 0.03,
        alpha: Math.min(0.12 + i * 0.03, 0.7),
        dur: dur,
        phase: Math.random()
      });
    }
  });
  probeSvg.remove();

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    draw(performance.now() / 1000);
  }

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = Math.max(W / 696, H / 316); // come preserveAspectRatio "slice"
    const ox = (W - 696 * s) / 2, oy = (H - 316 * s) / 2;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    ctx.lineCap = 'round';
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      const prog = reduce ? 0.4 : (((t / it.dur) + it.phase) % 1);
      ctx.setLineDash([it.len * 0.35, it.len * 1.7]);
      ctx.lineDashOffset = it.len * (0.35 - 1.35 * prog); // il segmento scorre lungo la curva
      ctx.lineWidth = it.width;
      ctx.strokeStyle = 'rgba(11,15,14,' + it.alpha + ')';
      ctx.stroke(it.path);
    }
  }

  // Quando animare: solo se la scheda è visibile e la landing non è a schermo
  let running = false, landingOn = false, last = 0;
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps bastano
    last = now;
    draw(now / 1000);
  }
  function update() {
    const should = !reduce && !landingOn && document.visibilityState === 'visible';
    if (should && !running) { running = true; requestAnimationFrame(loop); }
    if (!should) running = false;
  }

  const cine = document.querySelector('.cine');
  if (cine && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      landingOn = en[0].isIntersecting;
      update();
    }).observe(cine);
  }
  document.addEventListener('visibilitychange', update);
  window.addEventListener('resize', resize);
  resize();
  update();
})();
