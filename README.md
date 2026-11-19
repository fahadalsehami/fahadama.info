# Fahad Alsehami: personal site

A personal website with no dependencies and no build step. The page opens on a body and its brain, drawn as points from real anatomy. Scrolling reads the body one signal at a time (eyes, face, voice, heart, breath and skin): each lights its pathway from the brain, and its trace flows left and fuses into one line. Then the brain gathers into Fahad's face, which becomes his photo and settles into the portrait in About. The fused line becomes a thread running down the whole page, and every section hangs from it: About, Work, Projects, Talks & prizes, Bookshelf, Interests, Play Me and Say hello. The signature colour is sky, `#D2ECFF`, in light and dark themes.

## Preview it

- **On a Mac:** double-click `preview.command`. It opens the site at `http://localhost:8000`; close the Terminal window to stop it. If macOS won't open it the first time, right-click it and choose Open.
- **Any computer:** run `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- Opening `index.html` straight from disk works too; the local server shows the site exactly as it will look online.

## Edit the content

Every word, link and picture lives in **`content/site.js`**. Edit, save, refresh.

- Text supports `**bold**`, `*italic*` and `[links](https://example.com)`. Straight quotes become curly ones on the page.
- An empty `url: ""` shows an item without a link.
- A section with no items is left out, along with its link in the menu (for example, empty `books.items` hides the Bookshelf).

### Sections

| Section | In `content/site.js` | Notes |
| --- | --- | --- |
| Hero | `person`, `hero` | Name and the one-line intro under it. The face at the end of the hero is `person.portrait`, the same photo as About. |
| About | `about` | The big statement (`lead` is the softer opening), paragraphs, and the facts beside the portrait. `person.location` is added to the facts as "Based in". |
| Work | `experience` | One entry per role on the timeline, newest first: `dates`, `title`, `org`, `orgUrl`, `place`, `detail`, and `logo: { src, alt }` (files in `content/logos/`, about 176 × 176). For a role with no logo image, `logo: { mark: "UCSF" }` shows the letters on a sky tile instead. |
| Projects | `projects.items` | `media: { image, alt, tone }` shows a screenshot from `content/projects/` rising out of a coloured mat; `tone` picks the mat (`"sky"`, `"lilac"`, `"mint"`, `"blue"`, `"paper"`). For work with no screenshot yet, `media: "complex"` draws a turning cell complex instead (used for CELLO). A video uses `media: { video, poster, length, alt, tone }`: the poster shows with a Play button, nothing plays by itself, and it pauses when scrolled out of view (keep the file under about 10 MB). `credit` adds a small attribution line under the tags. `#projects/<id>` opens the page at that project. |
| Talks & prizes | `talks.items` | `{ id, year, place, title, role, detail, badge, photos }`. `photos` are `{ src, alt, caption, width, height }` from `content/talks/`: the first is shown large and a second overlaps its corner; `badge` is the pill on the first photo. An item with no photos is listed on one line under the others (year, title and place). `#talks/<id>` opens the page at that item (the About facts link to the MIT entry this way). |
| Bookshelf | `books.items` | `{ title, author, note, color, accent }`, plus optional `ink` (spine text colour), `height` and `width` (about 0.75–1.15 and 0.7–1.4), `font: "serif"` for a serif spine, `spineTitle` / `spineAuthor` for shorter spine text, `reading: true` to show that book first, and `cover: "content/books/…"` for a real cover image. Long titles shrink and wrap onto two or three lines to fit the spine. |
| Interests | `interests.items` | `figure` picks the 3D figure made of points: `"network"` (a social graph), `"camera"` (a camera on a tripod), `"tennis"` (a racket and ball), `"mountain"` (peaks with a trail and flag), `"bike"` (a road bike) or `"people"` (two people talking). Each figure assembles as it scrolls into view and turns toward the pointer. Add `photos: [{ src, caption }]` to show small photos under the text, and `project: "<project id>"` to link the tile to a project (Explainers links to the explainers). `#interests/<id>` opens the page at that tile. |
| Play Me | `play` | Tennis on a sky court: move with the mouse, a finger or the arrow keys, serve with a click, a tap or the space bar. Hitting off the edge of the racket angles the ball, and too wide lands out. Four points, two clear, takes a game. Games and the longest rally are kept in the visitor's browser. |
| Contact | `contact.items` | `{ label, value, url }`. Add `copy: true` to show a Copy button (useful for email). |

### The portrait

`content/images/portrait.webp` is a cut-out photo (transparent background, square, at least 560 × 560). The page shows it in one tone inside a round sky frame, so any cut-out photo will match the palette.

### Colours and type

Tokens sit at the top of `assets/css/site.css`: light under `:root`, dark under `:root[data-theme="dark"]`. The canvases (hero signals, CELLO's cell complex, the tennis court) read their colours from the same file, so a colour changed there changes everywhere.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--sky` | `#D2ECFF` | `#D2ECFF` | The signature: hero, mats, badges, the current chapter's node |
| `--ink` | `#0C2033` | `#E6F1FB` | Text and the signal traces |
| `--tide` | `#1D5C93` | `#D2ECFF` | Links, years and lit details |
| `--paper` | `#F7FAFD` | `#07121D` | Page background |

One typeface throughout: Bricolage Grotesque, a variable font whose letters tighten as they grow, from the hero name down to the captions.

## How it's published

The live site is [fahadama.info](https://fahadama.info). GitHub Pages serves it straight from the `main` branch of [fahadalsehami/fahadama.info](https://github.com/fahadalsehami/fahadama.info), so a change committed to `main` is live a minute or two later. To change something without a terminal, open the file on GitHub, click the pencil, edit, and commit.

- `CNAME` names the custom domain, and `.nojekyll` tells GitHub Pages to serve the files exactly as they are.
- The domain appears in four places: `CNAME`, `meta.url` in `content/site.js`, the canonical and share tags in `index.html`, and `sitemap.xml` / `robots.txt`. Change them together if the domain ever changes.
- DNS for fahadama.info is managed at IONOS: four A records point the bare domain at GitHub Pages (185.199.108.153 to 185.199.111.153), and `www` is a CNAME to `fahadalsehami.github.io`.
- Any other static host works too: upload the folder with no build command.

## How it works

| File | What it does |
| --- | --- |
| `index.html` | Page structure. Picks the theme before first paint so nothing flashes. |
| `content/site.js` | All content. |
| `assets/js/site.js` | Builds the page from the content, and runs the menu, theme, scroll position on the thread, deep links (`#about`, `#experience`, `#projects`, `#projects/<id>`, `#talks`, `#talks/<id>`, `#bookshelf`, `#interests`, `#interests/<id>`, `#play`, `#contact`), contact buttons and structured data. |
| `assets/js/signals.js` | The hero: the body read one signal at a time as you scroll, the traces fusing into the thread, then the brain gathering into the portrait and the photo landing in About. Arriving there sends a pulse of light down the thread. |
| `assets/js/anatomy-data.js` | The anatomy the hero draws: about 30,000 surface points of the skin, brain, heart and airways, and the nerve pathways, loaded after the page. |
| `assets/js/complex.js` | CELLO's picture: a slowly turning cell complex of nodes, edges and filled cells. |
| `assets/js/figures.js` | The Interests figures: six small 3D sculptures made of points, shaded by depth, with glowing accents. |
| `assets/js/bookshelf.js` | The 3D bookshelf on its glass shelf. |
| `assets/js/play.js` | Play Me: tennis against the site. |
| `assets/css/site.css` | Tokens, layout and every component, for light and dark. |
| `assets/fonts/` | Bricolage Grotesque, self-hosted. |
| `assets/img/` | Favicon, app icons and the social share image. |
| `404.html` | The page for addresses that don't exist. |

- **Theme:** follows the device setting until a visitor picks one with the moon or sun button; the choice is remembered in that browser.
- **The thread:** a soft light on it marks how far down the page you are, and the chapter you're reading lights its node.
- **Accessibility:** keyboard reachable throughout (arrow keys move between books and move your racket in Play Me; Escape closes an open book or the menu), visible focus, screen-reader labels and announcements. With reduced motion on, the hero is one still picture with every signal lit, the Interests figures hold still, the pulse is off, and the game still plays.

## Credits

- Font under the SIL Open Font License: Bricolage Grotesque (The Bricolage Grotesque Project Authors). The license is in `assets/fonts/`.
- Logos: Medera's mark from medera.info and BOTIM's wordmark (on BOTIM blue) from botim.me, captured November 2026. They belong to their owners and are shown only to identify the companies. The other roles show their names' letters, not logos.
- Screenshots: medera.info's agents and Medera Glass pages, the BH-ASR leaderboard and its Two gates explainer on Hugging Face, a frame from the Perimeter explainer video, botim.me and Signal & Symptom on Substack. The portrait comes from Signal & Symptom.
- Anatomy: the hero's points and the Reading the Mind from the Body video are adapted from BodyParts3D, © The Database Center for Life Science, licensed under CC BY 4.0. The hero merges its structures and resamples them as points.
- Talks & prizes: the MIT Hacking Medicine photos (New York, 2018) are Fahad's own. The Regeneron ISEF 2024 artwork belongs to Society for Science and is shown only to identify the event.
