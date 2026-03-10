/* ═══════════════════════════════════════════════════
   main.js — Orchestrator: nav, hero, particles,
              menu grid, pizza tabs, cart, scroll reveal,
              order canvas, newsletter
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     1. NAVBAR — scroll glass + hamburger
  ══════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  /* close mobile menu on link click */
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ══════════════════════════════════════════
     2. HERO CANVAS — floating orbs / shapes
  ══════════════════════════════════════════ */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* floating glass blobs */
    const blobs = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 40 + Math.random() * 80,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .3,
      hue: 20 + Math.random() * 40,
      alpha: .04 + Math.random() * .06,
    }));

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      blobs.forEach(b => {
        /* fill */
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `hsla(${b.hue},80%,75%,${b.alpha})`);
        g.addColorStop(1, `hsla(${b.hue},60%,50%,0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        /* drift */
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = W + b.r;
        if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        if (b.y > H + b.r) b.y = -b.r;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ══════════════════════════════════════════
     3. HERO PARTICLES
  ══════════════════════════════════════════ */
  function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const emojis = ['✦','◈','⬡','◉','✿','◆','⬟'];
    const count  = 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      const size = 4 + Math.random() * 10;
      const x = Math.random() * 100;
      const delay = Math.random() * 12;
      const dur   = 8 + Math.random() * 10;
      const tx    = (Math.random() - .5) * 120;

      /* some are emoji, most are circles */
      if (Math.random() < .25) {
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.fontSize = `${10 + Math.random() * 14}px`;
        el.style.color = `hsl(${20 + Math.random()*40},70%,65%)`;
        el.style.background = 'none';
        el.style.width = 'auto'; el.style.height = 'auto';
      } else {
        el.style.width  = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = `hsl(${15 + Math.random()*50},70%,70%)`;
        el.style.opacity = `${.2 + Math.random() * .4}`;
      }

      el.style.left = `${x}%`;
      el.style.bottom = '-10px';
      el.style.setProperty('--tx', `${tx}px`);
      el.style.animationDuration  = `${dur}s`;
      el.style.animationDelay     = `-${delay}s`;

      container.appendChild(el);
    }
  }

  /* ══════════════════════════════════════════
     4. PIZZA TABS
  ══════════════════════════════════════════ */
  const pizzaData = {
    volcano: {
      name: 'Volcano Cheese Pizza',
      desc: 'Triple-layered mozzarella, cheddar lava, golden crust — a cheese lover\'s dream. Every bite erupts with flavor.',
      price: '₹ 349',
    },
    truffle: {
      name: 'Truffle Mushroom Pizza',
      desc: 'Wild porcini & shiitake mushrooms, black truffle oil, aged parmesan snow on a golden brown crust.',
      price: '₹ 429',
    },
    garden: {
      name: 'Garden Fresh Pizza',
      desc: 'Roasted bell peppers, caramelized onions, basil pesto, zucchini ribbons — a garden in every bite.',
      price: '₹ 299',
    },
    bbq: {
      name: 'Smoky BBQ Chicken',
      desc: 'Slow-smoked pulled chicken, smoky BBQ glaze, red onion, jalapeños on our signature sourdough base.',
      price: '₹ 379',
    },
  };

  const pizzaImages = {
    volcano: 'img/pizza_volcano.png',
    truffle:  'img/pizza_truffle.png',
    garden:   'img/pizza_volcano.png', /* reuse with hue shift via filter */
    bbq:      'img/pizza_truffle.png',
  };
  const pizzaFilters = {
    volcano: '',
    truffle:  '',
    garden:  'hue-rotate(35deg) saturate(1.2)',
    bbq:     'hue-rotate(-15deg) saturate(1.3) brightness(.95)',
  };

  document.querySelectorAll('.pizza-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.pizza;
      document.querySelectorAll('.pizza-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      /* update info card */
      const d = pizzaData[type];
      if (d) {
        animateText('#pizzaName', d.name);
        animateText('#pizzaDesc', d.desc);
        animateText('#pizzaPrice', d.price);
      }

      /* swap real images with fade */
      const realImg  = document.getElementById('pizzaRealImg');
      const heroImg  = document.getElementById('heroPizzaImg');
      if (realImg) {
        realImg.classList.add('switching');
        setTimeout(() => {
          realImg.src = pizzaImages[type] || pizzaImages.volcano;
          realImg.style.filter = pizzaFilters[type] || '';
          realImg.classList.remove('switching');
        }, 350);
      }
      if (heroImg) {
        heroImg.src = pizzaImages[type] || pizzaImages.volcano;
        heroImg.style.filter = pizzaFilters[type] || '';
      }

      /* legacy canvas API — kept for fallback */
      if (window.setPizzaType) window.setPizzaType(type);
    });
  });


  function animateText(selector, text) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    requestAnimationFrame(() => {
      el.textContent = text;
      el.style.transition = 'opacity .35s, transform .35s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  /* ══════════════════════════════════════════
     5. FULL MENU GRID
  ══════════════════════════════════════════ */
  /* ════════════════════════════════════════════
     Image / filter / animation map per item
     6 real photos are reused with CSS filters
     to create unique looks for every dish.
     anim class drives the GIF-like behaviour.
  ════════════════════════════════════════════ */
  const MENU_ITEMS = [
    /* ── Pizza ── */
    { cat:'pizza',    name:'Volcano Cheese Pizza',   desc:'Triple cheese, crispy crust',          price:349,
      img:'img/pizza_volcano.png', filter:'',                                                      anim:'gifFloat' },
    { cat:'pizza',    name:'Truffle Mushroom Pizza', desc:'Wild mushrooms, truffle oil',           price:429,
      img:'img/pizza_truffle.png', filter:'',                                                      anim:'gifBreathe' },
    { cat:'pizza',    name:'Garden Fresh Pizza',     desc:'Seasonal veggies, basil pesto',        price:299,
      img:'img/pizza_volcano.png', filter:'hue-rotate(35deg) saturate(1.3)',                       anim:'gifFloat' },
    { cat:'pizza',    name:'Smoky BBQ Pizza',        desc:'Pulled chicken, jalapeños',            price:379,
      img:'img/pizza_truffle.png', filter:'hue-rotate(-20deg) saturate(1.4) brightness(.92)',      anim:'gifBreathe' },
    { cat:'pizza',    name:'Margarita Classic',      desc:'Tomato, buffalo mozzarella, basil',    price:249,
      img:'img/pizza_volcano.png', filter:'saturate(.85) brightness(1.05)',                        anim:'gifFloat' },

    /* ── Drinks ── */
    { cat:'drinks',   name:'Mango Juice',            desc:'Fresh Alphonso mango blend',           price:149,
      img:'img/mango_juice.png',   filter:'',                                                      anim:'gifLiquid' },
    { cat:'drinks',   name:'Strawberry Smoothie',    desc:'Fresh berries, yogurt, honey',         price:179,
      img:'img/strawberry.png',    filter:'',                                                      anim:'gifLiquid' },
    { cat:'drinks',   name:'Orange Juice',           desc:'Cold-pressed Valencia oranges',        price:129,
      img:'img/orange_juice.png',  filter:'',                                                      anim:'gifLiquid' },
    { cat:'drinks',   name:'Blueberry Soda',         desc:'Sparkling blueberry lavender',         price:159,
      img:'img/blueberry.png',     filter:'',                                                      anim:'gifBubble' },
    { cat:'drinks',   name:'Matcha Latte',           desc:'Ceremonial grade, oat foam',           price:199,
      img:'img/mango_juice.png',   filter:'hue-rotate(82deg) saturate(1.6) brightness(.9)',        anim:'gifLiquid' },

    /* ── Juices ── */
    { cat:'juices',   name:'Watermelon Rush',        desc:'Fresh watermelon, mint, salt',         price:119,
      img:'img/strawberry.png',    filter:'hue-rotate(20deg) saturate(1.5) brightness(1.1)',       anim:'gifLiquid' },
    { cat:'juices',   name:'Dragon Fruit Blast',     desc:'Pink dragon fruit, coconut water',     price:189,
      img:'img/strawberry.png',    filter:'hue-rotate(-20deg) saturate(1.8) brightness(1.08)',     anim:'gifBubble' },
    { cat:'juices',   name:'Green Detox',            desc:'Spinach, cucumber, ginger, lemon',     price:159,
      img:'img/mango_juice.png',   filter:'hue-rotate(75deg) saturate(2) brightness(.88)',         anim:'gifLiquid' },
    { cat:'juices',   name:'Pomegranate Punch',      desc:'Cold-pressed pomegranate, rose',       price:169,
      img:'img/blueberry.png',     filter:'hue-rotate(40deg) saturate(1.6) brightness(1.05)',      anim:'gifBubble' },

    /* ── Desserts — real Unsplash dessert photos ── */
    { cat:'desserts', name:'Chocolate Lava Cake',    desc:'Warm molten center, vanilla ice cream',price:219,
      img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center', filter:'', anim:'gifGlow' },
    { cat:'desserts', name:'Mango Panna Cotta',      desc:'Italian cream, fresh mango jelly',     price:189,
      img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center', filter:'', anim:'gifGlow' },
    { cat:'desserts', name:'Berry Cheesecake',       desc:'New York style, mixed berry compôte',  price:229,
      img:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&crop=center', filter:'', anim:'gifGlow' },
    { cat:'desserts', name:'Tiramisu Cup',           desc:'Espresso-soaked, mascarpone cloud',    price:199,
      img:'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop&crop=center', filter:'', anim:'gifGlow' },
  ];


  const menuGrid = document.getElementById('menuGrid');
  let activeMenuCat = 'all';

  function renderMenu(cat) {
    if (!menuGrid) return;
    activeMenuCat = cat;
    const items = cat === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.cat === cat);

    menuGrid.innerHTML = items.map((item, idx) => {
      const delay  = (idx * 0.055).toFixed(2);
      const animClass = item.anim || 'gifFloat';
      const badge = {
        pizza:    '<span class="menu-badge badge-pizza">🍕 Pizza</span>',
        drinks:   '<span class="menu-badge badge-drink">🥤 Drink</span>',
        juices:   '<span class="menu-badge badge-juice">🍹 Juice</span>',
        desserts: '<span class="menu-badge badge-dessert">🍰 Dessert</span>',
      }[item.cat] || '';

      return `
        <article class="menu-item glass-card" style="animation-delay:${delay}s">
          <div class="menu-item-img">
            <img
              src="${item.img}"
              alt="${item.name}"
              class="menu-item-real-img ${animClass}"
              style="filter:${item.filter || ''}"
              loading="lazy"
            />
            <div class="menu-img-shimmer"></div>
            <div class="menu-hover-glow"></div>
            <div class="menu-hover-overlay">
              <span style="color:#fff;font-size:.78rem;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,.4)">${item.name}</span>
            </div>
            ${badge}
          </div>
          <div class="menu-item-body">
            <p class="menu-item-name">${item.name}</p>
            <p class="menu-item-desc">${item.desc}</p>
            <div class="menu-item-footer">
              <span class="price">₹ ${item.price}</span>
              <button class="btn btn-primary btn-sm cart-btn"
                data-item="${item.name}" data-price="${item.price}">Add</button>
            </div>
          </div>
        </article>`;
    }).join('');

    /* re-bind cart for new elements */
    bindCartButtons(menuGrid);
  }

  document.querySelectorAll('.menu-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu(btn.dataset.cat);
    });
  });

  renderMenu('all');

  /* ══════════════════════════════════════════
     6. CART
  ══════════════════════════════════════════ */
  let cartCount = 0;
  const cartCountEl = document.getElementById('cartCount');
  const cartToast   = document.getElementById('cartToast');
  let toastTimer;

  function addToCart(name, price) {
    cartCount++;
    cartCountEl.textContent = cartCount;
    cartCountEl.classList.add('visible');

    clearTimeout(toastTimer);
    cartToast.textContent = `🛒 Added: ${name} — ₹${price}`;
    cartToast.classList.add('show');
    toastTimer = setTimeout(() => cartToast.classList.remove('show'), 2800);

    /* pulse cart fab */
    const fab = document.getElementById('cartFab');
    fab.style.transform = 'scale(1.25)';
    setTimeout(() => fab.style.transform = '', 300);
  }

  function bindCartButtons(root) {
    root.querySelectorAll('.cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.item, btn.dataset.price);
        btn.textContent = '✓ Added';
        btn.style.background = 'linear-gradient(135deg,#27AE60,#1E8449)';
        setTimeout(() => {
          btn.textContent = btn.textContent.includes('Order') ? 'Order' : 'Add';
          btn.style.background = '';
        }, 1800);
      });
    });
  }

  /* Bind static cart buttons (not in menu grid) */
  bindCartButtons(document);

  /* ══════════════════════════════════════════
     7. SCROLL REVEAL
  ══════════════════════════════════════════ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('section, .pizza-detail-card, .footer-inner');
    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════
     8. ORDER CANVAS — rotating logo / food art
  ══════════════════════════════════════════ */
  function initOrderCanvas() {
    const canvas = document.getElementById('orderCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t = 0;

    /* generate a small orbiting food scene */
    const items = [
      { emoji:'🍕', angle: 0,          r: 90, speed: .008, size: 28 },
      { emoji:'🥭', angle: Math.PI*.5, r: 70, speed: .012, size: 22 },
      { emoji:'🍓', angle: Math.PI,    r: 85, speed: .009, size: 22 },
      { emoji:'🍺', angle: Math.PI*1.5,r:75,  speed: .011, size: 22 },
      { emoji:'☕', angle: Math.PI*.25,r:65,  speed: .014, size: 20 },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* background circle */
      const bg = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, 110);
      bg.addColorStop(0, 'rgba(255,158,74,.15)');
      bg.addColorStop(1, 'rgba(255,158,74,0)');
      ctx.beginPath();
      ctx.arc(W/2, H/2, 110, 0, Math.PI*2);
      ctx.fillStyle = bg;
      ctx.fill();

      /* orbit rings */
      [65, 80, 95].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(W/2, H/2, r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(255,158,74,${.06 + i*.02})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      /* centre logo emoji */
      ctx.font = '44px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', W/2, H/2);

      /* orbiting items */
      items.forEach(item => {
        item.angle += item.speed;
        const x = W/2 + Math.cos(item.angle) * item.r;
        const y = H/2 + Math.sin(item.angle) * item.r;
        ctx.font = `${item.size}px serif`;
        ctx.fillText(item.emoji, x, y);
      });

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ══════════════════════════════════════════
     9. NEWSLETTER
  ══════════════════════════════════════════ */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsEmail').value;
    if (!email) return;
    const btn = document.getElementById('newsletterBtn');
    btn.textContent = '✓ Subscribed!';
    btn.style.background = 'linear-gradient(135deg,#27AE60,#1E8449)';
    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      newsletterForm.reset();
    }, 3000);
    cartToast.textContent = `📩 Subscribed with ${email}`;
    cartToast.classList.add('show');
    setTimeout(() => cartToast.classList.remove('show'), 2800);
  });

  /* ══════════════════════════════════════════
     10. ACTIVE NAV LINK HIGHLIGHT
  ══════════════════════════════════════════ */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link:not(.nav-cta)');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active-nav'));
          const link = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
          link?.classList.add('active-nav');
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => io.observe(s));
  }

  /* ══════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initHeroParticles();
    initOrderCanvas();
    initScrollReveal();
    initActiveNav();
  });

  /* Active nav link style (non-cta) */
  const navStyle = document.createElement('style');
  navStyle.textContent = `.active-nav { color: var(--orange) !important; }
    .active-nav::after { transform: scaleX(1) !important; }`;
  document.head.appendChild(navStyle);

})();
