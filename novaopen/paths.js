// Sfondo di linee nere animate (adattamento vanilla di "Background Paths").
// 2 gruppi speculari da 36 curve; ogni curva ha il suo ritmo.
(function () {
  const host = document.getElementById('bg-paths');
  if (!host) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 696 316');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('fill', 'none');

  [1, -1].forEach(function (p) {
    for (let i = 0; i < 36; i++) {
      const a = 380 - i * 5 * p;
      const d =
        'M-' + a + ' -' + (189 + i * 6) +
        'C-' + a + ' -' + (189 + i * 6) + ' -' + (312 - i * 5 * p) + ' ' + (216 - i * 6) + ' ' + (152 - i * 5 * p) + ' ' + (343 - i * 6) +
        'C' + (616 - i * 5 * p) + ' ' + (470 - i * 6) + ' ' + (684 - i * 5 * p) + ' ' + (875 - i * 6) + ' ' + (684 - i * 5 * p) + ' ' + (875 - i * 6);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '1');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', String(0.5 + i * 0.03));
      path.setAttribute('stroke-opacity', String(Math.min(0.1 + i * 0.03, 0.75)));
      path.setAttribute('stroke-linecap', 'round');
      if (reduce) {
        path.setAttribute('stroke-dasharray', '1 0');
      } else {
        const dur = 20 + Math.random() * 10;
        path.style.strokeDasharray = '0.35 1';
        path.style.animation = 'bgpath ' + dur.toFixed(1) + 's linear infinite';
        path.style.animationDelay = '-' + (Math.random() * dur).toFixed(1) + 's';
      }
      svg.appendChild(path);
    }
  });

  host.appendChild(svg);
})();
