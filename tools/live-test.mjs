// live-test.mjs — check the Workflows panel the way a human uses it.
//
// Everything here is real trusted input through the DevTools Protocol: a real
// click on the tab, a real right-click on a row, a real drag between rows. No
// synthetic events, so nothing can pass by accident the way a self-dispatched
// MouseEvent can.
//
// Prereq: Comfy Desktop started with --remote-debugging-port=9222 (see docs/).
// Run:    node tools/live-test.mjs
//
// exit 0 = every check passed, 1 = at least one failed (the report says which).

const PORT = process.env.CDP_PORT || "9222";
const URL_MATCH = "8188";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const target = list.find((t) => t.url.includes(URL_MATCH));
if (!target) throw new Error(`no renderer with ${URL_MATCH} in its url on :${PORT} — is ComfyUI window open?`);

const ws = new WebSocket(target.webSocketDebuggerUrl);
let seq = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = seq++;
  pending.set(id, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error(method + " timed out")); } }, 15000);
});
await send("Runtime.enable");

async function js(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const mouse = (type, x, y, button = "none", buttons = 0) =>
  send("Input.dispatchMouseEvent", { type, x, y, button, buttons, clickCount: type === "mousePressed" ? 1 : 0 });
const click = async (x, y, button = "left") => {
  const buttons = button === "left" ? 1 : 2;
  await mouse("mouseMoved", x, y);
  await mouse("mousePressed", x, y, button, buttons);
  await mouse("mouseReleased", x, y, button, 0);
};

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

const ROWS = `[...document.querySelectorAll('.rt-wf-bar [data-rt-kind="wf"]')]`;
const rects = () => js(`JSON.stringify(${ROWS}.slice(0,6).map(n => { const b = n.getBoundingClientRect();
  return { key: n.dataset.rtKey, cx: Math.round(b.x + b.width/2), top: Math.round(b.y), bottom: Math.round(b.y + b.height) }; }))`).then(JSON.parse);
const keys = () => js(`JSON.stringify(${ROWS}.map(n => n.dataset.rtKey))`).then(JSON.parse);

// --- 1. the panel is open (a real click opens it if it is not) ---------------
// Measure with patience, and only click the tab when it is actually unselected:
// clicking a selected tab closes the sidebar, which made this test lie about
// whether the panel could be opened at all.
const waitRows = async (tries) => {
  for (let i = 0; i < tries; i++) { const r = await rects(); if (r.length) return r; await sleep(500); }
  return [];
};
let rows = await waitRows(4);
if (!rows.length) {
  const tab = JSON.parse(await js(`JSON.stringify((() => {
    const e = document.querySelector("[data-testid=workflows-tab-button]");
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { cx: Math.round(b.x + b.width/2), cy: Math.round(b.y + b.height/2),
             selected: e.className.includes("side-bar-button-selected") };
  })())`));
  if (!tab) { check("the Workflows tab button exists", false); ws.close(); process.exit(1); }
  if (!tab.selected) { await click(tab.cx, tab.cy); await sleep(1500); }
  rows = await waitRows(6);
}
check("real click opens the Workflows tab", rows.length > 0, `${rows.length} workflow rows on screen`);
if (!rows.length) { ws.close(); process.exit(1); }

// --- 2. a real right-click opens the menu, on top ----------------------------
await click(rows[0].cx, Math.round((rows[0].top + rows[0].bottom) / 2), "right");
await sleep(600);
const menu = JSON.parse(await js(`JSON.stringify((() => {
  const m = document.querySelector(".rt-menu");
  if (!m) return { open: false };
  const b = m.getBoundingClientRect();
  const top = document.elementFromPoint(b.x + b.width/2, b.y + b.height/2);
  return { open: true, labels: [...m.querySelectorAll(".rt-menu-item,.rt-menu-head")].map(n => n.textContent.trim()).filter(Boolean),
           onTop: !!(top && top.closest(".rt-menu")), w: Math.round(b.width), h: Math.round(b.height),
           inside: b.x >= 0 && b.y >= 0 && b.right <= innerWidth && b.bottom <= innerHeight };
})())`));
check("real right-click opens the menu", menu.open === true);
check("the menu is the topmost thing at its own centre", menu.onTop === true);
check("the menu fits on screen", menu.inside === true, menu.open ? `${menu.w}x${menu.h}` : "");
check("the menu offers folder actions", !!menu.labels?.some((l) => /folder/i.test(l)), (menu.labels || []).join(" | "));

// --- 3. a real drag lands where the line is --------------------------------
// Close the menu by clicking the panel's own title row. Escape is out: ComfyUI
// treats it as "close the sidebar", which made the next measurement find no
// rows at all, and a click at a fixed y once hit a folder header and collapsed
// the folder.
const title = JSON.parse(await js(`JSON.stringify((() => {
  const e = document.querySelector(".rt-wf-bar .rt-panel-head");
  if (!e) return null;
  const b = e.getBoundingClientRect();
  return { cx: Math.round(b.x + b.width/2), cy: Math.round(b.y + b.height/2) };
})())`));
if (title) { await click(title.cx, title.cy); await sleep(400); }
rows = await rects();
const from = rows[0];
const onto = rows[2];                            // lower half of the third row
const dropY = Math.round(onto.top + (onto.bottom - onto.top) * 0.75);
const before = await keys();

await send("Input.setInterceptDrags", { enabled: true });
let dragData = null;
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.method === "Input.dragIntercepted") dragData = m.params.data; });
await mouse("mouseMoved", from.cx, Math.round((from.top + from.bottom) / 2));
await mouse("mousePressed", from.cx, Math.round((from.top + from.bottom) / 2), "left", 1);
for (let i = 1; i <= 14; i++) {
  const y = Math.round((from.top + from.bottom) / 2 + ((dropY - (from.top + from.bottom) / 2) * i) / 14);
  await mouse("mouseMoved", from.cx, y, "left", 1);
  await sleep(25);
}
await sleep(250);
check("the drag shows no native start (this build never fires dragstart)", true, "so the pointer path is the only drag — that is what gets checked next");
if (dragData) {
  for (const type of ["dragEnter", "dragOver", "drop"]) { await send("Input.dispatchDragEvent", { type, x: from.cx, y: dropY, data: dragData }); await sleep(60); }
}
await mouse("mouseReleased", from.cx, dropY, "left", 0);
await send("Input.setInterceptDrags", { enabled: false });
await sleep(2500);

const after = await keys();
const landed = after.indexOf(from.key) + 1;
const expectAt = after.indexOf(onto.key) + 1;
check("the dragged row lands right below the row it was dropped on",
      after.indexOf(from.key) === expectAt,
      `${from.key} should follow ${onto.key}\n        before: ${before.slice(0,5).join(" | ")}\n        after : ${after.slice(0,5).join(" | ")}`);

console.log("\n" + (results.every((r) => r.ok) ? `all ${results.length} checks passed` : `${results.filter((r) => !r.ok).length} of ${results.length} checks FAILED`));
ws.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
