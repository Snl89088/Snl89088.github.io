// ===== Load dynamic sections =====
async function loadSections() {
    const sections = [
        { id: 'about-container', url: 'sections/about.html' },
        { id: 'research-container', url: 'sections/research.html' },
        { id: 'innovation-container', url: 'sections/innovation.html' },
        { id: 'publications-container', url: 'sections/publications.html' },
        { id: 'patents-container', url: 'sections/patents.html' },
        { id: 'projects-container', url: 'sections/projects.html' },
        { id: 'skills-container', url: 'sections/skills.html' },
        { id: 'awards-container', url: 'sections/awards.html' },
        { id: 'talks-container', url: 'sections/talks.html' },
        { id: 'blog-container', url: 'sections/blog.html' },
        { id: 'media-container', url: 'sections/media.html' },
        { id: 'contact-container', url: 'sections/contact.html' }
    ];
 
    const fetchPromises = sections.map(async (sec) => {
        const response = await fetch(sec.url);
        const html = await response.text();
        document.getElementById(sec.id).innerHTML = html;
    });
 
    await Promise.all(fetchPromises);
   
    // Now that sections are loaded, initialize scripts
    initScripts();
}
 
function initScripts() {
    // ===== Mobile menu =====
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    navToggle.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
        mobileMenu.setAttribute('aria-hidden', !open);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
 
    // ===== Nav scroll state =====
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 16) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }, { passive: true });
 
    // ===== Reveal on scroll =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
 
    // ===== Number counters =====
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const duration = 1600;
                const start = performance.now();
                function tick(now) {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const val = Math.round(target * eased);
                    if (el.dataset.count === '340') {
                        el.innerHTML = val + '<span> MW</span>';
                    } else {
                        el.textContent = val;
                    }
                    if (t < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
 
    // ===== Skill rings =====
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const ring = card.querySelector('.skill-ring');
                const progress = card.querySelector('.skill-ring-progress');
                const percent = parseInt(ring.dataset.percent, 10);
                const circumference = 2 * Math.PI * 52;
                const offset = circumference - (percent / 100) * circumference;
                const valueEl = card.querySelector('.skill-ring-value');
                const target = percent;
                const duration = 1400;
                const start = performance.now();
                setTimeout(() => { progress.style.strokeDashoffset = offset; }, 50);
                function tick(now) {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    const val = Math.round(target * eased);
                    valueEl.innerHTML = val + '<span>%</span>';
                    if (t < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                skillObserver.unobserve(card);
            }
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('.skill-card').forEach(el => skillObserver.observe(el));
 
    // ===== Publication filter buttons =====
    document.querySelectorAll('.pub-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pub-filter').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
        });
    });
 
    // ===== Contact form =====
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            toast.style.pointerEvents = 'auto';
            form.reset();
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                toast.style.pointerEvents = 'none';
            }, 3800);
        });
    }
}
 
// ===== Hero animated H2 molecules (canvas) =====
(function() {
    const canvas = document.getElementById('moleculeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, dpr;
    const molecules = [];
 
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.offsetWidth;
        h = canvas.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
 
    function initMolecules() {
        molecules.length = 0;
        const count = Math.min(18, Math.floor((w * h) / 60000));
        for (let i = 0; i < count; i++) {
            molecules.push({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
                rotation: Math.random() * Math.PI * 2,
                vRotation: (Math.random() - 0.5) * 0.004,
                scale: 0.6 + Math.random() * 0.9,
                opacity: 0.18 + Math.random() * 0.22
            });
        }
    }
 
    function drawMolecule(m) {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rotation);
        ctx.scale(m.scale, m.scale);
        const bondLength = 36;
        const atomRadius = 11;
        ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-bondLength/2, 0);
        ctx.lineTo(bondLength/2, 0);
        ctx.stroke();
 
        const grad1 = ctx.createRadialGradient(-bondLength/2 - 3, -3, 1, -bondLength/2, 0, atomRadius);
        grad1.addColorStop(0, `rgba(0, 153, 255, ${m.opacity})`);
        grad1.addColorStop(1, `rgba(0, 153, 255, 0)`);
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(-bondLength/2, 0, atomRadius, 0, Math.PI * 2);
        ctx.fill();
 
        ctx.strokeStyle = `rgba(0, 153, 255, ${m.opacity * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-bondLength/2, 0, atomRadius - 3, 0, Math.PI * 2);
        ctx.stroke();
 
        const grad2 = ctx.createRadialGradient(bondLength/2 - 3, -3, 1, bondLength/2, 0, atomRadius);
        grad2.addColorStop(0, `rgba(22, 199, 132, ${m.opacity})`);
        grad2.addColorStop(1, `rgba(22, 199, 132, 0)`);
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(bondLength/2, 0, atomRadius, 0, Math.PI * 2);
        ctx.fill();
 
        ctx.strokeStyle = `rgba(22, 199, 132, ${m.opacity * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bondLength/2, 0, atomRadius - 3, 0, Math.PI * 2);
        ctx.stroke();
 
        ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity * 1.4})`;
        ctx.font = '600 11px Manrope, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', -bondLength/2, 0);
        ctx.fillText('H', bondLength/2, 0);
        ctx.restore();
    }
 
    function animate() {
        ctx.clearRect(0, 0, w, h);
        molecules.forEach(m => {
            m.x += m.vx; m.y += m.vy; m.rotation += m.vRotation;
            if (m.x < -60) m.x = w + 60;
            if (m.x > w + 60) m.x = -60;
            if (m.y < -60) m.y = h + 60;
            if (m.y > h + 60) m.y = -60;
            drawMolecule(m);
        });
        requestAnimationFrame(animate);
    }
 
    function init() {
        resize();
        initMolecules();
        if (!prefersReduced) {
            animate();
        } else {
            molecules.forEach(m => drawMolecule(m));
        }
    }
 
    init();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 150);
    });
})();
 
// Kick off loading sections
loadSections();
