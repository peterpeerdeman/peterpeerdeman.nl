# peterpeerdeman.nl website

A single static page. No JavaScript ships to the browser.

## setup

```
npm install
```

## development

```
npm run serve
```

Serves on http://localhost:1234 and builds into `.dev/` (kept out of `dist/`
so a dev bundle can never end up in a deploy).

## production build

```
npm run build
```

Wipes `dist/` and `.parcel-cache/`, runs Parcel, then copies `static/` over the
result. Everything in `dist/` is what gets uploaded to the host.

## deployment

Pushing to `master` builds the site and uploads `dist/` to `public_html` over
FTPS (`.github/workflows/deploy.yml`).

Required repository secrets:

| secret | value |
| --- | --- |
| `FTP_SERVER` | hostname of the DirectAdmin server |
| `FTP_USERNAME` | `deploy@peterpeerdeman.nl` |
| `FTP_PASSWORD` | password for that account |

The `deploy` FTP account is chrooted to `public_html`, so `server-dir` is `./`.

`public_html` also contains folders that are not part of `dist/`. The deploy
action keeps a `.deploy-state.json` on the server listing the files it has
uploaded, and only ever deletes files recorded there — anything it did not put
there is invisible to it. Do not set `dangerous-clean-slate`, and do not
replace this with an `lftp mirror --delete`; both would wipe those folders.

Because the upload is additive, `dist/` must be built from a clean directory or
files from an older build would be uploaded alongside the current ones. `npm run
build` wipes `dist/` first, so this holds as long as the workflow uses it.

## layout

- `src/` — everything Parcel processes. Assets referenced from `index.html`
  get content-hashed filenames.
- `static/` — files that must keep a stable, unhashed URL because something
  outside the site points at them: `og.jpg` (link-preview scrapers),
  `robots.txt`, `humans.txt` and `.htaccess` (cache headers for the Apache
  host). Parcel never sees these; the build copies them verbatim.
- CSS lives inline in `<head>` of `src/index.html`. It is smaller than the
  HTTP request that would fetch it as a separate file.
- Fonts are self-hosted in `src/fonts/`. `Vollkorn SC` is subset to only the
  sixteen letters the animated words use.
