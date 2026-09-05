import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excluded = new Set(["index.html", "primo-progress.html", "googlefcecf4d190e41af8.html"]);
const educatorOnly = new Set([
  "teacher-guide.html", "pilc-connections.html", "worksheets.html",
  "games.html", "chat-mats.html", "monthly-curriculum.html"
]);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await htmlFiles(absolute));
    else if (entry.name.endsWith(".html")) found.push(absolute);
  }
  return found;
}

test("every protected Primo route loads the shared access bootstrap", async () => {
  for (const absolute of await htmlFiles(root)) {
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    if (excluded.has(relative)) continue;
    const html = await readFile(absolute, "utf8");
    assert.match(html, /pv-secondary-access-pending/, relative);
    assert.match(html, /secondary-access-gate\.css/, relative);
    assert.match(html, /secondary-access-gate\.mjs/, relative);
    if (educatorOnly.has(relative)) {
      assert.match(html, /data-primo-access-role="educator"/, relative);
    }
  }
});

test("route matrix covers signed-out, wrong-role, no-access, and authorized states", async () => {
  const gate = await readFile(path.join(root, "js/core/secondary-access-gate.mjs"), "utf8");
  for (const state of ["signed-out", "wrong-role", "no-access", "authorized"]) {
    assert.match(gate, new RegExp(`status: ["']${state}["']`), state);
  }
  assert.match(gate, /get_student_session_context/);
  assert.match(gate, /get_student_product_access/);
  assert.match(gate, /product_entitlements/);
  assert.match(gate, /row\?\.product_key === PRODUCT_KEY/);
});

test("Primo sign-in, student return, and student sign-out destinations cannot drift", async () => {
  const gate = await readFile(path.join(root, "js/core/access-gate.mjs"), "utf8");
  assert.match(gate, /returnTo=primoVolo/);
  assert.match(gate, /signOut\.disabled = true/);
  assert.match(gate, /await supabase\.auth\.signOut\(\)/);
  assert.match(gate, /window\.location\.replace\(STUDENT_HOME_URL\)/);
  assert.match(gate, /returnLink\.href = STUDENT_HOME_URL/);
});

test("deployment route matrix names every central product return target", {
  skip: process.env.LIVE_DEPLOYMENT !== "1"
}, async () => {
  const response = await fetch("https://firstvololearning-ctrl.github.io/First-Volo-Account/js/auth-return-targets.js");
  assert.equal(response.ok, true);
  const source = await response.text();
  for (const target of ["storyBuilder", "morphology", "primoVolo"]) {
    assert.match(source, new RegExp(`\\b${target}\\b`), target);
  }
});

test("published product gates retain role, entitlement, and return-path contracts", {
  skip: process.env.LIVE_DEPLOYMENT !== "1"
}, async () => {
  const routes = [
    ["https://firstvololearning-ctrl.github.io/First-Volo-Morphology/js/auth/morphology-access.js", ["returnTo=morphology", "Educator sign in", "Student sign in"]],
    ["https://firstvololearning-ctrl.github.io/First-Volo-Story-Builder/access-gate.mjs", ["returnTo=storyBuilder", "product_entitlements", "get_student_product_access"]],
    ["https://firstvololearning-ctrl.github.io/Primo-Volo-Italian-Learning-Hub/js/core/access-gate.mjs", ["returnTo=primoVolo", "product_entitlements", "get_student_product_access"]]
  ];
  for (const [url, expectations] of routes) {
    const response = await fetch(`${url}?routeMatrix=${Date.now()}`);
    assert.equal(response.ok, true, url);
    const source = await response.text();
    for (const expected of expectations) assert.match(source, new RegExp(expected), `${url}: ${expected}`);
  }
});
