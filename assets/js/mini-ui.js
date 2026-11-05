/* ==========================================================================
   Media for the Projects cards: a real screenshot in a window frame
   ({ image, alt, tone }), or one of the small animated interfaces below
   for work that has no public screenshot yet. Animations run only while
   the card is on screen.
   Exposes window.MiniUI = { mount(container, media, item) }.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* A tiny scheduler so every animation can be paused and resumed cleanly. */
  function Timeline() {
    var timers = [];
    return {
      at: function (ms, fn) { timers.push(setTimeout(fn, reduce ? 0 : ms)); },
      clear: function () { timers.forEach(clearTimeout); timers = []; },
    };
  }

  /* ---------------- Co-therapy session ---------------- */
  function session(root) {
    var box = el("div", "mini mini-session");
    var note = "Sleep improved; continue CBT-I and recheck PHQ-9 in 2 weeks.";
    box.innerHTML =
      '<div class="mini-card">' +
      '<div class="mini-head"><span>Session · Co-therapy</span><span class="stamp" data-k="stamp">✓ Approved by clinician</span></div>' +
      row("Client", "J. Rivera, 34") + row("Intake", "Packet complete") + row("PHQ-9", "11 → 8, improving") + row("Cue", "Ask about sleep routine") +
      '<div class="mini-row" data-k="noterow"><span class="k">Note</span><span class="v"><span data-k="note"></span><i class="caret"></i></span></div>' +
      "</div>";
    root.appendChild(box);
    function row(k, v) { return '<div class="mini-row"><span class="k">' + k + '</span><span class="v">' + esc(v) + "</span></div>"; }
    var rows = box.querySelectorAll(".mini-row");
    var noteEl = box.querySelector('[data-k="note"]');
    var stamp = box.querySelector('[data-k="stamp"]');
    var tl = Timeline(), typing = 0;
    function run() {
      tl.clear(); clearInterval(typing);
      rows.forEach(function (r) { r.classList.remove("is-on"); });
      stamp.classList.remove("is-on");
      noteEl.textContent = "";
      rows.forEach(function (r, i) { tl.at(250 + i * 450, function () { r.classList.add("is-on"); }); });
      tl.at(250 + rows.length * 450, function () {
        var i = 0;
        if (reduce) { noteEl.textContent = note; return done(); }
        typing = setInterval(function () {
          i++;
          noteEl.textContent = note.slice(0, i);
          if (i >= note.length) { clearInterval(typing); done(); }
        }, 34);
      });
      function done() {
        tl.at(500, function () { stamp.classList.add("is-on"); });
        tl.at(4200, run);
      }
    }
    return { start: run, stop: function () { tl.clear(); clearInterval(typing); } };
  }

  /* ---------------- BH-ASR leaderboard ---------------- */
  function leaderboard(root) {
    // English consultations (PriMock57), word error rate in %, with each system's
    // rank, from the public leaderboard on the model card (checked Nov 2026).
    var data = [
      [1, "Medera BH-ASR Pro", 11.02, true],
      [2, "Medera BH-ASR Lite", 11.5, true],
      [3, "Qwen3-ASR 0.6B", 11.8],
      [4, "Parakeet-TDT 0.6B v2", 12.32],
      [6, "Whisper large-v3", 13.55],
    ];
    var box = el("div", "mini mini-board");
    var html = '<div class="panel-inner"><div class="lb-head"><span>English consultations · WER</span><span>13 recognizers</span></div>';
    data.forEach(function (d) {
      html += '<div class="lb-row' + (d[3] ? " is-ours" : "") + '"><span class="n">' + d[0] + '</span><span class="name">' + d[1] + '</span><span class="bar"><i data-w="' + (d[2] / 15 * 100).toFixed(1) + '"></i></span><span class="wer">' + d[2].toFixed(2) + "%</span></div>";
    });
    html += "</div>";
    box.innerHTML = html;
    root.appendChild(box);
    var bars = box.querySelectorAll(".bar i");
    var tl = Timeline();
    function run() {
      tl.clear();
      bars.forEach(function (b) { b.style.transition = "none"; b.style.width = "0"; });
      void box.offsetWidth;
      bars.forEach(function (b, i) {
        tl.at(200 + i * 180, function () { b.style.transition = ""; b.style.width = b.getAttribute("data-w") + "%"; });
      });
      tl.at(6500, run);
    }
    return { start: run, stop: tl.clear };
  }

  /* ---------------- Medera Glass: filing into the chart ---------------- */
  function chart(root) {
    var items = [["Progress note", "SOAP"], ["Diagnosis", "F41.1"], ["Procedure", "CPT 90837"], ["Measure", "GAD-7 · 9"], ["Letter", "Referral to PCP"]];
    var box = el("div", "mini mini-chart");
    var html = '<div class="mini-card"><div class="mini-head"><span>Chart · Practice EHR</span><span class="mini-chip" data-k="state" style="color:#8A847A">Syncing</span></div>';
    items.forEach(function (it) {
      html += '<div class="mini-row"><span class="v">' + it[0] + ' <span style="color:#8A847A;font-family:var(--mono);font-size:10px">' + it[1] + '</span></span><span class="tick">waiting</span></div>';
    });
    html += '<div class="foot-line"><span data-k="count">0 of 5 filed</span><span>Audit log on</span></div></div>';
    box.innerHTML = html;
    root.appendChild(box);
    var ticks = box.querySelectorAll(".tick"), state = box.querySelector('[data-k="state"]'), count = box.querySelector('[data-k="count"]');
    var tl = Timeline();
    function run() {
      tl.clear();
      ticks.forEach(function (t) { t.textContent = "waiting"; t.classList.remove("is-done"); });
      state.textContent = "Syncing"; state.style.color = "#8A847A";
      count.textContent = "0 of 5 filed";
      ticks.forEach(function (t, i) {
        tl.at(500 + i * 650, function () { t.textContent = "filed ✓"; t.classList.add("is-done"); count.textContent = (i + 1) + " of 5 filed"; });
      });
      tl.at(500 + ticks.length * 650, function () { state.textContent = "Up to date"; state.style.color = "#2E6B47"; });
      tl.at(500 + ticks.length * 650 + 3200, run);
    }
    return { start: run, stop: tl.clear };
  }

  /* ---------------- BOTIM: calls across a globe ---------------- */
  function globe(root) {
    var box = el("div", "mini mini-globe");
    var cx = 100, cy = 100, R = 72, g = "";
    g += '<circle class="globe-line" cx="100" cy="100" r="72"/>';
    [0.35, 0.7].forEach(function (k) { g += '<ellipse class="globe-line" cx="100" cy="100" rx="' + (R * k) + '" ry="72"/>'; });
    [-0.5, 0, 0.5].forEach(function (k) { var y = cy + k * R, rx = Math.sqrt(R * R - (k * R) * (k * R)); g += '<ellipse class="globe-line" cx="100" cy="' + y + '" rx="' + rx.toFixed(1) + '" ry="' + (rx * 0.18).toFixed(1) + '"/>'; });
    var pts = [[64, 70], [138, 62], [122, 128], [58, 124], [96, 40], [150, 104], [84, 150]];
    var arcs = [[0, 1], [1, 2], [3, 5], [4, 2], [6, 1]];
    arcs.forEach(function (a) {
      var p = pts[a[0]], q = pts[a[1]], mx = (p[0] + q[0]) / 2, my = Math.min(p[1], q[1]) - 34;
      g += '<path class="arc" d="M' + p[0] + " " + p[1] + "Q" + mx + " " + my + " " + q[0] + " " + q[1] + '"/>';
    });
    pts.forEach(function (p) { g += '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; });
    box.innerHTML =
      '<div class="globe-wrap"><svg viewBox="0 0 200 200" aria-hidden="true">' + g + "</svg>" +
      '<div class="stats">' +
      '<div class="stat"><span class="k">Launched</span><span class="v">2017</span></div>' +
      '<div class="stat"><span class="k">Registered users</span><span class="v">90M</span></div>' +
      '<div class="stat"><span class="k">Acquired</span><span class="v">2023</span></div>' +
      '<div class="stat"><span class="k">G42-led round</span><span class="v">$500M</span></div>' +
      "</div></div>";
    root.appendChild(box);
    return { start: function () {}, stop: function () {} };
  }

  /* ---------------- Hallucination guard: model consensus ---------------- */
  function consensus(root) {
    var claims = [
      { text: "Patient reports sleeping 7 hours on most nights.", votes: [1, 1, 1, 1], verdict: ["Supported 4/4", "ok"] },
      { text: "Sertraline was increased to 100 mg today.", votes: [0, 0, 1, 0], verdict: ["Not in transcript · flagged", "flag"] },
    ];
    var models = ["Claude", "GPT", "Grok", "Open"];
    var box = el("div", "mini mini-consensus");
    box.innerHTML =
      '<div><div class="mini-card"><div class="mini-head"><span>Claim check</span><span data-k="idx">1 of 2</span></div>' +
      '<div class="claim" data-k="claim"></div><div class="votes">' +
      models.map(function (m) { return '<div class="vote"><b>·</b>' + m + "</div>"; }).join("") +
      '</div><div class="verdict"><span>Consensus</span><b data-k="verdict">checking…</b></div></div>' +
      '<p class="foot-note">checked against the session transcript</p></div>';
    root.appendChild(box);
    var claimEl = box.querySelector('[data-k="claim"]'), idx = box.querySelector('[data-k="idx"]'), verdict = box.querySelector('[data-k="verdict"]');
    var votes = box.querySelectorAll(".vote");
    var tl = Timeline(), n = 0;
    function show(i) {
      var c = claims[i];
      claimEl.textContent = "“" + c.text + "”";
      idx.textContent = (i + 1) + " of " + claims.length;
      verdict.textContent = "checking…"; verdict.className = "";
      votes.forEach(function (v) { v.className = "vote"; v.querySelector("b").textContent = "·"; });
      votes.forEach(function (v, k) {
        tl.at(500 + k * 420, function () {
          var yes = c.votes[k] === 1;
          v.className = "vote is-on " + (yes ? "yes" : "no");
          v.querySelector("b").textContent = yes ? "✓" : "✗";
        });
      });
      tl.at(500 + votes.length * 420 + 200, function () { verdict.textContent = c.verdict[0]; verdict.className = c.verdict[1]; });
      tl.at(500 + votes.length * 420 + 3000, function () { n = (n + 1) % claims.length; show(n); });
    }
    return { start: function () { tl.clear(); show(n); }, stop: tl.clear };
  }

  /* ---------------- A real screenshot in a window frame ---------------- */
  function framed(root, media) {
    var tone = /^[a-z]+$/.test(media.tone || "") ? " tone-" + media.tone : "";
    var box = el("div", "mini mini-frame" + tone);
    box.innerHTML = '<div class="window"><div class="window-bar"><i></i><i></i><i></i></div><img src="' + esc(media.image) + '" alt="' + esc(media.alt || "") + '" loading="lazy" decoding="async"></div>';
    root.appendChild(box);
    return { start: function () {}, stop: function () {} };
  }

  /* ---------------- Topological deep learning: a turning cell complex ---------------- */
  function complex(root) {
    var box = el("div", "mini mini-complex");
    box.innerHTML = '<canvas aria-hidden="true"></canvas><div class="complex-key"><span><i class="k-cell"></i>2-cells</span><span><i class="k-edge"></i>edges</span><span><i class="k-node"></i>nodes</span></div>';
    root.appendChild(box);
    var P = window.Particles;
    if (P && P.shapes && P.shapes.complex) {
      var pts = P.makeShape("complex", 5600, 77);
      P.Cloud(box.querySelector("canvas"), pts, { dot: 1.2, swing: 0.75, yaw: 0.35, pitch: 0.42, scale: 0.98, ink: [226, 232, 244], accent: [240, 150, 112] });
    }
    return { start: function () {}, stop: function () {} };
  }

  /* ---------------- Marsad: a stance network in its own console style ---------------- */
  function network(root) {
    var r = (function (seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; })(4242);
    var groups = [["pro", 74, 78, 7], ["con", 226, 76, 7], ["neutral", 150, 124, 6]];
    var nodes = [], edges = [];
    groups.forEach(function (g) {
      for (var i = 0; i < g[3]; i++) {
        var a = (i / g[3]) * Math.PI * 2 + r() * 0.6, d = i === 0 ? 0 : 20 + r() * 26;
        nodes.push({ x: g[1] + Math.cos(a) * d * 1.25, y: g[2] + Math.sin(a) * d * 0.8, s: g[0], hub: i === 0, r: i === 0 ? 7 : 3.5 + r() * 2.5 });
      }
    });
    nodes.forEach(function (n, i) {
      nodes.forEach(function (m, j) {
        if (j <= i) return;
        var d = Math.hypot(n.x - m.x, n.y - m.y);
        if ((n.s === m.s && d < 52) || (n.hub && m.hub) || (d < 70 && r() < 0.12)) edges.push([i, j]);
      });
    });
    var svg = '<svg viewBox="0 0 300 160" aria-hidden="true">';
    edges.forEach(function (e, k) {
      var a = nodes[e[0]], b = nodes[e[1]];
      svg += '<line class="nb-edge" data-a="' + e[0] + '" data-b="' + e[1] + '" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>';
    });
    nodes.forEach(function (n, i) {
      svg += '<circle class="nb-node ' + n.s + '" data-i="' + i + '" cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="' + n.r.toFixed(1) + '"/>';
    });
    svg += "</svg>";
    var box = el("div", "mini mini-network");
    box.innerHTML =
      '<div class="nb-console">' +
      '<div class="nb-head"><b>Marsad</b><span class="nb-ar" lang="ar">مرصد</span><span class="nb-chip">Topic network</span></div>' +
      svg +
      '<div class="nb-foot"><span class="nb-key pro">pro</span><span class="nb-key con">con</span><span class="nb-key neutral">neutral</span><span class="nb-lang">EN · <span lang="ar">ع</span></span></div>' +
      "</div>";
    root.appendChild(box);
    var hubs = [];
    nodes.forEach(function (n, i) { if (n.hub) hubs.push(i); });
    var circles = box.querySelectorAll(".nb-node"), lines = box.querySelectorAll(".nb-edge");
    var tl = Timeline(), k = 0;
    function focus(i) {
      circles.forEach(function (c) { c.classList.toggle("is-focus", +c.getAttribute("data-i") === i); });
      lines.forEach(function (l) {
        var on = +l.getAttribute("data-a") === i || +l.getAttribute("data-b") === i;
        l.classList.toggle("is-on", on);
      });
    }
    function run() {
      tl.clear();
      focus(hubs[k % hubs.length]);
      k++;
      tl.at(2400, run);
    }
    return { start: run, stop: tl.clear };
  }

  var kinds = { session: session, leaderboard: leaderboard, chart: chart, globe: globe, consensus: consensus, complex: complex, network: network };

  function mount(container, media) {
    var ctl;
    if (media && typeof media === "object" && media.image) ctl = framed(container, media);
    else if (kinds[media]) ctl = kinds[media](container);
    else return null;
    var running = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; ctl.start(); }
          else if (!e.isIntersecting && running) { running = false; ctl.stop(); }
        });
      }, { threshold: 0.25 }).observe(container);
    } else ctl.start();
    return ctl;
  }

  window.MiniUI = { mount: mount };
})();
