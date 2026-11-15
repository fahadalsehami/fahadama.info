/* ==========================================================================
   Builds the page from content/site.js and runs what moves: the hero
   signals, the thread down the page, the nav, the theme, deep links, and
   the Bookshelf and Play Me sections when they come near.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE || {};
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- helpers ---------------- */
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  /* Typographic apostrophes and quotes: I'm -> I’m, "word" -> “word”. */
  function typo(s) {
    return String(s == null ? "" : s)
      .replace(/(\w)'(\w)/g, "$1’$2")
      .replace(/(^|[\s(\[])'/g, "$1‘").replace(/'/g, "’")
      .replace(/(^|[\s(\[])"/g, "$1“").replace(/"/g, "”");
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
  var OUT = '<svg class="out" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"/></svg>';
  var NEWTAB = '<span class="sr-only"> (opens in a new tab)</span>';
  /* Link text with the outward arrow tied to its last word, so the arrow never wraps alone. */
  function outText(s) {
    return text(s).replace(/(\S+)$/, '<span class="nobr">$1' + OUT + "</span>");
  }

  var status = $(".sr-status");
  function announce(msg) {
    if (!status) return;
    status.textContent = "";
    setTimeout(function () { status.textContent = msg; }, 60);
  }

  var person = S.person || {};
  var hero = S.hero || {};
  var about = S.about || {};
  var projects = S.projects || {};
  var talks = S.talks || {};
  var books = S.books || {};
  var interests = S.interests || {};
  var play = S.play || {};
  var contact = S.contact || {};

  /* ---------------- chapter heads ---------------- */
  function head(section, id, title, note) {
    var h = make("header", "chapter-head");
    h.appendChild(make("span", "node", ""));
    h.lastChild.setAttribute("aria-hidden", "true");
    var h2 = make("h2", "chapter-title", text(title));
    h2.id = id + "-title";
    h.appendChild(h2);
    if (note) h.appendChild(make("p", "chapter-note", md(note)));
    section.appendChild(h);
  }

  /* ---------------- hero ---------------- */
  if (person.name) {
    // One word per line: the name is set large, so the break is chosen, not left to the window width.
    $('[data-slot="name"]').innerHTML = String(person.name).split(/\s+/).map(function (w) { return '<span class="w">' + esc(w) + "</span>"; }).join(" ");
    $('[data-slot="wordmark"]').textContent = person.name;
  }
  if (hero.intro) $('[data-slot="intro"]').innerHTML = md(hero.intro);
  var heroEl = $(".hero");
  var hint = $('[data-slot="hint"]');
  if (hint && !reduce) hint.textContent = finePointer ? "Point at the signals. Click to send a pulse." : "Tap the signals to send a pulse.";

  /* ---------------- about ---------------- */
  (function () {
    var sec = $('[data-slot="about"]');
    head(sec, "about", "About");
    var grid = make("div", "about");
    var main = make("div", "about-main");
    if (about.statement) {
      main.appendChild(make("p", "about-statement",
        (about.lead ? '<span class="about-lead">' + text(about.lead) + "</span> " : "") + text(about.statement)));
    }
    var body = make("div", "about-body");
    list(about.paragraphs).forEach(function (p) { body.appendChild(make("p", "", md(p))); });
    main.appendChild(body);
    grid.appendChild(main);

    var side = make("aside", "about-side");
    side.setAttribute("aria-label", "At a glance");
    var pt = person.portrait || {};
    if (pt.src) {
      side.appendChild(make("figure", "portrait",
        '<img src="' + esc(pt.src) + '" alt="' + esc(pt.alt || person.name || "") + '" width="560" height="560" decoding="async">'));
    }
    var facts = list(about.facts);
    if (person.location) facts = facts.concat([{ label: "Based in", value: person.location }]);
    if (facts.length) {
      var dl = make("dl", "facts");
      facts.forEach(function (f) {
        var row = make("div", "fact");
        row.appendChild(make("dt", "", text(f.label)));
        row.appendChild(make("dd", "", md(f.value)));
        dl.appendChild(row);
      });
      side.appendChild(dl);
    }
    grid.appendChild(side);
    sec.appendChild(grid);
  })();

  /* ---------------- work ---------------- */
  (function () {
    var sec = $('[data-slot="experience"]');
    var items = list(S.experience);
    if (!items.length) { sec.remove(); return; }
    head(sec, "experience", "Work");
    var ol = make("ol", "roles");
    items.forEach(function (r) {
      var li = make("li", "role");
      li.appendChild(make("p", "role-when", text(r.dates)));
      var body = make("div", "role-body");
      var logo = r.logo && r.logo.src ? '<img class="role-logo" src="' + esc(r.logo.src) + '" alt="" width="44" height="44" loading="lazy" decoding="async">' : "";
      var org = r.org ? (r.orgUrl ? "<a " + linkAttrs(r.orgUrl) + ">" + outText(r.org) + (isExternal(r.orgUrl) ? NEWTAB : "") + "</a>" : text(r.org)) : "";
      body.appendChild(make("h3", "role-title", logo + '<span class="role-name">' + text(r.title) + (org ? ", " + org : "") + "</span>"));
      if (r.place) body.appendChild(make("p", "role-place", text(r.place)));
      if (r.detail) body.appendChild(make("p", "role-detail", md(r.detail)));
      li.appendChild(body);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
  })();

  /* ---------------- projects ---------------- */
  var complexes = [];
  (function () {
    var sec = $('[data-slot="projects"]');
    var items = list(projects.items);
    if (!items.length) { sec.remove(); return; }
    head(sec, "projects", projects.title || "Projects", projects.note);
    var ol = make("ol", "works");
    items.forEach(function (p) {
      var m = p.media;
      var tone = m && typeof m === "object" && m.tone ? " tone-" + m.tone : "";
      var li = make("li", "work" + tone);
      if (p.id) li.id = "project-" + p.id;
      var url = safeUrl(p.url);

      var media;
      if (m && typeof m === "object" && m.image) {
        media = make(url ? "a" : "div", "work-media",
          '<img src="' + esc(m.image) + '" alt="' + esc(m.alt || "") + '" loading="lazy" decoding="async">');
        if (url) {
          media.setAttribute("href", url);
          media.setAttribute("tabindex", "-1");
          media.setAttribute("aria-hidden", "true");
          if (isExternal(url)) { media.setAttribute("target", "_blank"); media.setAttribute("rel", "noopener"); }
        }
      } else if (m === "complex") {
        media = make("div", "work-media is-drawn",
          '<canvas class="complex-canvas" aria-hidden="true"></canvas>' +
          '<p class="complex-key" aria-hidden="true"><span><i class="k-node"></i>nodes</span><span><i class="k-edge"></i>edges</span><span><i class="k-cell"></i>cells</span></p>');
        media.setAttribute("role", "img");
        media.setAttribute("aria-label", "A turning cell complex: nodes, edges and filled cells, the higher-order structure CELLO learns from");
      }
      if (media) li.appendChild(media);

      var body = make("div", "work-text");
      if (p.eyebrow) body.appendChild(make("p", "work-eyebrow", text(p.eyebrow)));
      body.appendChild(make("h3", "work-title", url
        ? "<a " + linkAttrs(url) + ">" + outText(p.title) + (isExternal(url) ? NEWTAB : "") + "</a>"
        : text(p.title)));
      if (p.detail) body.appendChild(make("p", "work-detail", md(p.detail)));
      var tags = list(p.tags);
      if (tags.length) {
        var ul = make("ul", "tags");
        ul.setAttribute("aria-label", "Topics");
        tags.forEach(function (t) { ul.appendChild(make("li", "", text(t))); });
        body.appendChild(ul);
      }
      li.appendChild(body);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    $$(".complex-canvas", sec).forEach(function (cv) {
      if (window.Complex) complexes.push(window.Complex.mount(cv, { reduce: reduce }));
    });
  })();

  /* ---------------- talks & prizes ---------------- */
  (function () {
    var sec = $('[data-slot="talks"]');
    var items = list(talks.items);
    if (!items.length) { sec.remove(); return; }
    head(sec, "talks", talks.title || "Talks", talks.note);
    var ol = make("ol", "talks");
    items.forEach(function (t, i) {
      var li = make("li", "talk" + (i % 2 ? " is-flipped" : ""));
      if (t.id) li.id = "talk-" + t.id;
      var photos = list(t.photos).filter(function (ph) { return ph && ph.src; }).slice(0, 2);
      if (photos.length) {
        var wall = make("div", "talk-photos " + (photos.length > 1 ? "is-pair" : "is-single"));
        photos.forEach(function (ph, k) {
          var dims = ph.width && ph.height ? ' width="' + Number(ph.width) + '" height="' + Number(ph.height) + '"' : "";
          wall.appendChild(make("figure", "talk-photo " + (k ? "is-second" : "is-main"),
            '<img src="' + esc(ph.src) + '" alt="' + esc(ph.alt || "") + '"' + dims + ' loading="lazy" decoding="async">' +
            (ph.caption ? "<figcaption>" + text(ph.caption) + "</figcaption>" : "")));
        });
        if (t.badge) {
          var badge = make("span", "talk-badge", text(t.badge));
          badge.setAttribute("aria-hidden", "true");
          wall.appendChild(badge);
        }
        li.appendChild(wall);
      }
      var body = make("div", "talk-text");
      if (t.year) body.appendChild(make("p", "talk-year", text(t.year)));
      body.appendChild(make("h3", "talk-title", text(t.title)));
      if (t.place) body.appendChild(make("p", "talk-place", text(t.place)));
      if (t.role) body.appendChild(make("p", "talk-role", text(t.role)));
      if (t.detail) body.appendChild(make("p", "talk-detail", md(t.detail)));
      li.appendChild(body);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
  })();

  /* ---------------- bookshelf (mounted when near) ---------------- */
  (function () {
    var sec = $('[data-slot="bookshelf"]');
    var items = list(books.items);
    if (!items.length || !window.Bookshelf) { sec.remove(); return; }
    head(sec, "bookshelf", "Bookshelf", books.title);
    if (books.hint) sec.appendChild(make("p", "shelf-hint", text(books.hint)));
    var slot = make("div", "shelf-slot");
    sec.appendChild(slot);
    whenNear(sec, function () { window.Bookshelf.mount(slot, items); });
  })();

  var FIGURE_LABELS = {
    network: "A social graph in points: a hub of influence and the ties around it",
    camera: "A video camera on a tripod, drawn in points",
    tennis: "A tennis racket and ball, drawn in points",
    mountain: "A range of peaks with a trail to the summit and a flag, drawn in points",
    bike: "A road bike, drawn in points",
    people: "Two people shaking hands under a speech bubble, drawn in points",
  };
  /* ---------------- interests ----------------
     Each tile holds a 3D figure made of points (assets/js/figures.js). The
     figures are built when the section comes near; each assembles as it
     scrolls into view and turns toward the pointer. */
  (function () {
    var sec = $('[data-slot="interests"]');
    var items = list(interests.items);
    if (!items.length) { sec.remove(); return; }
    head(sec, "interests", interests.title || "Interests", interests.note);
    var ul = make("ul", "interests");
    var tiles = [];
    items.forEach(function (it) {
      var li = make("li", "interest");
      if (it.id) li.id = "interest-" + it.id;
      var fig = make("div", "interest-figure", '<canvas class="interest-canvas"></canvas>');
      fig.setAttribute("role", "img");
      fig.setAttribute("aria-label", FIGURE_LABELS[it.figure] || text(it.label || it.title));
      li.appendChild(fig);
      li.appendChild(make("h3", "interest-title", text(it.label || it.title)));
      if (it.text) li.appendChild(make("p", "interest-text", md(it.text)));
      var ph = list(it.photos).filter(function (p) { return p && p.src; });
      if (ph.length) {
        var pl = make("ul", "interest-photos");
        ph.forEach(function (p) {
          pl.appendChild(make("li", "", '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || "") + '" loading="lazy" decoding="async">'));
        });
        li.appendChild(pl);
      }
      if (it.project) {
        var target = list(projects.items).filter(function (p) { return p.id === it.project; })[0];
        if (target) li.appendChild(make("a", "interest-link", "See " + text(target.title)));
        if (target) li.lastChild.setAttribute("href", "#projects/" + it.project);
      }
      ul.appendChild(li);
      tiles.push({ li: li, fig: fig, it: it });
    });
    sec.appendChild(ul);

    whenNear(sec, function () {
      if (!window.Figures) return;
      tiles.forEach(function (tile, i) {
        var api = window.Figures.mount($("canvas", tile.fig), tile.it.figure, { reduce: reduce, delay: (i % 3) * 140 + Math.floor(i / 3) * 90 });
        // The figure turns toward the pointer anywhere on the tile.
        tile.li.addEventListener("pointermove", function (e) {
          var r = tile.fig.getBoundingClientRect();
          api.point(Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5)), Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5)));
        });
        tile.li.addEventListener("pointerleave", function () { api.point(null); });
        tile.li.addEventListener("focusin", function () { api.hover(true); });
        tile.li.addEventListener("focusout", function () { api.hover(false); });
      });
    });
  })();

  /* ---------------- play (mounted when near) ---------------- */
  (function () {
    var sec = $('[data-slot="play"]');
    if (!window.PlayMe || play.hidden) { sec.remove(); return; }
    head(sec, "play", play.title || "Play Me", play.note);
    var slot = make("div", "play-slot");
    sec.appendChild(slot);
    whenNear(sec, function () {
      window.PlayMe.mount(slot, { name: person.firstName || "me", announce: announce });
    });
  })();

  /* ---------------- contact ---------------- */
  (function () {
    var sec = $('[data-slot="contact"]');
    head(sec, "contact", contact.title || "Say hello", contact.note);
    var items = list(contact.items);
    if (!items.length) return;
    var ul = make("ul", "contacts");
    items.forEach(function (c) {
      var li = make("li", "contact");
      li.appendChild(make("p", "contact-label", text(c.label)));
      var url = safeUrl(c.url);
      var v = url
        ? make("a", "contact-value", (/^(mailto|tel):/i.test(url) ? text(c.value) : outText(c.value)) + (isExternal(url) ? NEWTAB : ""))
        : make("span", "contact-value", text(c.value));
      if (url) {
        v.setAttribute("href", url);
        if (isExternal(url)) { v.setAttribute("target", "_blank"); v.setAttribute("rel", "noopener"); }
      }
      li.appendChild(v);
      if (c.copy) {
        var b = make("button", "copy-btn", '<span class="idle">Copy</span><span class="done">Copied</span>');
        b.type = "button";
        b.setAttribute("aria-label", "Copy " + String(c.label || "").toLowerCase());
        b.addEventListener("click", function () {
          var val = c.value || "";
          var ok = function () {
            b.classList.add("is-copied");
            announce("Copied " + val);
            setTimeout(function () { b.classList.remove("is-copied"); }, 1800);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(val).then(ok, function () {});
        });
        li.appendChild(b);
      }
      ul.appendChild(li);
    });
    sec.appendChild(ul);
  })();

  $('[data-slot="year"]').textContent = String(new Date().getFullYear());

  /* ---------------- nav ---------------- */
  var NAV = [
    ["about", "About"], ["experience", "Work"], ["projects", "Projects"], ["talks", "Talks"],
    ["bookshelf", "Books"], ["interests", "Interests"], ["play", "Play"],
  ];
  var navList = $('[data-slot="nav"]');
  var links = {};
  NAV.forEach(function (n) {
    if (!document.getElementById(n[0])) return;
    var li = make("li", "", '<a href="#' + n[0] + '">' + n[1] + "</a>");
    links[n[0]] = li.firstChild;
    navList.appendChild(li);
  });

  var bar = $("#bar");
  var menuBtn = $(".menu-toggle");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var first = $("a", navList); if (first) first.focus(); }
  }
  menuBtn.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
  navList.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
  });

  // The bar turns solid once the hero has scrolled away.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { bar.classList.toggle("is-solid", !es[0].isIntersecting); }, { rootMargin: "-72px 0px 0px 0px" }).observe(heroEl);
    // Scroll spy: the chapter crossing the middle of the screen is the current one.
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        if (links[e.target.id]) links[e.target.id].setAttribute("aria-current", "true");
        $$(".chapter").forEach(function (c) { c.classList.toggle("is-current", c === e.target); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".chapter").forEach(function (c) { spy.observe(c); });
  }

  /* ---------------- theme ---------------- */
  var toggle = $(".theme-toggle");
  var signals = null;
  function labelTheme() {
    var dark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  function setTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
    labelTheme();
    if (signals) signals.retheme();
    complexes.forEach(function (c) { c.retheme(); });
    document.dispatchEvent(new CustomEvent("themechange"));
  }
  toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next, true);
    announce(next === "dark" ? "Dark theme" : "Light theme");
  });
  labelTheme();
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (er) {}
      if (!saved) setTheme(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", follow); else if (mq.addListener) mq.addListener(follow);
  }

  /* ---------------- the thread ---------------- */
  var wrap = $(".story .wrap");
  var thread = $(".thread");
  function threadX() {
    var r = wrap.getBoundingClientRect();
    return r.left + parseFloat(getComputedStyle(wrap).paddingLeft || 0);
  }
  // How far down the page the reader is, shown as light along the thread.
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var r = thread.getBoundingClientRect();
      var p = (window.innerHeight * 0.5 - r.top) / Math.max(1, r.height);
      thread.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  function pulseDown() {
    if (reduce) return;
    thread.classList.remove("is-pulsing"); void thread.offsetWidth; thread.classList.add("is-pulsing");
  }

  /* ---------------- hero signals ---------------- */
  var canvas = $(".signals");
  var copy = $(".hero-copy");
  if (canvas && window.Signals) {
    signals = window.Signals.mount(canvas, {
      host: heroEl,
      reduce: reduce,
      labels: ["vocal", "facial", "physiological", "neuro", "clinical"],
      anchor: function (W, H) {
        var hr = heroEl.getBoundingClientRect(), cr = copy.getBoundingClientRect();
        return { x: Math.round(threadX() - hr.left) + 0.5, y: Math.max(H * 0.42, cr.top - hr.top - 26) };
      },
      onReady: function () { heroEl.classList.add("is-ready"); },
      onPulseDown: pulseDown,
    });
  } else heroEl.classList.add("is-ready");

  /* ---------------- lazy mounts ---------------- */
  function whenNear(el, fn) {
    var done = false;
    function go() { if (!done) { done = true; fn(); } }
    if (!("IntersectionObserver" in window)) return go();
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); go(); }
    }, { rootMargin: "900px 0px" });
    io.observe(el);
    el._mountNow = go;
  }

  /* ---------------- deep links ----------------
     #projects/<id>, #talks/<id> and #interests/<id> open on that item;
     #about, #experience, #bookshelf and the rest scroll natively. */
  function target(hash) {
    var m = /^#(projects|talks|interests)\/([\w-]+)$/.exec(hash || "");
    if (!m) return null;
    var prefix = { projects: "project-", talks: "talk-", interests: "interest-" }[m[1]];
    return document.getElementById(prefix + m[2]) || document.getElementById(m[1]);
  }
  function show(el, smooth) {
    if (!el) return;
    var sec = el.closest(".chapter");
    if (sec && sec._mountNow) sec._mountNow();
    requestAnimationFrame(function () {
      var top = el.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top: top, behavior: smooth && !reduce ? "smooth" : "auto" });
      el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    });
  }
  window.addEventListener("hashchange", function () {
    var el = target(location.hash);
    if (el) show(el, true);
    else {
      var plain = location.hash && document.getElementById(location.hash.slice(1));
      if (plain && plain._mountNow) plain._mountNow();
    }
  });
  function initialHash() {
    var el = target(location.hash);
    if (el) {
      show(el, false);
      // Sections above may still be settling (fonts, lazy mounts); correct once if the item moved.
      setTimeout(function () {
        var d = el.getBoundingClientRect().top - 96;
        if (Math.abs(d) > 4 && Math.abs(d) < 2000) window.scrollBy(0, d);
      }, 700);
      return;
    }
    var plain = location.hash && document.getElementById(location.hash.slice(1));
    if (plain && plain.classList.contains("chapter")) {
      if (plain._mountNow) plain._mountNow();
      requestAnimationFrame(function () { plain.scrollIntoView(); });
    }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initialHash); else initialHash();

  /* ---------------- structured data ---------------- */
  (function () {
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

  var foot = $(".foot-top");
  if (foot) foot.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    var h1 = $("#hero-name");
    h1.setAttribute("tabindex", "-1");
    h1.focus({ preventScroll: true });
  });
})();
