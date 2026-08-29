/* =========================================================
   SETUP
========================================================= */
gsap.registerPlugin(ScrollTrigger);

const isMobile = window.matchMedia('(max-width: 860px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   LOADER
========================================================= */
const loaderFill = document.getElementById('loaderFill');
const loaderPct = document.getElementById('loaderPct');
const loaderEl = document.getElementById('loader');

let loadProgress = 0;
const loadTimer = setInterval(() => {
  loadProgress += Math.random() * 18;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadTimer);
    finishLoad();
  }
  loaderFill.style.width = loadProgress + '%';
  loaderPct.textContent = String(Math.floor(loadProgress)).padStart(2, '0');
}, 140);

function finishLoad() {
  gsap.to({}, {
    duration: 0.3,
    onComplete: () => {
      loaderEl.classList.add('done');
      document.body.style.overflow = '';
      playHeroIntro();
    }
  });
}

/* =========================================================
   CUSTOM CURSOR
========================================================= */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

if (!isMobile) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    gsap.set(cursorRing, { x: ringX, y: ringY });
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

/* =========================================================
   SMOOTH SCROLL (Lenis)
========================================================= */
let lenis;
if (!isMobile && !prefersReducedMotion && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* Nav links + anchor scroll */
document.querySelectorAll('[data-nav]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    document.getElementById('navMobile').classList.remove('open');
    if (target) {
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));

/* =========================================================
   SCROLL PROGRESS RAIL
========================================================= */
const scrollFill = document.getElementById('scrollFill');
function updateScrollRail() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollFill.style.width = scrolled + '%';
}
window.addEventListener('scroll', updateScrollRail);

/* =========================================================
   HERO INTRO TEXT REVEAL
========================================================= */
function playHeroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.eyebrow span', { y: 0, opacity: 1, duration: 0.9 }, 0.1)
    .fromTo('.line-inner[data-speed="1"]', { yPercent: 110 }, { yPercent: 0, duration: 1.1 }, 0.25)
    .fromTo('.line-inner.outline', { yPercent: 110 }, { yPercent: 0, duration: 1.1 }, 0.4)
    .fromTo('.hero-sub span', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.65)
    .fromTo('.btn-magnetic', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.8)
    .fromTo('.hero-frame', { opacity: 0 }, { opacity: 1, duration: 1 }, 0.2)
    .fromTo('.hero-meta', { opacity: 0 }, { opacity: 1, duration: 1 }, 0.9)
    .fromTo('.nav', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
}
// Set initial state for eyebrow (avoid FOUC before intro plays)
gsap.set('.eyebrow span', { y: 24, opacity: 0 });

/* =========================================================
   SCROLL-TRIGGERED REVEALS
========================================================= */
gsap.utils.toArray('.reveal-up').forEach((el) => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});

gsap.utils.toArray('.work-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 85%' }
  });
});

/* Timeline fill + dot activation */
gsap.to('#timelineFill', {
  height: '100%', ease: 'none',
  scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 }
});
gsap.utils.toArray('.timeline-item').forEach((item) => {
  ScrollTrigger.create({
    trigger: item, start: 'top 65%',
    onEnter: () => item.classList.add('in-view'),
  });
});

/* Achievements counters */
gsap.utils.toArray('.stat-num').forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 1.8, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.floor(obj.val); }
      });
    }
  });
});

/* =========================================================
   MAGNETIC BUTTONS
========================================================= */
if (!isMobile) {
  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    const inner = btn.querySelector('.btn-magnetic-inner');
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(inner, { x: x * 0.35, y: y * 0.5, duration: 0.5, ease: 'power3.out' });
      gsap.to(btn, { x: x * 0.12, y: y * 0.18, duration: 0.5, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* =========================================================
   3D TILT — SKILL & WORK CARDS
========================================================= */
if (!isMobile) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const inner = card.querySelector('.skill-card-inner') || card;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(inner, {
        rotateY: px * 14, rotateX: -py * 14, duration: 0.5, ease: 'power2.out',
        transformPerspective: 900
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(inner, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' });
    });
  });
}

/* =========================================================
   CONTACT FORM
========================================================= */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formNote.textContent = 'Thanks — your message has been noted. I\'ll get back to you soon.';
  contactForm.reset();
});

/* =========================================================
   PARTICLES (2D canvas, hero background)
========================================================= */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const COUNT = isMobile ? 40 : 110;

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.3,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    o: Math.random() * 0.5 + 0.15
  }));

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

