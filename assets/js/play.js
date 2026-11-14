/* ==========================================================================
   Play Me: tennis on a sky court. You hold the racket at the bottom, the
   site plays the one at the top. Move with the mouse, a finger or
   the arrow keys; serve with a click, a tap or the space bar. Hit the ball
   off the edge of your racket to angle it, but too wide and it lands out.
   Win four points, two clear, to take the game. Games are kept in this
   browser. Colours come from CSS custom properties on .court-wrap.
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

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s.me === "number") return s; } catch (e) {}
    return { me: 0, you: 0, game: 1, rally: 0 };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  /* ---------------- drawing ---------------- */
  function layer(w, h, dpr) {
    var cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    var c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv: cv, c: c };
  }

  /* A racket drawn once per colour: head on the left, handle to the right. */
  function racketSprite(frame, grip, strings, dpr) {
    var L = layer(78, 40, dpr), c = L.c, hx = 21, hy = 20;
    c.save();
    c.beginPath(); c.ellipse(hx, hy, 15, 11, 0, 0, TAU); c.clip();
    c.strokeStyle = strings; c.lineWidth = 0.8;
    for (var x = 7.4; x <= 35; x += 3.5) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x, 34); c.stroke(); }
    for (var y = 9.2; y <= 31; y += 3.5) { c.beginPath(); c.moveTo(4, y); c.lineTo(38, y); c.stroke(); }
    c.restore();
    c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = frame; c.lineWidth = 3.2;
    c.beginPath(); c.ellipse(hx, hy, 15, 11, 0, 0, TAU); c.stroke();
    c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(35.4, 16.2); c.lineTo(46.5, 20); c.lineTo(35.4, 23.8); c.stroke();
    c.strokeStyle = grip; c.lineWidth = 6.2;
    c.beginPath(); c.moveTo(47.5, 20); c.lineTo(72, 20); c.stroke();
    return L.cv;
  }

  /* ---------------- scoreboard marks ---------------- */
  // A small racket: strung head, throat and grip, tilted like a racket at rest.
  var RACKET = '<g transform="rotate(-38 18 18)"><path class="strings" d="M14.6 5v12.6M18 3v17M21.4 5v12.6M12 7.6h12M11 11.2h14M12 14.8h12"/>' +
    '<ellipse cx="18" cy="11.2" rx="7.4" ry="8.8"/><path d="M15.2 19.4 18 23.6l2.8-4.2"/><path class="grip" d="M18 24v9.4"/></g>';
  var MARK_ME = '<svg class="mark mark-me" viewBox="0 0 36 36" aria-hidden="true">' + RACKET + "</svg>";
  var MARK_YOU = '<svg class="mark mark-you" viewBox="0 0 36 36" aria-hidden="true">' + RACKET + "</svg>";
  var MARK_BALL = '<svg class="mark mark-ball" viewBox="0 0 36 36" aria-hidden="true"><circle class="glow" cx="18" cy="18" r="13"/><circle class="ball" cx="18" cy="18" r="7.5"/></svg>';

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
      '<p class="turn-note" aria-hidden="true"><span></span></p>' +
      "</div>" +
      '<p class="court-hint" id="court-hint">Move with the mouse, a finger or the arrow keys. Serve with a click, a tap or the space bar.</p>' +
      '<button type="button" class="play-again" hidden>Play again</button>' +
      "</div>" +
      '<div class="scoreboard" role="group" aria-label="Scoreboard">' +
      '<h3 aria-hidden="true">Scoreboard</h3>' +
      '<div class="score-row">' + MARK_ME + '<span class="score-name">Me<small>' + name + ', at the top</small></span><span class="score-dots"></span><span class="score-num" data-k="me">0</span></div>' +
      '<div class="score-row">' + MARK_YOU + '<span class="score-name">You<small>at the bottom</small></span><span class="score-dots"></span><span class="score-num" data-k="you">0</span></div>' +
      '<div class="score-row">' + MARK_BALL + '<span class="score-name">Longest rally<small>shots in one point</small></span><span class="score-dots"></span><span class="score-num" data-k="rally">0</span></div>' +
      '<p class="score-game" data-k="now"></p>' +
      '<p class="score-foot"></p>' +
      "</div>";
    root.appendChild(area);

    var wrap = area.querySelector(".court-wrap");
    var canvas = area.querySelector(".court-canvas");
    var ctx = canvas.getContext("2d");
    var note = area.querySelector(".turn-note"), noteText = note.querySelector("span");
    var again = area.querySelector(".play-again");
    var foot = area.querySelector(".score-foot"), nowEl = area.querySelector('[data-k="now"]');

    /* geometry */
    var W = 0, H = 0, dpr = 1, cx0 = 0, cy0 = 0, cw = 0, ch = 0, courtLayer = null, sprites = {};
    var col = {};
    function readColors() {
      var cs = getComputedStyle(wrap);
      function v(n, fb) { var x = cs.getPropertyValue(n).trim(); return x || fb; }
      col = {
        court: v("--court", "#A9D3F4"), line: v("--court-line", "#FFFFFF"), mesh: v("--net-mesh", "rgba(12,32,51,0.3)"),
        net: v("--net", "#FFFFFF"), post: v("--post", "#0C2033"),
        me: v("--racket-me", "#0C2033"), meGrip: v("--racket-me-grip", "#1D5C93"),
        you: v("--racket-you", "#2C7CC4"), youGrip: v("--racket-you-grip", "#0C2033"), strings: v("--strings", "rgba(12,32,51,0.45)"),
        ball: v("--ball", "#FFFFFF"), ballEdge: v("--ball-edge", "rgba(12,32,51,0.5)"), glow: v("--ball-glow", "rgba(255,255,255,0.9)"),
        shadow: v("--ball-shadow", "rgba(12,32,51,0.22)"), mark: v("--mark", "rgba(12,32,51,0.45)"),
        sheen: v("--court-sheen", "rgba(255,255,255,0.16)"),
      };
    }

    function buildCourt() {
      readColors();
      var L = layer(W, H, dpr), c = L.c;
      var x0 = cx0, y0 = cy0, x1 = cx0 + cw, y1 = cy0 + ch, mid = cy0 + ch / 2;
      var w = Math.max(1.6, cw / 190), s = 0.12 * cw;
      // the surface, with a soft sheen across the far half
      c.fillStyle = col.court;
      c.fillRect(x0 - w * 6, y0 - w * 6, cw + w * 12, ch + w * 12);
      var g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, col.sheen); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.fillRect(x0 - w * 6, y0 - w * 6, cw + w * 12, ch + w * 12);
      // lines
      c.strokeStyle = col.line; c.lineCap = "butt"; c.lineWidth = w;
      function ln(ax, ay, bx, by) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
      c.strokeRect(x0, y0, cw, ch);
      ln(x0 + s, y0, x0 + s, y1); ln(x1 - s, y0, x1 - s, y1);
      ln(x0 + s, y0 + ch * 0.25, x1 - s, y0 + ch * 0.25); ln(x0 + s, y0 + ch * 0.75, x1 - s, y0 + ch * 0.75);
      ln(x0 + cw / 2, y0 + ch * 0.25, x0 + cw / 2, y0 + ch * 0.75);
      ln(x0 + cw / 2, y0, x0 + cw / 2, y0 + 7); ln(x0 + cw / 2, y1, x0 + cw / 2, y1 - 7);
      // net: a band of mesh between two posts
      var nx0 = x0 - cw * 0.05, nx1 = x1 + cw * 0.05;
      c.strokeStyle = col.mesh; c.lineWidth = 0.8;
      for (var x = nx0; x < nx1; x += 5) { ln(x, mid - 7, x + 5, mid); ln(x + 5, mid - 7, x, mid); }
      c.strokeStyle = col.net; c.lineWidth = w * 1.5; c.lineCap = "round";
      ln(nx0, mid - 7, nx1, mid - 7);
      [nx0, nx1].forEach(function (px) { c.beginPath(); c.arc(px, mid - 4, 3.6, 0, TAU); c.fillStyle = col.post; c.fill(); });
      courtLayer = L.cv;
      sprites.you = racketSprite(col.you, col.youGrip, col.strings, dpr);
      sprites.me = racketSprite(col.me, col.meGrip, col.strings, dpr);
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
    var state = "idle", server = "you", hitter = null, rally = 0, timer = 0, marks = [], trail = [];
    var keyDir = 0;

    function server0() { return score.game % 2 === 1 ? "you" : "me"; }
    function playable() { return visible && !document.hidden; }
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
      if (a >= 3 && b >= 3) return a === b ? "Deuce" : a > b ? "Advantage you" : "Advantage me";
      return "You " + POINTS[Math.min(a, 3)] + ", me " + POINTS[Math.min(b, 3)];
    }
    function refresh() {
      area.querySelector('[data-k="me"]').textContent = score.me;
      area.querySelector('[data-k="you"]').textContent = score.you;
      area.querySelector('[data-k="rally"]').textContent = score.rally;
      nowEl.textContent = "This game: " + gameText();
      foot.textContent = "Game " + score.game + ". " + (server === "you" ? "You serve." : "I serve.") + " Win four points, two clear, to take it.";
    }

    function newPoint() {
      state = "serve";
      hitter = null;
      rally = 0;
      timer = 0;
      ball.bounced = false; ball.z = 0.05; ball.du = ball.dv = 0;
      trail = [];
      if (server === "you") { say("Your serve", false); you.target = you.u = serveSpot("you"); }
      else { say("My serve", true); }
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
        if (a > b) { score.you++; say("Game, you", false); announce("Game to you. Rally length " + rally + "."); }
        else { score.me++; say("Game, " + name, true); announce("Game to me."); }
        score.game++;
        save(score);
        server = server0();
        refresh();
        nowEl.textContent = "Last game: you " + a + " points, me " + b;
        again.hidden = false;
        return;
      }
      save(score);
      var text = call || (winner === "you" ? "Nice shot" : "My point");
      if (a >= 3 && b >= 3) text = a === b ? "Deuce" : a > b ? "Advantage you" : "Advantage me";
      say(text, winner === "me");
      announce((winner === "you" ? "Your point. " : "My point. ") + gameText() + ".");
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
            if (ball.u < 0 || ball.u > 1) { point(hitter === "you" ? "me" : "you", "Out"); return; }
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
      // where the ball landed: a ring that opens and fades
      marks.forEach(function (m) {
        var k = m.t / 0.9;
        ctx.beginPath();
        ctx.ellipse(X(m.u), Y(m.v), 6 * s * (1 + k * 2.2), 2.8 * s * (1 + k * 2.2), 0, 0, TAU);
        ctx.strokeStyle = col.mark; ctx.globalAlpha = 1 - k; ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      drawRacket(sprites.me, me.u, V_ME, true, me.swing);
      var bx = X(ball.u), by = Y(ball.v), lift = ball.z * ch * 0.9, r = 5.6 * s * (1 + ball.z * 1.6);
      if (state !== "over") {
        // shadow on the court
        ctx.beginPath();
        ctx.ellipse(bx + lift * 0.25, by + 2, 6 * s, 3 * s, 0, 0, TAU);
        ctx.fillStyle = col.shadow; ctx.globalAlpha = 1 - Math.min(0.8, ball.z * 4); ctx.fill();
        ctx.globalAlpha = 1;
        // a short trail of light behind the ball
        if ((state === "rally" || state === "point") && !reduce) {
          trail.push({ x: bx, y: by - lift });
          if (trail.length > 16) trail.shift();
        } else trail = [];
        ctx.lineCap = "round";
        for (var i = 1; i < trail.length; i++) {
          var f = i / trail.length;
          ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = col.glow; ctx.globalAlpha = f * 0.55; ctx.lineWidth = r * 1.7 * f;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // the ball, lit from within
        ctx.save();
        ctx.shadowColor = col.glow; ctx.shadowBlur = 14 * s;
        ctx.beginPath(); ctx.arc(bx, by - lift, r, 0, TAU);
        ctx.fillStyle = col.ball; ctx.fill();
        ctx.restore();
        ctx.lineWidth = 1.2; ctx.strokeStyle = col.ballEdge; ctx.stroke();
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

    /* run only while the court is on screen and the tab is visible */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; if (visible) { resize(); wake(); } });
      }, { threshold: 0.2 }).observe(wrap);
    } else visible = true;
    document.addEventListener("visibilitychange", wake);
    document.addEventListener("themechange", function () { if (W) { buildCourt(); draw(); } wake(); });
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
    say(server === "you" ? "Your serve" : "My serve", server === "me");
    refresh();
    resize();
    return {};
  }

  window.PlayMe = { mount: mount };
})();
