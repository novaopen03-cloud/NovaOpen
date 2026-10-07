// Landing cinematica (adattamento vanilla di "Cinematic Landing Hero") + CTA + scorrimento
(function () {
  const root = document.documentElement;
  const cine = document.querySelector('.cine');

  // Pulsanti di acquisto: metti il link di pagamento nell'href al posto di "#"
  document.querySelectorAll('.js-buy').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.getAttribute('href') === '#') {
        e.preventDefault();
        alert('Checkout in arrivo! Collega qui il link di pagamento.');
      }
    });
  });

  // Scorrimento morbido verso le sezioni (gestito qui, non via CSS, per non disturbare lo scroll della landing)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.id === 'nav-buy' || a.classList.contains('js-buy')) return;
    a.addEventListener('click', function (e) {
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  const navBuy = document.getElementById('nav-buy');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Versione semplice
  if (!cine || reduce || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('cine-pending');
    if (navBuy) {
      navBuy.addEventListener('click', function (e) {
        e.preventDefault();
        const el = document.getElementById('acquista-static');
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
      });
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const isMobile = window.innerWidth < 768;
  let scrollTl;
  window.__cine3d = false; // il 3D si disegna solo quando la card è visibile

  // --- Inclinazione leggera del 3D col mouse (solo desktop) ---
  const card = document.querySelector('.main-card');
  const tilt = document.querySelector('.mockup-tilt');
  if (!isMobile && window.matchMedia('(pointer: fine)').matches) {
    let raf = 0;
    window.addEventListener('mousemove', function (e) {
      if (!window.__cine3d) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
        const xv = (e.clientX / window.innerWidth - 0.5) * 2;
        const yv = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(tilt, { rotationY: xv * 6, rotationX: -yv * 6, ease: 'power3.out', duration: 1.2 });
      });
    });
  }

  gsap.context(function () {
    gsap.set('.text-track', { autoAlpha: 0, y: 50, scale: 0.9, rotationX: -15 });
    gsap.set('.text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
    gsap.set('.main-card', { y: window.innerHeight + 200, autoAlpha: 1 });
    gsap.set(['.card-left-text', '.card-right-text', '.mockup-scroll-wrapper', '.floating-badge'], { autoAlpha: 0 });
    gsap.set('.mockup-scroll-wrapper', { transformPerspective: 1000 });
    gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.92 });

    gsap.timeline({ delay: 0.3 })
      .to('.text-track', { duration: 1.4, autoAlpha: 1, y: 0, scale: 1, rotationX: 0, ease: 'expo.out' })
      .to('.text-days', { duration: 1.2, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=0.8');

    scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: cine,
        start: 'top top',
        end: '+=' + (isMobile ? 2600 : 3400),
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: function () {
          if (!scrollTl || scrollTl.labels.m3d === undefined) return;
          const t = scrollTl.time(), L = scrollTl.labels;
          window.__cine3d = t >= L.m3d - 0.4 && t <= L.m3dEnd + 1.6;
        },
        onLeave: function () { window.__cine3d = false; },
        onLeaveBack: function () { window.__cine3d = false; }
      }
    });

    scrollTl
      .to('.hero-text-wrapper', { scale: 1.1, opacity: 0.15, ease: 'power2.inOut', duration: 2 }, 0)
      .to('.bg-grid-theme', { opacity: 0.1, ease: 'power2.inOut', duration: 2 }, 0)
      .to('.scroll-hint', { autoAlpha: 0, duration: 0.3 }, 0)
      .to('.main-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
      .to('.main-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.4 })
      .addLabel('m3d')
      .fromTo('.mockup-scroll-wrapper',
        { y: 200, z: -300, rotationX: 35, rotationY: -20, autoAlpha: 0, scale: 0.7 },
        { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 2 }, '-=0.8')
      .fromTo('.floating-badge',
        { y: 80, autoAlpha: 0, scale: 0.8 },
        { y: 0, autoAlpha: 1, scale: 1, ease: 'back.out(1.4)', duration: 1.2, stagger: 0.2 }, '-=1.3')
      .fromTo('.card-left-text', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.3 }, '-=1.3')
      .fromTo('.card-right-text', { x: 50, autoAlpha: 0, scale: 0.85 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.3 }, '<')
      .to({}, { duration: 1.4 })
      .addLabel('m3dEnd')
      .set('.hero-text-wrapper', { autoAlpha: 0 })
      .set('.cta-wrapper', { autoAlpha: 1 })
      .to(['.mockup-scroll-wrapper', '.floating-badge', '.card-left-text', '.card-right-text'], {
        scale: 0.92, y: -30, autoAlpha: 0, ease: 'power3.in', duration: 1, stagger: 0.04
      })
      .to('.main-card', {
        width: isMobile ? '92vw' : '85vw',
        height: isMobile ? '92vh' : '85vh',
        borderRadius: isMobile ? '32px' : '40px',
        ease: 'expo.inOut',
        duration: 1.5
      }, 'pullback')
      .to('.cta-wrapper', { scale: 1, ease: 'expo.inOut', duration: 1.5 }, 'pullback')
      .to('.main-card', { y: -window.innerHeight - 300, ease: 'power3.in', duration: 1.3 })
      .to({}, { duration: 0.8 });
  }, cine);

  // "Acquista" nel menu porta all'offerta finale, in fondo alla landing
  if (navBuy) {
    navBuy.addEventListener('click', function (e) {
      e.preventDefault();
      const st = scrollTl && scrollTl.scrollTrigger;
      if (st) window.scrollTo({ top: st.end - 20, behavior: 'smooth' });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