/* =========================================================
   THREE.JS — HERO SCENE
========================================================= */
(function initHeroScene() {
  const canvas = document.getElementById('webgl');
  const heroSection = document.querySelector('.hero');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 9 : 7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* Lighting — cinematic, monochrome */
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
  rimLight.position.set(-5, -3, -4);
  scene.add(rimLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  /* Central abstract geometry — icosahedron core + wireframe shell */
  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x111111, metalness: 0.85, roughness: 0.25,
    flatShading: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const wireGeo = new THREE.IcosahedronGeometry(2.15, 1);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.18 });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  /* Orbiting ring of small octahedra */
  const satellites = new THREE.Group();
  const satCount = isMobile ? 6 : 10;
  for (let i = 0; i < satCount; i++) {
    const geo = new THREE.OctahedronGeometry(0.09, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.6, roughness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / satCount) * Math.PI * 2;
    const radius = 3.1;
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * 0.6, Math.sin(angle) * radius);
    satellites.add(mesh);
  }
  group.add(satellites);

  /* Scattered background points (starfield-like, 3D depth) */
  const starGeo = new THREE.BufferGeometry();
  const starCount = isMobile ? 200 : 500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 24;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* Mouse-responsive parallax */
  let targetRotX = 0, targetRotY = 0;
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = mx * 0.4;
    targetRotX = my * 0.25;
  });

  /* Gyroscope fallback for touch devices */
  if (isMobile && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        targetRotY = (e.gamma / 90) * 0.3;
        targetRotX = (e.beta / 180) * 0.2;
      }
    });
  }

  /* Scroll-based camera movement */
  let scrollProgress = 0;
  ScrollTrigger.create({
    trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { scrollProgress = self.progress; }
  });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    group.rotation.y += 0.0022;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.04);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, group.rotation.y + (targetRotY - group.rotation.y) * 0.04, 1);

    wire.rotation.y -= 0.0009;
    wire.rotation.x += 0.0006;

    satellites.rotation.y += 0.0016;
    satellites.children.forEach((s, i) => {
      s.rotation.x += 0.01;
      s.rotation.y += 0.008;
    });

    stars.rotation.y += 0.00015;

    /* Cinematic camera drift + scroll parallax */
    camera.position.x = Math.sin(t * 0.08) * 0.3 + mx * 0.25;
    camera.position.y = Math.cos(t * 0.1) * 0.15 - my * 0.15 - scrollProgress * 1.4;
    camera.position.z = (isMobile ? 9 : 7) + scrollProgress * 2.5;
    camera.lookAt(0, -scrollProgress * 0.6, 0);

    group.position.y = -scrollProgress * 0.8;
    group.scale.setScalar(1 - scrollProgress * 0.15);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* =========================================================
   THREE.JS — ABOUT SECTION MINI SCENE
========================================================= */
(function initAboutScene() {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, parent.clientWidth / parent.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(parent.clientWidth, parent.clientHeight);

  const light1 = new THREE.DirectionalLight(0xffffff, 2);
  light1.position.set(3, 4, 5);
  scene.add(light1);
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const shapes = new THREE.Group();
  scene.add(shapes);

  const geoTypes = [
    () => new THREE.TorusKnotGeometry(0.5, 0.14, 100, 12),
    () => new THREE.OctahedronGeometry(0.6, 0),
    () => new THREE.TetrahedronGeometry(0.6, 0)
  ];
  const count = isMobile ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const geo = geoTypes[i % geoTypes.length]();
    const mat = new THREE.MeshStandardMaterial({
      color: i === 0 ? 0x0e0e0e : 0x1a1a1a, metalness: 0.75, roughness: 0.3, flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((i - 1) * 1.4, Math.sin(i) * 0.5, -i * 0.6);
    shapes.add(mesh);
  }

  let hovering = false;
  parent.addEventListener('mouseenter', () => hovering = true);
  parent.addEventListener('mouseleave', () => hovering = false);

  let rotSpeed = 0.004;
  ScrollTrigger.create({
    trigger: parent, start: 'top 90%', end: 'bottom top',
    onUpdate: () => { rotSpeed = 0.006; }
  });

  function animate() {
    shapes.children.forEach((m, i) => {
      m.rotation.x += rotSpeed * (i + 1) * 0.6;
      m.rotation.y += rotSpeed * (i + 1);
    });
    shapes.rotation.y += hovering ? 0.006 : 0.0015;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = parent.clientWidth / parent.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(parent.clientWidth, parent.clientHeight);
  });
})();

/* =========================================================
   REFRESH SCROLLTRIGGER AFTER LOAD
========================================================= */
window.addEventListener('load', () => ScrollTrigger.refresh());
