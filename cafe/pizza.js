/* ═══════════════════════════════════════════════════
   pizza.js — Canvas pizza renderer + interaction
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Shared pizza palette ─── */
  const PALETTE = {
    crust:       '#C8854A',
    crustEdge:   '#A0622E',
    sauce:       '#C0392B',
    sauceDark:   '#922B21',
    cheese:      '#F4D03F',
    cheeseHigh:  '#F7DC6F',
    cheeseShad:  '#D4AC0D',
    olive:       '#1E6B24',
    pepperoni:   '#8B1A1A',
    pepperoniHi: '#B22222',
    bell:        '#27AE60',
    bellYellow:  '#F39C12',
    mushroom:    '#BDC3C7',
    mushroomDk:  '#7F8C8D',
    onion:       '#9B59B6',
    basil:       '#1A5928',
  };

  /* ═══════════════════════════════════════════════════
     Core renderPizza — draws one full pizza frame
  ═══════════════════════════════════════════════════ */
  function renderPizza(ctx, cx, cy, r, rotation, hoverAmt, type) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    /* ─ crust shadow ─ */
    ctx.shadowColor = 'rgba(80,40,10,.45)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.crustEdge;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* ─ crust ─ */
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.crust;
    ctx.fill();

    /* crust texture rings */
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r - i * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,98,46,${0.3 - i * 0.08})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* ─ sauce ─ */
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
    const sauceGrad = ctx.createRadialGradient(r * .15, -r * .15, 0, 0, 0, r * .84);
    sauceGrad.addColorStop(0, '#E74C3C');
    sauceGrad.addColorStop(1, PALETTE.sauceDark);
    ctx.fillStyle = sauceGrad;
    ctx.fill();

    /* sauce bumps */
    ctx.save();
    ctx.globalAlpha = .2;
    for (let k = 0; k < 8; k++) {
      const angle = (k / 8) * Math.PI * 2;
      const sr = r * .55;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * sr * .5, Math.sin(angle) * sr * .5, 12 + k * 2, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.sauce;
      ctx.fill();
    }
    ctx.restore();

    /* ─ cheese base ─ */
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    const cheeseGrad = ctx.createRadialGradient(r * .2, -r * .25, 0, 0, 0, r * .78);
    cheeseGrad.addColorStop(0, PALETTE.cheeseHigh);
    cheeseGrad.addColorStop(0.5, PALETTE.cheese);
    cheeseGrad.addColorStop(1, PALETTE.cheeseShad);
    ctx.fillStyle = cheeseGrad;
    ctx.fill();

    /* cheese bubbles */
    const bubbles = [
      { x: r*.3, y: -r*.2, r: r*.14 },
      { x: -r*.25, y: r*.25, r: r*.12 },
      { x: -r*.05, y: -r*.35, r: r*.1 },
      { x: r*.15, y: r*.38, r: r*.09 },
      { x: -r*.38, y: -r*.1, r: r*.11 },
    ];
    bubbles.forEach(b => {
      const bg = ctx.createRadialGradient(b.x - b.r*.3, b.y - b.r*.3, 0, b.x, b.y, b.r);
      bg.addColorStop(0, 'rgba(255,240,150,.9)');
      bg.addColorStop(0.6, PALETTE.cheese);
      bg.addColorStop(1, 'rgba(180,140,0,.5)');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + hoverAmt * 4, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
    });

    /* ─ toppings by type ─ */
    if (!type || type === 'volcano') drawVolcanoToppings(ctx, r, hoverAmt);
    else if (type === 'truffle')    drawTruffleToppings(ctx, r);
    else if (type === 'garden')     drawGardenToppings(ctx, r);
    else if (type === 'bbq')        drawBBQToppings(ctx, r);

    /* ─ sheen highlight ─ */
    const sheenGrad = ctx.createRadialGradient(-r*.3, -r*.3, 0, 0, 0, r);
    sheenGrad.addColorStop(0, 'rgba(255,255,255,.28)');
    sheenGrad.addColorStop(0.4, 'rgba(255,255,255,.06)');
    sheenGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = sheenGrad;
    ctx.fill();

    /* hover cheese stretch glow */
    if (hoverAmt > 0.05) {
      ctx.globalAlpha = hoverAmt * .5;
      ctx.shadowColor = '#F4D03F';
      ctx.shadowBlur = 20 + hoverAmt * 30;
      ctx.beginPath();
      ctx.arc(0, 0, r * .78, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244,208,63,.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  /* ─── Topping helpers ─── */
  function drawPepperoni(ctx, x, y, r) {
    /* shadow */
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, r, r * .9, .3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fill();
    /* body */
    const g = ctx.createRadialGradient(x - r*.25, y - r*.3, 0, x, y, r);
    g.addColorStop(0, '#CD4040');
    g.addColorStop(0.6, PALETTE.pepperoni);
    g.addColorStop(1, '#5A0A0A');
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * .9, .3, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    /* spots */
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.arc(x - r*.25, y - r*.2, r*.18, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r*.18, y + r*.1, r*.1,  0, Math.PI*2); ctx.fill();
  }

  function drawMushroom(ctx, x, y, s) {
    /* stem */
    ctx.fillStyle = PALETTE.mushroomDk;
    ctx.fillRect(x - s*.1, y, s*.2, s*.4);
    /* cap */
    const g = ctx.createRadialGradient(x - s*.1, y - s*.1, 0, x, y, s*.4);
    g.addColorStop(0, '#E8EDF0');
    g.addColorStop(1, PALETTE.mushroomDk);
    ctx.beginPath();
    ctx.ellipse(x, y, s * .4, s * .26, 0, Math.PI, 0);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawLeaf(ctx, x, y, angle, col) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(6, -10, 14, -8, 12, 0);
    ctx.bezierCurveTo(14, 8, 6, 10, 0, 0);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.restore();
  }

  function drawVolcanoToppings(ctx, r, hoverAmt) {
    /* pepperoni */
    const pp = [
      {x:r*.32, y:-r*.18}, {x:-r*.28, y:r*.22}, {x:-r*.4, y:-r*.22},
      {x:r*.08, y:r*.42}, {x:-r*.06, y:-r*.44}, {x:r*.46, y:r*.18},
    ];
    pp.forEach(({x,y}) => drawPepperoni(ctx, x, y, r*.13));

    /* olives */
    const olives = [{x:-r*.12,y:r*.1},{x:r*.2,y:r*.32},{x:r*.36,y:-r*.36}];
    olives.forEach(({x,y}) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r*.07, r*.1, .4, 0, Math.PI*2);
      ctx.fillStyle = PALETTE.olive;
      ctx.fill();
      /* olive hole */
      ctx.beginPath();
      ctx.arc(x, y, r*.03, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fill();
    });

    /* cheese drip on hover */
    if (hoverAmt > 0.2) {
      const drips = [
        {a:0.4,  d:r*.86}, {a:1.2, d:r*.82}, {a:2.5, d:r*.88}, {a:4.0, d:r*.84},
      ];
      drips.forEach(({a, d}) => {
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        const len = hoverAmt * r * .25;
        const dripGrad = ctx.createLinearGradient(x, y, x + Math.cos(a)*.3*len, y + Math.sin(a)*.3*len + len);
        dripGrad.addColorStop(0, '#F4D03F');
        dripGrad.addColorStop(1, 'rgba(244,208,63,0)');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
          x + Math.cos(a)*len*.2, y + len*.5,
          x - Math.cos(a)*len*.1, y + len*.9,
          x + Math.cos(a)*len*.05, y + len
        );
        ctx.lineWidth = 5 + hoverAmt * 3;
        ctx.strokeStyle = dripGrad;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }
  }

  function drawTruffleToppings(ctx, r) {
    /* mushrooms */
    const mps = [{x:r*.3,y:-r*.15},{x:-r*.25,y:r*.28},{x:r*.05,y:r*.4},{x:-r*.38,y:-r*.18},{x:r*.38,y:r*.28}];
    mps.forEach(({x,y}) => drawMushroom(ctx, x, y, r*.28));
    /* parmesan dots */
    ctx.fillStyle = 'rgba(255,252,220,.85)';
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + .3;
      const rr = r * (.35 + Math.random() * .35);
      ctx.beginPath();
      ctx.arc(Math.cos(a)*rr, Math.sin(a)*rr, 3 + Math.random()*3, 0, Math.PI*2);
      ctx.fill();
    }
    /* basil */
    const bps = [{x:r*.2,y:r*.35,a:.5},{x:-r*.3,y:-.15*r,a:-.4},{x:.1*r,y:-.4*r,a:.2}];
    bps.forEach(({x,y,a}) => drawLeaf(ctx, x, y, a, PALETTE.basil));
  }

  function drawGardenToppings(ctx, r) {
    /* bell peppers */
    const rings = [{x:r*.28,y:-r*.2,c:PALETTE.bell},{x:-r*.3,y:r*.25,c:PALETTE.bellYellow},{x:r*.05,y:r*.4,c:'#E74C3C'},{x:-r*.1,y:-.4*r,c:PALETTE.bell}];
    rings.forEach(({x,y,c}) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r*.1, r*.07, .4, 0, Math.PI*2);
      ctx.strokeStyle = c;
      ctx.lineWidth = 5;
      ctx.stroke();
    });
    /* olives */
    [{x:r*.42,y:.1*r},{x:-.25*r,y:-.3*r}].forEach(({x,y}) => {
      ctx.beginPath();
      ctx.ellipse(x,y,r*.07,r*.1,.3,0,Math.PI*2);
      ctx.fillStyle='#1E6B24'; ctx.fill();
    });
    /* basil leaves */
    [{x:r*.1,y:r*.3,a:.6},{x:-.35*r,y:.1*r,a:-.5}].forEach(({x,y,a}) => drawLeaf(ctx,x,y,a,PALETTE.basil));
    /* onion rings */
    ctx.beginPath();
    ctx.ellipse(.3*r,.25*r,r*.12,r*.08,.5,0,Math.PI*2);
    ctx.strokeStyle=PALETTE.onion; ctx.lineWidth=4; ctx.stroke();
  }

  function drawBBQToppings(ctx, r) {
    /* pulled-meat blobs */
    const meats = [{x:.3*r,y:-.2*r},{x:-.28*r,y:.22*r},{x:.05*r,y:.42*r},{x:-.38*r,y:-.15*r},{x:.42*r,y:.22*r}];
    meats.forEach(({x,y}) => {
      ctx.beginPath();
      ctx.ellipse(x,y,r*.14,r*.09,.5,0,Math.PI*2);
      ctx.fillStyle='#8B4513'; ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - r*.03,y - r*.02,r*.08,r*.05,.3,0,Math.PI*2);
      ctx.fillStyle='rgba(200,120,50,.7)'; ctx.fill();
    });
    /* BBQ glaze streaks */
    ctx.save();
    ctx.globalAlpha=.35;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*.4+.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*r*.2, Math.sin(a)*r*.2);
      ctx.bezierCurveTo(Math.cos(a+.5)*r*.5, Math.sin(a+.5)*r*.5, Math.cos(a-.3)*r*.65, Math.sin(a-.3)*r*.65, Math.cos(a+.1)*r*.72, Math.sin(a+.1)*r*.72);
      ctx.strokeStyle='#6E1C00'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.stroke();
    }
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════
     HERO PIZZA
  ═══════════════════════════════════════════════════ */
  function initHeroPizza() {
    const canvas = document.getElementById('pizzaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rot = 0, hover = 0, speed = 0.005;

    const wrap = document.getElementById('heroPizzaWrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => { speed = 0.018; hover = 1; });
      wrap.addEventListener('mouseleave', () => { speed = 0.005; hover = 0; });
      wrap.addEventListener('click', () => {
        speed = 0.04;
        setTimeout(() => speed = 0.005, 800);
      });
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      renderPizza(ctx, W/2, H/2, W/2 * .88, rot, hover, 'volcano');
      rot += speed;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ═══════════════════════════════════════════════════
     LARGE INTERACTIVE PIZZA
  ═══════════════════════════════════════════════════ */
  function initLargePizza() {
    const canvas = document.getElementById('pizzaLarge');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let rot = 0, hover = 0, isHover = false, isDrag = false;
    let lastX = 0, dragSpeed = 0, currentType = 'volcano';

    // expose type switcher globally
    window.setPizzaType = function(t) { currentType = t; };

    canvas.addEventListener('mouseenter', () => { isHover = true; });
    canvas.addEventListener('mouseleave', () => { isHover = false; isDrag = false; });
    canvas.addEventListener('mousedown', e => { isDrag = true; lastX = e.clientX; });
    window.addEventListener('mouseup', () => { isDrag = false; });
    window.addEventListener('mousemove', e => {
      if (!isDrag) return;
      const dx = e.clientX - lastX;
      dragSpeed = dx * 0.012;
      rot += dragSpeed;
      lastX = e.clientX;
    });

    /* touch */
    canvas.addEventListener('touchstart', e => { isDrag = true; lastX = e.touches[0].clientX; }, {passive:true});
    canvas.addEventListener('touchend',   () => { isDrag = false; });
    canvas.addEventListener('touchmove',  e => {
      if (!isDrag) return;
      const dx = e.touches[0].clientX - lastX;
      dragSpeed = dx * 0.012;
      rot += dragSpeed;
      lastX = e.touches[0].clientX;
    }, {passive:true});

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (!isDrag) {
        dragSpeed *= 0.96;
        rot += dragSpeed + 0.004;
      }
      hover += ((isHover ? 1 : 0) - hover) * 0.08;

      renderPizza(ctx, W/2, H/2, W/2 * .9, rot, hover, currentType);

      /* cheese drips on hover */
      if (hover > 0.4) spawnCheeseDrip();

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* cheese drip DOM elements */
  let lastDrip = 0;
  function spawnCheeseDrip() {
    const now = Date.now();
    if (now - lastDrip < 800) return;
    lastDrip = now;
    const container = document.getElementById('cheeseDrips');
    if (!container) return;
    const d = document.createElement('div');
    d.className = 'cheese-drip';
    const angle = Math.random() * Math.PI * 2;
    const cr = 220;
    const left = 240 + Math.cos(angle) * (cr * .9);
    const top  = 240 + Math.sin(angle) * (cr * .9);
    d.style.cssText = `left:${left}px;top:${top}px;transform:rotate(${angle + Math.PI/2}rad)`;
    container.appendChild(d);
    setTimeout(() => d.remove(), 1600);
  }

  /* ═══════════════════════════════════════════════════
     FOOD CANVASES (specials cards)
  ═══════════════════════════════════════════════════ */
  function initFoodCanvases() {
    document.querySelectorAll('.food-canvas').forEach(canvas => {
      const ctx = canvas.getContext('2d');
      const type = canvas.dataset.food;
      let rot = 0;

      function draw() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (type === 'pizza-volcano' || type === 'truffle') {
          renderPizza(ctx, W/2, H/2+10, Math.min(W,H)/2*.8, rot, 0, type === 'truffle' ? 'truffle' : 'volcano');
          rot += 0.007;
        } else if (type === 'mango-juice') {
          drawJuiceScene(ctx, W, H, '#FF9E00', '#FFB300', '🥭');
        } else if (type === 'strawberry') {
          drawJuiceScene(ctx, W, H, '#E91E63', '#FF5252', '🍓');
        }
        requestAnimationFrame(draw);
      }
      draw();
    });
  }

  function drawJuiceScene(ctx, W, H, col1, col2, emoji) {
    const grad = ctx.createLinearGradient(0,0,W,H);
    grad.addColorStop(0, col1 + '33');
    grad.addColorStop(1, col2 + '22');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    /* glass */
    const gx = W/2, gy = H/2;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.beginPath();
    ctx.moveTo(-30, -50);
    ctx.quadraticCurveTo(-32, 30, -26, 55);
    ctx.lineTo(26, 55);
    ctx.quadraticCurveTo(32, 30, 30, -50);
    ctx.closePath();
    ctx.fillStyle = col1 + 'AA';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.font = '2rem sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, W/2, H/2 - 8);
  }

  /* ─── Init on DOM ready ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initHeroPizza();
    initLargePizza();
    initFoodCanvases();
  });

  /* export render for drinks.js use */
  window.PizzaRenderer = { renderPizza };

})();
