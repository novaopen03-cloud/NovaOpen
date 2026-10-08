// Scena 3D: apriscatole + apribarattoli modellati con Three.js, ruotano su se stessi.
// Se Three.js non si carica o WebGL non è disponibile, resta visibile la foto di ripiego.
const stage = document.getElementById('scene3d');
const host = document.getElementById('gl');

async function init() {
  const THREE = await import('three');
  const { mergeVertices } = await import('three/addons/utils/BufferGeometryUtils.js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);

  // Studio fotografico: pannelli luminosi morbidi che si riflettono sulle superfici lucide
  function studioEnv() {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30),
      new THREE.MeshBasicMaterial({ color: 0x0c1110, side: THREE.BackSide })));
    function panel(w, h, x, y, z, k, tint) {
      const c = new THREE.Color(tint || 0xffffff).multiplyScalar(k);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    }
    panel(14, 5, 0, 11, 3, 7);               // softbox alto
    panel(3, 16, -10, 1, 4, 6);              // striscia sinistra
    panel(3, 16, 10, 0, 3, 4.5);             // striscia destra
    panel(10, 3, 0, -8, 6, 1.4);             // riempimento basso
    panel(9, 9, 0, 3, -12, 2.4, 0xbff5de);   // luce di taglio verde dietro
    return pmrem.fromScene(env, 0.015).texture;
  }
  scene.environment = studioEnv();

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-3, 4, 5);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const rimMint = new THREE.PointLight(0x3fe0a8, 14, 0, 2);
  rimMint.position.set(4, 2, -2);
  scene.add(rimMint);
  const fillCool = new THREE.PointLight(0xcfeee3, 8, 0, 2);
  fillCool.position.set(-4, -2, 3);
  scene.add(fillCool);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

  /* ---------- APRISCATOLE ---------- */
  function buildOpener() {
    const g = new THREE.Group();

    // corpo: uovo/goccia, più largo in alto, appiattito, retro piatto
    // uovo con estremità arrotondate (superellisse), più largo in alto
    const prof = [];
    const N = 100, n = 2.3;
    for (let i = 0; i <= N; i++) {
      const sv = -Math.cos(Math.PI * i / N);              // da -1 a 1, più fitto alle estremità
      const y = sv < 0 ? 0.3 + sv * 1.5 : 0.3 + sv * 0.9;  // metà bassa più lunga
      const r = 0.62 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(sv), n)), 1 / n);
      prof.push(new THREE.Vector2(r, y));
    }
    let geo = new THREE.LatheGeometry(prof, 96);
    geo.rotateY(Math.PI); // la giunzione finisce sul retro
    geo.deleteAttribute('uv');
    geo.deleteAttribute('normal');
    geo = mergeVertices(geo, 1e-4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i) * 0.62;
      if (z < -0.16) z = -0.16;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();

    const black = new THREE.MeshPhysicalMaterial({
      color: 0x050606, roughness: 0.22, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.035
    });
    g.add(new THREE.Mesh(geo, black));

    // pulsante grigio sul fronte
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.05, 48),
      new THREE.MeshPhysicalMaterial({ color: 0x040404, roughness: 0.3, clearcoat: 0.6 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.62, 0.36);
    g.add(ring);
    const bp = [[0, -0.03], [0.195, -0.03], [0.195, 0.02], [0.18, 0.035], [0.15, 0.041], [0, 0.041]]
      .map((p) => new THREE.Vector2(p[0], p[1]));
    const button = new THREE.Mesh(new THREE.LatheGeometry(bp, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xb9bfc1, roughness: 0.34, metalness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.2 }));
    button.rotation.x = Math.PI / 2;
    button.position.set(0, 0.62, 0.375);
    g.add(button);

    // pannello posteriore (testi e pulsante) come texture
    const W = 640, H = 992;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const P = (px, py) => [(px + 0.5) / 1.0 * W, (0.9 - py) / 1.55 * H];
    const shield = [[-0.24, 0.85], [0.24, 0.85], [0.46, 0.5], [0.46, 0], [0.34, -0.4], [0, -0.62], [-0.34, -0.4], [-0.46, 0], [-0.46, 0.5]];
    x.beginPath();
    shield.forEach((p, i) => { const [a, b] = P(p[0], p[1]); i ? x.lineTo(a, b) : x.moveTo(a, b); });
    x.closePath();
    x.fillStyle = '#3a4141';
    x.fill();
    // pulsante di riavvio
    let [bx, by] = P(0, 0.28);
    x.beginPath(); x.arc(bx, by, 62, 0, Math.PI * 2); x.fillStyle = '#1b1f1f'; x.fill();
    x.lineWidth = 8; x.strokeStyle = '#8c9393'; x.stroke();
    x.beginPath(); x.arc(bx, by, 40, 0, Math.PI * 2); x.fillStyle = '#0b0d0d'; x.fill();
    // testi
    x.fillStyle = '#f2f2f2';
    x.textAlign = 'center';
    x.font = '600 25px system-ui, Arial, sans-serif';
    let [tx, ty] = P(0, 0.02);
    x.fillText("Read user's manual", tx, ty);
    x.fillText('before use.', tx, ty + 30);
    // freccia
    let [ax, ay] = P(0, -0.16);
    x.fillRect(ax - 3, ay, 6, 34);
    x.beginPath(); x.moveTo(ax - 14, ay + 28); x.lineTo(ax + 14, ay + 28); x.lineTo(ax, ay + 46); x.closePath(); x.fill();
    // CE
    let [cx, cy] = P(0, -0.38);
    x.font = '700 46px Arial, sans-serif';
    x.fillText('CE', cx, cy);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.55),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0.1 }));
    panel.rotation.y = Math.PI;
    panel.position.set(0, 0.125, -0.1615);
    g.add(panel);

    // rotella dentata + vite dorata
    const gear = new THREE.Shape();
    const teeth = 28;
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 ? 0.125 : 0.16;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i ? gear.lineTo(px, py) : gear.moveTo(px, py);
    }
    gear.closePath();
    const gearMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(gear, { depth: 0.05, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0xcfd3d6, metalness: 1, roughness: 0.3 }));
    gearMesh.position.set(0, 0.72, -0.235);
    g.add(gearMesh);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 24),
      new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 1, roughness: 0.3 }));
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0, 0.72, -0.25);
    g.add(screw);

    // piolino bianco
    const peg = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f1f1, roughness: 0.5 }));
    peg.position.set(0.22, 0.88, -0.17);
    g.add(peg);

    return g;
  }

  /* ---------- APRIBARATTOLI ---------- */
  function buildJarOpener() {
    const c1 = 0.72, R1 = 0.72, c2 = 0.72, R2 = 0.65;
    const wOut = (y) => {
      const a = Math.sqrt(Math.max(0, R1 * R1 - (y - c1) * (y - c1)));
      const b = Math.sqrt(Math.max(0, R2 * R2 - (y + c2) * (y + c2)));
      const w = 0.4 * Math.exp(-Math.pow(y / 0.8, 4));
      return Math.max(a, b, w);
    };
    const wIn = (y) => Math.max(0, wOut(y) - 0.22);
    const yTop = c1 + R1, yBot = -(c2 + R2);

    function loop(wf, y0, y1, n) {
      const right = [], left = [];
      for (let i = 1; i < n; i++) {
        const y = y0 + (y1 - y0) * (1 - Math.cos(Math.PI * i / n)) / 2;
        const w = wf(y);
        right.push([w, y]); left.push([-w, y]);
      }
      left.reverse();
      return [[0, y0], ...right, [0, y1], ...left];
    }
    function resample(pts, N) {
      const m = pts.length, cum = [0];
      for (let i = 1; i <= m; i++) {
        const a = pts[i - 1], b = pts[i % m];
        cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
      }
      const total = cum[m], out = [];
      let k = 0;
      for (let i = 0; i < N; i++) {
        const d = total * i / N;
        while (cum[k + 1] < d) k++;
        const a = pts[k], b = pts[(k + 1) % m];
        const t = (d - cum[k]) / ((cum[k + 1] - cum[k]) || 1);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
      return out;
    }
    function smooth(p, passes) {
      let q = p;
      for (let s = 0; s < passes; s++) {
        q = q.map((v, i) => {
          const a = q[(i - 1 + q.length) % q.length], b = q[(i + 1) % q.length];
          return [0.25 * a[0] + 0.5 * v[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * v[1] + 0.25 * b[1]];
        });
      }
      return q;
    }

    // contorno esterno
    const outer = smooth(resample(loop(wOut, yBot, yTop, 160), 300), 6);

    // contorno interno (foro) con dentatura
    let y0 = null, y1 = null;
    for (let y = yBot; y <= yTop; y += 0.002) {
      if (wIn(y) > 0.002) { if (y0 === null) y0 = y; y1 = y; }
    }
    let inner = smooth(resample(loop(wIn, y0, y1, 160), 220), 4);
    let cx = 0, cy = 0;
    inner.forEach((p) => { cx += p[0]; cy += p[1]; });
    cx /= inner.length; cy /= inner.length;
    inner = inner.map((p, i) => {
      if (i % 2 === 0) return p;
      const a = inner[(i - 1 + inner.length) % inner.length], b = inner[(i + 1) % inner.length];
      let nx = a[1] - b[1], ny = b[0] - a[0];
      const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
      if (nx * (cx - p[0]) + ny * (cy - p[1]) < 0) { nx = -nx; ny = -ny; }
      return [p[0] + nx * 0.03, p[1] + ny * 0.03];
    });

    const shape = new THREE.Shape(outer.map((p) => new THREE.Vector2(p[0], p[1])));
    shape.holes.push(new THREE.Path(inner.map((p) => new THREE.Vector2(p[0], p[1]))));
    [[0.56, 0.5], [-0.56, 0.5], [0.5, -0.48], [-0.5, -0.48]].forEach((h) => {
      const hole = new THREE.Path();
      hole.absarc(h[0], h[1], 0.055, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    });

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.016, bevelSegments: 5, curveSegments: 10
    });
    geo.center();
    const mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x1b5a47, roughness: 0.4, metalness: 0.0, clearcoat: 0.35, clearcoatRoughness: 0.3 }));
    const g = new THREE.Group();
    g.add(mesh);
    g.scale.setScalar(0.8);
    return g;
  }

  /* ---------- in volo: ogni oggetto fluttua, è inclinato e ruota su se stesso ---------- */
  const opener = buildOpener();
  const jar = buildJarOpener();
  const openerPivot = new THREE.Group();   // posizione, inclinazione, fluttuazione
  const jarPivot = new THREE.Group();
  const openerSpin = new THREE.Group();    // rotazione su se stesso
  const jarSpin = new THREE.Group();
  openerSpin.add(opener);
  jarSpin.add(jar);
  openerPivot.add(openerSpin);
  jarPivot.add(jarSpin);
  scene.add(openerPivot, jarPivot);

  // ombre morbide sotto gli oggetti
  function shadowTex() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.4)');
    gr.addColorStop(0.6, 'rgba(0,0,0,0.12)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const shTex = shadowTex();
  function makeShadow() {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
    m.position.z = -0.9;
    scene.add(m);
    return m;
  }
  const openerShadow = makeShadow();
  const jarShadow = makeShadow();

  const base = {
    o: new THREE.Vector3(-0.85, 0, 0), j: new THREE.Vector3(1.0, 0, 0), sc: 1
  };

  /* ---------- dimensioni ---------- */
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan((camera.fov * Math.PI / 180) / 2);
    let dist;
    if (camera.aspect < 0.9) {
      // spazio stretto: i due oggetti uno sopra l'altro
      base.o.set(0, 1.0, 0); base.j.set(0, -1.0, 0); base.sc = 0.62;
      dist = Math.max(1.85 / t, 0.85 / (camera.aspect * t));
    } else {
      base.o.set(-0.85, 0, 0); base.j.set(1.0, 0, 0); base.sc = 1;
      dist = Math.max(1.72 / t, 3.1 / (camera.aspect * t));
    }
    camera.position.set(0, 0, dist);
    camera.updateProjectionMatrix();
    openerPivot.scale.setScalar(base.sc);
    jarPivot.scale.setScalar(base.sc);
  }

  /* ---------- trascinamento ---------- */
  let dragging = false, lastX = 0, vel = 0, dragOff = 0;
  host.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; vel = 0;
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const d = (e.clientX - lastX) * 0.012;
    lastX = e.clientX;
    vel = d;
    dragOff += d;
  });
  const endDrag = () => { dragging = false; };
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);

  /* ---------- loop ---------- */
  let visible = true, last = performance.now(), t = 0, auto = 0, scrollCur = 0;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(host);
  new ResizeObserver(resize).observe(host);
  resize();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || window.__cine3d === false) return;
    t += dt;

    // la rotazione segue anche lo scroll: scorrendo, gli oggetti girano su se stessi
    const target = (window.__cineP || 0) * 14;
    scrollCur += (target - scrollCur) * Math.min(1, dt * 5);

    if (!dragging) {
      auto += (reduceMotion ? 0 : 0.55) * dt;
      dragOff += vel;
      vel *= 0.94;
    }
    const ry = auto + dragOff + scrollCur;
    openerSpin.rotation.y = 0.45 + ry;
    jarSpin.rotation.y = -0.35 - ry * 0.85;

    // fluttuazione e inclinazione (come il libro in volo)
    const fl = reduceMotion ? 0 : 1;
    const fo = Math.sin(t * 1.25) * 0.09 * fl, fj = Math.sin(t * 1.05 + 1.8) * 0.09 * fl;
    openerPivot.position.set(base.o.x, base.o.y + fo * base.sc, base.o.z);
    jarPivot.position.set(base.j.x, base.j.y + fj * base.sc, base.j.z);
    openerPivot.rotation.set(0.3 + Math.sin(t * 0.8) * 0.05 * fl, 0, 0.14 + Math.sin(t * 0.6) * 0.04 * fl);
    jarPivot.rotation.set(0.3 + Math.sin(t * 0.7 + 1) * 0.05 * fl, 0, -0.14 + Math.sin(t * 0.55 + 2) * 0.04 * fl);

    // ombre: più piccole e leggere quando l'oggetto sale
    const sy = -1.42 * base.sc;
    openerShadow.position.set(base.o.x, base.o.y + sy, -0.9);
    jarShadow.position.set(base.j.x, base.j.y + sy, -0.9);
    const so = 1 - fo * 1.2, sj = 1 - fj * 1.2;
    openerShadow.scale.set(1.5 * base.sc * so, 0.3 * base.sc * so, 1);
    jarShadow.scale.set(1.5 * base.sc * sj, 0.3 * base.sc * sj, 1);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  stage.classList.add('ready');
  resize();
}

init().catch((err) => {
  console.warn('Vista 3D non disponibile, uso la foto di ripiego.', err);
});
