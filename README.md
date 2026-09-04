# peterpeerdeman.nl website

## setup

`brew install sass/sass/sass`

## production build 

`npx parcel build src/index.html`

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
