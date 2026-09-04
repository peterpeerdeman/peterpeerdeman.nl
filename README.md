# peterpeerdeman.nl website

## setup

`brew install sass/sass/sass`

## production build 

`npx parcel build src/index.html`

## deployment

Deploys run from this machine over FTPS — the credentials never leave it.
Pushing `master` builds the site and uploads `dist/` to `public_html`.

### one-time setup

Tell the repo where the server is (`.env.deploy` is gitignored):

```sh
cat > .env.deploy <<'EOF'
FTP_SERVER=your.directadmin.host
FTP_USERNAME=deploy@peterpeerdeman.nl
EOF
chmod 600 .env.deploy
```

Put the password in the macOS Keychain rather than on disk:

```sh
security add-generic-password -s peterpeerdeman.nl-deploy \
  -a deploy@peterpeerdeman.nl -w
```

Enable the push hook:

```sh
npm run hooks:install
```

### deploying

| command | what it does |
| --- | --- |
| `git push` (on `master`) | builds and deploys automatically |
| `npm run deploy` | deploys the current `dist/` |
| `npm run deploy:dry` | shows what would change, touches nothing |
| `git push --no-verify` | pushes without deploying |

Run `npm run build && npm run deploy:dry` before the first real deploy and read
the upload/delete list.

### why it is safe

`public_html` also contains folders that are not part of `dist/`. The deploy
keeps a `.deploy-state.json` on the server listing the files it has uploaded,
and only ever deletes files recorded there — anything it did not put there is
invisible to it, so the bespoke folders are never candidates for deletion.

Do not set `dangerous-clean-slate`, and do not replace this with an
`lftp mirror --delete`; both would wipe those folders. The `deploy` FTP account
is chrooted to `public_html`, which is why `server-dir` is `./`.
