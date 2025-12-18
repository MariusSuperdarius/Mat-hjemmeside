// Simpelt script for enhedscirklen og retvinklet trekant
(function(){
  // --- Enhedscirkel ---
  const angleRange = document.getElementById('angleRange');
  const angleOut = document.getElementById('angleOut');
  const angleLabel = document.getElementById('angleLabel');
  const cosLabel = document.getElementById('cosLabel');
  const sinLabel = document.getElementById('sinLabel');
  const pythLabel = document.getElementById('pythLabel');
  const tanLabel = document.getElementById('tanLabel');
  const point = document.getElementById('point');
  const radiusLine = document.getElementById('radiusLine');
  const xProj = document.getElementById('xProj');
  const yProj = document.getElementById('yProj');
  const svg = document.getElementById('unitSVG');
  const cx = 150, cy = 150, r = 100;

  function updateUnit(thetaDeg){
    const t = thetaDeg * Math.PI / 180;
    const cos = Math.cos(t), sin = Math.sin(t);
    const x = cx + r * cos;
    const y = cy - r * sin;

    point.setAttribute('cx', x);
    point.setAttribute('cy', y);
    point.setAttribute('aria-valuenow', String(thetaDeg));
    radiusLine.setAttribute('x2', x);
    radiusLine.setAttribute('y2', y);

    xProj.setAttribute('x2', x);
    xProj.setAttribute('y2', cy);
    yProj.setAttribute('x1', x);
    yProj.setAttribute('y1', cy);
    yProj.setAttribute('x2', x);
    yProj.setAttribute('y2', y);

    angleRange.value = thetaDeg;
    angleOut.value = thetaDeg;
    angleLabel.textContent = `vinkel: ${thetaDeg}°`;
    cosLabel.textContent = `cos: ${cos.toFixed(3)}`;
    sinLabel.textContent = `sin: ${sin.toFixed(3)}`;
    pythLabel.textContent = `cos² + sin² = ${(cos*cos + sin*sin).toFixed(3)}`;
    tanLabel.textContent = `tan: ${ (Math.abs(cos) < 1e-6) ? 'uendelig' : (sin/cos).toFixed(3) }`;

    // update live region for screen readers
    const ucLive = document.getElementById('uc-live');
    if(ucLive) ucLive.textContent = `Vinkel ${thetaDeg} grader. cos ${cos.toFixed(3)}. sin ${sin.toFixed(3)}.`;

    // pædagogisk feedback
    const fb = document.getElementById('uc-feedback');
    if(fb){ fb.innerHTML = explainAngle(thetaDeg); }
  }

  // forklarer nogle vigtige vinkler
  function explainAngle(angle){
    const a = ((Math.round(angle) % 360) + 360) % 360;
    switch(a){
      case 0: return '0°: Punktet ligger på højre side af cirklen. cos = 1, sin = 0.';
      case 30: return '30°: cos ≈ 0.866, sin = 0.5. Bruges ofte i opgaver med 30-60-90 trekanter.';
      case 45: return '45°: cos = sin ≈ 0.707. I en 45°-trekant er kateterne lige lange.';
      case 60: return '60°: cos = 0.5, sin ≈ 0.866. Komplement til 30°.';
      case 90: return '90°: Punktet er øverst. cos = 0, sin = 1. Tangens er uendelig.';
      case 180: return '180°: Punktet er længst til venstre. cos = -1, sin = 0.';
      case 270: return '270°: Punktet er nederst. cos = 0, sin = -1.';
    }
    return 'Flyt punktet eller brug presets for at se værdier og forklaringer.';
  }

  function snapAngle(a){
    const snaps = [0,30,45,60,90,180,270,360];
    for(const s of snaps){
      if(Math.abs(((a - s + 540) % 360) - 180) <= 3) return s % 360;
    }
    return a;
  }

  angleRange.addEventListener('input', e=> updateUnit(parseInt(e.target.value,10)));

  // Gør punktet klikketragbart
  let dragging = false;
  point.addEventListener('pointerdown', e=>{ dragging = true; point.setPointerCapture(e.pointerId);} );
  point.addEventListener('pointerup', e=>{ dragging = false; point.releasePointerCapture(e.pointerId);} );
  svg.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM().inverse();
    const loc = pt.matrixTransform(ctm);
    const dx = loc.x - cx, dy = cy - loc.y; // invert y
    let theta = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
    const snapped = snapAngle(theta);
    if(snapped !== theta){
      theta = snapped;
      radiusLine.classList.add('pulse');
      setTimeout(()=> radiusLine.classList.remove('pulse'), 700);
    }
    angleRange.value = theta;
    updateUnit(theta);
  });

  // Keyboard control when point is focused
  point.addEventListener('keydown', e=>{
    let delta = 0;
    if(e.key === 'ArrowLeft') delta = e.shiftKey ? -5 : -1;
    if(e.key === 'ArrowRight') delta = e.shiftKey ? 5 : 1;
    if(delta !== 0){
      e.preventDefault();
      let cur = parseInt(angleRange.value,10);
      cur = (cur + delta + 360) % 360;
      updateUnit(cur);
    }
  });

  // Preset buttons
  document.querySelectorAll('.preset').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const a = parseInt(btn.getAttribute('data-angle'),10);
      if(!Number.isNaN(a)) updateUnit(a);
    });
  });

  // Start value
  updateUnit(0);

  // --- Retvinklet trekant ---
  const angleTri = document.getElementById('angleTri');
  const angleTriOut = document.getElementById('angleTriOut');
  const hypRange = document.getElementById('hypRange');
  const hypOut = document.getElementById('hypOut');
  const triangle = document.getElementById('triangle');
  const legALabel = document.getElementById('legALabel');
  const legBLabel = document.getElementById('legBLabel');
  const hypLabel = document.getElementById('hypLabel');
  const pythTri = document.getElementById('pythTri');
  const triSVG = document.getElementById('triSVG');

  function updateTriangle(){
    const angDeg = parseFloat(angleTri.value);
    const ang = angDeg * Math.PI / 180;
    const hyp = parseFloat(hypRange.value);
    const a = hyp * Math.sin(ang); // modstående
    const b = hyp * Math.cos(ang); // hosliggende

    // Simple drawing: anchor at (20,160), base along x
    const x0 = 20, y0 = 160;
    const x1 = x0 + b*80; // scale for visibility
    const y1 = y0;
    const x2 = x0;
    const y2 = y0 - a*80;

    triangle.setAttribute('points', `${x0},${y0} ${x2},${y2} ${x1},${y1}`);

    angleTriOut.value = Math.round(angDeg);
    hypOut.value = hyp.toFixed(2);
    legALabel.textContent = `modstående: ${a.toFixed(3)}`;
    legBLabel.textContent = `hosliggende: ${b.toFixed(3)}`;
    hypLabel.textContent = `hypotenuse: ${hyp.toFixed(3)}`;
    pythTri.textContent = `a² + b² = c² (tjek): ${(a*a + b*b).toFixed(3)} = ${(hyp*hyp).toFixed(3)}`;

    const triLive = document.getElementById('tri-live');
    if(triLive) triLive.textContent = `Vinkel ${angDeg}°, modstående ${a.toFixed(3)}, hosliggende ${b.toFixed(3)}, hypotenuse ${hyp.toFixed(3)}.`;
  }

  angleTri.addEventListener('input', updateTriangle);
  hypRange.addEventListener('input', updateTriangle);

  // Preset buttons for triangle angles
  document.querySelectorAll('.preset-tri').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const a = parseInt(btn.getAttribute('data-angle'),10);
      if(!Number.isNaN(a)){
        angleTri.value = a;
        updateTriangle();
      }
    });
  });

  // Toggle answers for exercises
  document.querySelectorAll('.show-answer').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const ans = btn.nextElementSibling;
      if(!ans) return;
      const isOpen = ans.style.display === 'block';
      if(isOpen){ ans.style.display = 'none'; btn.setAttribute('aria-expanded','false'); }
      else{ ans.style.display = 'block'; btn.setAttribute('aria-expanded','true'); }
    });
  });

  updateTriangle();
})();
