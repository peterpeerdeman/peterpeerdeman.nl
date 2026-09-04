// Deploys dist/ to public_html over FTPS.
//
// public_html also holds folders that are not part of dist/. This uses the
// same engine as the FTP-Deploy-Action: it keeps a .deploy-state.json on the
// server listing the files it uploaded, and only ever deletes files recorded
// there. Anything it did not put there -- the bespoke folders -- is invisible
// to it. Never enable dangerous-clean-slate.

import { createRequire } from "node:module";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { deploy } = require("@samkirkland/ftp-deploy");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = resolve(root, ".env.deploy");

function die(msg) {
  console.error(`\ndeploy: ${msg}\n`);
  process.exit(1);
}

// .env.deploy is gitignored and holds FTP_SERVER / FTP_USERNAME, and
// optionally FTP_PASSWORD if you would rather not use the Keychain.
function loadEnvFile() {
  if (!existsSync(envFile)) return;

  const mode = statSync(envFile).mode & 0o077;
  if (mode !== 0) {
    console.warn(
      `deploy: warning: .env.deploy is readable by other users, run: chmod 600 ${envFile}`
    );
  }

  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue; // real env wins
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

// Preferred home for the password: the macOS Keychain, so it is never on disk
// in plaintext. Seed it once with the command printed below.
function passwordFromKeychain(service, account) {
  try {
    return execFileSync(
      "security",
      ["find-generic-password", "-s", service, "-a", account, "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
  } catch {
    return undefined;
  }
}

loadEnvFile();

const server = process.env.FTP_SERVER;
const username = process.env.FTP_USERNAME;
const keychainService =
  process.env.FTP_KEYCHAIN_SERVICE ?? "peterpeerdeman.nl-deploy";

if (!server || !username) {
  die(
    `FTP_SERVER and FTP_USERNAME must be set.\n` +
      `  Create ${envFile} containing:\n` +
      `    FTP_SERVER=your.directadmin.host\n` +
      `    FTP_USERNAME=deploy@peterpeerdeman.nl\n` +
      `  then: chmod 600 ${envFile}`
  );
}

const password =
  process.env.FTP_PASSWORD ?? passwordFromKeychain(keychainService, username);

if (!password) {
  die(
    `no FTP password found.\n` +
      `  Store it in the Keychain once with:\n` +
      `    security add-generic-password -s ${keychainService} -a ${username} -w\n` +
      `  (or set FTP_PASSWORD in ${envFile})`
  );
}

const distDir = resolve(root, "dist");
if (!existsSync(distDir) || readdirSync(distDir).length === 0) {
  die("dist/ is missing or empty -- run `npm run build` first.");
}

const dryRun =
  process.argv.includes("--dry-run") || process.env.DEPLOY_DRY_RUN === "true";

if (dryRun) {
  console.log("deploy: DRY RUN -- no changes will be made to the server\n");
}

// local-dir is resolved against the working directory, so pin it to the repo
// root -- git hooks and npm scripts do not agree on where they start.
process.chdir(root);

await deploy({
  server,
  username,
  password,
  protocol: "ftps",
  port: Number(process.env.FTP_PORT ?? 21),

  "local-dir": "./dist/",
  // The deploy FTP account is chrooted to public_html, so its root IS the web
  // root. Do not put "public_html/" here.
  "server-dir": "./",
  "state-name": ".deploy-state.json",

  exclude: [
    "**/.git*",
    "**/.git*/**",
    "**/node_modules/**",
    "**/.DS_Store",
  ],

  "dry-run": dryRun,
  "log-level": "standard",
});
