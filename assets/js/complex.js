/* ==========================================================================
   Complex: CELLO's picture. A slowly turning cell complex drawn in lines:
   nodes, edges, and a few filled 2-cells, the higher-order structure that
   topological deep learning learns from. Static when motion is reduced.
   Exposes window.Complex = { mount(canvas, opts) }.
   ========================================================================== */
(function () {
  "use strict";

  function hash(n) { var x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); }

  /* A once-subdivided icosahedron, gently lumpy so it reads as data, not a ball. */
  function build() {
    var t = (1 + Math.sqrt(5)) / 2;
    var v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
    var f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    var cache = {};
    function mid(a, b) {
      var key = a < b ? a + "_" + b : b + "_" + a;
      if (cache[key] != null) return cache[key];
      v.push([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]);
      return (cache[key] = v.length - 1);
    }
    var f2 = [];
    f.forEach(function (tri) {
      var a = mid(tri[0], tri[1]), b = mid(tri[1], tri[2]), c = mid(tri[2], tri[0]);
      f2.push([tri[0], a, c], [tri[1], b, a], [tri[2], c, b], [a, b, c]);
    });
    v = v.map(function (p, i) {
      var l = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
      var r = 1 + (hash(i) - 0.5) * 0.22;
      return [p[0] / l * r, p[1] / l * r, p[2] / l * r];
    });
    var edges = {}, list = [];
    f2.forEach(function (tri) {
      for (var k = 0; k < 3; k++) {
        var a = tri[k], b = tri[(k + 1) % 3], key = a < b ? a + "_" + b : b + "_" + a;
        if (!edges[key]) { edges[key] = 1; list.push([a, b]); }
      }
    });
    // A few filled 2-cells, and one node whose neighbourhood is lit.
    var cells = f2.filter(function (_, i) { return hash(i * 3.1) > 0.8; });
    var hub = 7;
    return { v: v, e: list, cells: cells, hub: hub };
  }

  function mount(canvas, opts) {
    opts = opts || {};
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext("2d");
    var G = build();
    var W = 0, H = 0, dpr = 1, ang = 0.6, raf = 0, last = 0, running = false, visible = false, colors = {};

    function readColors() {
      var cs = getComputedStyle(canvas);
      function v(n, fb) { var s = cs.getPropertyValue(n).trim(); return s || fb; }
      colors = { ink: v("--cx-ink", "rgba(12,32,51,0.55)"), cell: v("--cx-cell", "rgba(29,92,147,0.18)"), hub: v("--cx-hub", "#1D5C93"), node: v("--cx-node", "rgba(12,32,51,0.75)") };
    }
    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function project(p) {
      var cy = Math.cos(ang), sy = Math.sin(ang), tilt = 0.42, cx = Math.cos(tilt), sx = Math.sin(tilt);
      var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy;
      var y = p[1] * cx - z * sx; z = p[1] * sx + z * cx;
      var R = Math.min(W, H) * 0.36, d = 3.4, k = d / (d - z);
      return { x: W / 2 + x * R * k, y: H / 2 + y * R * k, z: z };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var P = G.v.map(project);
      // cells, back to front
      G.cells.map(function (c) { return { c: c, z: (P[c[0]].z + P[c[1]].z + P[c[2]].z) / 3 }; })
        .sort(function (a, b) { return a.z - b.z; })
        .forEach(function (o) {
          var c = o.c;
          ctx.beginPath(); ctx.moveTo(P[c[0]].x, P[c[0]].y); ctx.lineTo(P[c[1]].x, P[c[1]].y); ctx.lineTo(P[c[2]].x, P[c[2]].y); ctx.closePath();
          ctx.globalAlpha = 0.55 + 0.45 * (o.z + 1) / 2;
          ctx.fillStyle = colors.cell; ctx.fill();
        });
      ctx.globalAlpha = 1;
      // edges: nearer ones darker
      G.e.forEach(function (e) {
        var a = P[e[0]], b = P[e[1]], z = (a.z + b.z) / 2;
        var lit = e[0] === G.hub || e[1] === G.hub;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.lineWidth = lit ? 1.8 : 1;
        ctx.strokeStyle = lit ? colors.hub : colors.ink;
        ctx.globalAlpha = lit ? 1 : 0.25 + 0.75 * (z + 1.1) / 2.2;
        ctx.stroke();
      });
      // nodes
      P.forEach(function (p, i) {
        ctx.beginPath(); ctx.arc(p.x, p.y, i === G.hub ? 4 : 1.7 + (p.z + 1) * 0.5, 0, Math.PI * 2);
        ctx.globalAlpha = i === G.hub ? 1 : 0.35 + 0.65 * (p.z + 1.1) / 2.2;
        ctx.fillStyle = i === G.hub ? colors.hub : colors.node; ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function loop(ts) {
      raf = 0;
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      ang += dt * 0.22;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    }
    function start() { if (reduce || running || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    readColors(); size(); draw();
    if ("ResizeObserver" in window) new ResizeObserver(function () { size(); draw(); }).observe(canvas);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(canvas);
    else { visible = true; start(); }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    return { retheme: function () { readColors(); draw(); } };
  }

  window.Complex = { mount: mount };
})();
