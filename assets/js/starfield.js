/* ==========================================================================
   Starfield — the night sky behind starlight mode: twinkling stars and a
   slow nebula glow. Runs only while starlight is on and the tab is visible.
   Exposes window.Starfield = { start(canvas), stop() }.
   ========================================================================== */
(function () {
  "use strict";

  var TAU = Math.PI * 2;
  var canvas = null, ctx = null, raf = 0, stars = [], W = 0, H = 0, dpr = 1, t0 = 0, running = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function build() {
    var r = rng(20261101);
    var n = Math.round((W * H) / 900);
    stars = [];
    for (var i = 0; i < n; i++) {
      var big = r() < 0.035;
      stars.push({
        x: r() * W,
        y: r() * H,
        s: big ? 1.6 + r() * 0.7 : 1 + r() * 0.35,
        a: big ? 0.7 + r() * 0.3 : 0.22 + r() * 0.6,
        tw: 0.4 + r() * 1.6,
        ph: r() * TAU,
        warm: r() < 0.18,
      });
    }
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    build();
    paint(performance.now());
  }

  function nebula(x, y, r, rgb, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(" + rgb + "," + a + ")");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function paint(now) {
    var t = (now - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, W, H);
    var drift = reduce ? 0 : Math.sin(t * 0.05) * 30;
    nebula(W * 0.63 + drift, H * 0.2, Math.max(W, H) * 0.32, "120,52,72", 0.16);
    nebula(W * 0.7 - drift, H * 0.62, Math.max(W, H) * 0.26, "92,44,86", 0.12);
    nebula(W * 0.22, H * 0.85 + drift, Math.max(W, H) * 0.3, "54,40,92", 0.08);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = reduce ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * s.tw + s.ph));
      ctx.fillStyle = s.warm ? "rgba(255,226,206," + a.toFixed(3) + ")" : "rgba(236,236,255," + a.toFixed(3) + ")";
      if (s.s > 1.5) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.6, 0, TAU); ctx.fill();
      } else ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
    }
  }

  var last = 0;
  function loop(now) {
    raf = 0;
    if (!running) return;
    if (now - last > 40) { paint(now); last = now; }   // ~25 fps is plenty for twinkling
    if (!reduce) raf = requestAnimationFrame(loop);
  }

  function start(el) {
    canvas = el || canvas;
    if (!canvas) return;
    ctx = ctx || canvas.getContext("2d");
    if (!t0) t0 = performance.now();
    running = true;
    resize();
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", function () { if (running) resize(); });
  document.addEventListener("visibilitychange", function () {
    if (!canvas) return;
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; }
    else if (running && !raf) raf = requestAnimationFrame(loop);
  });

  window.Starfield = { start: start, stop: stop };
})();
