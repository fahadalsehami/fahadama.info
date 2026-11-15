/* ==========================================================================
   Figures: the Interests, each one a small 3D sculpture made of points.
   The six shapes (a social graph, a camera on a tripod, a racket and ball,
   a range of peaks with a trail and flag, a road bike, two people talking)
   are built from simple primitives in a unit space with y up. Each tile
   assembles its figure from scattered points when it first comes into view,
   turns slowly on its own, and turns toward the pointer. Points are round,
   shaded by depth, with accents that glow. Still when motion is reduced.
   Colours come from --fig-ink, --fig-accent and --fig-glow on the canvas.
   Exposes window.Figures = { mount(canvas, name, opts), names }.
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

  /* ---------------- the shapes ---------------- */
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

  /* ---------------- rendering ---------------- */
  function parseColor(s, fallback) {
    s = String(s || "").trim();
    var m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) { var v = parseInt(m[1], 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255, 1]; }
    m = /^rgba?\(([^)]+)\)$/i.exec(s);
    if (m) {
      var p = m[1].split(/\s*,\s*|\s+/).map(Number);
      if (p.length >= 3 && p.every(function (x) { return !isNaN(x); })) return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    return fallback;
  }
  function easeOut(k) { k = Math.max(0, Math.min(1, k)); return 1 - Math.pow(1 - k, 3); }

  var LEVELS = 12;

  /* opts: { reduce, count, delay (ms before assembling), dot } */
  function mount(canvas, name, opts) {
    opts = opts || {};
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext("2d");
    var points = makeShape(name, opts.count || 2600, hash(name + ":figure"));
    var n = points.length;
    // Centre each figure on its own bounds, so it turns about its middle, and
    // measure it, so every figure fills its tile the same way.
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    points.forEach(function (q) {
      lo[0] = Math.min(lo[0], q.x); lo[1] = Math.min(lo[1], q.y); lo[2] = Math.min(lo[2], q.z);
      hi[0] = Math.max(hi[0], q.x); hi[1] = Math.max(hi[1], q.y); hi[2] = Math.max(hi[2], q.z);
    });
    var mid = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2], reach = 0, tall = 0;
    points = points.map(function (q) {
      var c = { x: q.x - mid[0], y: q.y - mid[1], z: q.z - mid[2], accent: q.accent, s: q.s, ph: q.ph };
      reach = Math.max(reach, Math.sqrt(c.x * c.x + c.z * c.z));
      tall = Math.max(tall, Math.abs(c.y));
      return c;
    });
    var PX = new Float32Array(n), PY = new Float32Array(n), PR = new Float32Array(n), PB = new Uint8Array(n);
    var r0 = rng(n + 11);
    var scatter = points.map(function () {
      var zz = r0() * 2 - 1, t = r0() * TAU, q = Math.sqrt(1 - zz * zz), R = 1.8 + r0() * 1.1;
      return [R * q * Math.cos(t), R * zz, R * q * Math.sin(t)];
    });

    var W = 0, H = 0, dpr = 1, raf = 0, running = false, visible = false;
    var t0 = performance.now() - (hash(name) % 7000);
    var assemble = reduce ? 1 : 0, assembleAt = 0;
    var hover = 0, hoverTarget = 0;
    var aim = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    var ink = [12, 32, 51, 1], accent = [43, 123, 198, 1], glow = [43, 123, 198, 0.22];
    var styles = [], glowStyle = "";

    function readColors() {
      var cs = getComputedStyle(canvas);
      ink = parseColor(cs.getPropertyValue("--fig-ink"), ink);
      accent = parseColor(cs.getPropertyValue("--fig-accent"), accent);
      glow = parseColor(cs.getPropertyValue("--fig-glow"), glow);
      styles = [];
      for (var c = 0; c < 2; c++) for (var l = 0; l < LEVELS; l++) {
        var col = c ? accent : ink, a = (l + 0.6) / LEVELS;
        styles.push("rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a.toFixed(3) + ")");
      }
      glowStyle = "rgba(" + glow[0] + "," + glow[1] + "," + glow[2] + "," + glow[3] + ")";
    }
    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      draw(performance.now());
    }

    function draw(now) {
      if (!W) return;
      var t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var k = easeOut(assemble);
      if (k <= 0) return;
      var swing = reduce ? 0 : Math.sin(t * 0.42) * 0.5 * (1 - 0.6 * hover);
      var yaw = 0.42 + swing + look.x * 0.95, pitch = 0.22 - look.y * 0.45;
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      // Fit by the figure's own reach (any turn) and height, allowing for perspective.
      var S = Math.min(W * 0.43 / reach, H * 0.4 / (tall + 0.12 * reach)) / 1.14 * (1 + 0.04 * hover);
      var cam = 4.2, ox = W / 2, oy = H / 2;
      var drift = reduce ? 0 : 0.006 * (1 - 0.7 * hover);
      var dot = (opts.dot || 1.3) * Math.max(0.85, Math.min(1.3, S / 88));
      var base = (0.76 + 0.22 * hover) * Math.min(1, k * 1.4);
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
        var a = base * (0.4 + 0.6 * depth) * (0.62 + 0.38 * p.s);
        var lvl = Math.max(0, Math.min(LEVELS - 1, (a * LEVELS) | 0));
        PB[i] = (p.accent ? LEVELS : 0) + lvl;
        PR[i] = dot * 0.5 * (0.72 + 0.48 * p.s) * (0.8 + 0.4 * depth) * f * 0.92;
      }
      // accents first get a soft halo, so they read as lit from within
      ctx.fillStyle = glowStyle;
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        if (PB[i] < LEVELS || (i & 1)) continue;
        var g = PR[i] * 3.2;
        ctx.moveTo(PX[i] + g, PY[i]);
        ctx.arc(PX[i], PY[i], g, 0, TAU);
      }
      ctx.globalAlpha = 0.5 * base;
      ctx.fill();
      ctx.globalAlpha = 1;
      // then the points, one path per shade
      for (var b = 0; b < LEVELS * 2; b++) {
        ctx.beginPath();
        var any = false;
        for (i = 0; i < n; i++) {
          if (PB[i] !== b) continue;
          var r = PR[i];
          if (r < 0.8) ctx.rect(PX[i] - r, PY[i] - r, r * 2, r * 2);
          else { ctx.moveTo(PX[i] + r, PY[i]); ctx.arc(PX[i], PY[i], r, 0, TAU); }
          any = true;
        }
        if (any) { ctx.fillStyle = styles[b]; ctx.fill(); }
      }
    }

    var lastDraw = 0;
    function loop(now) {
      raf = 0;
      if (!running) return;
      if (assemble < 1 && assembleAt && now >= assembleAt) assemble = Math.min(1, (now - assembleAt) / 1500);
      hover += (hoverTarget - hover) * 0.1;
      look.x += (aim.x - look.x) * 0.08;
      look.y += (aim.y - look.y) * 0.08;
      var settling = assemble < 1 || Math.abs(hoverTarget - hover) > 0.002 || Math.abs(aim.x - look.x) > 0.001 || Math.abs(aim.y - look.y) > 0.001;
      // While idle the figure only swings slowly, so half the frame rate looks the same.
      if (settling || hoverTarget || now - lastDraw > 30) { draw(now); lastDraw = now; }
      if (!reduce || settling) raf = requestAnimationFrame(loop);
      else running = false;
    }
    function start() {
      if (running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) {
          if (!assembleAt) assembleAt = performance.now() + (opts.delay || 0);
          start();
        } else stop();
      });
    }, { rootMargin: "60px" }) : null;
    if (io) io.observe(canvas);
    else { visible = true; assemble = 1; start(); }
    var onVis = function () { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVis);
    var onTheme = function () { readColors(); draw(performance.now()); };
    document.addEventListener("themechange", onTheme);
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { resize(); }) : null;
    if (ro) ro.observe(canvas);

    readColors();
    resize();

    return {
      /* Pointer over the tile, as -0.5..0.5 across and down; null when it leaves. */
      point: function (x, y) {
        if (x == null) { aim.x = 0; aim.y = 0; hoverTarget = 0; }
        else { aim.x = x; aim.y = y; hoverTarget = 1; }
        start();
      },
      hover: function (on) { hoverTarget = on ? 1 : 0; if (!on) { aim.x = 0; aim.y = 0; } start(); },
      redraw: function () { readColors(); draw(performance.now()); },
      destroy: function () {
        stop();
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        document.removeEventListener("themechange", onTheme);
      },
    };
  }

  window.Figures = { mount: mount, names: Object.keys(shapes) };
})();
