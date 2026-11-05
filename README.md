# Fahad Alsehami — personal site

A personal website with no dependencies and no build step, designed after arunmommileti.com: every visit opens in **Starlight**, a night-sky view of the page. **Turn the lights on** to use the site in light or dark theme. Inside: About, Experience, Projects, Bookshelf, Interests and Play Me, a crayon tennis game.

## Preview it

- **On a Mac:** double-click `preview.command`. It opens the site at `http://localhost:8000`; close the Terminal window to stop it. If macOS won't open it the first time, right-click it and choose Open.
- **Any computer:** run `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- Opening `index.html` straight from disk works too, but browsers don't let a page read pixels from local files, so the Starlight portrait shows as a grainy photo instead of particles. The local server shows the site exactly as it will look online.

## Edit the content

Every word, link and picture lives in **`content/site.js`**. Edit, save, refresh.

- Text supports `**bold**`, `*italic*` and `[links](https://example.com)`. Straight quotes become curly ones on the page.
- An empty `url: ""` shows an item without a link.
- A section with no items hides its tab (for example, empty `books.items` hides the Bookshelf).

### Sections

| Section | In `content/site.js` | Notes |
| --- | --- | --- |
| Header | `person`, `hero` | Name, location, greeting and the one-line intro. |
| About | `about` | The big statement, paragraphs, the facts table, and the particle emblem under it (`emblem.label` is the year on the laurel). |
| Experience | `experience` | One row per role: `dates`, `title`, `org`, `orgUrl`, `place`, `detail`, and `logo: { src, alt }` for the square logo beside the dates (files in `content/logos/`, about 176 × 176). |
| Projects | `projects.items` | `media: { image, alt, tone }` shows a screenshot from `content/projects/` in a window frame; `tone` sets the backdrop (`"sky"`, `"mint"`, `"lilac"`, `"blue"`, `"paper"`, `"rust"`). For work with no screenshot yet, `media` can be a drawn card instead: `"complex"` (a turning cell complex, used for CELLO), `"session"`, `"leaderboard"`, `"chart"`, `"globe"` or `"consensus"`. Each card has an anchor, so `#projects/cello` opens Projects at CELLO. |
| Bookshelf | `books.items` | `{ title, author, note, color, accent }`, plus optional `ink` (spine text colour), `height` and `width` (about 0.75–1.15 and 0.7–1.4), `font: "serif"` for a serif spine, `spineTitle` / `spineAuthor` for shorter spine text, `reading: true` to show that book first, and `cover: "content/books/…"` for a real cover image. Long titles shrink and wrap onto two or three lines to fit the spine. |
| Interests | `interests.items` | `figure` picks the 3D particle drawing: `"network"`, `"camera"`, `"tennis"`, `"mountain"`, `"bike"` or `"people"`. Add `photos: [{ src, caption }]` to pin polaroids next to it, and `project: "<project id>"` to link it to a Projects card (Explainers links to the explainers). |
| Play Me | `play` | Tennis against you: move with the mouse, a finger or the arrow keys, serve with a click, a tap or the space bar. Hitting off the edge of the racket angles the ball, and too wide lands out. Four points, two clear, takes a game. Games and the longest rally are kept in the visitor's browser. |
| Contact | `contact.items` | `{ label, value, url }`. Add `copy: true` to show a Copy button (useful for email). The first item gets the small accent dot. |

### The portrait

`content/images/portrait.webp` is a cut-out photo (transparent background, square, at least 560 × 560). In Starlight it is rebuilt from coloured particles.

To make the portrait look toward the pointer like the original site, add nine photos of you looking in each direction and list them in `person.portrait.poses` (`center`, `up`, `down`, `left`, `right`, `upLeft`, `upRight`, `downLeft`, `downRight`). Without them the photo tilts gently instead.

### Colours and type

Tokens sit at the top of `assets/css/site.css`: light under `:root`, dark under `:root[data-theme="dark"]`, and Starlight under `:root[data-mode="starlight"]`.

## How it's published

The live site is [fahadama.info](https://fahadama.info). GitHub Pages serves it straight from the `main` branch of [fahadalsehami/fahadama.info](https://github.com/fahadalsehami/fahadama.info), so a change committed to `main` is live a minute or two later. To change something without a terminal, open the file on GitHub, click the pencil, edit, and commit.

- `CNAME` names the custom domain, and `.nojekyll` tells GitHub Pages to serve the files exactly as they are.
- The domain appears in four places: `CNAME`, `meta.url` in `content/site.js`, the canonical and share tags in `index.html`, and `sitemap.xml` / `robots.txt`. Change them together if the domain ever changes.
- DNS for fahadama.info is managed at IONOS: four A records point the bare domain at GitHub Pages (185.199.108.153 to 185.199.111.153), and `www` is a CNAME to `fahadalsehami.github.io`.
- Any other static host works too: upload the folder with no build command.

## How it works

| File | What it does |
| --- | --- |
| `index.html` | Page structure. Picks theme and Starlight before first paint so nothing flashes. |
| `content/site.js` | All content. |
| `assets/js/site.js` | Builds the page from the content: tabs and links (`#about`, `#experience`, `#projects`, `#bookshelf`, `#interests`, `#interests/<id>`, `#play`), Starlight, theme, the portrait, contact, structured data. |
| `assets/js/particles.js` | The particle engine: 2D drawings (emblem, "Say hello", the Starlight portrait) and the 3D point clouds for the Interests. |
| `assets/js/starfield.js` | The night sky behind Starlight. |
| `assets/js/mini-ui.js` | The Projects card media: framed screenshots, plus optional animated cards. |
| `assets/js/bookshelf.js` | The 3D bookshelf. |
| `assets/js/play.js` | Play Me: crayon tennis against the site. |
| `assets/css/site.css` | Tokens, layout and every component, for Starlight, light and dark. |
| `assets/fonts/` | Newsreader, Geist, Geist Mono and Caveat, self-hosted. |
| `assets/img/` | Favicon, app icons and the social share image. |

- **Starlight:** opens on every visit. "Turn the lights on" shows the site for the rest of the visit; the star button brings Starlight back. Add `?lights=on` to a link to skip it. Click anywhere in Starlight to drop a pool of light.
- **Theme:** follows the device setting until a visitor picks one (the half-moon button, or a click on the portrait); the choice is remembered in that browser.
- **Accessibility:** keyboard reachable throughout (arrow keys move between tabs and books, and move your racket in Play Me; Escape closes an open interest or book), visible focus, screen-reader labels and announcements, and reduced motion respected.

## Credits

- Design after [arunmommileti.com](https://arunmommileti.com).
- Fonts under the SIL Open Font License: Newsreader (Production Type), Geist and Geist Mono (Vercel), Caveat (Impallari Type). Licenses are in `assets/fonts/`.
- Logos: Medera's mark from medera.info, BOTIM's wordmark (on BOTIM blue) from botim.me, and Substack's app icon from substack.com, captured November 2026. They belong to their owners and are shown only to identify the companies.
- Screenshots: medera.info, the BH-ASR leaderboard and its Two gates explainer on Hugging Face, botim.me and Signal & Symptom on Substack. The portrait comes from Signal & Symptom.
