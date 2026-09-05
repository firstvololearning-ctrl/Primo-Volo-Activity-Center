import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excluded = new Set(["index.html", "primo-progress.html", "googlefcecf4d190e41af8.html"]);
const educatorOnly = new Set([
  "teacher-guide.html",
  "pilc-connections.html",
  "worksheets.html",
  "games.html",
  "chat-mats.html",
  "monthly-curriculum.html"
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

for (const absolute of await htmlFiles(root)) {
  const relative = path.relative(root, absolute).split(path.sep).join("/");
  if (excluded.has(relative)) continue;
  const prefix = "../".repeat(relative.split("/").length - 1);
  let html = await readFile(absolute, "utf8");
  const role = educatorOnly.has(relative) ? ' data-primo-access-role="educator"' : "";
  html = html.replace(/<html(?![^>]*pv-secondary-access-pending)([^>]*)>/i,
    `<html class="pv-secondary-access-pending"${role}$1>`);
  if (!html.includes("secondary-access-gate.css")) {
    html = html.replace(/<\/head>/i,
      `  <link rel="stylesheet" href="${prefix}css/secondary-access-gate.css?v=1">\n</head>`);
  }
  if (!html.includes("secondary-access-gate.mjs")) {
    html = html.replace(/<\/body>/i,
      `  <script type="module" src="${prefix}js/core/secondary-access-gate.mjs?v=1"></script>\n</body>`);
  }
  await writeFile(absolute, html);
}
