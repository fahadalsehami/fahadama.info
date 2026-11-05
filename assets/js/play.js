/* ==========================================================================
   Play Me — tennis in crayon. You hold the red racket at the bottom, the
   site plays the blue racket at the top. Move with the mouse, a finger or
   the arrow keys; serve with a click, a tap or the space bar. Hit the ball
   off the edge of your racket to angle it, but too wide and it lands out.
   Win four points, two clear, to take the game. Games are kept in this
   browser.
   Exposes window.PlayMe = { mount(container, { name, announce }) }.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "playme-tennis";
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Court space: u runs across (0 = left sideline, 1 = right sideline),
     v runs down the court (0 = my baseline at the top, 1 = yours). */
  var V_ME = -0.02, V_YOU = 1.02;           // where each racket stands
  var REACH = 0.085;                         // half the racket's hitting width, in u
  var YOU_SPEED = 2.3, KEY_SPEED = 1.45;     // u per second
  var AI_BASE = 0.95, AI_MAX = 1.2;          // the site's footspeed
  var SERVE_SPEED = 0.8, MAX_SPEED = 1.5;    // court lengths per second

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
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s.me === "number") return s; } catch (e) {}
    return { me: 0, you: 0, game: 1, rally: 0 };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  /* ---------------- crayon drawing ---------------- */
  function crayonLine(c, x1, y1, x2, y2, w, color, seed) {
    var r = rng(seed), len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / 12));
    c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = color;
    for (var pass = 0; pass < 3; pass++) {
      c.beginPath();
      for (var i = 0; i <= n; i++) {
        var t = i / n, x = x1 + (x2 - x1) * t + (r() - 0.5) * 1.3, y = y1 + (y2 - y1) * t + (r() - 0.5) * 1.3;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.globalAlpha = pass ? 0.45 : 0.92;
      c.lineWidth = pass ? w * 0.55 : w;
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  /* Punch small holes so strokes look like wax on paper. */
  function grain(c, w, h, density, seed) {
    var r = rng(seed), n = Math.round(w * h * density);
    c.save();
    c.globalCompositeOperation = "destination-out";
    for (var i = 0; i < n; i++) {
      c.fillStyle = "rgba(0,0,0," + (0.2 + r() * 0.65).toFixed(2) + ")";
      var s = 0.7 + r() * 1.3;
      c.fillRect(r() * w, r() * h, s, s);
    }
    c.restore();
  }
  function layer(w, h, dpr) {
    var cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    var c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv: cv, c: c };
  }

  /* A racket drawn once per colour: head on the left, handle to the right. */
  function racketSprite(color, dark, dpr, seed) {
    var L = layer(78, 40, dpr), c = L.c, r = rng(seed);
    var hx = 21, hy = 20;
    c.save();
    c.beginPath(); c.ellipse(hx, hy, 15.5, 11.5, 0, 0, TAU); c.clip();
    c.strokeStyle = dark; c.globalAlpha = 0.5; c.lineWidth = 1;
    for (var x = 6; x <= 36; x += 4.2) { c.beginPath(); c.moveTo(x + (r() - 0.5), 6); c.lineTo(x + (r() - 0.5), 34); c.stroke(); }
    for (var y = 8; y <= 32; y += 4.2) { c.beginPath(); c.moveTo(4, y + (r() - 0.5)); c.lineTo(38, y + (r() - 0.5)); c.stroke(); }
    c.restore();
    c.globalAlpha = 1;
    c.strokeStyle = color; c.lineWidth = 4.2;
    for (var p = 0; p < 2; p++) {
      c.beginPath(); c.ellipse(hx + (r() - 0.5), hy + (r() - 0.5), 15.5, 11.5, 0, 0, TAU);
      c.globalAlpha = p ? 0.5 : 0.95; c.stroke();
    }
    c.globalAlpha = 1;
    crayonLine(c, 35.5, 17, 47, 20, 3.2, color, seed + 1);
    crayonLine(c, 35.5, 23, 47, 20, 3.2, color, seed + 2);
    crayonLine(c, 47, 20, 72, 20, 6.5, dark, seed + 3);
    grain(c, 78, 40, 0.16, seed + 4);
    return L.cv;
  }

  /* ---------------- little faces for the scoreboard ---------------- */
  var BUN =
    '<svg class="bun BUN-CLASS" viewBox="0 0 48 48" aria-hidden="true">' +
    '<ellipse cx="24" cy="27" rx="20" ry="17" fill="#EFD3AB" stroke="#B88E5E" stroke-width="1.3"/>' +
    '<ellipse cx="13" cy="31" rx="3" ry="2" fill="#EC9E8A" opacity=".55"/><ellipse cx="35" cy="31" rx="3" ry="2" fill="#EC9E8A" opacity=".55"/>' +
    '<g class="eyes-closed" fill="none" stroke="#5B4632" stroke-width="1.4" stroke-linecap="round"><path d="M15.5 26.5q2.5 1.8 5 0"/><path d="M27.5 26.5q2.5 1.8 5 0"/></g>' +
    '<g class="eyes-open" fill="#3E2F22"><circle cx="18" cy="26" r="1.9"/><circle cx="30" cy="26" r="1.9"/></g>' +
    '<path d="M22.4 31q1.6 1.3 3.2 0" fill="none" stroke="#5B4632" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path class="band" d="M7 18q17-9 34 0" fill="none" stroke="BAND" stroke-width="3.2" stroke-linecap="round"/>' +
    '<text class="zz" x="40" y="9">z</text>' +
    "</svg>";
  var FACE_ME =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="15" fill="#B7BDF0" stroke="#4D5BC2" stroke-width="2.4"/>' +
    '<path d="M8 15q12-8 24 0" fill="none" stroke="#4D5BC2" stroke-width="2.6" stroke-linecap="round"/>' +
    '<circle cx="15.5" cy="21" r="1.4" fill="#2A2F6B"/><circle cx="24.5" cy="21" r="1.4" fill="#2A2F6B"/><path d="M17.5 26q2.5 2 5 0" fill="none" stroke="#2A2F6B" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var FACE_YOU =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="15" fill="#F3B3A4" stroke="#D2462C" stroke-width="2.4"/>' +
    '<path d="M8 15q12-8 24 0" fill="none" stroke="#D2462C" stroke-width="2.6" stroke-linecap="round"/>' +
    '<circle cx="15.5" cy="21" r="1.4" fill="#6B2416"/><circle cx="24.5" cy="21" r="1.4" fill="#6B2416"/><path d="M17.5 26q2.5 2 5 0" fill="none" stroke="#6B2416" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var FACE_BALL =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="13" fill="#DCE65A" stroke="#9AA52A" stroke-width="2"/>' +
    '<path d="M9 13q9 7 0 14M31 13q-9 7 0 14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

  var POINTS = ["0", "15", "30", "40"];

  function mount(root, opts) {
    opts = opts || {};
    var name = String(opts.name || "me").replace(/[<>&"]/g, "");
    var announce = opts.announce || function () {};
    var score = load();

    var area = document.createElement("div");
    area.className = "play-area";
    area.innerHTML =
      '<div class="board-col">' +
      '<div class="court-wrap" tabindex="0" role="application" aria-label="Tennis court. Left and right arrow keys move your racket, Space serves." aria-describedby="court-hint">' +
      '<canvas class="court-canvas" aria-hidden="true"></canvas>' +
      BUN.replace("BUN-CLASS", "bun-me").replace("BAND", "#4D5BC2") +
      BUN.replace("BUN-CLASS", "bun-you").replace("BAND", "#D2462C") +
      '<p class="turn-note" aria-hidden="true"><span></span><svg viewBox="0 0 140 10"><path d="M4 6.5Q40 2.5 72 4.5T136 3.5"/></svg></p>' +
      "</div>" +
      '<p class="court-hint" id="court-hint">Move with the mouse, a finger or ← →. Serve with a click, a tap or the space bar.</p>' +
      '<button type="button" class="play-again" hidden>Play again</button>' +
      "</div>" +
      '<div class="scoreboard" role="group" aria-label="Scoreboard">' +
      '<h3 aria-hidden="true">scoreboard</h3>' +
      '<div class="score-row">' + FACE_ME + '<span class="score-name">me (' + name + ')</span><span class="score-dots"></span><span class="score-num" data-k="me">0</span></div>' +
      '<div class="score-row">' + FACE_YOU + '<span class="score-name">you<small>(for now)</small></span><span class="score-dots"></span><span class="score-num" data-k="you">0</span></div>' +
      '<div class="score-row">' + FACE_BALL + '<span class="score-name">longest rally</span><span class="score-dots"></span><span class="score-num" data-k="rally">0</span></div>' +
      '<p class="score-game" data-k="now"></p>' +
      '<p class="score-foot"></p>' +
      "</div>";
    root.appendChild(area);

    var wrap = area.querySelector(".court-wrap");
    var canvas = area.querySelector(".court-canvas");
    var ctx = canvas.getContext("2d");
    var note = area.querySelector(".turn-note"), noteText = note.querySelector("span");
    var again = area.querySelector(".play-again");
    var bunMe = area.querySelector(".bun-me"), bunYou = area.querySelector(".bun-you");
    var foot = area.querySelector(".score-foot"), nowEl = area.querySelector('[data-k="now"]');

    /* geometry */
    var W = 0, H = 0, dpr = 1, cx0 = 0, cy0 = 0, cw = 0, ch = 0, courtLayer = null, sprites = {};
    function lineColor() { return document.documentElement.getAttribute("data-theme") === "dark" && document.documentElement.getAttribute("data-mode") !== "starlight" ? "#CFC8BC" : "#4A4540"; }

    function buildCourt() {
      var L = layer(W, H, dpr), c = L.c;
      var x0 = cx0, y0 = cy0, x1 = cx0 + cw, y1 = cy0 + ch, mid = cy0 + ch / 2;
      // surface: green crayon hatch
      c.save();
      c.beginPath(); c.rect(x0, y0, cw, ch); c.clip();
      c.strokeStyle = "#8DB66B"; c.lineWidth = 2.3; c.globalAlpha = 0.72;
      for (var d = -ch; d < cw + ch; d += 6.5) { c.beginPath(); c.moveTo(x0 + d, y0); c.lineTo(x0 + d - ch, y1); c.stroke(); }
      c.restore();
      grain(c, W, H, 0.12, 31);
      // lines
      var col = lineColor(), w = Math.max(2.4, cw / 120), s = 0.12 * cw;
      crayonLine(c, x0, y0, x1, y0, w, col, 1);
      crayonLine(c, x1, y0, x1, y1, w, col, 2);
      crayonLine(c, x1, y1, x0, y1, w, col, 3);
      crayonLine(c, x0, y1, x0, y0, w, col, 4);
      crayonLine(c, x0 + s, y0, x0 + s, y1, w * 0.8, col, 5);
      crayonLine(c, x1 - s, y0, x1 - s, y1, w * 0.8, col, 6);
      crayonLine(c, x0 + s, y0 + ch * 0.25, x1 - s, y0 + ch * 0.25, w * 0.8, col, 7);
      crayonLine(c, x0 + s, y0 + ch * 0.75, x1 - s, y0 + ch * 0.75, w * 0.8, col, 8);
      crayonLine(c, x0 + cw / 2, y0 + ch * 0.25, x0 + cw / 2, y0 + ch * 0.75, w * 0.8, col, 9);
      crayonLine(c, x0 + cw / 2, y0, x0 + cw / 2, y0 + 7, w * 0.8, col, 10);
      crayonLine(c, x0 + cw / 2, y1, x0 + cw / 2, y1 - 7, w * 0.8, col, 11);
      // net: a band of mesh between two posts
      var nx0 = x0 - cw * 0.05, nx1 = x1 + cw * 0.05;
      c.save();
      c.globalAlpha = 0.32; c.strokeStyle = col; c.lineWidth = 1;
      for (var x = nx0; x < nx1; x += 5) { c.beginPath(); c.moveTo(x, mid - 7); c.lineTo(x + 5, mid); c.moveTo(x + 5, mid - 7); c.lineTo(x, mid); c.stroke(); }
      c.restore();
      crayonLine(c, nx0, mid - 7, nx1, mid - 7, w * 1.15, col, 12);
      crayonLine(c, nx0, mid, nx1, mid, w * 0.7, col, 13);
      [nx0, nx1].forEach(function (px, k) {
        c.beginPath(); c.arc(px, mid - 3, 4.2, 0, TAU); c.fillStyle = col; c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
        grain(c, 0, 0, 0, 14 + k);
      });
      grain(c, W, H, 0.05, 41);
      courtLayer = L.cv;
      sprites.you = racketSprite("#D2462C", "#7E2414", dpr, 51);
      sprites.me = racketSprite("#4D5BC2", "#232C78", dpr, 61);
    }

    function resize() {
      var r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      cw = W * 0.64; ch = H * 0.68;
      cx0 = (W - cw) / 2; cy0 = H * 0.11;
      buildCourt();
      draw();
    }

    /* ---------------- state ---------------- */
    var you = { u: 0.62, target: 0.62, swing: 0, dir: 0 };
    var me = { u: 0.38, swing: 0, plan: null };
    var ball = { u: 0.5, v: 0.5, du: 0, dv: 0, z: 0, ub: 0.5, vb: 0.5, bounced: false, from: 0, speed: SERVE_SPEED };
    var pts = { you: 0, me: 0 };
    var state = "idle", server = "you", hitter = null, rally = 0, timer = 0, marks = [];
    var keyDir = 0;

    function server0() { return score.game % 2 === 1 ? "you" : "me"; }
    function playable() {
      return visible && !document.hidden && document.documentElement.getAttribute("data-mode") !== "starlight";
    }
    function serveSpot(who) {
      var even = (pts.you + pts.me) % 2 === 0;
      if (who === "you") return even ? 0.64 : 0.36;
      return even ? 0.36 : 0.64;
    }

    function say(text, mine) {
      noteText.textContent = text;
      note.classList.toggle("is-mine", !!mine);
    }
    function gameText() {
      var a = pts.you, b = pts.me;
      if (a >= 3 && b >= 3) return a === b ? "deuce" : a > b ? "advantage you" : "advantage me";
      return "you " + POINTS[Math.min(a, 3)] + " · " + POINTS[Math.min(b, 3)] + " me";
    }
    function refresh() {
      area.querySelector('[data-k="me"]').textContent = score.me;
      area.querySelector('[data-k="you"]').textContent = score.you;
      area.querySelector('[data-k="rally"]').textContent = score.rally;
      nowEl.textContent = "this game: " + gameText();
      foot.textContent = "Game " + score.game + ". " + (server === "you" ? "You serve." : "I serve.") + " Win four points, two clear, to take it.";
      var toYou = state === "rally" && ball.dv > 0, toMe = state === "rally" && ball.dv < 0;
      var waiting = state === "serve" || state === "idle";
      var youUp = (waiting && server === "you") || toYou;
      var meUp = (waiting && server === "me") || toMe;
      bunYou.classList.toggle("is-awake", youUp); bunYou.classList.toggle("is-asleep", !youUp);
      bunMe.classList.toggle("is-awake", meUp); bunMe.classList.toggle("is-asleep", !meUp);
    }

    function newPoint() {
      state = "serve";
      hitter = null;
      rally = 0;
      timer = 0;
      ball.bounced = false; ball.z = 0.05; ball.du = ball.dv = 0;
      if (server === "you") { say("your serve", false); you.target = you.u = serveSpot("you"); }
      else { say("my serve…", true); }
      refresh();
    }

    function launch(from, u0, v0, ub, vb, speed) {
      ball.u = u0; ball.v = v0;
      ball.ub = ub; ball.vb = vb;
      ball.speed = speed;
      var dir = vb < v0 ? -1 : 1;
      var t = Math.abs(vb - v0) / speed;
      ball.dv = dir * speed;
      ball.du = (ub - u0) / t;
      ball.from = v0;
      ball.bounced = false;
      hitter = from;
      rally++;
      if (from === "you") you.swing = 1; else me.swing = 1;
      state = "rally";
      refresh();
    }

    function serve(who) {
      if (state !== "serve" || who !== server) return;
      var u0 = who === "you" ? you.u : me.u;
      if (who === "you") {
        var wide = u0 >= 0.5;
        launch("you", u0, V_YOU, wide ? rand(0.2, 0.44) : rand(0.56, 0.8), rand(0.3, 0.42), SERVE_SPEED);
      } else {
        var left = u0 < 0.5;
        launch("me", u0, V_ME, left ? rand(0.56, 0.8) : rand(0.2, 0.44), rand(0.58, 0.7), SERVE_SPEED + 0.03);
      }
      say(gameText(), who === "me");
    }

    function aiReturn() {
      // aim away from you, deeper as the rally goes on; now and then it goes wide
      var speed = Math.min(MAX_SPEED, ball.speed + 0.05);
      var target = you.u < 0.5 ? rand(0.56, 0.9) : rand(0.1, 0.44);
      if (Math.random() < 0.3) target = rand(0.25, 0.75);
      var errChance = Math.min(0.2, 0.035 + rally * 0.01);
      if (Math.random() < errChance) target = Math.random() < 0.5 ? rand(-0.12, -0.02) : rand(1.02, 1.12);
      launch("me", ball.u, V_ME, target, rand(0.7, 0.86), speed);
    }
    function youReturn() {
      var off = clamp((ball.u - you.u) / REACH, -1, 1);
      var speed = Math.min(MAX_SPEED, ball.speed + 0.05);
      // centre contact sends it back over the middle; the edges angle it toward the lines
      var target = 0.5 + (ball.u - 0.5) * 0.35 + off * 0.55 + you.dir * 0.06;
      launch("you", ball.u, V_YOU, target, rand(0.14, 0.3), speed);
    }

    function point(winner, call) {
      state = "point";
      timer = 0;
      pts[winner]++;
      if (rally > score.rally) score.rally = rally;
      var a = pts.you, b = pts.me, done = (a >= 4 || b >= 4) && Math.abs(a - b) >= 2;
      if (done) {
        state = "over";
        if (a > b) { score.you++; say("game, you!", false); announce("Game to you. Rally length " + rally + "."); }
        else { score.me++; say("game, " + name + " :)", true); announce("Game to me."); }
        score.game++;
        save(score);
        server = server0();
        refresh();
        nowEl.textContent = "last game: you " + a + " points, me " + b;
        again.hidden = false;
        return;
      }
      save(score);
      var text = call || (winner === "you" ? "nice shot!" : "my point");
      if (a >= 3 && b >= 3) text = a === b ? "deuce!" : a > b ? "advantage you" : "advantage me";
      say(text, winner === "me");
      announce((winner === "you" ? "Your point. " : "My point. ") + gameText().replace("·", ","));
      refresh();
    }

    /* ---------------- loop ---------------- */
    var raf = 0, last = 0, visible = false;
    function step(dt) {
      // your racket
      if (keyDir) you.target = clamp(you.target + keyDir * KEY_SPEED * dt, -0.1, 1.1);
      var mv = clamp(you.target - you.u, -YOU_SPEED * dt, YOU_SPEED * dt);
      you.dir = mv > 0.0005 ? 1 : mv < -0.0005 ? -1 : 0;
      you.u += mv;
      // my racket
      var aim;
      if (state === "rally" && ball.dv < 0) {
        if (!me.plan) {
          var miss = Math.random() < Math.min(0.28, 0.04 + rally * 0.012) ? (Math.random() < 0.5 ? -1 : 1) * rand(0.1, 0.17) : 0;
          me.plan = { err: rand(-0.03, 0.03) + miss };
        }
        var t = (ball.v - V_ME) / -ball.dv;
        var willBeOut = !ball.bounced && (ball.ub < 0 || ball.ub > 1);
        aim = willBeOut ? 0.5 : ball.u + ball.du * t + me.plan.err;
      } else {
        me.plan = null;
        aim = state === "serve" && server === "me" ? serveSpot("me") : 0.5 + (ball.u - 0.5) * 0.2;
      }
      var aiSpeed = Math.min(AI_MAX, AI_BASE + rally * 0.02);
      me.u += clamp(aim - me.u, -aiSpeed * dt, aiSpeed * dt);
      you.swing = Math.max(0, you.swing - dt * 5);
      me.swing = Math.max(0, me.swing - dt * 5);

      if (state === "serve") {
        var su = server === "you" ? you.u : me.u;
        ball.u = su + (server === "you" ? 0.05 : -0.05);
        ball.v = server === "you" ? V_YOU - 0.01 : V_ME + 0.01;
        timer += dt;
        ball.z = 0.05 + Math.abs(Math.sin(timer * 3)) * 0.05;
        if (server === "me" && timer > 1.15) serve("me");
      } else if (state === "rally") {
        ball.u += ball.du * dt;
        ball.v += ball.dv * dt;
        var span = Math.abs(ball.vb - ball.from);
        if (!ball.bounced) {
          var p = clamp(Math.abs(ball.v - ball.from) / span, 0, 1);
          ball.z = 0.09 * 4 * p * (1 - p) + 0.03 * (1 - p);
          if ((ball.dv < 0 && ball.v <= ball.vb) || (ball.dv > 0 && ball.v >= ball.vb)) {
            ball.bounced = true;
            marks.push({ u: ball.u, v: ball.v, t: 0 });
            if (ball.u < 0 || ball.u > 1) { point(hitter === "you" ? "me" : "you", "out!"); return; }
          }
        } else {
          var end = ball.dv < 0 ? V_ME : V_YOU, rest = Math.abs(end - ball.vb) || 0.2;
          var q = clamp(Math.abs(ball.v - ball.vb) / rest, 0, 1);
          ball.z = 0.07 * 4 * q * (1 - q) * 0.9 + 0.02 * q;
        }
        if (ball.dv < 0 && ball.v <= V_ME) {
          if (Math.abs(ball.u - me.u) <= REACH) aiReturn(); else point("you");
        } else if (ball.dv > 0 && ball.v >= V_YOU) {
          if (Math.abs(ball.u - you.u) <= REACH) youReturn(); else point("me");
        }
      } else if (state === "point") {
        timer += dt;
        ball.u += ball.du * dt * 0.5;
        ball.v += ball.dv * dt * 0.5;
        ball.z = Math.max(0, ball.z - dt * 0.2);
        if (timer > 1.35) newPoint();
      }
      for (var i = marks.length - 1; i >= 0; i--) { marks[i].t += dt; if (marks[i].t > 0.9) marks.splice(i, 1); }
    }

    function X(u) { return cx0 + u * cw; }
    function Y(v) { return cy0 + v * ch; }

    function drawRacket(img, u, v, top, swing) {
      if (!img) return;
      var x = X(u), y = Y(v);
      var base = top ? -Math.PI / 2 - 0.55 : Math.PI / 2 - 0.55;
      var a = base + (reduce ? 0 : swing * (top ? -0.7 : 0.7));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      var s = cw / 330;
      ctx.drawImage(img, -21 * s, -20 * s, 78 * s, 40 * s);
      ctx.restore();
    }

    function draw() {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (courtLayer) ctx.drawImage(courtLayer, 0, 0, W, H);
      var s = cw / 330;
      marks.forEach(function (m) {
        ctx.beginPath();
        ctx.ellipse(X(m.u), Y(m.v), 7 * s * (1 + m.t), 3.4 * s * (1 + m.t), 0, 0, TAU);
        ctx.strokeStyle = "rgba(120,90,40," + (0.5 * (1 - m.t / 0.9)).toFixed(2) + ")";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
      drawRacket(sprites.me, me.u, V_ME, true, me.swing);
      // ball and its shadow
      var bx = X(ball.u), by = Y(ball.v), lift = ball.z * ch * 0.9, r = 6.2 * s * (1 + ball.z * 1.6);
      if (state !== "over") {
        ctx.beginPath();
        ctx.ellipse(bx + lift * 0.25, by + 2, 6 * s, 3 * s, 0, 0, TAU);
        ctx.fillStyle = "rgba(40,30,20," + (0.22 * (1 - Math.min(0.8, ball.z * 4))).toFixed(2) + ")";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, by - lift, r, 0, TAU);
        ctx.fillStyle = "#DCE65A"; ctx.fill();
        ctx.lineWidth = 1.6; ctx.strokeStyle = "#8F9A22"; ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx - r * 1.05, by - lift, r * 0.8, -0.9, 0.9);
        ctx.arc(bx + r * 1.05, by - lift, r * 0.8, Math.PI - 0.9, Math.PI + 0.9);
        ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.1; ctx.stroke();
      }
      drawRacket(sprites.you, you.u, V_YOU, false, you.swing);
    }

    function loop(now) {
      raf = 0;
      if (!playable()) { last = 0; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (state !== "over" && state !== "idle") step(dt);
      else { // between games: keep the racket responsive, then rest
        var mv = clamp(you.target - you.u, -YOU_SPEED * dt, YOU_SPEED * dt);
        you.u += mv;
        if (state === "idle") park();
        if (Math.abs(you.target - you.u) < 0.0005 && dt) { draw(); return; }
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    function wake() { if (!raf && playable()) { last = 0; raf = requestAnimationFrame(loop); } }

    /* ---------------- input ---------------- */
    function pointerU(e) {
      var r = wrap.getBoundingClientRect();
      return clamp((e.clientX - r.left - cx0) / cw, -0.1, 1.1);
    }
    wrap.addEventListener("pointermove", function (e) { you.target = pointerU(e); wake(); });
    wrap.addEventListener("pointerdown", function (e) {
      you.target = pointerU(e);
      if (state === "idle") start();
      else if (state === "serve" && server === "you") serve("you");
      wake();
    });
    wrap.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { keyDir = -1; e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { keyDir = 1; e.preventDefault(); }
      else if (k === " " || k === "Enter") {
        e.preventDefault();
        if (state === "idle") start();
        else if (state === "serve" && server === "you") serve("you");
        else if (state === "over") nextGame();
      }
      wake();
    });
    wrap.addEventListener("keyup", function (e) {
      if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && keyDir < 0) keyDir = 0;
      if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && keyDir > 0) keyDir = 0;
    });
    wrap.addEventListener("blur", function () { keyDir = 0; });

    function start() {
      pts.you = pts.me = 0;
      server = server0();
      newPoint();
      if (server === "you") serve("you");
    }
    function nextGame() {
      again.hidden = true;
      marks = [];
      pts.you = pts.me = 0;
      server = server0();
      newPoint();
      wrap.focus({ preventScroll: true });
      wake();
    }
    again.addEventListener("click", nextGame);

    /* run only while the court is on screen, the tab is visible and the lights are on */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; if (visible) { resize(); wake(); } });
      }, { threshold: 0.2 }).observe(wrap);
    } else visible = true;
    document.addEventListener("visibilitychange", wake);
    document.addEventListener("site:theme", function () { if (W) { buildCourt(); draw(); } wake(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); }).observe(wrap);

    function park() {
      var su = server === "you" ? you.u : me.u;
      ball.u = su + (server === "you" ? 0.05 : -0.05);
      ball.v = server === "you" ? V_YOU - 0.01 : V_ME + 0.01;
      ball.z = 0.06;
    }

    server = server0();
    state = "idle";
    if (server === "you") you.u = you.target = serveSpot("you"); else me.u = serveSpot("me");
    park();
    say(server === "you" ? "your serve" : "my serve…", server === "me");
    refresh();
    nowEl.textContent = "this game: you 0 · 0 me";
    resize();
    return {};
  }

  window.PlayMe = { mount: mount };
})();
