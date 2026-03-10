/* ═══════════════════════════════════════════════════
   drinks.js — Juice glass canvas animations
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DRINKS = {
    mango:      { base:'#FFB300', top:'#FF8F00', foam:'#FFF3E0', fruit:'🥭', ice:true,  bubbles:true,  orbitFruits:['🥭','🍋','🌿'] },
    strawberry: { base:'#E91E63', top:'#FF5252', foam:'#FCE4EC', fruit:'🍓', ice:true,  bubbles:false, orbitFruits:['🍓','🍓','🌿'] },
    orange:     { base:'#FF6D00', top:'#FF9100', foam:'#FFF3E0', fruit:'🍊', ice:true,  bubbles:true,  orbitFruits:['🍊','🍋','🍊'] },
    blueberry:  { base:'#3F51B5', top:'#7C4DFF', foam:'#EDE7F6', fruit:'🫐', ice:false, bubbles:true,  orbitFruits:['🫐','🫐','💜'] },
    matcha:     { base:'#33691E', top:'#558B2F', foam:'#F9FBE7', fruit:'🍵', ice:false, bubbles:false, orbitFruits:['🌿','🍵','🌱'] },
  };

  /* ─── Bubble pool ─── */
  function makeBubbles(n, W, H) {
    return Array.from({length: n}, () => ({
      x: 20 + Math.random() * (W - 40),
      y: H * .7 + Math.random() * H * .2,
      r: 1 + Math.random() * 3,
      speed: .4 + Math.random() * .8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: .03 + Math.random() * .04,
    }));
  }

  /* ─── Liquid wave ─── */
  function drawLiquidWave(ctx, x, y, w, h, col, t, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    /* bottom */
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    /* wavy top */
    const segs = 24;
    for (let i = segs; i >= 0; i--) {
      const px = x + (i / segs) * w;
      const wave = Math.sin((i / segs) * Math.PI * 3 + t) * 4
                 + Math.sin((i / segs) * Math.PI * 1.7 + t * 1.3) * 2.5;
      ctx.lineTo(px, y + wave);
    }
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.restore();
  }

  /* ─── Full glass renderer ─── */
  function drawGlass(ctx, W, H, drink, t, bubbles, swirl) {
    ctx.clearRect(0, 0, W, H);

    const gx = W / 2;
    const topY = H * .12, botY = H * .9;
    const topW = W * .36, botW = W * .42;

    /* ─ glass body clip ─ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(gx - topW, topY);
    ctx.bezierCurveTo(gx - topW - 4, H * .55, gx - botW - 4, H * .78, gx - botW, botY);
    ctx.lineTo(gx + botW, botY);
    ctx.bezierCurveTo(gx + botW + 4, H * .78, gx + topW + 4, H * .55, gx + topW, topY);
    ctx.closePath();
    ctx.clip();

    /* liquid fill with gradient */
    const liquidY = topY + (botY - topY) * .15;
    const fillGrad = ctx.createLinearGradient(0, liquidY, 0, botY);
    fillGrad.addColorStop(0,   drink.base + 'EE');
    fillGrad.addColorStop(0.5, drink.base + 'CC');
    fillGrad.addColorStop(1,   drink.top  + 'AA');
    ctx.fillStyle = fillGrad;
    ctx.fillRect(0, liquidY, W, botY - liquidY);

    /* wave layers */
    drawLiquidWave(ctx, gx - topW - 4, liquidY - 10, (topW + 4) * 2, 20, drink.top + '88', t, .9);
    drawLiquidWave(ctx, gx - topW - 4, liquidY - 6,  (topW + 4) * 2, 18, 'rgba(255,255,255,.3)', t * 1.3 + 1, .7);

    /* bubbles */
    if (drink.bubbles && bubbles) {
      bubbles.forEach(b => {
        const bx = b.x + Math.sin(b.wobble) * 5;
        const bAlpha = b.y > liquidY ? Math.min(1, (botY - b.y) / (botY - liquidY)) : 0;
        ctx.save();
        ctx.globalAlpha = bAlpha * .7;
        ctx.beginPath();
        ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        if (b.y < liquidY) {
          b.y = botY - 4;
          b.x = gx - botW + Math.random() * botW * 2;
        }
      });
    }

    /* ice cubes */
    if (drink.ice) {
      const icePositions = [
        { x: gx - topW * .35, y: H * .55, a: .2 },
        { x: gx + topW * .25, y: H * .62, a: -.3 },
        { x: gx - topW * .05, y: H * .7,  a: .5 },
      ];
      icePositions.forEach(({x, y, a}) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        const iceSide = 20 + Math.random() * 4;
        ctx.beginPath();
        ctx.roundRect(-iceSide/2, -iceSide/2, iceSide, iceSide, 4);
        ctx.fillStyle = 'rgba(220,240,255,.45)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.lineWidth = 1;
        ctx.stroke();
        /* ice highlight */
        ctx.beginPath();
        ctx.moveTo(-iceSide/2 + 3, -iceSide/2 + 3);
        ctx.lineTo(iceSide/2 - 5, -iceSide/2 + 3);
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });
    }

    /* swirl effect */
    if (swirl > 0) {
      ctx.save();
      ctx.globalAlpha = swirl * .3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(gx, H * .55, (30 + i * 18), -Math.PI/2 + t, -Math.PI/2 + t + Math.PI * 1.2);
        ctx.strokeStyle = 'rgba(255,255,255,.5)';
        ctx.lineWidth = 2 + i;
        ctx.stroke();
      }
      ctx.restore();
    }

    /* fruit emoji floating */
    ctx.font = `${H * .12}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fy = H * .45 + Math.sin(t * 1.2) * 6;
    ctx.globalAlpha = .85;
    ctx.fillText(drink.fruit, gx, fy);
    ctx.globalAlpha = 1;

    /* condensation droplets */
    ctx.restore(); /* end clip */

    /* ─ glass outline ─ */
    ctx.beginPath();
    ctx.moveTo(gx - topW, topY);
    ctx.bezierCurveTo(gx - topW - 4, H * .55, gx - botW - 4, H * .78, gx - botW, botY);
    ctx.lineTo(gx + botW, botY);
    ctx.bezierCurveTo(gx + botW + 4, H * .78, gx + topW + 4, H * .55, gx + topW, topY);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,.65)';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* glass sheen */
    const sheenGrad = ctx.createLinearGradient(gx - topW, topY, gx - topW + 18, topY);
    sheenGrad.addColorStop(0, 'rgba(255,255,255,.55)');
    sheenGrad.addColorStop(1, 'transparent');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(gx - topW, topY);
    ctx.bezierCurveTo(gx - topW - 4, H * .55, gx - botW - 4, H * .78, gx - botW, botY);
    ctx.lineTo(gx - botW + 16, botY);
    ctx.bezierCurveTo(gx - botW + 12, H * .78, gx - topW + 12, H * .55, gx - topW + 16, topY);
    ctx.closePath();
    ctx.fillStyle = sheenGrad;
    ctx.fill();
    ctx.restore();

    /* foam on top */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(gx, liquidY - 2, topW * .85, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = drink.foam;
    ctx.globalAlpha = .8;
    ctx.fill();
    ctx.restore();

    /* rim */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(gx, topY, topW, 7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    /* straw */
    const strawX = gx + topW * .4;
    const strawGrad = ctx.createLinearGradient(strawX, topY - 20, strawX + 8, topY - 20);
    strawGrad.addColorStop(0, drink.base);
    strawGrad.addColorStop(1, drink.top);
    ctx.fillStyle = strawGrad;
    ctx.fillRect(strawX, topY - 40, 7, H * .65);
  }

  /* ─── Orbit fruits around glass ─── */
  function initOrbitFruits(containerId, fruits) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    fruits.forEach((f, i) => {
      const el = document.createElement('span');
      el.className = 'orbit-fruit';
      el.textContent = f;
      el.style.cssText = `
        animation-duration: ${3.5 + i}s;
        animation-delay: ${-i * 1.2}s;
        top: 50%; left: 50%;
        margin-top: -0.55em; margin-left: -0.55em;
      `;
      container.appendChild(el);
    });
  }

  /* ═══════════════════════════════════════════════════
     Init all drink canvases
  ═══════════════════════════════════════════════════ */
  function initDrinks() {
    const configs = [
      { canvasId: 'drinkMango',  orbitId: 'orbitMango',  key: 'mango' },
      { canvasId: 'drinkStraw',  orbitId: 'orbitStraw',  key: 'strawberry' },
      { canvasId: 'drinkOrange', orbitId: 'orbitOrange', key: 'orange' },
      { canvasId: 'drinkBlue',   orbitId: 'orbitBlue',   key: 'blueberry' },
      { canvasId: 'drinkMatcha', orbitId: 'orbitMatcha', key: 'matcha' },
    ];

    configs.forEach(({canvasId, orbitId, key}) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const drink = DRINKS[key];
      const W = canvas.width, H = canvas.height;
      const bubbles = makeBubbles(14, W, H);

      let t = 0, swirl = 0, isHover = false;

      /* orbit fruits */
      initOrbitFruits(orbitId, drink.orbitFruits);

      /* hover = swirl */
      const card = canvas.closest('.drink-card');
      if (card) {
        card.addEventListener('mouseenter', () => { isHover = true;  });
        card.addEventListener('mouseleave', () => { isHover = false; });
      }

      function draw() {
        swirl += ((isHover ? 1 : 0) - swirl) * 0.05;
        drawGlass(ctx, W, H, drink, t, bubbles, swirl);
        t += 0.025;
        requestAnimationFrame(draw);
      }
      draw();
    });
  }

  document.addEventListener('DOMContentLoaded', initDrinks);

})();
