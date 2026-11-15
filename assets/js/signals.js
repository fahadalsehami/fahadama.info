/* ==========================================================================
   Signals: the hero. Five live traces (vocal, facial, physiological, neuro,
   clinical) flow in from the right edge and fuse into one line, the thread
   that runs down the page. Pointing at the traces makes them flare; a click
   or tap sends a pulse of light along them and down the thread.
   Exposes window.Signals = { mount(canvas, opts) }.
   ========================================================================== */
(function () {
  "use strict";

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  /* Smooth value noise in 0..1. */
  function noise(x) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i) + (hash(i + 1) - hash(i)) * u;
  }
  function smoother(e0, e1, x) {
    var t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function easeOut(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }

  /* Each shape returns roughly -1..1 for a travelling position u (px). */
  var SHAPES = [
    // vocal: speech arrives in syllables, bursts of fast vibration
    function (u) {
      var syllable = Math.max(0, Math.sin(u * 0.021) * 0.55 + noise(u * 0.011) * 0.95 - 0.38);
      return (Math.sin(u * 0.56) * 0.62 + Math.sin(u * 0.87 + 1.3) * 0.38) * syllable * 1.75;
    },
    // facial: landmark points, drawn as dots
    function (u) { return (noise(u * 0.045) - 0.5) * 0.9 + Math.sin(u * 0.028) * 0.32; },
    // physiological: a pulse wave with its dicrotic notch, one beat every 118px
    function (u) {
      var p = (((u % 118) + 118) % 118) / 118;
      var systole = Math.exp(-Math.pow((p - 0.18) / 0.052, 2));
      var notch = 0.36 * Math.exp(-Math.pow((p - 0.43) / 0.075, 2));
      return (systole + notch) * 1.55 - 0.5;
    },
    // neuro: small, fast oscillations whose strength drifts
    function (u) {
      var a = 0.5 + 0.5 * Math.sin(u * 0.0125 + 0.7);
      return (Math.sin(u * 0.33) * 0.48 + Math.sin(u * 0.57 + 2.1) * 0.3 + (noise(u * 0.42) - 0.5) * 0.7) * (0.35 + a * 0.75);
    },
    // clinical: scores that hold between visits, then step
    function (u) { var k = Math.floor(u / 66); return Math.round((noise(k * 0.71 + 3) - 0.5) * 5) / 2.6; },
  ];
  var AMP = [13, 9, 15, 7, 11];          // px at full strength, per trace
  var SPEED = 42;                          // px per second, right to left

  function mount(canvas, opts) {
    opts = opts || {};
    var host = opts.host || canvas.parentNode;
    var labels = opts.labels || ["vocal", "facial", "physiological", "neuro", "clinical"];
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, colors = {};
    var anchor = { x: 40, y: 300 };
    var running = false, raf = 0, visible = true, t0 = 0, now = 0;
    var reveal = reduce ? 1 : 0, drop = reduce ? 1 : 0, introStart = 0, readySent = false;
    var pointer = { x: -999, y: -999, level: 0, target: 0 };
    var pulses = [];

    function readColors() {
      var cs = getComputedStyle(canvas);
      function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
      colors = {
        ink: v("--sig-ink", "rgba(12,32,51,0.62)"),
        strong: v("--sig-strong", "rgba(12,32,51,0.9)"),
        glow: v("--sig-glow", "rgba(255,255,255,0.75)"),
        label: v("--sig-label", "rgba(12,32,51,0.55)"),
        halo: v("--sig-halo", "rgba(226,242,255,0.92)"),
        light: v("--sig-light", "rgba(255,255,255,0.55)"),
        pulse: v("--sig-pulse", "#FFFFFF"),
        core: v("--sig-core", "#1D5C93"),
        font: v("--sig-font", '"Bricolage Grotesque", system-ui, sans-serif'),
      };
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (opts.anchor) { var a = opts.anchor(W, H); if (a) anchor = a; }
    }

    function laneY(k) {
      var top = H * (W < 640 ? 0.13 : 0.15), bottom = Math.min(anchor.y - 40, H * (W < 640 ? 0.5 : 0.56));
      return top + (bottom - top) * (k / (SHAPES.length - 1));
    }

    /* Where trace k sits at x, before its wave is added. */
    function base(k, x) {
      var span = Math.max(1, W - anchor.x);
      var s = (W - x) / span;                       // 0 at the right edge, 1 at the thread
      var e = smoother(0.36, 1, s);
      return { s: s, e: e, y: laneY(k) + (anchor.y - laneY(k)) * e };
    }

    function boostAt(x, y) {
      if (pointer.level < 0.005) return 0;
      var dx = x - pointer.x, dy = y - pointer.y;
      return pointer.level * Math.exp(-(dx * dx + dy * dy) / (2 * 120 * 120));
    }

    function draw(time) {
      ctx.clearRect(0, 0, W, H);
      var span = Math.max(1, W - anchor.x);

      // A soft light that follows the pointer.
      if (pointer.level > 0.01) {
        var g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        g.addColorStop(0, colors.light);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = pointer.level;
        ctx.fillStyle = g;
        ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
        ctx.globalAlpha = 1;
      }

      var step = W < 640 ? 2.5 : 3;
      for (var k = 0; k < SHAPES.length; k++) {
        var pts = [];
        for (var x = W + 6; x >= anchor.x - 0.5; x -= step) {
          var b = base(k, x);
          if (b.s > reveal) break;
          var env = (1 - b.e) * (1 - b.e);
          var u = x + time * SPEED + k * 977;
          var amp = AMP[k] * env * (W < 640 ? 0.8 : 1) * (1 + 1.9 * boostAt(x, b.y));
          pts.push(x, b.y + SHAPES[k](u) * amp);
        }
        if (pts.length < 4) continue;
        if (k === 1) {
          // facial: dots, thinning into a line as they merge
          for (var i = 0; i < pts.length; i += 6) {
            var s1 = (W - pts[i]) / span;
            ctx.globalAlpha = 1 - smoother(0.55, 1, s1) * 0.4;
            ctx.beginPath();
            ctx.arc(pts[i], pts[i + 1], 1.55, 0, Math.PI * 2);
            ctx.fillStyle = colors.ink;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          // the merged tail still needs a line so it joins the thread
          var tail = [];
          for (var j = 0; j < pts.length; j += 2) if ((W - pts[j]) / span > 0.7) tail.push(pts[j], pts[j + 1]);
          if (tail.length > 3) stroke(tail, 1.2, colors.ink);
          continue;
        }
        stroke(pts, 5, colors.glow);
        stroke(pts, 1.25, colors.ink);
      }

      // The fused line drops down out of the hero and becomes the thread.
      if (drop > 0) {
        ctx.beginPath();
        ctx.moveTo(anchor.x, anchor.y);
        ctx.lineTo(anchor.x, anchor.y + (H - anchor.y) * drop + 1);
        ctx.lineWidth = 1.6; ctx.strokeStyle = colors.strong; ctx.stroke();
        ctx.beginPath(); ctx.arc(anchor.x, anchor.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.strong; ctx.fill();
      }

      // Labels where the traces are still apart.
      ctx.font = "400 " + (W < 640 ? 11 : 13) + "px " + colors.font;
      ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
      ctx.lineJoin = "round"; ctx.lineWidth = 5; ctx.strokeStyle = colors.halo;
      for (var n = 0; n < labels.length; n++) {
        var ly = laneY(n) - (W < 640 ? 14 : 15), lx = W - (W < 640 ? 16 : 28);
        ctx.globalAlpha = clamp(reveal * 3 - n * 0.25, 0, 1);
        ctx.strokeText(labels[n], lx, ly);   // a halo keeps the name legible where a trace runs under it
        ctx.fillStyle = colors.label;
        ctx.fillText(labels[n], lx, ly);
      }
      ctx.globalAlpha = 1;

      // Pulses of light: along each trace to the thread, then down it.
      for (var p = pulses.length - 1; p >= 0; p--) {
        var age = time - pulses[p].t;
        var along = age / 1.5;
        if (along <= 1) {
          for (var q = 0; q < SHAPES.length; q++) {
            var px = W - easeOut(along) * span;
            var bb = base(q, px);
            var env2 = (1 - bb.e) * (1 - bb.e);
            var py = bb.y + SHAPES[q](px + time * SPEED + q * 977) * AMP[q] * env2;
            glowAt(px, py, 18 + 10 * (1 - along), 0.9);
          }
        } else {
          var down = (age - 1.5) / 0.6;
          if (down <= 1) glowAt(anchor.x, anchor.y + (H - anchor.y) * down, 22, 1);
          else {
            pulses.splice(p, 1);
            if (opts.onPulseDown) opts.onPulseDown();
          }
        }
      }
    }

    function stroke(pts, width, color) {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = color; ctx.stroke();
    }

    function glowAt(x, y, r, a) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, colors.pulse);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = a;
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      // a small bright core, so the light reads on a pale sky too
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = colors.core; ctx.fill();
      ctx.globalAlpha = 1;
    }

    function loop(ts) {
      raf = 0;
      if (!t0) t0 = ts;
      now = (ts - t0) / 1000;
      if (!introStart) introStart = now;
      var intro = now - introStart;
      reveal = easeOut(intro / 1.25);
      drop = easeOut((intro - 1.05) / 0.5);
      if (drop >= 1 && !readySent) { readySent = true; if (opts.onReady) opts.onReady(); }
      pointer.level += (pointer.target - pointer.level) * 0.08;
      draw(now + 12);
      if (running) raf = requestAnimationFrame(loop);
    }

    function start() {
      if (reduce || running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function still() {
      // Reduced motion: one quiet frame, fully drawn.
      reveal = 1; drop = 1;
      draw(12.3);
      if (!readySent) { readySent = true; if (opts.onReady) opts.onReady(); }
    }

    /* Pointer: flare the traces near it. */
    function local(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    host.addEventListener("pointermove", function (e) {
      var p = local(e);
      pointer.x = p.x; pointer.y = p.y; pointer.target = e.pointerType === "touch" ? 0.7 : 1;
      if (reduce) return;
    });
    host.addEventListener("pointerleave", function () { pointer.target = 0; });
    host.addEventListener("pointerdown", function (e) {
      if (e.button > 0 || (e.target.closest && e.target.closest("a, button"))) return;
      var p = local(e);
      pointer.x = p.x; pointer.y = p.y;
      pulse();
    });

    function pulse() {
      if (reduce) { if (opts.onPulseDown) opts.onPulseDown(); return; }
      if (pulses.length > 2) return;
      pulses.push({ t: now + 12 });
      start();
    }

    readColors();
    size();
    if (reduce) still();

    var ro = "ResizeObserver" in window ? new ResizeObserver(function () {
      size();
      if (reduce) still(); else if (!running) draw(now + 12);
    }) : null;
    if (ro) ro.observe(canvas);
    else window.addEventListener("resize", function () { size(); if (reduce) still(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    start();

    return {
      pulse: pulse,
      retheme: function () { readColors(); if (reduce) still(); else draw(now + 12); },
      resize: function () { size(); if (reduce) still(); },
    };
  }

  window.Signals = { mount: mount };
})();
