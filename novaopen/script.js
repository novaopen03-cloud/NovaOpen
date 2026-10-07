// Landing cinematica (adattamento vanilla di "Cinematic Landing Hero") + CTA
(function () {
  const root = document.documentElement;
  const cine = document.querySelector('.cine');

  function bindBuy() {
    document.querySelectorAll('.js-buy').forEach(function (el) {
      el.addEventListener('click', function (e) {
        // Quando avrai il link di pagamento, metti l'href qui sopra (al posto di "#")
        if (el.getAttribute('href') === '#') {
          e.preventDefault();
          alert('Checkout in arrivo! Collega qui il link di pagamento.');
        }
      });
    });
  }
  bindBuy();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!cine || reduce || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('cine-pending'); // versione semplice
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const isMobile = window.innerWidth < 768;
  let scrollTl;

  // --- Luce che segue il mouse + inclinazione del 3D ---
  const card = document.querySelector('.main-card');
  const tilt = document.querySelector('.mockup-tilt');
  let raf = 0;
  window.addEventListener('mousemove', function (e) {
    if (window.scrollY > window.innerHeight * 8) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
      const xv = (e.clientX / window.innerWidth - 0.5) * 2;
      const yv = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(tilt, { rotationY: xv * 8, rotationX: -yv * 8, ease: 'power3.out', duration: 1.2 });
    });
  });

  // --- Timeline a scroll ---
  gsap.context(function () {
    gsap.set('.text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 });
    gsap.set('.text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
    gsap.set('.main-card', { y: window.innerHeight + 200, autoAlpha: 1 });
    gsap.set(['.card-left-text', '.card-right-text', '.mockup-scroll-wrapper', '.floating-badge'], { autoAlpha: 0 });
    gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' });

    gsap.timeline({ delay: 0.3 })
      .to('.text-track', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' })
      .to('.text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0');

    scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: cine,
        start: 'top top',
        end: '+=' + (isMobile ? 4200 : 5200),
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    scrollTl
      .to(['.hero-text-wrapper', '.bg-grid-theme'], { scale: 1.15, filter: 'blur(20px)', opacity: 0.2, ease: 'power2.inOut', duration: 2 }, 0)
      .to('.main-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
      .to('.main-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.5 })
      .fromTo('.mockup-scroll-wrapper',
        { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
        { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 2.5 }, '-=0.8')
      .fromTo('.floating-badge',
        { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 },
        { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: 'back.out(1.5)', duration: 1.5, stagger: 0.2 }, '-=1.6')
      .fromTo('.card-left-text', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.5 }, '-=1.5')
      .fromTo('.card-right-text', { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.5 }, '<')
      .to({}, { duration: 2.5 })
      .set('.hero-text-wrapper', { autoAlpha: 0 })
      .set('.cta-wrapper', { autoAlpha: 1 })
      .to({}, { duration: 1.5 })
      .to(['.mockup-scroll-wrapper', '.floating-badge', '.card-left-text', '.card-right-text'], {
        scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: 'power3.in', duration: 1.2, stagger: 0.05
      })
      .to('.main-card', {
        width: isMobile ? '92vw' : '85vw',
        height: isMobile ? '92vh' : '85vh',
        borderRadius: isMobile ? '32px' : '40px',
        ease: 'expo.inOut',
        duration: 1.8
      }, 'pullback')
      .to('.cta-wrapper', { scale: 1, filter: 'blur(0px)', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
      .to('.main-card', { y: -window.innerHeight - 300, ease: 'power3.in', duration: 1.5 })
      .to({}, { duration: 1.2 });
  }, cine);

  // "Acquista" nel menu porta alla CTA finale, in fondo alla landing
  const navBuy = document.getElementById('nav-buy');
  if (navBuy) {
    navBuy.addEventListener('click', function (e) {
      e.preventDefault();
      const st = scrollTl && scrollTl.scrollTrigger;
      if (st) window.scrollTo({ top: st.end - 20, behavior: 'smooth' });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
