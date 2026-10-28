/* Shared motion for the inner pages: Lenis smooth scroll, GSAP reveals, nav, counters, chips. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 });
    }));
  }

  /* Internal page links: navigate this frame directly so the host's link handling cannot swallow them */
  addEventListener('click', e => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute('href');
    if (/^(https?:)?\/\//.test(href) || href.startsWith('#') || href.startsWith('mailto:')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.assign(new URL(href, location.href).href);
  }, true);

  /* Nav */
  const nav = document.getElementById('nav');
  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('is-solid', y > 40);
    if (y > 400 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 400) nav.classList.remove('is-hidden');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  /* Chips: stagger index + cursor-tracking glow */
  document.querySelectorAll('.stack').forEach(stack => {
    [...stack.children].forEach((chip, i) => {
      chip.style.setProperty('--i', i);
      chip.addEventListener('mousemove', e => {
        const r = chip.getBoundingClientRect();
        chip.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        chip.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  });

  /* Copy buttons: data-copy="#id" */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const src = document.querySelector(btn.dataset.copy); if (!src) return;
    const label = btn.textContent;
    btn.addEventListener('click', () => {
      const done = () => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = label, 1800); };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents(src); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Select and copy'; };
      try { navigator.clipboard.writeText(src.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  if (!hasGsap) return;

  /* Page header parallax */
  if (!reduce) gsap.to('.page-head .wrap', {
    y: 80, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.page-head', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Reveals grouped by section */
  if (!reduce) {
    const groups = new Map();
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const p = el.closest('section, article, header') || document.body;
      if (!groups.has(p)) groups.set(p, []); groups.get(p).push(el);
    });
    groups.forEach((els, sec) => gsap.from(els, {
      y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: sec, start: 'top 80%' }
    }));
  }

  /* Scroll-drawn timeline line */
  document.querySelectorAll('.timeline .draw').forEach(line => {
    if (reduce) { line.style.transform = 'none'; return; }
    gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line.parentElement, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 } });
  });

  /* Counters */
  document.querySelectorAll('[data-count]').forEach(el => {
    const v = el.querySelector('.v'), end = +el.dataset.count, dec = +(el.dataset.dec || 0);
    const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) { v.textContent = fmt(end); return; }
    const o = { n: 0 };
    gsap.to(o, { n: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => v.textContent = fmt(o.n) });
  });

  /* Magnetic buttons */
  if (!reduce) document.querySelectorAll('[data-magnet]').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4 }); });
    b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
