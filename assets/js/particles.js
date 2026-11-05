/* ==========================================================================
   Particles — drawings made of thousands of small dots.
   Used for the Interests, the 2018 emblem, the "Say hello" heading and the
   starlight portrait. A figure is drawn once on a hidden canvas (ink in
   black, accents in red), then sampled into points that drift, tighten on
   hover and turn slowly in 3D.
   Exposes window.Particles = { figures, sampleDrawing, sampleImage, sampleText, Field,
   shapes, makeShape, Cloud }.
   ========================================================================== */
(function () {
  "use strict";

  var TAU = Math.PI * 2;

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ---------------- Figures (drawn on a 400 x 300 canvas) ----------------
     Black = ink, red = accent. Lighter alpha gives sparser dots. */
  var INK = "#000", RED = "#f00";

  function line(c, pts, w, color) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineWidth = w;
    c.strokeStyle = color || INK;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke();
  }
  function circle(c, x, y, r, fill, stroke, w) {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.lineWidth = w || 4; c.strokeStyle = stroke; c.stroke(); }
  }

  var figures = {
    /* Politics as a social graph */
    network: function (c) {
      var nodes = [[200, 150, 17, 1], [110, 82, 11], [292, 78, 12], [92, 196, 10], [300, 214, 13], [196, 48, 8], [204, 252, 9], [46, 128, 7], [352, 140, 8], [150, 228, 7], [262, 160, 7], [148, 132, 6]];
      var edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 5], [2, 8], [2, 5], [3, 7], [3, 9], [4, 8], [4, 6], [9, 6], [0, 10], [10, 4], [0, 11], [11, 1], [11, 3]];
      edges.forEach(function (e) { line(c, [nodes[e[0]], nodes[e[1]]], 2.6, "rgba(0,0,0,0.75)"); });
      nodes.forEach(function (n, i) {
        if (i === 0) { circle(c, n[0], n[1], n[2], RED); circle(c, n[0], n[1], n[2] + 9, null, RED, 2.5); }
        else circle(c, n[0], n[1], n[2], "rgba(0,0,0,0.85)");
      });
    },

    /* Explainer videos: a camera on a short tripod */
    camera: function (c) {
      c.fillStyle = "rgba(0,0,0,0.32)";
      c.strokeStyle = INK;
      c.lineWidth = 5;
      roundRect(c, 102, 112, 168, 92, 12); c.fill(); c.stroke();
      circle(c, 146, 80, 34, "rgba(0,0,0,0.18)", INK, 5);
      circle(c, 222, 76, 28, "rgba(0,0,0,0.18)", INK, 5);
      circle(c, 146, 80, 7, INK); circle(c, 222, 76, 6, INK);
      c.beginPath(); c.moveTo(270, 140); c.lineTo(330, 114); c.lineTo(330, 204); c.lineTo(270, 178); c.closePath();
      c.fillStyle = "rgba(0,0,0,0.4)"; c.fill(); c.stroke();
      circle(c, 128, 136, 7, RED);
      line(c, [[186, 204], [150, 284]], 5); line(c, [[186, 204], [186, 286]], 5); line(c, [[186, 204], [222, 284]], 5);
      c.beginPath(); c.moveTo(170, 140); c.lineTo(200, 158); c.lineTo(170, 176); c.closePath(); c.fillStyle = RED; c.fill();
    },

    /* Tennis: racket and ball */
    tennis: function (c) {
      c.save();
      c.translate(168, 118);
      c.rotate(-0.55);
      c.beginPath(); c.ellipse(0, 0, 66, 88, 0, 0, TAU);
      c.lineWidth = 9; c.strokeStyle = INK; c.stroke();
      c.save(); c.clip();
      c.lineWidth = 1.6; c.strokeStyle = "rgba(0,0,0,0.6)";
      for (var x = -60; x <= 60; x += 13) { c.beginPath(); c.moveTo(x, -90); c.lineTo(x, 90); c.stroke(); }
      for (var y = -84; y <= 84; y += 13) { c.beginPath(); c.moveTo(-70, y); c.lineTo(70, y); c.stroke(); }
      c.restore();
      line(c, [[-22, 84], [0, 126], [22, 84]], 7);
      c.fillStyle = INK; roundRect(c, -9, 120, 18, 92, 6); c.fill();
      c.restore();
      circle(c, 300, 218, 27, RED);
      c.lineWidth = 3; c.strokeStyle = "#fff";
      c.beginPath(); c.arc(278, 218, 22, -0.9, 0.9); c.stroke();
      c.beginPath(); c.arc(322, 218, 22, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
    },

    /* Hiking: peaks, a trail and a flag */
    mountain: function (c) {
      c.beginPath(); c.moveTo(20, 262); c.lineTo(150, 72); c.lineTo(214, 162); c.lineTo(262, 108); c.lineTo(384, 262); c.closePath();
      c.fillStyle = "rgba(0,0,0,0.22)"; c.fill();
      c.lineWidth = 5; c.strokeStyle = INK; c.lineJoin = "round"; c.stroke();
      c.beginPath(); c.moveTo(150, 72); c.lineTo(126, 108); c.lineTo(142, 102); c.lineTo(154, 116); c.lineTo(168, 98); c.closePath();
      c.fillStyle = "rgba(0,0,0,0.65)"; c.fill();
      c.setLineDash([2, 9]); c.lineWidth = 5; c.strokeStyle = RED;
      c.beginPath(); c.moveTo(70, 258); c.lineTo(132, 216); c.lineTo(98, 186); c.lineTo(160, 152); c.lineTo(128, 126); c.lineTo(150, 84); c.stroke();
      c.setLineDash([]);
      line(c, [[150, 72], [150, 30]], 4);
      c.beginPath(); c.moveTo(150, 30); c.lineTo(186, 40); c.lineTo(150, 52); c.closePath(); c.fillStyle = RED; c.fill();
    },

    /* Road cycling */
    bike: function (c) {
      var rear = [112, 196], front = [292, 196], bb = [186, 196], seat = [164, 106], head = [262, 110];
      [rear, front].forEach(function (w) {
        circle(c, w[0], w[1], 62, null, INK, 6);
        c.lineWidth = 1.2; c.strokeStyle = "rgba(0,0,0,0.5)";
        for (var i = 0; i < 16; i++) { var a = i / 16 * TAU; c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[0] + Math.cos(a) * 58, w[1] + Math.sin(a) * 58); c.stroke(); }
        circle(c, w[0], w[1], 6, INK);
      });
      line(c, [rear, seat, bb, rear], 6, RED);
      line(c, [seat, head, bb], 6, RED);
      line(c, [head, [270, 136], front], 5.5);
      line(c, [[150, 96], [182, 96]], 7);
      line(c, [seat, [162, 96]], 5);
      c.lineWidth = 5; c.strokeStyle = INK; c.beginPath(); c.moveTo(258, 104); c.lineTo(280, 100); c.quadraticCurveTo(298, 102, 292, 122); c.quadraticCurveTo(286, 136, 274, 130); c.stroke();
      circle(c, bb[0], bb[1], 13, null, INK, 4);
    },

    /* Networking: two people and a conversation */
    people: function (c) {
      function person(x, s, tilt) {
        circle(c, x, 92, 22 * s, "rgba(0,0,0,0.8)");
        c.save(); c.translate(x, 0); c.rotate(tilt);
        c.fillStyle = "rgba(0,0,0,0.45)"; c.strokeStyle = INK; c.lineWidth = 4;
        roundRect(c, -30 * s, 124, 60 * s, 118, 26 * s); c.fill(); c.stroke();
        c.restore();
        line(c, [[x - 12 * s, 236], [x - 14 * s, 286]], 6); line(c, [[x + 12 * s, 236], [x + 14 * s, 286]], 6);
      }
      person(120, 1, 0.02);
      person(282, 1, -0.02);
      line(c, [[148, 160], [196, 176]], 6); line(c, [[254, 160], [206, 176]], 6);
      circle(c, 201, 177, 9, RED);
      c.fillStyle = "rgba(255,0,0,0.85)";
      roundRect(c, 168, 22, 66, 40, 14); c.fill();
      c.beginPath(); c.moveTo(192, 60); c.lineTo(186, 76); c.lineTo(206, 61); c.closePath(); c.fill();
      c.fillStyle = "#fff"; [186, 201, 216].forEach(function (x) { circle(c, x, 42, 4, "#fff"); });
    },

    /* Laurel wreath with a year (drawn on 300 x 300) */
    laurel: function (c, w, h, label) {
      var cx = w / 2, cy = h / 2 + 6, R = w * 0.38;
      [-1, 1].forEach(function (side) {
        function at(deg) {
          var th = deg * Math.PI / 180;
          return [cx + side * R * Math.cos(th), cy + R * Math.sin(th)];
        }
        // branch: from the bottom (95deg) round to the top (235deg)
        c.beginPath();
        for (var i = 0; i <= 40; i++) {
          var q = at(95 + i * 3.5);
          if (i === 0) c.moveTo(q[0], q[1]); else c.lineTo(q[0], q[1]);
        }
        c.lineWidth = 3.2; c.strokeStyle = "rgba(0,0,0,0.9)"; c.stroke();
        for (var k = 0; k < 10; k++) {
          var deg = 104 + k * 13.2, q2 = at(deg), q3 = at(deg + 1);
          var ang = Math.atan2(q3[1] - q2[1], q3[0] - q2[0]);
          [1, -1].forEach(function (o) {
            c.save();
            c.translate(q2[0], q2[1]);
            c.rotate(ang + o * 0.75 * side * -1 + (side < 0 ? Math.PI : 0));
            c.beginPath();
            c.ellipse(13, 0, 13, 5, 0, 0, Math.PI * 2);
            c.fillStyle = (k % 3 === 1 && o === 1) ? "rgba(255,0,0,0.95)" : "rgba(0,0,0,0.82)";
            c.fill();
            c.restore();
          });
        }
      });
      // ribbon
      c.fillStyle = "rgba(255,0,0,0.95)";
      c.beginPath(); c.moveTo(cx, cy + R + 4); c.lineTo(cx - 18, cy + R + 22); c.lineTo(cx - 10, cy + R + 24); c.lineTo(cx, cy + R + 10); c.lineTo(cx + 10, cy + R + 24); c.lineTo(cx + 18, cy + R + 22); c.closePath(); c.fill();
      // year
      c.fillStyle = "#000"; c.strokeStyle = "#000"; c.lineWidth = 2.4;
      c.font = "500 " + Math.round(w * 0.2) + "px Newsreader, Georgia, serif";
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(label || "2018", cx, cy - 4);
      c.strokeText(label || "2018", cx, cy - 4);
      // star above
      c.beginPath();
      for (var j = 0; j < 10; j++) {
        var rr = j % 2 ? 4.5 : 11, a = -Math.PI / 2 + j * Math.PI / 5;
        c.lineTo(cx + rr * Math.cos(a), cy - R - 6 + rr * Math.sin(a));
      }
      c.closePath(); c.fillStyle = "rgba(255,0,0,0.95)"; c.fill();
    },
  };

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  /* ---------------- Sampling ---------------- */
  function canvasFor(w, h) {
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    return cv;
  }

  /* Rejection-sample `count` points from a drawing. Points use 0..1 coordinates. */
  function sampleDrawing(draw, w, h, count, seed, extra) {
    var cv = canvasFor(w, h), c = cv.getContext("2d", { willReadFrequently: true });
    draw(c, w, h, extra);
    return samplePixels(c.getImageData(0, 0, w, h).data, w, h, count, seed, false);
  }

  function samplePixels(data, w, h, count, seed, keepColor) {
    var r = rng(seed || 7), pts = [], tries = 0, max = count * 60;
    while (pts.length < count && tries < max) {
      tries++;
      var x = (r() * w) | 0, y = (r() * h) | 0, i = (y * w + x) * 4, a = data[i + 3];
      if (a < 12 || r() * 255 > a) continue;
      var p = { x: (x + r()) / w, y: (y + r()) / h, z: r() * 2 - 1, s: 0.55 + r() * 0.7, ph: r() * TAU };
      if (keepColor) { p.r = data[i]; p.g = data[i + 1]; p.b = data[i + 2]; }
      else p.accent = data[i] > 150 && data[i + 1] < 90 && data[i + 2] < 90;
      pts.push(p);
    }
    return pts;
  }

  function sampleImage(img, w, h, count, seed) {
    var cv = canvasFor(w, h), c = cv.getContext("2d", { willReadFrequently: true });
    c.drawImage(img, 0, 0, w, h);
    var d;
    try { d = c.getImageData(0, 0, w, h).data; } catch (e) { return []; }
    return samplePixels(d, w, h, count, seed, true);
  }

  function sampleText(text, font, w, h, count, seed) {
    return sampleDrawing(function (c) {
      c.fillStyle = INK;
      c.font = font;
      c.textBaseline = "alphabetic";
      c.fillText(text, 4, h * 0.78);
    }, w, h, count, seed);
  }

  /* ---------------- Field: draws and animates a set of points ---------------- */
  function cssColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function toRGB(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return [24, 23, 19];
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* opts: { pad, dot, depth, turn, drift, keepColor, glow, converge, density } */
  function Field(canvas, points, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var dpr = 1, W = 0, H = 0, raf = 0, running = false, visible = true;
    var hover = 0, hoverTarget = 0, t0 = performance.now(), converge = opts.converge ? 0 : 1, convergeStart = 0;
    var ink = [24, 23, 19], accent = [173, 75, 43];
    var scatter = points.map(function (p, i) {
      var r = rng(i * 31 + 9);
      return { x: p.x + (r() - 0.5) * 1.6, y: p.y + (r() - 0.5) * 1.2 };
    });

    function readColors() {
      ink = toRGB(cssColor("--ink", "#181713"));
      accent = toRGB(cssColor("--accent", "#AD4B2B"));
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      draw(performance.now());
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var pad = opts.pad || 0;
      var sw = W - pad * 2, sh = H - pad * 2;
      var turn = reduce ? 0 : (opts.turn || 0) * Math.sin(t * 0.45);
      var cosT = Math.cos(turn), sinT = Math.sin(turn);
      var drift = (opts.drift == null ? 0.6 : opts.drift) * (1 - 0.75 * hover);
      var dot = opts.dot || 1.1;
      var k = converge < 1 ? easeOut(converge) : 1;
      var baseAlpha = 0.62 + 0.3 * hover;
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var px = p.x, py = p.y;
        if (k < 1) { px = scatter[i].x + (p.x - scatter[i].x) * k; py = scatter[i].y + (p.y - scatter[i].y) * k; }
        var x = pad + px * sw, y = pad + py * sh;
        if (turn) {
          var dx = x - W / 2;
          x = W / 2 + dx * cosT + p.z * (opts.depth || 18) * sinT;
        }
        if (!reduce && drift) {
          x += Math.sin(t * 0.9 + p.ph) * drift;
          y += Math.cos(t * 0.8 + p.ph * 1.3) * drift;
        }
        var a = baseAlpha * (0.55 + 0.45 * p.s);
        if (opts.twinkle && !reduce) a *= 0.65 + 0.35 * Math.sin(t * 1.7 + p.ph * 3);
        var col;
        if (opts.keepColor && p.r != null) {
          var b = opts.brighten || 1, L = opts.lift || 0;
          col = "rgba(" + Math.min(255, (p.r * b + L) | 0) + "," + Math.min(255, (p.g * b + L) | 0) + "," + Math.min(255, (p.b * b + L) | 0) + "," + a.toFixed(3) + ")";
        } else {
          var c = p.accent ? accent : ink;
          col = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")";
        }
        ctx.fillStyle = col;
        var s = dot * p.s * (opts.keepColor ? 1 : (0.9 + 0.25 * hover));
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }

    function easeOut(k) { return 1 - Math.pow(1 - k, 3); }

    function loop(now) {
      raf = 0;
      if (!running) return;
      hover += (hoverTarget - hover) * 0.12;
      if (converge < 1) converge = Math.min(1, (now - convergeStart) / (opts.convergeMs || 1500));
      draw(now);
      if (!reduce || converge < 1 || Math.abs(hoverTarget - hover) > 0.01) raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) {
          if (opts.converge && converge === 0 && !convergeStart) { convergeStart = performance.now(); if (reduce) converge = 1; }
          start();
        } else stop();
      });
    }, { rootMargin: "80px" }) : null;
    if (io) io.observe(canvas);

    readColors();
    resize();
    if (!io) { converge = 1; start(); }

    var onTheme = function () { readColors(); draw(performance.now()); };
    document.addEventListener("site:theme", onTheme);
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { resize(); }) : null;
    if (ro) ro.observe(canvas);

    return {
      setHover: function (on) { hoverTarget = on ? 1 : 0; if (!running) start(); },
      replay: function () { converge = 0; convergeStart = performance.now(); start(); },
      redraw: function () { readColors(); draw(performance.now()); },
      destroy: function () {
        stop();
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        document.removeEventListener("site:theme", onTheme);
      },
    };
  }


  /* ======================================================================
     3D point clouds for the Interests. Each shape is built from simple
     primitives (lines, rings, spheres, boxes) in a unit space with y up,
     then rendered with a slow swing, perspective and depth shading.
     ====================================================================== */
  function V(x, y, z) { return [x, y, z]; }
  function vadd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function vsub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function vmul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function vlen(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }

  function Builder(seed, k) {
    var r = rng(seed), pts = [];
    function n(c) { return Math.max(1, Math.round(c * k)); }
    function put(q, acc, size) {
      pts.push({ x: q[0], y: q[1], z: q[2], accent: !!acc, s: size || (0.55 + r() * 0.65), ph: r() * TAU });
    }
    function jit(q, j) {
      if (!j) return q;
      return [q[0] + (r() - 0.5) * j, q[1] + (r() - 0.5) * j, q[2] + (r() - 0.5) * j];
    }
    var B = {
      r: r,
      pts: pts,
      put: put,
      seg: function (a, b, density, acc, j) {
        var c = n(vlen(vsub(b, a)) * (density || 160));
        for (var i = 0; i < c; i++) put(jit(vadd(a, vmul(vsub(b, a), r())), j == null ? 0.012 : j), acc);
      },
      path: function (list, density, acc, j) {
        for (var i = 1; i < list.length; i++) B.seg(list[i - 1], list[i], density, acc, j);
      },
      ring: function (c, R, u, w, count, acc, j, a0, a1) {
        var cc = n(count), from = a0 || 0, span = (a1 == null ? TAU : a1) - from;
        for (var i = 0; i < cc; i++) {
          var t = from + r() * span;
          put(jit(vadd(c, vadd(vmul(u, R * Math.cos(t)), vmul(w, R * Math.sin(t)))), j == null ? 0.01 : j), acc);
        }
      },
      ellipse: function (c, A, Bb, u, w, count, acc, j) {
        var cc = n(count);
        for (var i = 0; i < cc; i++) {
          var t = r() * TAU;
          put(jit(vadd(c, vadd(vmul(u, A * Math.cos(t)), vmul(w, Bb * Math.sin(t)))), j == null ? 0.01 : j), acc);
        }
      },
      disc: function (c, R, u, w, count, acc) {
        var cc = n(count);
        for (var i = 0; i < cc; i++) {
          var t = r() * TAU, q = R * Math.sqrt(r());
          put(vadd(c, vadd(vmul(u, q * Math.cos(t)), vmul(w, q * Math.sin(t)))), acc, 0.45 + r() * 0.5);
        }
      },
      sphere: function (c, R, count, acc) {
        var cc = n(count);
        for (var i = 0; i < cc; i++) {
          var zz = r() * 2 - 1, t = r() * TAU, q = Math.sqrt(1 - zz * zz);
          put(vadd(c, [R * q * Math.cos(t), R * zz, R * q * Math.sin(t)]), acc);
        }
      },
      quad: function (c, u, w, count, acc) {
        var cc = n(count);
        for (var i = 0; i < cc; i++) put(vadd(c, vadd(vmul(u, r() * 2 - 1), vmul(w, r() * 2 - 1))), acc, 0.45 + r() * 0.5);
      },
      box: function (c, hx, hy, hz, edge, face, acc) {
        var X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
        var corners = [];
        for (var i = 0; i < 8; i++) corners.push(vadd(c, [(i & 1 ? 1 : -1) * hx, (i & 2 ? 1 : -1) * hy, (i & 4 ? 1 : -1) * hz]));
        [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(function (e) {
          B.seg(corners[e[0]], corners[e[1]], edge, acc, 0.008);
        });
        if (face) {
          B.quad(vadd(c, vmul(Z, hz)), vmul(X, hx), vmul(Y, hy), face, acc);
          B.quad(vadd(c, vmul(Z, -hz)), vmul(X, hx), vmul(Y, hy), face * 0.6, acc);
          B.quad(vadd(c, vmul(Y, hy)), vmul(X, hx), vmul(Z, hz), face * 0.7, acc);
          B.quad(vadd(c, vmul(X, hx)), vmul(Z, hz), vmul(Y, hy), face * 0.6, acc);
          B.quad(vadd(c, vmul(X, -hx)), vmul(Z, hz), vmul(Y, hy), face * 0.6, acc);
        }
      },
      tube: function (a, b, R, count, acc) {
        var d = vsub(b, a), L = vlen(d), ax = vmul(d, 1 / (L || 1));
        var tmp = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        var u = cross(ax, tmp); u = vmul(u, 1 / vlen(u));
        var w = cross(ax, u);
        var cc = n(count);
        for (var i = 0; i < cc; i++) {
          var t = r() * TAU, h = r();
          put(vadd(vadd(a, vmul(d, h)), vadd(vmul(u, R * Math.cos(t)), vmul(w, R * Math.sin(t)))), acc);
        }
      },
    };
    return B;
  }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  var X3 = [1, 0, 0], Y3 = [0, 1, 0], Z3 = [0, 0, 1];

  var shapes = {
    /* Politics as a social graph: a hub of influence and the ties around it. */
    network: function (B) {
      var r = B.r, nodes = [V(0, 0, 0)];
      var spots = [[-0.78, 0.38, 0.2], [-0.42, 0.78, -0.3], [0.18, 0.86, 0.32], [0.74, 0.5, -0.12], [0.86, -0.12, 0.35], [0.52, -0.66, -0.3], [-0.06, -0.86, 0.22], [-0.66, -0.58, -0.26], [-0.9, -0.06, -0.42], [0.36, 0.2, 0.7], [-0.3, 0.1, -0.78], [0.2, -0.24, -0.72]];
      spots.forEach(function (q) { nodes.push(V(q[0], q[1], q[2])); });
      var edges = [];
      for (var i = 1; i < nodes.length; i++) if (i % 3 !== 0) edges.push([0, i]);
      for (i = 1; i < nodes.length; i++) {
        var best = -1, bd = 9, second = -1, sd = 9;
        for (var j = 1; j < nodes.length; j++) {
          if (j === i) continue;
          var d = vlen(vsub(nodes[i], nodes[j]));
          if (d < bd) { second = best; sd = bd; best = j; bd = d; } else if (d < sd) { second = j; sd = d; }
        }
        edges.push([i, best]);
        if (i % 2) edges.push([i, second]);
      }
      edges.forEach(function (e) { B.seg(nodes[e[0]], nodes[e[1]], e[0] === 0 ? 150 : 110, false, 0.01); });
      nodes.forEach(function (q, k) {
        if (k === 0) return;
        var R = 0.055 + (k % 4) * 0.014;
        B.sphere(q, R, 900 * R + 40, false);
      });
      B.sphere(nodes[0], 0.14, 230, true);
      B.ring(nodes[0], 0.26, [0.96, 0.28, 0], [0, 0.3, 0.95], 150, true, 0.006);
    },

    /* Explainer videos: a camera on a tripod. */
    camera: function (B) {
      B.box(V(-0.1, 0.12, 0), 0.42, 0.24, 0.2, 230, 220, false);
      var lc = V(0.32, 0.12, 0);
      B.ring(lc, 0.13, Y3, Z3, 120, false);
      B.ring(V(0.56, 0.12, 0), 0.18, Y3, Z3, 170, false);
      for (var i = 0; i < 6; i++) {
        var t = i / 6 * TAU, off = [0, Math.cos(t), Math.sin(t)];
        B.seg(vadd(lc, vmul(off, 0.13)), vadd(V(0.56, 0.12, 0), vmul(off, 0.18)), 120, false, 0.006);
      }
      B.disc(V(0.56, 0.12, 0), 0.08, Y3, Z3, 60, false);
      [[V(-0.3, 0.6, 0), 0.19], [V(0.08, 0.57, 0), 0.16]].forEach(function (rl) {
        B.ring(rl[0], rl[1], X3, Y3, 170, false);
        B.ring(rl[0], rl[1] * 0.35, X3, Y3, 40, false);
        for (var k = 0; k < 5; k++) {
          var a = k / 5 * TAU + 0.3;
          B.seg(vadd(rl[0], [Math.cos(a) * rl[1] * 0.35, Math.sin(a) * rl[1] * 0.35, 0]), vadd(rl[0], [Math.cos(a) * rl[1] * 0.95, Math.sin(a) * rl[1] * 0.95, 0]), 120, false, 0.006);
        }
      });
      B.sphere(V(-0.42, 0.28, 0.21), 0.03, 50, true);
      var tri = [V(-0.18, 0.24, 0.205), V(-0.18, 0.0, 0.205), V(0.03, 0.12, 0.205)];
      B.path([tri[0], tri[1], tri[2], tri[0]], 260, true, 0.006);
      var mount = V(-0.1, -0.12, 0);
      B.seg(mount, V(-0.1, -0.36, 0), 120, false);
      B.seg(V(-0.1, -0.36, 0), V(-0.52, -0.98, 0.32), 130, false);
      B.seg(V(-0.1, -0.36, 0), V(0.32, -0.98, 0.32), 130, false);
      B.seg(V(-0.1, -0.36, 0), V(-0.1, -0.98, -0.45), 130, false);
    },

    /* Tennis: a racket and a ball. */
    tennis: function (B) {
      var al = -0.62, u = [Math.cos(al), Math.sin(al), 0], w = [-Math.sin(al), Math.cos(al), 0];
      var c = V(-0.18, 0.28, 0), A = 0.36, Bb = 0.47;
      B.ellipse(c, A, Bb, u, w, 520, false, 0.012);
      B.ellipse(c, A * 0.92, Bb * 0.94, u, w, 300, false, 0.008);
      for (var k = -5; k <= 5; k++) {
        var x = k * 0.058, half = Bb * 0.94 * Math.sqrt(Math.max(0, 1 - Math.pow(x / (A * 0.92), 2)));
        B.seg(vadd(c, vadd(vmul(u, x), vmul(w, -half))), vadd(c, vadd(vmul(u, x), vmul(w, half))), 60, false, 0.004);
      }
      for (k = -7; k <= 7; k++) {
        var y = k * 0.058, halfx = A * 0.92 * Math.sqrt(Math.max(0, 1 - Math.pow(y / (Bb * 0.94), 2)));
        B.seg(vadd(c, vadd(vmul(w, y), vmul(u, -halfx))), vadd(c, vadd(vmul(w, y), vmul(u, halfx))), 60, false, 0.004);
      }
      var neck = vadd(c, vmul(w, -(Bb + 0.24)));
      B.seg(vadd(c, vadd(vmul(w, -Bb * 0.86), vmul(u, -0.17))), neck, 170, false);
      B.seg(vadd(c, vadd(vmul(w, -Bb * 0.86), vmul(u, 0.17))), neck, 170, false);
      B.tube(neck, vadd(neck, vmul(w, -0.46)), 0.05, 330, false);
      B.ring(vadd(neck, vmul(w, -0.46)), 0.055, u, Z3, 40, false);
      var ball = V(0.56, -0.5, 0.18);
      B.sphere(ball, 0.16, 430, true);
      for (var i = 0; i < 120; i++) {
        var t = i / 120 * TAU;
        var sx = Math.cos(t) * 0.8 + 0.2 * Math.cos(3 * t), sy = Math.sin(t) * 0.8 - 0.2 * Math.sin(3 * t), sz = 0.6 * Math.sin(2 * t);
        var L = Math.sqrt(sx * sx + sy * sy + sz * sz);
        B.put(vadd(ball, [sx / L * 0.162, sy / L * 0.162, sz / L * 0.162]), false, 0.6);
      }
    },

    /* Hiking: a range of peaks, a trail to the top and a flag. */
    mountain: function (B) {
      var r = B.r, base = -0.66;
      var peaks = [[-0.16, 0, 1.18, 0.98], [0.56, 0.16, 0.76, 0.64], [-0.78, -0.2, 0.5, 0.52]];
      function h(x, z) {
        var best = 0;
        peaks.forEach(function (p, i) {
          var dx = x - p[0], dz = (z - p[1]) * 1.25, d = Math.sqrt(dx * dx + dz * dz);
          var a = Math.atan2(dz, dx);
          var ridge = 1 + 0.16 * Math.sin(a * 4 + i) + 0.05 * Math.sin(a * 11 + i * 2);
          best = Math.max(best, p[2] * Math.max(0, 1 - Math.pow(d / (p[3] * ridge), 1.12)));
        });
        return best;
      }
      // rocky faces, sparser near the foot
      for (var i = 0; i < 3400; i++) {
        var x = r() * 2.2 - 1.1, z = r() * 1.5 - 0.75, y = h(x, z);
        if (y <= 0.015) continue;
        if (r() > 0.3 + y * 0.55) continue;
        B.put([x, base + y, z], false, 0.42 + r() * 0.5);
      }
      // ridgelines that wander down from each summit
      peaks.forEach(function (p, pi) {
        var n = pi === 0 ? 6 : 4;
        for (var k = 0; k < n; k++) {
          var a = k / n * TAU + 0.4 + pi, steps = 60;
          for (var j = 0; j <= steps; j++) {
            var t = j / steps, wob = Math.sin(t * 9 + k * 2) * 0.04 * t;
            var R = t * p[3] * 0.98;
            var x2 = p[0] + Math.cos(a + wob * 3) * R, z2 = p[1] + Math.sin(a + wob * 3) * R / 1.25;
            var y2 = h(x2, z2);
            if (y2 < 0.02) break;
            B.put([x2 + (r() - 0.5) * 0.012, base + y2 + 0.005, z2 + (r() - 0.5) * 0.012], false, 0.75 + r() * 0.4);
            if (r() < 0.6) B.put([x2 + (r() - 0.5) * 0.02, base + y2, z2 + (r() - 0.5) * 0.02], false, 0.6);
          }
        }
      });
      // snow line on the high peak
      for (i = 0; i < 2600; i++) {
        var sx = -0.16 + (r() - 0.5) * 0.9, sz = (r() - 0.5) * 0.8, sy = h(sx, sz);
        if (Math.abs(sy - 0.84) < 0.022 + 0.03 * Math.sin(sx * 30)) B.put([sx, base + sy + 0.004, sz], false, 0.8);
      }
      // the trail, dashed in red, switching back up the front face
      var trail = [[-0.86, 0.45], [-0.4, 0.42], [-0.62, 0.28], [-0.24, 0.24], [-0.44, 0.12], [-0.2, 0.06], [-0.16, 0.0]];
      for (i = 1; i < trail.length; i++) {
        for (var q = 0; q < 46; q++) {
          var tt = q / 46;
          if (Math.floor(tt * 9) % 2) continue;
          var tx = trail[i - 1][0] + (trail[i][0] - trail[i - 1][0]) * tt, tz = trail[i - 1][1] + (trail[i][1] - trail[i - 1][1]) * tt;
          B.put([tx, base + h(tx, tz) + 0.016, tz], true, 0.85);
        }
      }
      var summit = V(-0.16, base + 1.18, 0);
      B.seg(summit, vadd(summit, [0, 0.3, 0]), 170, false, 0.006);
      for (i = 0; i < 130; i++) {
        var fa = r(), fb = r() * (1 - fa);
        B.put(vadd(summit, [fa * 0.28, 0.3 - fb * 0.15 - fa * 0.075, 0]), true, 0.75);
      }
    },

    /* Road cycling: a road bike. */
    bike: function (B) {
      var R = 0.38, rear = V(-0.56, -0.32, 0), front = V(0.56, -0.32, 0), bb = V(-0.06, -0.32, 0);
      [rear, front].forEach(function (c) {
        B.ring(c, R, X3, Y3, 420, false, 0.02);
        B.ring(c, R - 0.06, X3, Y3, 170, false, 0.006);
        B.sphere(c, 0.035, 30, false);
        for (var i = 0; i < 16; i++) {
          var t = i / 16 * TAU, side = i % 2 ? 0.035 : -0.035;
          B.seg(vadd(c, [0, 0, side]), vadd(c, [Math.cos(t) * (R - 0.06), Math.sin(t) * (R - 0.06), 0]), 50, false, 0.003);
        }
      });
      var seat = V(-0.2, 0.14, 0), headTop = V(0.38, 0.13, 0), headLow = V(0.42, -0.02, 0);
      B.seg(bb, seat, 220, true, 0.016);
      B.seg(seat, headTop, 220, true, 0.016);
      B.seg(bb, headLow, 220, true, 0.016);
      B.seg(headTop, headLow, 220, true, 0.016);
      [-0.05, 0.05].forEach(function (z) {
        B.seg(vadd(bb, [0, 0, z]), vadd(rear, [0, 0, z]), 160, true, 0.012);
        B.seg(vadd(seat, [0, 0, z * 0.6]), vadd(rear, [0, 0, z]), 160, true, 0.012);
        B.seg(vadd(headLow, [0, 0, z * 0.5]), vadd(front, [0, 0, z]), 160, false, 0.01);
      });
      var stem = V(0.47, 0.19, 0);
      B.seg(headTop, stem, 160, false);
      B.seg(V(0.47, 0.19, -0.2), V(0.47, 0.19, 0.2), 150, false);
      [-0.2, 0.2].forEach(function (z) {
        B.path([V(0.47, 0.19, z), V(0.56, 0.17, z), V(0.59, 0.08, z), V(0.55, 0.0, z), V(0.5, 0.0, z)], 170, false, 0.008);
      });
      var post = V(-0.24, 0.25, 0);
      B.seg(seat, post, 160, false);
      B.ellipse(V(-0.25, 0.27, 0), 0.13, 0.04, X3, Z3, 120, false, 0.01);
      B.ring(bb, 0.1, X3, Y3, 90, false, 0.008);
      B.seg(vadd(bb, [0, 0, 0.12]), vadd(bb, [0.1, -0.12, 0.12]), 120, false);
      B.seg(vadd(bb, [0, 0, -0.12]), vadd(bb, [-0.1, 0.12, -0.12]), 120, false);
    },

    /* Topological deep learning: a cell complex. Nodes, edges and filled
       2-cells on a lumpy geodesic sphere, with one higher-order
       neighbourhood picked out in the accent colour. */
    complex: function (B) {
      var r = B.r, t = (1 + Math.sqrt(5)) / 2;
      var verts = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
      var faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
      // one subdivision: 42 vertices, 80 faces
      var cache = {};
      function mid(a, b) {
        var k = a < b ? a + "_" + b : b + "_" + a;
        if (cache[k] != null) return cache[k];
        var p = verts[a], q = verts[b];
        verts.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]);
        cache[k] = verts.length - 1;
        return cache[k];
      }
      var sub = [];
      faces.forEach(function (f) {
        var a = mid(f[0], f[1]), b = mid(f[1], f[2]), c = mid(f[2], f[0]);
        sub.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]);
      });
      faces = sub;
      verts = verts.map(function (v, i) {
        var L = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        var k = 0.78 * (1 + 0.12 * Math.sin(i * 2.3) + 0.06 * Math.cos(i * 5.1));
        return [v[0] / L * k, v[1] / L * k * 0.92, v[2] / L * k];
      });
      // the highlighted neighbourhood: every face around vertex 0 and its ring
      var hub = 5, lit = {};
      faces.forEach(function (f, i) { if (f.indexOf(hub) >= 0) lit[i] = true; });
      var edges = {};
      faces.forEach(function (f, i) {
        [[f[0], f[1]], [f[1], f[2]], [f[2], f[0]]].forEach(function (e) {
          var k = e[0] < e[1] ? e[0] + "_" + e[1] : e[1] + "_" + e[0];
          edges[k] = edges[k] || { a: e[0], b: e[1], lit: false };
          if (lit[i]) edges[k].lit = true;
        });
      });
      Object.keys(edges).forEach(function (k) {
        var e = edges[k];
        B.seg(verts[e.a], verts[e.b], e.lit ? 210 : 130, e.lit, 0.006);
      });
      faces.forEach(function (f, i) {
        var fill = lit[i] ? 70 : (i % 3 === 0 ? 34 : 0);
        for (var n = 0; n < fill; n++) {
          var u = r(), v = r();
          if (u + v > 1) { u = 1 - u; v = 1 - v; }
          var a = verts[f[0]], b = verts[f[1]], c = verts[f[2]];
          B.put([a[0] + (b[0] - a[0]) * u + (c[0] - a[0]) * v, a[1] + (b[1] - a[1]) * u + (c[1] - a[1]) * v, a[2] + (b[2] - a[2]) * u + (c[2] - a[2]) * v], !!lit[i], 0.45 + r() * 0.4);
        }
      });
      verts.forEach(function (v, i) { B.sphere(v, i === hub ? 0.05 : 0.024, i === hub ? 80 : 26, i === hub); });
    },

    /* Networking: two people shaking hands, and a conversation. */
    people: function (B) {
      var r = B.r;
      function radius(y) {
        // shoulders, chest, waist and hips
        if (y > 0.22) return 0.2 - (y - 0.22) * 1.1;
        if (y > -0.1) return 0.2 - (0.22 - y) * 0.16;
        return 0.15 + (-0.1 - y) * 0.06;
      }
      [-1, 1].forEach(function (side) {
        var x = side * 0.44;
        B.sphere(V(x, 0.5, 0), 0.115, 280, false);
        B.tube(V(x, 0.34, 0), V(x, 0.39, 0), 0.045, 30, false);
        for (var i = 0; i < 900; i++) {
          var t = r() * TAU, y = 0.3 - r() * 0.64, rx = radius(y);
          if (r() > 0.5) continue;
          B.put([x + Math.cos(t) * rx, y, Math.sin(t) * rx * 0.62], false, 0.5 + r() * 0.5);
        }
        B.path([V(x - 0.19, 0.25, 0), V(x - 0.1, 0.31, 0), V(x, 0.33, 0), V(x + 0.1, 0.31, 0), V(x + 0.19, 0.25, 0)], 220, false, 0.008);
        B.tube(V(x - 0.08, -0.33, 0), V(x - 0.09, -0.92, 0.02), 0.04, 150, false);
        B.tube(V(x + 0.08, -0.33, 0), V(x + 0.09, -0.92, -0.02), 0.04, 150, false);
        B.tube(V(x - side * 0.19, 0.24, 0), V(x - side * 0.25, -0.22, 0.02), 0.032, 110, false);
        B.tube(V(x + side * 0.17, 0.24, 0.02), V(side * 0.05, 0.0, 0.1), 0.032, 130, false);
      });
      B.sphere(V(0, 0.0, 0.1), 0.055, 80, true);
      var c = V(0, 0.82, 0), w = 0.24, hh = 0.1;
      B.path([V(-w, hh, 0), V(w, hh, 0), V(w, -hh, 0), V(0.07, -hh, 0), V(-0.01, -hh - 0.09, 0), V(-0.04, -hh, 0), V(-w, -hh, 0), V(-w, hh, 0)].map(function (q) { return vadd(c, q); }), 210, true, 0.008);
      [-0.1, 0, 0.1].forEach(function (dx) { B.disc(vadd(c, [dx, 0, 0]), 0.028, X3, Y3, 30, false); });
    },
  };

  function makeShape(name, count, seed) {
    var f = shapes[name] || shapes.network;
    var B = Builder(seed || hash(name), 1);
    f(B);
    var pts = B.pts;
    // Resample to the requested size so every figure has a similar density.
    if (count && pts.length) {
      var r = rng((seed || 1) + 7), out = [];
      if (count >= pts.length) {
        out = pts.slice();
        while (out.length < count) {
          var p = pts[(r() * pts.length) | 0];
          out.push({ x: p.x + (r() - 0.5) * 0.01, y: p.y + (r() - 0.5) * 0.01, z: p.z + (r() - 0.5) * 0.01, accent: p.accent, s: 0.5 + r() * 0.6, ph: r() * TAU });
        }
      } else {
        for (var i = 0; i < count; i++) out.push(pts[(r() * pts.length) | 0]);
      }
      pts = out;
    }
    return pts;
  }

  /* opts: { yaw, swing, pitch, scale, dot, drift, converge, convergeMs, ink: [r,g,b], accent: [r,g,b] } */
  function Cloud(canvas, points, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var dpr = 1, W = 0, H = 0, raf = 0, running = false, visible = true;
    var hover = 0, hoverTarget = 0, t0 = performance.now() - ((hash(canvas.className + points.length) % 9000));
    var converge = opts.converge ? 0 : 1, convergeStart = 0;
    var ink = [24, 23, 19], accent = [173, 75, 43];
    var n = points.length;
    var PX = new Float32Array(n), PY = new Float32Array(n), PS = new Float32Array(n), PB = new Uint8Array(n);
    var r0 = rng(n + 3);
    var scatter = points.map(function () {
      var zz = r0() * 2 - 1, t = r0() * TAU, q = Math.sqrt(1 - zz * zz), R = 1.6 + r0() * 0.9;
      return [R * q * Math.cos(t), R * zz, R * q * Math.sin(t)];
    });
    var LEVELS = 10;
    var styles = [];
    function readColors() {
      ink = opts.ink || toRGB(cssColor("--ink", "#181713"));
      accent = opts.accent || toRGB(cssColor("--accent", "#AD4B2B"));
      styles = [];
      for (var c = 0; c < 2; c++) for (var l = 0; l < LEVELS; l++) {
        var col = c ? accent : ink, a = (l + 0.5) / LEVELS;
        styles.push("rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a.toFixed(3) + ")");
      }
    }
    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      draw(performance.now());
    }
    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var swing = opts.swing == null ? 0.5 : opts.swing;
      var yaw = (opts.yaw == null ? 0.42 : opts.yaw) + (reduce ? 0 : Math.sin(t * 0.42) * swing * (1 - 0.35 * hover));
      var pitch = opts.pitch == null ? 0.22 : opts.pitch;
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var S = Math.min(W / 2.3, H / 2.15) * (opts.scale || 1) * (1 + 0.035 * hover);
      var cam = 4.2, ox = W / 2, oy = H / 2;
      var k = converge < 1 ? 1 - Math.pow(1 - converge, 3) : 1;
      var drift = reduce ? 0 : (opts.drift == null ? 0.006 : opts.drift) * (1 - 0.7 * hover);
      var dot = (opts.dot || 1.1);
      var base = 0.58 + 0.34 * hover;
      for (var i = 0; i < n; i++) {
        var p = points[i], x = p.x, y = p.y, z = p.z;
        if (k < 1) { var sc = scatter[i]; x = sc[0] + (x - sc[0]) * k; y = sc[1] + (y - sc[1]) * k; z = sc[2] + (z - sc[2]) * k; }
        if (drift) { x += Math.sin(t * 0.9 + p.ph) * drift; y += Math.cos(t * 0.8 + p.ph * 1.3) * drift; }
        var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        var f = cam / (cam - z2);
        PX[i] = ox + x1 * f * S;
        PY[i] = oy - y2 * f * S;
        var depth = Math.max(0, Math.min(1, (z2 + 1.1) / 2.2));
        var a = base * (0.42 + 0.58 * depth) * (0.6 + 0.4 * p.s);
        var lvl = Math.max(0, Math.min(LEVELS - 1, (a * LEVELS) | 0));
        PB[i] = (p.accent ? LEVELS : 0) + lvl;
        PS[i] = dot * (0.75 + 0.45 * p.s) * (0.85 + 0.3 * depth) * f * 0.92;
      }
      for (var b = 0; b < LEVELS * 2; b++) {
        ctx.fillStyle = styles[b];
        for (i = 0; i < n; i++) {
          if (PB[i] !== b) continue;
          var s = PS[i];
          ctx.fillRect(PX[i] - s / 2, PY[i] - s / 2, s, s);
        }
      }
    }
    function loop(now) {
      raf = 0;
      if (!running) return;
      hover += (hoverTarget - hover) * 0.12;
      if (converge < 1) converge = Math.min(1, (now - convergeStart) / (opts.convergeMs || 1400));
      draw(now);
      if (!reduce || converge < 1 || Math.abs(hoverTarget - hover) > 0.01) raf = requestAnimationFrame(loop);
    }
    function start() { if (running || !visible) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) {
          if (opts.converge && converge === 0 && !convergeStart) { convergeStart = performance.now(); if (reduce) converge = 1; }
          start();
        } else stop();
      });
    }, { rootMargin: "80px" }) : null;
    if (io) io.observe(canvas);
    readColors();
    resize();
    if (!io) { converge = 1; start(); }
    var onTheme = function () { readColors(); draw(performance.now()); };
    document.addEventListener("site:theme", onTheme);
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { resize(); }) : null;
    if (ro) ro.observe(canvas);
    return {
      setHover: function (on) { hoverTarget = on ? 1 : 0; if (!running) start(); },
      replay: function () { converge = 0; convergeStart = performance.now(); start(); },
      redraw: function () { readColors(); draw(performance.now()); },
      destroy: function () {
        stop();
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        document.removeEventListener("site:theme", onTheme);
      },
    };
  }

  window.Particles = {
    figures: figures,
    sampleDrawing: sampleDrawing,
    sampleImage: sampleImage,
    sampleText: sampleText,
    Field: Field,
    shapes: shapes,
    makeShape: makeShape,
    Cloud: Cloud,
    hash: hash,
  };
})();
