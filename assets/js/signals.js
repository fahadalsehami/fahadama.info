/* ==========================================================================
   Signals: the hero. A body and its brain, drawn as points from real anatomy.
   Scrolling reads the body one channel at a time (eyes, face, voice, heart,
   breath, skin): each lights its pathway from the brain, and its trace leaves
   the body and flows left, where the traces fuse into the thread that runs
   down the page. Then the brain gathers into Fahad's face, the face becomes
   his photo, and the photo settles into the portrait in About.
   Anatomy: BodyParts3D surface points, in anatomy-data.js (see the README).
   Exposes window.Signals = { mount(canvas, opts) }.
   ========================================================================== */
(function () {
  "use strict";

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ramp(e0, e1, x) { return clamp((x - e0) / (e1 - e0), 0, 1); }
  function smooth(e0, e1, x) { var t = ramp(e0, e1, x); return t * t * (3 - 2 * t); }
  function smoother(e0, e1, x) { var t = ramp(e0, e1, x); return t * t * t * (t * (t * 6 - 15) + 10); }
  function inOut(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function noise(x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) + (hash(i + 1) - hash(i)) * u; }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function parseColor(s, fb) {
    s = (s || "").trim();
    var m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) { var v = parseInt(m[1], 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
    m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(s);
    return m ? [+m[1], +m[2], +m[3]] : fb;
  }

  /* ---------- the story, as positions along the hero's scroll (0..1) ---------- */
  var FIRST = 0.06, STEP = 0.075;          // channel k starts lighting at FIRST + k * STEP
  var ZOOM = [0.53, 0.65];                 // the view moves in to the head; the body fades
  var MORPH = [0.62, 0.83];                // the brain gathers into the face
  var PHOTO = [0.83, 0.93];                // the drawn face becomes the photo
  var SPEED = 42;                          // px per second the traces flow toward the thread

  /* ---------- the six channels the body can be read through ---------- */
  var SHAPES = {
    // pupil size: a slow drift, and a blink now and then
    eyes: function (u) {
      var b = ((u % 300) + 300) % 300;
      return (noise(u * 0.008) - 0.5) * 1.2 + (b < 14 ? -Math.sin((b / 14) * Math.PI) * 1.5 : 0);
    },
    // facial landmarks, drawn as dots
    face: function (u) { return (noise(u * 0.045) - 0.5) * 0.9 + Math.sin(u * 0.028) * 0.32; },
    // speech arrives in syllables, bursts of fast vibration
    voice: function (u) {
      var syllable = Math.max(0, Math.sin(u * 0.021) * 0.55 + noise(u * 0.011) * 0.95 - 0.38);
      return (Math.sin(u * 0.56) * 0.62 + Math.sin(u * 0.87 + 1.3) * 0.38) * syllable * 1.75;
    },
    // the pulse: a beat and its dicrotic notch every 118px
    heart: function (u) {
      var p = (((u % 118) + 118) % 118) / 118;
      return (Math.exp(-Math.pow((p - 0.18) / 0.052, 2)) + 0.36 * Math.exp(-Math.pow((p - 0.43) / 0.075, 2))) * 1.55 - 0.5;
    },
    // breathing: slow, a little longer out than in
    breath: function (u) { var a = u * 0.016; return Math.sin(a + 0.35 * Math.sin(a)) * 0.9; },
    // skin conductance: quick rises that fade slowly
    skin: function (u) {
      var k = Math.floor(u / 210), d = u - k * 210 - (30 + hash(k + 7) * 110);
      var r = d > 0 ? (1 - Math.exp(-d / 10)) * Math.exp(-d / 85) : 0;
      return (noise(u * 0.004) - 0.5) * 0.45 + r * 1.7 - 0.45;
    },
  };
  // site: where the trace leaves the body (model metres: x to the figure's left, y up, z forward)
  var CHANNELS = [
    { id: "eyes", site: [-0.032, 1.603, 0.068], paths: ["eyeL", "eyeR"], amp: 8 },
    { id: "face", site: [-0.05, 1.574, 0.075], paths: ["faceBrowL", "faceBrowR", "faceCheekL", "faceCheekR", "faceMouthL", "faceMouthR"], amp: 8, dots: true },
    { id: "voice", site: [0, 1.485, 0.033], paths: ["vagusTop", "larynx"], amp: 12 },
    { id: "heart", site: [0.0275, 1.297, 0.031], paths: ["vagus", "cord", "symHeart"], amp: 14 },
    { id: "breath", site: [-0.075, 1.33, 0.06], paths: ["cord", "phrenicL", "phrenicR"], amp: 11 },
    { id: "skin", site: [-0.296, 0.8, 0.055], paths: ["cord", "armL", "armR"], amp: 10 },
  ];

  /* ---------- the anatomy: decode the points, the pathways and what lights with each channel ---------- */
  var BRAIN = { cortex: 1, cingulate: 1, insula: 1, amygdala: 1, hippocampus: 1, hypothalamus: 1, thalamus: 1, deep: 1, brainstem: 1, cerebellum: 1 };
  var CLS_SKIN = 0, CLS_BRAIN = 1, CLS_HEART = 2, CLS_AIR = 3, CLS_OFF = 4;

  function spline(pts) {
    var out = [], n = pts.length;
    function at(i) { return pts[Math.max(0, Math.min(n - 1, i))]; }
    for (var i = 0; i < n - 1; i++) {
      var p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      for (var k = 0; k < 14; k++) {
        var t = k / 14, t2 = t * t, t3 = t2 * t;
        for (var c = 0; c < 3; c++) {
          out.push(0.5 * (2 * p1[c] + (p2[c] - p0[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * t3));
        }
      }
    }
    out.push(pts[n - 1][0], pts[n - 1][1], pts[n - 1][2]);
    return new Float32Array(out);
  }

  function decode(A) {
    var raw = atob(A.b64), n = A.n, pos = 0;
    var X = new Float32Array(n), Y = new Float32Array(n), Z = new Float32Array(n);
    var CLS = new Uint8Array(n), HL = new Uint8Array(n), R = new Float32Array(n), PH = new Float32Array(n);
    function v() { var e, t = 0, a = 0; do { e = raw.charCodeAt(pos++); t |= (e & 127) << a; a += 7; } while (e & 128); return (t >>> 1) ^ -(t & 1); }
    var centre = {};
    A.groups.forEach(function (g) {
      var x = 0, y = 0, z = 0, sc = g[6], cls = g[0] === "skin" ? CLS_SKIN : BRAIN[g[0]] ? CLS_BRAIN : g[0] === "heart" ? CLS_HEART : g[0] === "airways" ? CLS_AIR : CLS_OFF;
      var sx = 0, sy = 0, sz = 0;
      for (var k = g[1]; k < g[1] + g[2]; k++) {
        x += v(); y += v(); z += v();
        X[k] = g[3] + x * sc; Y[k] = g[4] + y * sc; Z[k] = g[5] + z * sc; CLS[k] = cls;
        sx += X[k]; sy += Y[k]; sz += Z[k];
      }
      centre[g[0]] = [sx / g[2], sy / g[2], sz / g[2]];
    });
    if (pos !== raw.length) throw new Error("anatomy: the point data did not decode cleanly");
    var r = rng(4242), brain = [];
    for (var i = 0; i < n; i++) {
      R[i] = r(); PH[i] = r() * 6.2832; HL[i] = 255;
      var c = CLS[i], x2 = X[i], y2 = Y[i], z2 = Z[i];
      if (c === CLS_BRAIN) brain.push(i);
      else if (c === CLS_HEART) HL[i] = 3;
      else if (c === CLS_AIR) HL[i] = 4;
      else if (c === CLS_SKIN) {
        var dt = Math.hypot(x2, y2 - 1.485, z2 - 0.033);
        var dpL = Math.hypot(x2 - 0.296, y2 - 0.8, z2 - 0.055), dpR = Math.hypot(x2 + 0.296, y2 - 0.8, z2 - 0.055);
        if (z2 > 0.035 && y2 > 1.53 && y2 < 1.67 && Math.abs(x2) < 0.075) HL[i] = 1;
        else if (dt < 0.05 && z2 > -0.01) HL[i] = 2;
        else if (Math.min(dpL, dpR) < 0.075) HL[i] = 5;
      }
    }
    // the brain points that will become the face: the ones that are drawn anyway, by rank
    brain.sort(function (a, b) { return R[a] - R[b]; });
    var paths = {};
    Object.keys(A.paths).forEach(function (k) { paths[k] = spline(A.paths[k]); });
    paths.vagusTop = spline(A.paths.vagus.slice(0, 4));
    return { n: n, X: X, Y: Y, Z: Z, CLS: CLS, HL: HL, R: R, PH: PH, brain: brain, centre: centre, paths: paths };
  }

  /* ---------- mount ---------- */
  function mount(canvas, opts) {
    opts = opts || {};
    var track = opts.track, stage = opts.stage || canvas.parentNode;
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext("2d");
    var M = null, W = 0, H = 0, dpr = 1, wide = true;
    var colors = {}, STYLE = [];
    var anchor = { x: 40, y: 300 }, vB = null, vF = null, face = null, lanes = [], figR = 0, fadeA = 1e9, fadeB = 1e9;
    var p = 0, over = 0, time = 0, t0 = 0, reveal = reduce ? 1 : 0, visible = true, running = false, raf = 0, readySent = false;
    var scrolly = false, dead = false;

    // per point, per frame
    var PX, PY, PS, PB, ORDER, PART, COUNT = new Int32Array(32), START = new Int32Array(32);
    // the face: where each particle lands, as fractions of the portrait's square, and how dark it is there
    var NF = 0, TU = null, TV = null, TW = null, DLY = null, faceImg = null, targetsFor = "";
    var faceEl = null, slotEl = null, landed = false, flying = false;

    /* ---- colours from the stylesheet, so both themes follow the site ---- */
    function readColors() {
      var cs = getComputedStyle(canvas);
      function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
      colors = {
        ink: parseColor(v("--ink", "#0C2033"), [12, 32, 51]),
        tide: parseColor(v("--tide", "#1D5C93"), [29, 92, 147]),
        strong: v("--sig-strong", "rgba(12,32,51,0.88)"),
        label: v("--sig-label", "rgba(12,32,51,0.56)"),
        font: v("--sig-font", '"Bricolage Grotesque", system-ui, sans-serif'),
        dark: document.documentElement.getAttribute("data-theme") === "dark",
      };
      STYLE = [];
      for (var b = 0; b < 32; b++) {
        var c = b < 16 ? colors.ink : colors.tide, a = ((b % 16) + 0.75) / 16;
        STYLE.push("rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")");
      }
    }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + clamp(a, 0, 1).toFixed(3) + ")"; }

    /* ---- where everything sits for this viewport ---- */
    function copyRight() {
      var right = 0;
      if (!opts.copy || !document.createRange) return 0;
      var sr = stage.getBoundingClientRect(), rg = document.createRange();
      var walk = document.createTreeWalker(opts.copy, NodeFilter.SHOW_TEXT, null);
      for (var node = walk.nextNode(); node; node = walk.nextNode()) {
        if (!node.nodeValue.trim()) continue;
        rg.selectNodeContents(node);
        var rects = rg.getClientRects();
        for (var i = 0; i < rects.length; i++) if (rects[i].width) right = Math.max(right, rects[i].right - sr.left);
      }
      return right;
    }

    function layout() {
      if (opts.anchor) { var a = opts.anchor(W, H); if (a) anchor = a; }
      wide = W >= 900 && W / H >= 1.05;
      var span = 0.99;                                     // metres shown, hips to the top of the head
      if (wide) {
        var cr = copyRight() + 28, avail = W - 28 - cr;
        var s = Math.min((H * 0.88) / span, avail / 0.72);
        s = Math.max(s, (H * 0.6) / span);
        vB = { s: s, cx: avail > 0.72 * s ? (cr + W - 28) / 2 : W - 28 - 0.36 * s, cy: H * 0.515, yc: 1.285 };
        var D = clamp(Math.min(H * 0.46, W * 0.3, avail), 200, 380);
        face = { d: D, x: vB.cx - D / 2, y: clamp(H * 0.4 - D / 2, 76, H - D - 40) };
      } else {
        var top = H * 0.075, bottom = Math.max(H * 0.42, anchor.y - 24);
        var s2 = Math.min((bottom - top) / span, (W - 36) / 0.7);
        vB = { s: s2, cx: W * 0.5, cy: (top + bottom) / 2, yc: 1.285 };
        var D2 = clamp(Math.min(W * 0.64, anchor.y - H * 0.1 - 16), 150, 300);
        face = { d: D2, x: W / 2 - D2 / 2, y: Math.max(H * 0.1, 64) };
      }
      // the view on the face: the eyes where the photo has them, at the photo's scale
      vF = { s: (0.193 * face.d) / 0.064, cx: face.x + 0.493 * face.d, cy: face.y + 0.385 * face.d, yc: 1.603 };
      figR = vB.cx + 0.36 * vB.s;
      if (wide) { fadeA = H * 0.84; fadeB = H * 1.02; } else { fadeA = anchor.y - 10; fadeB = anchor.y + 46; }
      // lanes: wide screens give each trace its own line above the name
      lanes = [];
      var eyesY = vB.cy - (1.603 - vB.yc) * vB.s;
      var laneTop = clamp(eyesY - 6, Math.max(H * 0.14, 96), anchor.y - 120), laneBot = Math.max(laneTop + 60, anchor.y - 40);
      for (var k = 0; k < CHANNELS.length; k++) lanes.push(laneTop + ((laneBot - laneTop) * k) / (CHANNELS.length - 1));
      var nf = clamp(Math.round(face.d * face.d * 0.032), 1400, 4800);
      if (M) nf = Math.min(nf, M.brain.length);
      if (nf !== NF) { NF = nf; targetsFor = ""; }
      buildTargets();
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    /* ---- the face: sample the portrait into points, darker (or, in the dark theme, lighter) where the photo is ---- */
    function buildTargets() {
      if (!faceImg || !faceImg.complete || !faceImg.naturalWidth || !NF) return;
      var key = NF + (colors.dark ? "d" : "l");
      if (key === targetsFor) return;
      var S = 128, cv = document.createElement("canvas");
      cv.width = cv.height = S;
      var g = cv.getContext("2d");
      g.drawImage(faceImg, 0, 0, S, S);
      var data;
      try { data = g.getImageData(0, 0, S, S).data; } catch (e) { return; }
      var w = new Float32Array(S * S), total = 0, max = 0;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
        var dx = (x + 0.5) / S - 0.5, dy = (y + 0.5) / S - 0.5;
        if (dx * dx + dy * dy > 0.235) continue;            // inside the round frame
        var o = (y * S + x) * 4, al = data[o + 3] / 255;
        if (al < 0.05) continue;
        var lum = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255;
        lum = clamp((lum - 0.5) * 1.15 + 0.5, 0, 1);
        var wt = (colors.dark ? Math.pow(lum, 1.5) : Math.pow(1 - lum, 1.2)) * al;
        w[y * S + x] = wt; total += wt; if (wt > max) max = wt;
      }
      if (!total) return;
      TU = new Float32Array(NF); TV = new Float32Array(NF); TW = new Float32Array(NF); DLY = new Float32Array(NF);
      var r = rng(77), cum = 0, idx = 0, stepW = total / NF, next = r() * stepW;
      for (var j = 0; j < NF; j++) {
        while (idx < S * S - 1 && cum + w[idx] < next) { cum += w[idx]; idx++; }
        var px = idx % S, py = (idx / S) | 0;
        TU[j] = (px + r()) / S; TV[j] = (py + r()) / S; TW[j] = w[idx] / max;
        next += stepW;
      }
      // shuffle, so neighbouring brain points don't all land on neighbouring pixels
      for (j = NF - 1; j > 0; j--) {
        var k = (r() * (j + 1)) | 0, t;
        t = TU[j]; TU[j] = TU[k]; TU[k] = t; t = TV[j]; TV[j] = TV[k]; TV[k] = t; t = TW[j]; TW[j] = TW[k]; TW[k] = t;
      }
      for (j = 0; j < NF; j++) {
        var dc = Math.hypot(TU[j] - 0.5, TV[j] - 0.42) / 0.55;
        DLY[j] = 0.36 * (0.72 * clamp(dc, 0, 1) + 0.28 * hash(j * 3.7 + 1));
      }
      if (M) {
        PART.fill(-1);
        for (j = 0; j < NF; j++) PART[M.brain[j]] = j;
      }
      targetsFor = key;
    }

    /* ---- the scroll ---- */
    function readScroll() {
      if (!scrolly) { p = reduce ? 0.5 : 0; over = 0; return; }
      var r = track.getBoundingClientRect(), sh = stage.offsetHeight;
      var spanPx = Math.max(1, r.height - sh);
      p = clamp(-r.top / spanPx, 0, 1);
      over = Math.max(0, -r.top - spanPx);
      track.classList.toggle("is-scrolled", p > 0.015);
    }

    /* the photo: fades in over the drawn face, then rides the scroll into the portrait in About */
    function placeFace() {
      if (!faceEl || !face) return;
      if (!slotEl && opts.slot) { slotEl = opts.slot(); if (slotEl) slotEl.classList.add("is-awaiting"); }
      var show = smooth(PHOTO[0], PHOTO[1] - 0.02, p);
      if (!targetsFor) show = 0;
      var sr = stage.getBoundingClientRect();
      var ax = sr.left + face.x, ay = sr.top + face.y, ad = face.d;
      var f = 0, bx = ax, by = ay, bd = ad;
      if (slotEl) {
        // it lands as About reaches the spot its link scrolls to, so a visit to #about finds it in place
        var s = slotEl.getBoundingClientRect(), chap = slotEl.closest(".chapter") || slotEl;
        var margin = parseFloat(getComputedStyle(chap).scrollMarginTop) || 0;
        var land = over + (chap.getBoundingClientRect().top - margin);
        f = over > 0 ? (land > 1 ? clamp(over / land, 0, 1) : 1) : 0;
        bx = s.left; by = s.top; bd = s.width || ad;
      }
      var e = f;
      var landedNow = f >= 0.999 || !targetsFor;
      if (landedNow !== landed) {
        landed = landedNow;
        if (slotEl) slotEl.classList.toggle("is-awaiting", !landed);
        // arriving in About on the way down sends a pulse along the thread
        if (landed && flying && opts.onLand) opts.onLand();
      }
      flying = !landed && show >= 0.01;
      if (opts.copy) opts.copy.style.opacity = !wide && flying && f > 0 ? (1 - smooth(0.02, 0.4, f)).toFixed(3) : "";
      if (!flying) { faceEl.style.visibility = "hidden"; faceEl.style.opacity = "0"; return; }
      var x = lerp(ax, bx, e), y = lerp(ay, by, e), d = lerp(ad, bd, e);
      var sc = lerp(0.94, 1, show);
      faceEl.style.visibility = "visible";
      faceEl.style.opacity = show.toFixed(3);
      faceEl.style.width = d.toFixed(1) + "px";
      faceEl.style.transform = "translate3d(" + (x + (d * (1 - sc)) / 2).toFixed(1) + "px," + (y + (d * (1 - sc)) / 2).toFixed(1) + "px,0) scale(" + sc.toFixed(4) + ")";
    }

    /* ---- drawing ---- */
    var view = { s: 1, cx: 0, cy: 0, yc: 0, cos: 1, sin: 0 };
    function project(x, y, z, out) {
      var rx = x * view.cos + z * view.sin, rz = z * view.cos - x * view.sin;
      var k = 1 / (1 - rz * 0.5);
      out[0] = view.cx + rx * view.s * k; out[1] = view.cy - (y - view.yc) * view.s * k; out[2] = rz;
      return out;
    }
    var tmp = [0, 0, 0], tmp2 = [0, 0, 0];

    function litOf(k) { var a = FIRST + k * STEP; return smooth(a, a + 0.05, p); }
    function focusOf(k) { var a = FIRST + k * STEP; return smooth(a, a + 0.03, p) * (1 - smooth(a + STEP, a + STEP + 0.06, p)); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!M) return;
      var z = inOut(ramp(ZOOM[0], ZOOM[1], p));
      var m = targetsFor ? ramp(MORPH[0], MORPH[1], p) : 0;
      var yaw = reduce ? 0 : Math.sin(time * 0.21) * 0.15 * (1 - z);
      view.s = lerp(vB.s, vF.s, z); view.cx = lerp(vB.cx, vF.cx, z); view.cy = lerp(vB.cy, vF.cy, z); view.yc = lerp(vB.yc, vF.yc, z);
      view.cos = Math.cos(yaw); view.sin = Math.sin(yaw);

      var trA = (1 - smooth(ZOOM[0], ZOOM[0] + 0.07, p)) * reveal;   // traces and labels
      var bodyA = (1 - smooth(ZOOM[0] + 0.02, ZOOM[1] + 0.02, p)) * reveal;
      var skinA = (1 - smooth(MORPH[0] - 0.02, MORPH[0] + 0.1, p)) * reveal;
      var brainA = (1 - smooth(MORPH[0], MORPH[0] + 0.1, p)) * reveal;
      var stipA = 1 - smooth(PHOTO[0] + 0.03, PHOTO[1], p);
      var lit = [], foc = [], nLit = 0;
      for (var k = 0; k < CHANNELS.length; k++) { lit.push(litOf(k)); foc.push(focusOf(k)); nLit += lit[k]; }
      var beat = Math.exp(-Math.pow((((time * 1.2) % 1) - 0.12) / 0.07, 2));
      var breathe = Math.sin(time * 1.35);

      // the fused line: where the traces become the thread down the page
      if (reveal > 0.01) {
        ctx.strokeStyle = colors.strong;
        ctx.globalAlpha = reveal * (0.45 + 0.55 * clamp(nLit / 2, 0, 1));
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(anchor.x, anchor.y); ctx.lineTo(anchor.x, H + 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      drawPaths(lit, foc, trA);
      drawPoints(lit, foc, bodyA, skinA, brainA, stipA, m, beat, breathe);
      drawSites(lit, foc, trA);
      drawTraces(lit, foc, trA);
    }

    function drawPoints(lit, foc, bodyA, skinA, brainA, stipA, m, beat, breathe) {
      var n = M.n, X = M.X, Y = M.Y, Z = M.Z, CLS = M.CLS, HL = M.HL, R = M.R, PH = M.PH;
      var hc = M.centre.heart, ac = M.centre.airways;
      var BASEA = colors.dark ? [0.36, 0.44, 0.5, 0.44] : [0.34, 0.42, 0.5, 0.42];
      var SIZE = [1.25, 1.0, 1.35, 1.2];
      var dens = lerp(0.3, 0.38, inOut(ramp(ZOOM[0], ZOOM[1], p)));
      var hb = 1 + 0.035 * beat, br = 1 + 0.028 * breathe;
      var hlLevel = [0, 0, 0, 0, 0, 0];
      for (var k = 0; k < 6; k++) hlLevel[k] = lit[k] * (0.55 + 0.45 * foc[k]);
      var fd = face.d, fx = face.x, fy = face.y;
      COUNT.fill(0);
      for (var i = 0; i < n; i++) {
        PB[i] = -1;
        var c = CLS[i];
        if (c === CLS_OFF) continue;
        var a, x = X[i], y = Y[i], zz = Z[i], j = -1;
        if (c === CLS_SKIN) { if (!wide && R[i] > 0.8) continue; a = BASEA[0] * skinA * (reduce ? 1 : 0.8 + 0.2 * Math.sin(time * 1.7 + PH[i])); }
        else if (c === CLS_BRAIN) {
          j = PART[i];
          if (j < 0 || m <= 0) { j = -1; if (R[i] > dens) continue; }
          a = BASEA[1] * (j >= 0 ? reveal : brainA);
        } else {
          a = BASEA[c] * bodyA;
          if (c === CLS_HEART) { x = hc[0] + (x - hc[0]) * hb; y = hc[1] + (y - hc[1]) * hb; zz = hc[2] + (zz - hc[2]) * hb; }
          else { y = ac[1] + (y - ac[1]) * br; x = ac[0] + (x - ac[0]) * (1 + (br - 1) * 0.5); }
        }
        if (a < 0.008) continue;
        project(x, y, zz, tmp);
        var sx = tmp[0], sy = tmp[1], kk = 1 / (1 - tmp[2] * 0.5);
        var sz = SIZE[c] * kk, col = 0;
        a *= 0.62 + 0.38 * clamp((tmp[2] + 0.15) / 0.3, 0, 1);
        var h = HL[i];
        if (h !== 255 && hlLevel[h] > 0.01) {
          var hi = hlLevel[h] * (c === CLS_SKIN ? skinA : bodyA);
          a = lerp(a, Math.min(1, a * 2.4 + 0.3), hi); sz += 0.75 * hi; if (hi > 0.3) col = 16;
        }
        if (j >= 0) {
          // a brain point on its way into the face
          var e = inOut(ramp(DLY[j], DLY[j] + 0.62, m));
          var tx = fx + TU[j] * fd, ty = fy + TV[j] * fd;
          var dx = tx - sx, dy = ty - sy, sw = Math.sin(Math.PI * e) * (hash(j * 1.7) - 0.5) * 0.35;
          sx += dx * e - dy * sw; sy += dy * e + dx * sw;
          a = lerp(a, 0.18 + 0.82 * TW[j], e) * (e > 0.98 ? stipA : 1);
          sz = lerp(sz, 0.9 + 1.5 * TW[j], e);
          col = 0;
          if (a < 0.008) continue;
        }
        if (j < 0 && sy > fadeA) { a *= 1 - smooth(fadeA, fadeB, sy); if (a < 0.008) continue; }
        if (sx < -6 || sx > W + 6 || sy < -6 || sy > H + 6) continue;
        var b = col + Math.min(15, (a * 16) | 0);
        PX[i] = sx; PY[i] = sy; PS[i] = sz; PB[i] = b; COUNT[b]++;
      }
      var acc = 0;
      for (var b2 = 0; b2 < 32; b2++) { START[b2] = acc; acc += COUNT[b2]; }
      var fill = START.slice();
      for (i = 0; i < n; i++) { var bb = PB[i]; if (bb >= 0) ORDER[fill[bb]++] = i; }
      for (b2 = 0; b2 < 32; b2++) {
        if (!COUNT[b2]) continue;
        ctx.fillStyle = STYLE[b2];
        for (var q = START[b2], end = START[b2] + COUNT[b2]; q < end; q++) {
          var ii = ORDER[q], s2 = PS[ii];
          ctx.fillRect(PX[ii] - s2 / 2, PY[ii] - s2 / 2, s2, s2);
        }
      }
    }

    // pathways from the brain to each channel, with a pulse travelling down them
    function drawPaths(lit, foc, trA) {
      var pa = {}, rv = {};
      CHANNELS.forEach(function (ch, k) {
        var a = lit[k] * trA * (0.5 + 0.5 * foc[k]);
        ch.paths.forEach(function (name) { if ((pa[name] || 0) < a) pa[name] = a; if ((rv[name] || 0) < lit[k]) rv[name] = lit[k]; });
      });
      var trunk = 0;
      for (var k = 0; k < 6; k++) trunk = Math.max(trunk, lit[k] * trA);
      pa.descend = trunk; rv.descend = 1;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      Object.keys(pa).forEach(function (name) {
        var a = pa[name], P = M.paths[name];
        if (!P || a < 0.01) return;
        var cnt = P.length / 3, upto = Math.max(2, Math.round(cnt * rv[name]));
        ctx.beginPath();
        for (var i = 0; i < upto; i++) {
          project(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], tmp);
          if (i) ctx.lineTo(tmp[0], tmp[1]); else ctx.moveTo(tmp[0], tmp[1]);
        }
        ctx.strokeStyle = rgba(colors.tide, a * 0.55);
        ctx.lineWidth = 1;
        ctx.stroke();
        if (reduce || rv[name] < 0.98) return;
        // a pulse running from the brain toward the body
        var f = (time * 0.42 + hash(name.length * 13.1)) % 1, at = Math.floor(f * (cnt - 1));
        project(P[at * 3], P[at * 3 + 1], P[at * 3 + 2], tmp);
        ctx.fillStyle = rgba(colors.tide, a);
        ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 1.9, 0, 6.2832); ctx.fill();
      });
    }

    // what each channel looks like where it is read: pupils, voice, palms
    function drawSites(lit, foc, trA) {
      var sc = view.s / 800;
      ctx.lineWidth = 1;
      if (lit[0] * trA > 0.01) {
        var pupil = 0.5 + 0.5 * Math.sin(time * 0.8);
        [[0.032, 1.603, 0.068], [-0.032, 1.603, 0.068]].forEach(function (e) {
          project(e[0], e[1], e[2], tmp);
          ctx.strokeStyle = rgba(colors.tide, lit[0] * trA * 0.9);
          ctx.beginPath(); ctx.arc(tmp[0], tmp[1], (3.4 + 1.1 * foc[0]) * sc + 1, 0, 6.2832); ctx.stroke();
          ctx.fillStyle = rgba(colors.tide, lit[0] * trA);
          ctx.beginPath(); ctx.arc(tmp[0], tmp[1], (1.2 + 1.3 * pupil) * sc + 0.6, 0, 6.2832); ctx.fill();
        });
      }
      function ripples(pt, a, period, maxR) {
        if (a < 0.01) return;
        project(pt[0], pt[1], pt[2], tmp);
        for (var r2 = 0; r2 < 2; r2++) {
          var ph = reduce ? 0.35 + r2 * 0.3 : ((time / period) + r2 * 0.5) % 1;
          ctx.strokeStyle = rgba(colors.tide, a * (1 - ph) * 0.9);
          ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 2 + ph * maxR * sc, 0, 6.2832); ctx.stroke();
        }
      }
      ripples([0, 1.485, 0.04], lit[2] * trA, 0.9, 16);
      ripples([0.296, 0.8, 0.06], lit[5] * trA, 2.4, 14);
      ripples([-0.296, 0.8, 0.06], lit[5] * trA, 2.4, 14);
    }

    // the traces: each leaves the body at its site and flows left into the thread
    function drawTraces(lit, foc, trA) {
      if (trA < 0.01) return;
      ctx.font = "13px " + colors.font;
      var labelY = [];
      for (var k = 0; k < CHANNELS.length; k++) {
        var a = lit[k] * trA;
        if (a < 0.01) continue;
        var ch = CHANNELS[k];
        project(ch.site[0], ch.site[1], ch.site[2], tmp2);
        var Sx = tmp2[0], Sy = tmp2[1];
        var base = [], i, x, y, t;
        if (wide) {
          var Lx = vB.cx - 0.38 * vB.s - 22, Ly = lanes[k];
          // out of the body to its lane
          for (i = 0; i <= 20; i++) {
            t = i / 20;
            var c1x = Sx - 40, c2x = Lx + 60, mt = 1 - t;
            x = mt * mt * mt * Sx + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * Lx;
            y = mt * mt * mt * Sy + 3 * mt * mt * t * Sy + 3 * mt * t * t * Ly + t * t * t * Ly;
            base.push(x, y, 0);
          }
          // along the lane, then into the thread
          var spanL = Math.max(1, Lx - anchor.x);
          for (x = Lx - 3; x >= anchor.x; x -= 3) {
            var s = (Lx - x) / spanL, eb = smoother(0.36, 1, s);
            base.push(x, Ly + (anchor.y - Ly) * eb, (1 - eb) * (1 - eb) * smooth(0, 0.06, s));
          }
          var la = a * (0.62 + 0.38 * foc[k]);
          ctx.fillStyle = foc[k] > 0.3 ? rgba(colors.ink, la) : colors.label;
          ctx.globalAlpha = foc[k] > 0.3 ? 1 : a;
          ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
          ctx.fillText(ch.id, Lx - 2, Ly - 9);
          ctx.globalAlpha = 1;
        } else {
          // narrow screens: straight from the site to the thread, labels at the figure's right
          var Ax = anchor.x, Ay = anchor.y, dxs = Sx - Ax;
          var steps = Math.max(24, Math.round(Math.hypot(dxs, Sy - Ay) / 3));
          for (i = 0; i <= steps; i++) {
            t = i / steps;
            var u1 = 1 - t, c1 = Sx - dxs * 0.3, c2 = Ax + dxs * 0.42;
            x = u1 * u1 * u1 * Sx + 3 * u1 * u1 * t * c1 + 3 * u1 * t * t * c2 + t * t * t * Ax;
            y = u1 * u1 * u1 * Sy + 3 * u1 * u1 * t * Sy + 3 * u1 * t * t * (Ay - 18) + t * t * t * Ay;
            base.push(x, y, smooth(0.08, 0.3, t) * Math.pow(1 - smooth(0.62, 1, t), 2) * 0.8);
          }
          labelY.push({ k: k, y: Sy, a: a });
        }
        // reveal from the site toward the thread as the channel lights
        var cnt = base.length / 3, upto = Math.max(2, Math.round(cnt * smooth(FIRST + k * STEP, FIRST + k * STEP + 0.045, p)));
        var shape = SHAPES[ch.id], amp = ch.amp * (wide ? 1 : 0.8), arc = 0, px0 = base[0], py0 = base[1];
        var alphaLine = a * (0.62 + 0.38 * foc[k]);
        if (ch.dots) {
          ctx.fillStyle = rgba(colors.ink, alphaLine);
          for (i = 0; i < upto; i++) {
            x = base[i * 3]; y = base[i * 3 + 1]; arc += Math.hypot(x - px0, y - py0); px0 = x; py0 = y;
            if (i % 2) continue;
            var yy = y + shape(arc - time * SPEED + k * 977) * amp * base[i * 3 + 2];
            ctx.beginPath(); ctx.arc(x, yy, 1.15, 0, 6.2832); ctx.fill();
          }
        } else {
          ctx.beginPath();
          for (i = 0; i < upto; i++) {
            x = base[i * 3]; y = base[i * 3 + 1]; arc += Math.hypot(x - px0, y - py0); px0 = x; py0 = y;
            var yv = y + shape(arc - time * SPEED + k * 977) * amp * base[i * 3 + 2];
            if (i) ctx.lineTo(x, yv); else ctx.moveTo(x, yv);
          }
          ctx.strokeStyle = rgba(colors.ink, alphaLine);
          ctx.lineWidth = 1.3 + 0.5 * foc[k];
          ctx.stroke();
        }
      }
      if (!wide && labelY.length) {
        // keep the labels apart
        labelY.sort(function (u, v) { return u.y - v.y; });
        for (var q = 1; q < labelY.length; q++) if (labelY[q].y < labelY[q - 1].y + 16) labelY[q].y = labelY[q - 1].y + 16;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        labelY.forEach(function (l) {
          ctx.fillStyle = foc[l.k] > 0.3 ? rgba(colors.ink, l.a) : colors.label;
          ctx.globalAlpha = foc[l.k] > 0.3 ? 1 : l.a;
          ctx.fillText(CHANNELS[l.k].id, Math.min(W - 44, figR + 8), l.y);
          ctx.globalAlpha = 1;
        });
      }
    }

    /* ---- the loop ---- */
    function frame(now) {
      raf = 0;
      if (!running) return;
      if (!t0) t0 = now;
      time = (now - t0) / 1000;
      if (!reduce) reveal = smooth(0, 1.4, time);
      draw();
      if (!readySent && reveal > 0.3) { readySent = true; if (opts.onReady) opts.onReady(); }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduce && M && !dead) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function sync() { if (visible && !document.hidden) start(); else stop(); }
    function still() { time = 3.3; reveal = 1; readScroll(); draw(); if (!readySent) { readySent = true; if (opts.onReady) opts.onReady(); } }

    function onScroll() { readScroll(); placeFace(); }

    function init() {
      if (M || dead) return;
      try { M = decode(window.ANAT); } catch (e) { teardown(); return; }
      PX = new Float32Array(M.n); PY = new Float32Array(M.n); PS = new Float32Array(M.n);
      PB = new Int8Array(M.n); ORDER = new Uint32Array(M.n); PART = new Int32Array(M.n).fill(-1);
      targetsFor = "";
      size();
      // the name's width decides where the figure stands, so measure again once the font is in
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { size(); onScroll(); if (reduce) still(); });
      readScroll(); placeFace();
      if (reduce) still(); else sync();
    }
    function teardown() {
      dead = true; stop();
      scrolly = false; track.classList.remove("is-scrolly");
      if (faceEl) { faceEl.remove(); faceEl = null; }
      if (slotEl) slotEl.classList.remove("is-awaiting");
      ctx.clearRect(0, 0, W, H);
      if (opts.onReady && !readySent) { readySent = true; opts.onReady(); }
    }

    readColors();
    // scroll-driven only with motion allowed and room to pin the stage
    scrolly = !reduce && !!track && window.innerHeight >= 480;
    if (scrolly) track.classList.add("is-scrolly");

    // the photo that the face becomes, the same picture as the portrait in About
    if (opts.portrait && scrolly) {
      faceImg = new Image();
      faceImg.decoding = "async";
      faceImg.onload = function () { buildTargets(); onScroll(); };
      faceImg.src = opts.portrait;
      faceEl = document.createElement("div");
      faceEl.className = "portrait hero-face";
      faceEl.setAttribute("aria-hidden", "true");
      var im = document.createElement("img");
      im.src = opts.portrait; im.alt = ""; im.decoding = "async";
      faceEl.appendChild(im);
      document.body.appendChild(faceEl);
    }

    W = Math.max(1, Math.round(canvas.getBoundingClientRect().width)); H = Math.max(1, Math.round(canvas.getBoundingClientRect().height));
    if (window.ANAT) init();
    else {
      document.addEventListener("anatomy", init, { once: true });
      window.addEventListener("load", function () { if (!M) teardown(); });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (!M) return; size(); onScroll(); if (reduce) still(); }, 120);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }).observe(stage);
    }
    document.addEventListener("visibilitychange", sync);

    return {
      retheme: function () {
        readColors(); targetsFor = ""; buildTargets();
        if (reduce && M) still();
      },
    };
  }

  window.Signals = { mount: mount };
})();
