/* ==========================================================================
   Bookshelf — books standing on a shelf under a night sky. Each book is a
   small 3D box: the spine faces you, the cover is its right-hand side.
   Hover (or focus) lifts a book and names it below the shelf; selecting a
   book turns it to show the cover and the note. Drag sideways to browse
   when the shelf is wider than the screen.
   Exposes window.Bookshelf = { mount(container, books) }.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* Pick readable ink for a background colour. */
  function inkFor(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#F4F0E8";
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.6 ? "#1C1A17" : "#F4F0E8";
  }
  function shade(hex, k) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return hex;
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); }
    return "#" + [f(r), f(g), f(b)].map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
  }
  /* First author's surname, keeping particles: "Bessel van der Kolk" -> "van der Kolk". */
  function surname(author) {
    var a = String(author || "").split(/\s*(?:,|&| and )\s*/)[0].trim().split(/\s+/);
    var i = a.length - 1;
    while (i > 0 && /^(van|von|der|den|de|del|da|di|du|la|le|al|el|bin|ibn|st\.?)$/i.test(a[i - 1])) i--;
    return a.slice(i).join(" ");
  }

  var PALETTE = [["#2F4A8A", "#E8B04B"], ["#B4532E", "#F1E3C8"], ["#1F5B4F", "#E9C46A"], ["#E7D9B8", "#B4532E"], ["#20201E", "#E8DCC2"], ["#8DA7C9", "#2B3A55"], ["#6B2E3A", "#E7C9A0"]];

  function starfield(canvas) {
    var ctx = canvas.getContext("2d");
    function paint() {
      var w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var seed = 9, n = Math.round(w * h / 2400);
      function r() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < n; i++) {
        var a = 0.15 + r() * 0.55, s = r() < 0.08 ? 1.6 : 0.9;
        ctx.fillStyle = "rgba(236,232,255," + a.toFixed(2) + ")";
        ctx.fillRect(r() * w, r() * h * 0.82, s, s);
      }
    }
    paint();
    if ("ResizeObserver" in window) new ResizeObserver(paint).observe(canvas);
    return paint;
  }

  function mount(root, books) {
    books = (books || []).filter(function (b) { return b && b.title; });
    if (!books.length) return null;

    var stage = document.createElement("div");
    stage.className = "shelf-stage";
    stage.innerHTML =
      '<canvas class="shelf-stars" aria-hidden="true"></canvas>' +
      '<div class="shelf-scroller"><div class="shelf-track" role="list" aria-label="Books"></div></div>' +
      '<div class="shelf-caption" aria-live="polite"><h3></h3><p class="by"></p><p class="note"></p></div>';
    root.appendChild(stage);

    var scroller = stage.querySelector(".shelf-scroller");
    var track = stage.querySelector(".shelf-track");
    var cap = stage.querySelector(".shelf-caption");
    var capTitle = cap.querySelector("h3"), capBy = cap.querySelector(".by"), capNote = cap.querySelector(".note");
    starfield(stage.querySelector(".shelf-stars"));

    var plank = '<span class="shelf-plank" aria-hidden="true"><span class="plank-top"></span><span class="plank-front"></span></span>';
    track.insertAdjacentHTML("beforeend", plank);

    var els = books.map(function (b, i) {
      var pal = PALETTE[i % PALETTE.length];
      var color = b.color || pal[0], accent = b.accent || pal[1];
      var hk = clamp(Number(b.height) || 1, 0.75, 1.15), wk = clamp(Number(b.width) || 1, 0.7, 1.4);
      var sw = Math.round(58 * wk), bh = Math.round(286 * hk), bd = Math.round(196 * hk);
      var ink = b.ink || inkFor(color);
      var serif = b.font === "serif";
      // Fit the spine title: shrink the type for long titles so they read in full.
      var author = surname(b.author);
      var room = bh - 30 - 14 - 26 - 16 - 14 - author.length * 6.4;
      var title = String(b.title);
      var fit = serif ? room / (title.length * 0.5) : room / (title.length * 0.78);
      var size = serif ? clamp(fit, 9, 16) : clamp(fit, 8, 13);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "book" + (serif ? " is-serif" : "");
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", b.title + (b.author ? ", by " + b.author : ""));
      btn.style.cssText = "--sw:" + sw + "px;--bh:" + bh + "px;--bd:" + bd + "px;--color:" + color + ";--book-accent:" + accent + ";--ink-on:" + ink + ";--color-2:" + shade(color, -0.22) + ";--color-3:" + shade(color, 0.1) + ";--title-size:" + size.toFixed(1) + "px";
      var cover = b.cover
        ? '<img src="' + esc(b.cover) + '" alt="" loading="lazy" decoding="async">'
        : '<span class="cover-rule"></span><span class="cover-title">' + esc(b.title) + '</span><span class="cover-author">' + esc(b.author || "") + "</span>";
      btn.innerHTML =
        '<span class="book-spine" aria-hidden="true"><span class="rule"></span><span class="title">' + esc(b.title) + '</span><span class="dot"></span><span class="author">' + esc(author) + '</span><span class="rule"></span></span>' +
        '<span class="book-cover" aria-hidden="true">' + cover + "</span>" +
        '<span class="book-back" aria-hidden="true"></span>';
      btn._book = b;
      track.appendChild(btn);
      return btn;
    });

    var open = null, shown = null;
    var start = 0;
    books.forEach(function (b, i) { if (b.reading && !start) start = i; });

    function caption(i, withNote) {
      var b = books[i];
      if (shown === i + (withNote ? "n" : "")) return;
      shown = i + (withNote ? "n" : "");
      capTitle.textContent = b.title;
      capBy.textContent = b.author || "";
      capNote.textContent = withNote ? (b.note || "") : "";
      capNote.hidden = !withNote || !b.note;
      cap.classList.remove("is-fresh"); void cap.offsetWidth; cap.classList.add("is-fresh");
    }
    caption(start, false);

    function setOpen(i) {
      if (open != null) els[open].classList.remove("is-open"), els[open].setAttribute("aria-expanded", "false");
      open = i;
      if (i == null) { track.classList.remove("has-open"); return; }
      els[i].classList.add("is-open");
      els[i].setAttribute("aria-expanded", "true");
      track.classList.add("has-open");
      caption(i, true);
      // keep the opened book in view
      var r = els[i].getBoundingClientRect(), s = scroller.getBoundingClientRect();
      if (r.left < s.left + 40 || r.right > s.right - 40) scroller.scrollBy({ left: (r.left + r.width / 2) - (s.left + s.width / 2), behavior: reduce ? "auto" : "smooth" });
    }

    els.forEach(function (btn, i) {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("pointerenter", function () { if (open == null) caption(i, false); });
      btn.addEventListener("focus", function () { if (open == null) caption(i, false); });
      btn.addEventListener("click", function (e) {
        if (dragged) { e.preventDefault(); return; }
        setOpen(open === i ? null : i);
        if (open == null) caption(i, false);
      });
      btn.addEventListener("keydown", function (e) {
        var k = e.key, j = null;
        if (k === "ArrowRight") j = Math.min(els.length - 1, i + 1);
        else if (k === "ArrowLeft") j = Math.max(0, i - 1);
        else if (k === "Home") j = 0;
        else if (k === "End") j = els.length - 1;
        else if (k === "Escape" && open != null) { setOpen(null); caption(i, false); e.preventDefault(); return; }
        if (j != null) { e.preventDefault(); els[j].focus(); if (open != null) setOpen(j); }
      });
    });

    stage.addEventListener("click", function (e) {
      if (open != null && !e.target.closest(".book") && !dragged) { var i = open; setOpen(null); caption(i, false); }
    });

    /* Drag to browse (mouse and pen; touch scrolls natively). */
    var down = false, dragged = false, x0 = 0, s0 = 0;
    scroller.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      down = true; dragged = false; x0 = e.clientX; s0 = scroller.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!dragged && Math.abs(dx) > 5) { dragged = true; track.classList.add("is-dragging"); }
      if (dragged) scroller.scrollLeft = s0 - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      setTimeout(function () { dragged = false; }, 0);
    });

    /* Start with the chosen book near the middle when the shelf overflows. */
    requestAnimationFrame(function () {
      if (scroller.scrollWidth > scroller.clientWidth + 4) {
        var r = els[start].offsetLeft + els[start].offsetWidth / 2;
        scroller.scrollLeft = r - scroller.clientWidth / 2;
      }
    });

    return { close: function () { setOpen(null); } };
  }

  window.Bookshelf = { mount: mount };
})();
