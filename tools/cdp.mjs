// cdp.mjs — talk to a running Electron/Chromium app over the DevTools Protocol.
//
// Why this exists: verifying this panel by asking the page to dispatch its own
// events proves nothing. A synthetic `new MouseEvent("contextmenu")` and a real
// right-click take different paths through the app, and a drag cannot be faked
// at all. CDP's Input domain delivers *trusted* input instead, so right-click
// menus, hover states and drag-and-drop can be tested the way a human does it.
//
// Usage (node >= 22 — the built-in WebSocket is the whole dependency list):
//   node cdp.mjs targets
//   node cdp.mjs eval "document.title"
//   node cdp.mjs evalfile probe.js        # an expression in a file — no shell quoting fights
//   node cdp.mjs rect "[data-testid=workflows-tab-button]"
//   node cdp.mjs click 120 40
//   node cdp.mjs rightclick 240 380
//   node cdp.mjs drag 240 380 240 540
//   node cdp.mjs screenshot out.png
//
// The app must have been started with --remote-debugging-port=<port>.
// Electron honours it; ComfyUI Desktop does too:
//   taskkill /T /F /PID <main pid>
//   "Comfy Desktop.exe" --remote-debugging-port=9222

const PORT = process.env.CDP_PORT || "9222";
const HOST = `http://127.0.0.1:${PORT}`;
const URL_MATCH = process.env.CDP_URL_MATCH || "8188";   // prefer the app window, not devtools

let ws, nextId = 1;
const pending = new Map();
const listeners = new Map();

function connect(url) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", (e) => reject(new Error("ws error: " + (e.message || e.type))));
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve: res, reject: rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) {
        for (const fn of listeners.get(msg.method) || []) fn(msg.params);
      }
    });
  });
}

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(method + " timed out")); }
    }, 20000);
  });
}

function on(method, fn) {
  if (!listeners.has(method)) listeners.set(method, []);
  listeners.get(method).push(fn);
}

async function pickTarget() {
  const list = await (await fetch(HOST + "/json")).json();
  const pages = list.filter((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (!pages.length) throw new Error("no page targets on " + HOST + " — is the app running with --remote-debugging-port?");
  const wanted = pages.find((t) => t.url.includes(URL_MATCH));
  return wanted || pages[0];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evalInPage(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
  return r.result.value;
}

// centre of an element, in the same CSS pixels the Input domain expects
async function rectOf(selector) {
  const r = await evalInPage(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
  })()`);
  if (!r) throw new Error("no element matches " + selector);
  return r;
}

async function mouse(type, x, y, opts = {}) {
  await send("Input.dispatchMouseEvent", {
    type, x, y,
    button: opts.button ?? "none",
    buttons: opts.buttons ?? 0,
    clickCount: opts.clickCount ?? 0,
    modifiers: opts.modifiers ?? 0,
  });
}

async function click(x, y, button = "left") {
  const buttons = button === "left" ? 1 : button === "right" ? 2 : 4;
  await mouse("mouseMoved", x, y);
  await mouse("mousePressed", x, y, { button, buttons, clickCount: 1 });
  await mouse("mouseReleased", x, y, { button, buttons: 0, clickCount: 1 });
}

// A real drag: press, move far enough that Chromium's own drag controller takes
// over, collect the drag data it hands us, then dispatch the drop. Without
// interception the drop never lands.
async function drag(x1, y1, x2, y2, steps = 12) {
  await send("Input.setInterceptDrags", { enabled: true });
  let data = null;
  on("Input.dragIntercepted", (p) => { data = p.data; });
  await mouse("mouseMoved", x1, y1);
  await mouse("mousePressed", x1, y1, { button: "left", buttons: 1, clickCount: 1 });
  for (let i = 1; i <= steps; i++) {
    await mouse("mouseMoved", x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, { buttons: 1 });
    await sleep(16);
  }
  if (!data) { await send("Input.setInterceptDrags", { enabled: false }); throw new Error("chromium never started a drag — the source element is probably not draggable"); }
  for (const type of ["dragEnter", "dragOver", "drop"]) {
    await send("Input.dispatchDragEvent", { type, x: x2, y: y2, data });
    await sleep(20);
  }
  await send("Input.setInterceptDrags", { enabled: false });
  await mouse("mouseReleased", x2, y2, { button: "left", buttons: 0, clickCount: 1 });
  return data;
}

const [cmd, ...args] = process.argv.slice(2);
const target = await pickTarget();
await connect(target.webSocketDebuggerUrl);
await send("Runtime.enable");
await send("Page.enable");

switch (cmd) {
  case "targets": {
    const list = await (await fetch(HOST + "/json")).json();
    for (const t of list) console.log(`${t.type}\t${t.url.slice(0, 90)}`);
    break;
  }
  case "eval":
    console.log(JSON.stringify(await evalInPage(args.join(" ")), null, 2));
    break;
  case "evalfile": {
    const fs = await import("node:fs");
    console.log(JSON.stringify(await evalInPage(fs.readFileSync(args[0], "utf8")), null, 2));
    break;
  }
  case "rect":
    console.log(JSON.stringify(await rectOf(args[0]), null, 2));
    break;
  case "click":
    await click(+args[0], +args[1], "left");
    console.log("clicked left at", args[0], args[1]);
    break;
  case "rightclick":
    await click(+args[0], +args[1], "right");
    console.log("right-clicked at", args[0], args[1]);
    break;
  case "drag": {
    const d = await drag(+args[0], +args[1], +args[2], +args[3]);
    console.log("dragged", args.slice(0, 4).join(","), "| payload:", d.items?.map((i) => i.mimeType).join(","));
    break;
  }
  case "screenshot": {
    const r = await send("Page.captureScreenshot", { format: "png" });
    const fs = await import("node:fs");
    fs.writeFileSync(args[0] || "shot.png", Buffer.from(r.data, "base64"));
    console.log("wrote", args[0] || "shot.png");
    break;
  }
  default:
    console.log("commands: targets | eval <js> | rect <selector> | click x y | rightclick x y | drag x1 y1 x2 y2 | screenshot [file]");
}
ws.close();
process.exit(0);
