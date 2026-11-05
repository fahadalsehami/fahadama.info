/* ==========================================================================
   Builds the page from content/site.js and runs everything that moves:
   tabs, starlight, theme, the portrait, particles and the contact list.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE || {};
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var P = window.Particles;

  /* ---------------- helpers ---------------- */
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  /* Typographic apostrophes and quotes: I'm -> I’m, "word" -> “word”. */
  function typo(s) {
    return String(s == null ? "" : s)
      .replace(/(\w)'(\w)/g, "$1\u2019$2")
      .replace(/(^|[\s(\[])'/g, "$1\u2018").replace(/'/g, "\u2019")
      .replace(/(^|[\s(\[])"/g, "$1\u201C").replace(/"/g, "\u201D");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function text(s) { return esc(typo(s)); }
  function safeUrl(u) {
    u = String(u || "").trim();
    return /^(https?:|mailto:|tel:|#|\/|\.{0,2}\/|[\w-]+\.html)/i.test(u) || !/^[a-z][\w+.-]*:/i.test(u) ? u : "";
  }
  function isExternal(u) { return /^https?:/i.test(u); }
  function linkAttrs(u) {
    return 'href="' + esc(safeUrl(u)) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener"' : "");
  }
  /* Inline markdown: **bold**, *italic*, [text](url). */
  function md(s) {
    var links = [];
    var src = String(s == null ? "" : s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
      links.push(u);
      return "[" + t + "](\u0000" + (links.length - 1) + "\u0000)";
    });
    var out = text(src);
    out = out.replace(/\[([^\]]+)\]\(\u0000(\d+)\u0000\)/g, function (_, t, i) {
      return "<a " + linkAttrs(links[+i]) + ">" + t + "</a>";
    });
    return out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  }
  function make(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function list(v) { return Array.isArray(v) ? v : []; }

  var status = $(".sr-status");
  function announce(msg) {
    if (!status) return;
    status.textContent = "";
    setTimeout(function () { status.textContent = msg; }, 60);
  }

  var fontsReady = (function () {
    var p = null;
    return function () {
      if (p) return p;
      if (document.fonts && document.fonts.load) {
        p = Promise.race([
          Promise.all([document.fonts.load('400 48px "Newsreader"'), document.fonts.load('400 16px "Geist Mono"')]),
          new Promise(function (r) { setTimeout(r, 2500); }),
        ]).catch(function () {});
      } else p = Promise.resolve();
      return p;
    };
  })();

  /* ---------------- text bindings ---------------- */
  var person = S.person || {};
  var hero = S.hero || {};
  var contact = S.contact || {};
  function bind(name, value) {
    if (value == null) return;
    $$('[data-bind="' + name + '"]').forEach(function (el) { el.textContent = typo(value); });
  }
  bind("greeting", hero.greeting);
  bind("intro", hero.intro);
  bind("contactTitle", contact.title);
  bind("contactNote", contact.note);
  bind("name", person.name);
  bind("location", person.location);
  if (S.meta && S.meta.title) document.title = S.meta.title;
  if (S.meta && S.meta.description) {
    var md1 = $('meta[name="description"]');
    if (md1) md1.setAttribute("content", S.meta.description);
  }

  /* ---------------- theme and starlight ---------------- */
  var main = $("#main"), foot = $(".foot");
  var star = $(".control-star"), themeBtn = $(".control-theme"), controls = $(".controls");
  var portraitBtn = $(".portrait"), portraitImg = $(".portrait-img"), portraitCanvas = $(".portrait-particles");
  var pool = $(".light-pool"), sky = $(".starfield");
  var metaTheme = $('meta[name="theme-color"]');

  function mode() { return root.getAttribute("data-mode") === "starlight" ? "starlight" : "lit"; }
  function theme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }

  function paintChrome() {
    var c = mode() === "starlight" ? "#050508" : theme() === "dark" ? "#181714" : "#EEEAE0";
    if (metaTheme) metaTheme.setAttribute("content", c);
    var who = person.name || "the author";
    if (mode() === "starlight") {
      star.setAttribute("aria-label", "Turn the lights on and show the site");
      star.setAttribute("title", "Turn the lights on");
      portraitBtn.setAttribute("aria-label", "Portrait of " + who + ". Turn the lights on.");
    } else {
      star.setAttribute("aria-label", "Back to starlight");
      star.setAttribute("title", "Starlight");
      portraitBtn.setAttribute("aria-label", "Portrait of " + who + ". Switch to " + (theme() === "dark" ? "light" : "dark") + " theme.");
    }
    themeBtn.setAttribute("aria-label", theme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
    themeBtn.setAttribute("title", theme() === "dark" ? "Light theme" : "Dark theme");
    themeBtn.disabled = mode() === "starlight";
  }
  function changed() {
    paintChrome();
    var ev;
    try { ev = new CustomEvent("site:theme"); } catch (e) { ev = document.createEvent("Event"); ev.initEvent("site:theme", false, false); }
    document.dispatchEvent(ev);
  }

  function setTheme(t, remember) {
    root.setAttribute("data-theme", t);
    if (remember) { try { localStorage.setItem("theme", t); } catch (e) {} }
    changed();
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (er) {}
      if (saved !== "light" && saved !== "dark") setTheme(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", follow); else if (mq.addListener) mq.addListener(follow);
  }

  /* Grain: a small noise tile used as a mask, so text in starlight looks made of stardust. */
  (function grain() {
    try {
      var n = 180, c = document.createElement("canvas");
      c.width = c.height = n;
      var x = c.getContext("2d"), img = x.createImageData(n, n), d = img.data, seed = 1234567;
      for (var i = 0; i < n * n; i++) {
        seed = (seed * 16807) % 2147483647;
        var v = seed / 2147483647, a;
        if (v < 0.52) a = 255;
        else if (v < 0.8) a = 150 + ((v - 0.52) / 0.28) * 90;
        else a = ((v - 0.8) / 0.2) * 120;
        d[i * 4 + 3] = a | 0;
      }
      x.putImageData(img, 0, 0);
      root.style.setProperty("--grain", "url(" + c.toDataURL("image/png") + ")");
    } catch (e) {}
  })();

  /* Starlight portrait: the cut-out photo rebuilt from coloured particles. */
  var portraitPts = null, portraitField = null;
  function portraitParticles(on) {
    if (!on) {
      if (portraitField) { portraitField.destroy(); portraitField = null; }
      return;
    }
    if (portraitField || !P || !portraitCanvas) return;
    var go = function () {
      if (portraitField || mode() !== "starlight") return;
      if (!portraitPts) {
        try {
          var n = 220, c = document.createElement("canvas");
          c.width = c.height = n;
          var x = c.getContext("2d");
          x.beginPath(); x.arc(n / 2, n / 2, n / 2, 0, Math.PI * 2); x.clip();
          x.drawImage(portraitImg, n * 0.04, n * 0.01, n * 0.92, n * 1.02);
          portraitPts = P.sampleImage(c, n, n, 5200, 21);
        } catch (e) { portraitPts = []; }
      }
      if (!portraitPts.length) { root.classList.add("portrait-plain"); return; }
      portraitField = P.Field(portraitCanvas, portraitPts, {
        keepColor: true, brighten: 1.18, lift: 78, dot: 1.4, drift: 0.3, turn: 0.12, depth: 10, pad: 8, twinkle: true, converge: true, convergeMs: 1700,
      });
    };
    if (portraitImg.complete && portraitImg.naturalWidth) go();
    else portraitImg.addEventListener("load", go, { once: true });
  }

  var hintTimer = 0, skyTimer = 0;
  function setMode(next, quiet) {
    root.setAttribute("data-mode", next);
    try { sessionStorage.setItem("lights", next === "lit" ? "on" : "off"); } catch (e) {}
    var night = next === "starlight";
    [main, foot].forEach(function (el) { if (night) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
    clearTimeout(skyTimer);
    if (night) {
      if (window.Starfield) window.Starfield.start(sky);
      portraitParticles(true);
      controls.classList.remove("is-hinting");
    } else {
      skyTimer = setTimeout(function () { if (mode() === "lit" && window.Starfield) window.Starfield.stop(); }, 1000);
      portraitParticles(false);
      pool.classList.remove("is-on");
      if (!quiet) {
        controls.classList.add("is-hinting");
        clearTimeout(hintTimer);
        hintTimer = setTimeout(function () { controls.classList.remove("is-hinting"); }, 3600);
      }
    }
    changed();
    if (!quiet) announce(night ? "Starlight. Turn the lights on to use the site." : "Lights on.");
  }

  star.addEventListener("click", function () { setMode(mode() === "starlight" ? "lit" : "starlight"); });
  themeBtn.addEventListener("click", function () { if (mode() === "lit") setTheme(theme() === "dark" ? "light" : "dark", true); });
  portraitBtn.addEventListener("click", function () {
    if (mode() === "starlight") setMode("lit");
    else setTheme(theme() === "dark" ? "light" : "dark", true);
  });

  /* A pool of light wherever you click in starlight. */
  document.addEventListener("click", function (e) {
    if (mode() !== "starlight" || e.target.closest(".controls, .portrait, .skip-link")) return;
    pool.style.setProperty("--lx", e.clientX + "px");
    pool.style.setProperty("--ly", e.clientY + "px");
    pool.classList.add("is-on");
  });
  window.addEventListener("scroll", function () { if (pool.classList.contains("is-on") && mode() === "starlight") pool.classList.remove("is-on"); }, { passive: true });

  /* Portrait follows the pointer: nine photos if you add them, a gentle tilt otherwise. */
  (function lookAround() {
    var poses = (person.portrait && person.portrait.poses) || {};
    var keys = Object.keys(poses).filter(function (k) { return poses[k]; });
    var base = portraitImg.getAttribute("src");
    if (person.portrait && person.portrait.src) { portraitImg.setAttribute("src", person.portrait.src); base = person.portrait.src; }
    keys.forEach(function (k) { var im = new Image(); im.src = poses[k]; });
    if (!finePointer || reduce) return;
    var raf = 0, px = 0, py = 0, current = "center";
    function apply() {
      raf = 0;
      if (mode() !== "lit") return;
      var r = portraitBtn.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = px - cx, dy = py - cy, dist = Math.sqrt(dx * dx + dy * dy);
      if (keys.length) {
        var key = "center";
        if (dist > 70) {
          var h = dx > Math.abs(dy) * 0.45 ? "Right" : dx < -Math.abs(dy) * 0.45 ? "Left" : "";
          var v = dy < -Math.abs(dx) * 0.45 ? "up" : dy > Math.abs(dx) * 0.45 ? "down" : "";
          key = v ? v + h : (h ? h.toLowerCase() : "center");
        }
        if (key !== current) {
          current = key;
          portraitImg.setAttribute("src", poses[key] || poses.center || base);
        }
        return;
      }
      var k = Math.min(1, dist / 600), nx = dist ? dx / dist : 0, ny = dist ? dy / dist : 0;
      portraitImg.style.setProperty("--turn-y", (nx * k * 13).toFixed(2) + "deg");
      portraitImg.style.setProperty("--turn-x", (-ny * k * 9).toFixed(2) + "deg");
      portraitImg.style.setProperty("--shift-x", (nx * k * 4).toFixed(2) + "px");
      portraitImg.style.setProperty("--shift-y", (ny * k * 3).toFixed(2) + "px");
    }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  })();

  /* ---------------- sections ---------------- */
  var about = S.about || {};
  var projects = S.projects || {};
  var books = S.books || {};
  var interests = S.interests || {};
  var play = S.play || {};

  function panelHead(title, note, cls) {
    var head = make("div", "panel-head" + (cls ? " " + cls : ""));
    if (title) head.appendChild(make("h2", "panel-title", text(title)));
    if (note) head.appendChild(make("p", "panel-note", md(note)));
    return head;
  }

  function buildAbout(panel) {
    if (about.lead || about.statement) {
      var h = make("h2", "statement");
      if (about.lead) h.appendChild(make("span", "", text(about.lead)));
      if (about.statement) h.appendChild(make("span", "", text(about.statement)));
      panel.appendChild(h);
    }
    var grid = make("div", "about-grid");
    var copy = make("div", "about-copy");
    list(about.paragraphs).forEach(function (p) { copy.appendChild(make("p", "", md(p))); });
    grid.appendChild(copy);
    var col = make("div", "facts-col");
    var facts = list(about.facts);
    if (facts.length) {
      var dl = make("dl", "facts");
      facts.forEach(function (f) {
        var row = make("div", "fact");
        row.appendChild(make("dt", "", text(f.label)));
        row.appendChild(make("dd", "", md(f.value)));
        dl.appendChild(row);
      });
      col.appendChild(dl);
    }
    if (about.emblem && P) {
      var cv = make("canvas", "emblem");
      cv.setAttribute("aria-hidden", "true");
      col.appendChild(cv);
      fontsReady().then(function () {
        var fig = P.figures[about.emblem.kind] || P.figures.laurel;
        var pts = P.sampleDrawing(fig, 300, 300, 4200, P.hash("emblem" + (about.emblem.label || "")), about.emblem.label);
        var f = P.Field(cv, pts, { dot: 1.0, turn: 0.28, depth: 12, drift: 0.3, pad: 2 });
        cv.addEventListener("pointerenter", function () { f.setHover(true); });
        cv.addEventListener("pointerleave", function () { f.setHover(false); });
      });
    }
    grid.appendChild(col);
    panel.appendChild(grid);
  }

  function buildExperience(panel) {
    var ol = make("ol", "roles");
    list(S.experience).forEach(function (r) {
      var li = make("li", "role");
      var when = make("div", "role-when");
      if (r.logo && r.logo.src) {
        var img = make("img", "role-logo");
        img.src = r.logo.src;
        img.alt = r.logo.alt || "";
        img.width = 40; img.height = 40;
        img.loading = "lazy"; img.decoding = "async";
        when.appendChild(img);
      }
      when.appendChild(make("p", "role-dates", text(r.dates)));
      li.appendChild(when);
      var mid = make("div", "role-main");
      mid.appendChild(make("h3", "role-title", text(r.title)));
      var org = r.org ? (r.orgUrl ? "<a " + linkAttrs(r.orgUrl) + ">" + text(r.org) + "</a>" : text(r.org)) : "";
      var where = [org, text(r.place || "")].filter(Boolean).join(" · ");
      if (where) mid.appendChild(make("p", "role-org", where));
      li.appendChild(mid);
      li.appendChild(make("p", "role-detail", md(r.detail)));
      ol.appendChild(li);
    });
    panel.appendChild(ol);
  }

  function buildProjects(panel) {
    panel.appendChild(panelHead(projects.title, projects.note));
    var ul = make("ul", "work-grid");
    list(projects.items).forEach(function (p) {
      var li = make("li", "work");
      if (p.id) li.id = "project-" + p.id;
      var url = safeUrl(p.url);
      var media = make(url ? "a" : "div", "work-media");
      if (url) {
        media.setAttribute("href", url);
        if (isExternal(url)) { media.setAttribute("target", "_blank"); media.setAttribute("rel", "noopener"); }
        media.setAttribute("tabindex", "-1");
      }
      media.setAttribute("aria-hidden", "true");
      li.appendChild(media);
      if (window.MiniUI && p.media) window.MiniUI.mount(media, p.media, p);
      if (p.eyebrow) li.appendChild(make("p", "work-eyebrow", text(p.eyebrow)));
      var title = url ? "<a " + linkAttrs(url) + ">" + text(p.title) + (isExternal(url) ? '<span class="visually-hidden"> (opens in a new tab)</span>' : "") + "</a>" : text(p.title);
      li.appendChild(make("h3", "work-title", title));
      if (p.detail) li.appendChild(make("p", "work-detail", md(p.detail)));
      if (list(p.tags).length) li.appendChild(make("p", "work-tags", list(p.tags).map(esc).join(" · ")));
      ul.appendChild(li);
    });
    panel.appendChild(ul);
  }

  function buildBooks(panel) {
    if (books.title) panel.appendChild(make("h2", "shelf-title", text(books.title)));
    if (books.hint) panel.appendChild(make("p", "shelf-hint", text(books.hint)));
    if (window.Bookshelf) window.Bookshelf.mount(panel, list(books.items));
  }

  /* Interests: a grid of 3D particle figures; each opens into a larger view. */
  function figure(canvas, it, count, large) {
    var seed = P.hash((large ? "big" : "") + (it.id || it.label));
    if (P.makeShape && P.shapes[it.figure]) {
      var pts = P.makeShape(it.figure, count, seed);
      return P.Cloud(canvas, pts, large
        ? { dot: 1.3, swing: 0.55, converge: true, convergeMs: 1400 }
        : { dot: 1.05 });
    }
    var fig = P.figures[it.figure] || P.figures.network;
    return P.Field(canvas, P.sampleDrawing(fig, 400, 300, count, seed), { dot: large ? 1.4 : 1.1, turn: 0.4, depth: 22, drift: 0.5, pad: 4, converge: large });
  }
  var interestApi = null;
  function buildInterests(panel) {
    var items = list(interests.items);
    panel.appendChild(panelHead(interests.title, interests.note));
    panel.appendChild(make("hr", "interests-rule"));
    var body = make("div", "interests-body");
    var grid = make("ul", "interests-grid");
    grid.style.maxWidth = (items.length <= 4 ? 2 : items.length <= 6 ? 3 : 4) * 192 + "px";
    var detail = make("div", "interest-detail");
    detail.hidden = true;
    body.appendChild(grid);
    body.appendChild(detail);
    panel.appendChild(body);
    panel.appendChild(make("hr", "interests-end"));

    var buttons = [];
    items.forEach(function (it, i) {
      var li = make("li");
      var b = make("button", "interest");
      b.type = "button";
      b.setAttribute("aria-label", it.label);
      b.innerHTML = '<canvas aria-hidden="true"></canvas><span class="interest-label" aria-hidden="true">' + text(it.label) + "</span>";
      li.appendChild(b);
      grid.appendChild(li);
      buttons.push(b);
      if (P) {
        var f = figure(b.querySelector("canvas"), it, 2700, false);
        b.addEventListener("pointerenter", function () { f.setHover(true); });
        b.addEventListener("pointerleave", function () { f.setHover(false); });
        b.addEventListener("focus", function () { f.setHover(true); });
        b.addEventListener("blur", function () { f.setHover(false); });
      }
      b.addEventListener("click", function () { open(i, true); });
    });

    var big = null, current = -1;
    function open(i, user) {
      var it = items[i];
      if (!it) return;
      current = i;
      if (big) { big.destroy(); big = null; }
      var photos = list(it.photos).map(function (ph, k) {
        var tilt = [-4, 3, -2, 5][k % 4];
        return '<figure class="polaroid" style="--tilt:' + tilt + 'deg"><img src="' + esc(ph.src) + '" alt="' + esc(ph.alt || ph.caption || "") + '" loading="lazy" decoding="async">' + (ph.caption ? "<figcaption>" + text(ph.caption) + "</figcaption>" : "") + "</figure>";
      }).join("");
      detail.innerHTML =
        '<button type="button" class="interest-close" aria-label="Close ' + esc(it.label) + '"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg></button>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<div class="interest-copy"><h3 tabindex="-1">' + text(it.label) + "</h3>" + (it.text ? "<p>" + md(it.text) + "</p>" : "") +
        (it.project && projectTitle(it.project) ? '<a class="interest-link" href="#projects/' + esc(it.project) + '">' + text(projectTitle(it.project)) + ' in Projects <span aria-hidden="true">→</span></a>' : "") +
        (photos ? '<div class="polaroids">' + photos + "</div>" : "") +
        (items.length > 1 ? '<div class="interest-nav"><button type="button" data-step="-1">← ' + text(items[(i - 1 + items.length) % items.length].label) + '</button><button type="button" data-step="1">' + text(items[(i + 1) % items.length].label) + " →</button></div>" : "") +
        "</div>";
      grid.hidden = true;
      detail.hidden = false;
      if (P) big = figure($("canvas", detail), it, 7000, true);
      $(".interest-close", detail).addEventListener("click", function () { close(true); });
      $$(".interest-nav button", detail).forEach(function (nb) {
        nb.addEventListener("click", function () {
          var step = Number(nb.getAttribute("data-step"));
          open((current + step + items.length) % items.length, true);
          var again = $('.interest-nav button[data-step="' + step + '"]', detail);
          if (again) again.focus({ preventScroll: true });
        });
      });
      if (user) {
        setHash("interests/" + (it.id || i));
        if (!document.activeElement || !detail.contains(document.activeElement)) $("h3", detail).focus({ preventScroll: true });
        var top = panel.getBoundingClientRect().top;
        if (top < 0) window.scrollBy({ top: top - 20, behavior: reduce ? "auto" : "smooth" });
      }
    }
    function close(user) {
      if (current < 0) return;
      if (big) { big.destroy(); big = null; }
      detail.hidden = true;
      detail.innerHTML = "";
      grid.hidden = false;
      var was = current;
      current = -1;
      if (user) {
        setHash("interests");
        if (buttons[was]) buttons[was].focus({ preventScroll: true });
      }
    }
    detail.addEventListener("keydown", function (e) { if (e.key === "Escape") close(true); });

    interestApi = {
      show: function (id) {
        var i = -1;
        items.forEach(function (it, k) { if ((it.id || String(k)) === id) i = k; });
        if (i >= 0) open(i, false); else close(false);
      },
      close: function () { close(false); },
    };
  }

  function buildPlay(panel) {
    panel.appendChild(panelHead(play.title || "Play Me", play.note));
    if (window.PlayMe) window.PlayMe.mount(panel, { name: person.firstName || "me", announce: announce });
  }

  function projectTitle(id) {
    var hit = list(projects.items).filter(function (p) { return p.id === id; })[0];
    return hit ? hit.title : "";
  }
  function showProject(id, smooth) {
    var card = document.getElementById("project-" + id);
    if (!card) return;
    requestAnimationFrame(function () {
      var top = card.getBoundingClientRect().top + window.pageYOffset - 24;
      window.scrollTo({ top: top, behavior: smooth && !reduce ? "smooth" : "auto" });
      card.classList.remove("is-flash"); void card.offsetWidth; card.classList.add("is-flash");
      var link = card.querySelector(".work-title a");
      if (link) link.focus({ preventScroll: true });
    });
  }

  var SECTIONS = [
    { id: "about", label: "About", build: buildAbout, on: !!(about.statement || list(about.paragraphs).length) },
    { id: "experience", label: "Experience", build: buildExperience, on: list(S.experience).length > 0 },
    { id: "projects", label: "Projects", build: buildProjects, on: list(projects.items).length > 0 },
    { id: "bookshelf", label: "Bookshelf", build: buildBooks, on: list(books.items).length > 0 },
    { id: "interests", label: "Interests", build: buildInterests, on: list(interests.items).length > 0 },
    { id: "play", label: play.title || "Play Me", build: buildPlay, on: play !== false && play.show !== false },
  ].filter(function (s) { return s.on; });

  var tabsEl = $('[data-slot="tabs"]'), panelsEl = $('[data-slot="panels"]');
  var tabs = {}, panels = {}, built = {}, active = null;

  SECTIONS.forEach(function (s, i) {
    var t = make("button", "tab", text(s.label));
    t.type = "button";
    t.id = "tab-" + s.id;
    t.setAttribute("role", "tab");
    t.setAttribute("aria-controls", "panel-" + s.id);
    t.setAttribute("aria-selected", "false");
    t.tabIndex = -1;
    t.addEventListener("click", function () { select(s.id, { user: true }); });
    t.addEventListener("keydown", function (e) {
      var j = null;
      if (e.key === "ArrowRight") j = (i + 1) % SECTIONS.length;
      else if (e.key === "ArrowLeft") j = (i - 1 + SECTIONS.length) % SECTIONS.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = SECTIONS.length - 1;
      if (j != null) { e.preventDefault(); select(SECTIONS[j].id, { user: true }); tabs[SECTIONS[j].id].focus(); }
    });
    tabsEl.appendChild(t);
    tabs[s.id] = t;
    var p = make("section", "panel panel-" + s.id);
    p.id = "panel-" + s.id;
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", "tab-" + s.id);
    p.tabIndex = 0;
    p.hidden = true;
    panelsEl.appendChild(p);
    panels[s.id] = p;
  });

  function setHash(h) {
    try { history.replaceState(null, "", "#" + h); } catch (e) { location.hash = h; }
  }

  function select(id, opts) {
    opts = opts || {};
    if (!tabs[id]) id = SECTIONS[0] && SECTIONS[0].id;
    if (!id) return;
    var s = SECTIONS.filter(function (x) { return x.id === id; })[0];
    if (!built[id]) { built[id] = true; s.build(panels[id]); }
    if (active !== id) {
      SECTIONS.forEach(function (x) {
        var on = x.id === id;
        tabs[x.id].setAttribute("aria-selected", on ? "true" : "false");
        tabs[x.id].tabIndex = on ? 0 : -1;
        panels[x.id].hidden = !on;
      });
      active = id;
    }
    if (opts.user) {
      setHash(id);
      if (id === "interests" && interestApi) interestApi.close();
      // keep the start of the newly opened section in view
      var t = tabsEl.getBoundingClientRect();
      if (t.top < -2) window.scrollTo({ top: window.pageYOffset + t.top - 12, behavior: reduce ? "auto" : "smooth" });
    }
  }

  function route(fromLoad) {
    var h = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    var parts = h.split("/");
    var id = parts[0];
    if (!tabs[id]) { if (fromLoad) select(SECTIONS[0] && SECTIONS[0].id); return false; }
    select(id);
    if (id === "interests" && interestApi) {
      if (parts[1]) interestApi.show(parts[1]); else interestApi.close();
    }
    if (id === "projects" && parts[1]) showProject(parts[1], !fromLoad);
    return true;
  }
  var deepLinked = route(true);
  window.addEventListener("hashchange", function () { route(false); });
  if (deepLinked && !/^#projects\/./.test(location.hash)) {
    requestAnimationFrame(function () {
      var t = tabsEl.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, window.pageYOffset + t.top - 24));
    });
  }

  /* ---------------- contact ---------------- */
  (function buildContact() {
    var ul = $('[data-slot="contact"]');
    var items = list(contact.items);
    if (!items.length) { ul.hidden = true; return; }
    items.forEach(function (c, i) {
      var li = make("li", "contact-item" + (i === 0 ? " is-primary" : ""));
      var label = make("p", "contact-label", "<span>" + text(c.label) + "</span>");
      if (c.copy) {
        var b = make("button", "copy-btn", '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><path d="M8.5 2.6V2a.9.9 0 0 0-.9-.9H2a.9.9 0 0 0-.9.9v5.6c0 .5.4.9.9.9h.6"/></svg><span class="idle">Copy</span><span class="done">Copied</span>');
        b.type = "button";
        b.setAttribute("aria-label", "Copy " + c.label.toLowerCase());
        b.addEventListener("click", function () {
          var text = c.value || "";
          var ok = function () {
            b.classList.add("is-copied");
            announce("Copied " + text);
            setTimeout(function () { b.classList.remove("is-copied"); }, 1800);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
          else fallback();
          function fallback() {
            var ta = document.createElement("textarea");
            ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); ok(); } catch (e) {}
            document.body.removeChild(ta);
          }
        });
        label.appendChild(b);
      }
      li.appendChild(label);
      var url = safeUrl(c.url);
      var arrow = url && !/^(mailto|tel):/i.test(url) ? ' <span class="arrow" aria-hidden="true">↗</span>' : "";
      var v = url ? make("a", "contact-value", esc(c.value) + arrow) : make("span", "contact-value", esc(c.value));
      if (url) {
        v.setAttribute("href", url);
        if (isExternal(url)) { v.setAttribute("target", "_blank"); v.setAttribute("rel", "noopener"); }
      }
      li.appendChild(v);
      ul.appendChild(li);
    });
  })();

  /* "Say hello" drawn in particles. */
  (function hello() {
    var cv = $(".hello-canvas");
    if (!cv || !P) return;
    fontsReady().then(function () {
      var text = contact.title || "Say hello";
      var w = 380, h = 144;
      var pts = P.sampleDrawing(function (c) {
        var size = 100;
        c.font = "400 " + size + 'px "Newsreader", Georgia, serif';
        var m = c.measureText(text).width;
        if (m > w - 12) { size = Math.floor(size * (w - 12) / m); c.font = "400 " + size + 'px "Newsreader", Georgia, serif'; }
        c.fillStyle = "#000";
        c.textBaseline = "alphabetic";
        c.fillText(text, 6, h * 0.72);
      }, w, h, 2800, P.hash(text));
      var f = P.Field(cv, pts, { dot: 1.05, drift: 0.3, turn: 0, pad: 0 });
      var head = cv.parentNode.parentNode;
      head.addEventListener("pointerenter", function () { f.setHover(true); });
      head.addEventListener("pointerleave", function () { f.setHover(false); });
    });
  })();

  /* ---------------- footer ---------------- */
  var topLink = $(".foot-top");
  if (topLink) topLink.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    var g = $("#greeting");
    if (g) { g.setAttribute("tabindex", "-1"); g.focus({ preventScroll: true }); }
  });

  /* ---------------- structured data ---------------- */
  (function jsonld() {
    var now = list(S.experience)[0] || {};
    var data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: person.name,
      description: S.meta && S.meta.description,
      jobTitle: now.title,
      worksFor: now.org ? { "@type": "Organization", name: now.org, url: now.orgUrl || undefined } : undefined,
      homeLocation: person.location ? { "@type": "Place", name: person.location } : undefined,
      url: (S.meta && S.meta.url) || undefined,
      sameAs: list(contact.items).map(function (c) { return c.url; }).filter(isExternal),
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  })();

  /* ---------------- start ---------------- */
  setMode(mode(), true);
})();
