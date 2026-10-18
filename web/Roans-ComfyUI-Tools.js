import { app } from "../../scripts/app.js";

const API = "/Roans-ComfyUI-Tools/api";
const RT_CLIENT = Math.random().toString(36).slice(2, 8); // one id per page load

/* ------------------------------------------------------------------ styling */

const CSS = `
/* ---------------------------------------------------------------------------
   Metrics copied from ComfyUI's own sidebar, measured live in the running app
   (Nodes tab census): controls 32px tall, radius 6 (buttons) / 8 (search field),
   surfaces #262729 (button) and #313235 (input), no borders; rows 36px tall with
   radius 4, gap 12, padding 0 8px; row labels 14px #fff; section labels 12px
   #8a8a8a; icons 16px #8a8a8a; muted text #8a8a8a.
   --------------------------------------------------------------------------- */
.rt { display:flex; flex-direction:column; height:100%; box-sizing:border-box;
      font-size:14px; color:var(--fg-color,#fff); }

.rt-app {
  --rt-ctl:32px;
  --rt-radius:6px;
  --rt-surface:#262729;
  --rt-surface-hover:#313235;
  --rt-field:#313235;
  --rt-line:rgba(255,255,255,.09);
  --rt-muted:#8a8a8a;
  --rt-accent:var(--p-primary-color,#60a5fa);
  height:100%; min-height:0; box-sizing:border-box; overflow:hidden;
  display:flex; flex-direction:column;
  font-size:14px; color:var(--fg-color,#fff);
}

.rt-bar { flex:0 0 auto; display:flex; flex-direction:column; gap:8px;
          padding:8px 8px 10px; border-bottom:1px solid var(--rt-line); }
.rt-head { display:flex; align-items:center; gap:8px; min-width:0; flex-wrap:nowrap; }
.rt-head.wrap { flex-wrap:wrap; }
/* the one divider: under the search/button row, full width of the panel */
.rt-toolbar { margin:0 -8px; padding:0 8px 8px; border-bottom:1px solid var(--rt-line); }
.rt-spacer { flex:1 1 auto; min-width:0; }
.rt-scroll { flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden;
             padding:8px; display:flex; flex-direction:column; gap:4px;
             /* A classic Windows scrollbar is ~15px wide and only exists while the
                list overflows, so the content width jumped the moment it appeared and
                every badge row re-wrapped — that is the "spacing suddenly tighter"
                effect. Reserve the gutter so the width never changes, and draw the
                same slim bar ComfyUI's own panels use instead of the browser default. */
             scrollbar-gutter:stable; }
.rt-scroll::-webkit-scrollbar { width:8px; }
.rt-scroll::-webkit-scrollbar-track { background:transparent; }
.rt-scroll::-webkit-scrollbar-thumb { background:var(--rt-line); border-radius:4px; }
.rt-scroll::-webkit-scrollbar-thumb:hover { background:var(--rt-surface-hover); }
/* Flex children are allowed to shrink once the column overflows, and our rows only
   declared a min-height — so the moment a folder expanded and the list started
   scrolling, every folder row was squeezed from 44px to 32px and the whole list read
   as much tighter. Rows keep their natural height; the list does the scrolling. */
.rt-scroll > * { flex:0 0 auto; }

/* ---- panel title: identical box to ComfyUI's own header ------------------- */
/* SidebarTabTemplate renders the panel title as "truncate font-bold" inside a
   "min-h-16 px-3" panel: 16px/700, 64px min-height, 12px side padding. The Models
   and Workflows panels in this build draw no header of their own, so our bars print
   one in exactly those values. */
/* The title row carries NO divider: ComfyUI puts the line under the search/button row,
   not under the title (see the Node Library panel). */
.rt-panel-head { display:flex; align-items:center; gap:8px; min-height:64px;
      padding:0 12px; box-sizing:border-box; }
.rt-panel-title { font-size:16px; font-weight:700; color:var(--fg-color,#fff);
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }

/* ---- controls: same box as ComfyUI's own -------------------------------- */
.rt-btn, .rt-input, .rt-select {
  height:var(--rt-ctl); box-sizing:border-box; font-family:inherit; font-size:14px;
  color:var(--fg-color,#fff); background:var(--rt-surface); border:0; border-radius:var(--rt-radius);
  padding:0 10px; }
.rt-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px;
          cursor:pointer; white-space:nowrap; transition:background .12s,color .12s; }
.rt-btn:hover { background:var(--rt-surface-hover); }
.rt-btn.icon { width:var(--rt-ctl); min-width:var(--rt-ctl); flex:0 0 auto; padding:0; color:var(--rt-muted); }
.rt-btn.icon:hover { color:var(--fg-color,#fff); }
.rt-btn.icon.on { color:var(--rt-accent); background:var(--rt-surface-hover); }
.rt-btn.pri { background:var(--rt-accent); color:#0b0b0b; font-weight:500; }
.rt-btn.pri:hover { filter:brightness(1.1); }
.rt-btn.warn:hover { color:#f87171; }
.rt-input { background:var(--rt-field); font-size:12px; }
.rt-select { background:var(--rt-field); font-size:12px; padding-right:6px; }
.rt-input:focus, .rt-select:focus { outline:1px solid var(--rt-accent); outline-offset:-1px; }
.rt-input::placeholder { color:var(--rt-muted); }
.rt-grow { flex:1 1 auto; min-width:0; }
.rt-area { width:100%; box-sizing:border-box; background:var(--rt-field); border:0;
      border-radius:var(--rt-radius); padding:8px 10px; resize:vertical; min-height:72px;
      font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; line-height:1.5;
      color:var(--fg-color,#fff); }
.rt-area:focus { outline:1px solid var(--rt-accent); outline-offset:-1px; }

/* ---- labels ------------------------------------------------------------- */
.rt-sec { font-size:12px; font-weight:500; color:var(--rt-muted); white-space:nowrap; }
.rt-dim { font-size:12px; color:var(--rt-muted); white-space:nowrap; }
.rt-count { font-size:12px; color:var(--rt-muted); font-variant-numeric:tabular-nums; }
.rt-mono { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; color:var(--rt-muted); }

/* ---- rows: ComfyUI's tree node box -------------------------------------- */
/* Rhythm taken from the values measured live in this build: tree rows sit on a
   2px pad with a 4px gap and radius 6, panel buttons are 32px tall with 14px/500
   labels, small text is 12px, muted is #8a8a8a. Our rows carry 2-3 lines where the
   native tree carries one, so the internal gaps use the app's 8px unit — at 6px the
   badges crowded the next card as soon as a section was expanded. */
.rt-card, .rt-folder, .rt-root, .rt-row {
  display:flex; flex-direction:column; gap:8px; min-width:0;
  border:0; border-radius:6px; background:transparent; padding:8px; }
.rt-card:hover { background:var(--rt-surface); }
.rt-card .rt-head, .rt-folder { align-items:center; }
.rt-title { font-size:14px; font-weight:400; color:var(--fg-color,#fff); min-width:0;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:0 1 auto; cursor:pointer; }
.rt-title:hover { color:var(--rt-accent); }
.rt-name { font-size:14px; font-weight:400; color:var(--fg-color,#fff);
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
.rt-folder { flex-direction:row; gap:8px; padding:4px 8px; }
.rt-folder:hover { background:var(--rt-surface); }

/* ---- secondary line: badges, not bubbles -------------------------------- */
.rt-badges { display:flex; gap:6px 8px; flex-wrap:wrap; align-items:center; padding-left:0; }
.rt-badge { font-size:12px; padding:2px 6px; border-radius:4px; white-space:nowrap;
      background:var(--rt-surface); color:var(--rt-muted); border:0; opacity:1; }
.rt-badge.t { color:#a3cfa3; }
.rt-badge.k { color:#d4b09c; }
.rt-badge.a { color:var(--rt-accent); }
.rt-chips { display:flex; gap:6px; flex-wrap:wrap; }
.rt-chip { height:26px; padding:0 10px; border-radius:4px; border:0; cursor:pointer;
      background:var(--rt-surface); color:var(--rt-muted); font-family:inherit; font-size:12px;
      display:inline-flex; align-items:center; white-space:nowrap; }
.rt-chip:hover { color:var(--fg-color,#fff); }
.rt-chip.on { background:var(--rt-accent); color:#0b0b0b; }
.rt-detail { display:flex; flex-direction:column; gap:8px; padding:2px 0 4px; }
.rt-grid { display:grid; grid-template-columns:auto 1fr; gap:4px 12px; font-size:12px; }
.rt-k { color:var(--rt-muted); white-space:nowrap; }
.rt-v { word-break:break-word; min-width:0; }
.rt-code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; line-height:1.5;
      white-space:pre-wrap; word-break:break-word; background:var(--rt-field); border-radius:4px;
      padding:8px 10px; max-height:140px; overflow:auto; color:var(--fg-color,#fff); }
.rt-code.open { max-height:none; }
.rt-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.rt-folderslot { flex:0 0 auto; }
.rt-folderslot:not(:empty) { padding:2px 0 0; }
.rt-newfolder { display:flex; gap:8px; align-items:center; }

/* the right-click menu, floating like ComfyUI's own popups */
.rt-menu { position:fixed; z-index:10000; min-width:184px; padding:4px;
      background:var(--rt-surface,#262729); border-radius:6px; box-shadow:0 10px 30px rgba(0,0,0,.5);
      display:flex; flex-direction:column; }
.rt-menu-item { display:flex; align-items:center; height:28px; padding:0 10px; border:0; border-radius:4px;
      background:transparent; color:var(--fg-color,#fff); font:inherit; font-size:13px; font-weight:400; text-align:left;
      cursor:pointer; white-space:nowrap; }
.rt-menu-item:hover { background:var(--rt-surface-hover,#313235); }
.rt-menu-item.danger:hover { background:#4a2426; color:#fca5a5; }
.rt-menu-head { padding:6px 10px 2px; font-size:11px; color:var(--rt-muted,#8a8a8a); }
.rt-menu-sep { height:1px; margin:4px 6px; background:var(--rt-line,rgba(255,255,255,.09)); }

/* folders read like ComfyUI's own tree nodes: icon, name, count */
.rt-ficon { display:inline-flex; align-items:center; color:var(--rt-muted,#8a8a8a); flex:0 0 auto; }
.rt-folder { min-height:32px; }
.rt-folder .rt-name { font-weight:500; }
.rt-card { margin-left:16px; }   /* workflows sit inside their folder, visibly */
.rt-card.drop-before { box-shadow:inset 0 2px 0 0 var(--rt-accent,#60a5fa); }
.rt-folder.drop-into { background:var(--rt-surface-hover,#313235);
      box-shadow:inset 0 0 0 1px var(--rt-accent,#60a5fa); }
.rt-add { display:flex; align-items:center; gap:8px; height:var(--rt-ctl); padding:0 10px;
      font:inherit; font-size:14px; color:var(--rt-muted); cursor:pointer;
      background:transparent; border:1px dashed var(--rt-line); border-radius:4px; }
.rt-add:hover { color:var(--fg-color,#fff); border-color:var(--rt-muted); }
.rt-empty { color:var(--rt-muted); padding:24px 12px; text-align:center; font-size:14px; }

/* ---- the other tabs keep their own shapes, restyled to match ------------- */
.rt-form { display:flex; flex-direction:column; gap:8px; border:0; border-radius:6px;
      padding:10px; margin:8px; background:var(--rt-surface); }
.rt-field { display:flex; flex-direction:column; gap:4px; }
.rt-field > label { font-size:12px; color:var(--rt-muted); }
.rt-row2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.rt-hint { font-size:12px; color:var(--rt-muted); }
.rt-flash { animation:rtflash .9s ease-out; }
@keyframes rtflash { from { background:var(--rt-surface-hover); } }
.rt-native-block { margin-top:10px; padding-top:8px; border-top:1px solid var(--rt-line); }
.rt-native-editor { display:flex; flex-direction:column; gap:8px; margin-top:8px;
      border:0; border-radius:6px; padding:10px; background:var(--rt-surface); }
`;

function injectStyles() {
  if (document.getElementById("rt-styles")) return;
  const s = document.createElement("style");
  s.id = "rt-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* -------------------------------------------------------------------- state */

const S = { models: [], workflows: [], prompts: [], wfFolders: [], wfFolderMeta: {}, modelFolderMeta: {}, loadedAt: 0 };
const V = {
  model: { q: "", type: "All", sort: "name", desc: false, group: "type", open: new Set(), collapsed: new Set() },
  prompt: { q: "", kind: "all", group: "none", open: new Set(), collapsed: new Set() },
  wf: { q: "", sort: "recent", desc: true, collapsed: new Set(), editing: null, moving: null, newFolder: null },
};

let uiStamp = null;
let RT_FOLDER_INPUT = null;
let RT_MD_PAINT = null;

// An interaction log: every pointer/context event on our own panels, plus what
// the menu looked like 60ms later. This is how a right-click that never reaches
// us becomes visible from the outside.
const RT_EVENTS = [];
function rtLogEvent(type, e) {
  const t = e.target;
  const cls = (t && t.className ? t.className.toString() : "").slice(0, 40);
  RT_EVENTS.push({
    type,
    button: e.button,
    onRow: !!(t && t.closest && t.closest(".rt-card, .rt-folder")),
    inPanel: !!(t && t.closest && t.closest(".rt-app")),
    target: t ? `${t.tagName.toLowerCase()}.${cls}` : "?",
  });
  if (type === "contextmenu" || type === "pointerdown") {
    setTimeout(() => {
      const m = document.querySelector(".rt-menu");
      RT_EVENTS.push({
        type: `${type}:after`,
        menus: document.querySelectorAll(".rt-menu").length,
        menu: m
          ? (() => {
              const r = m.getBoundingClientRect();
              const cs = getComputedStyle(m);
              const mid = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              return {
                at: `${Math.round(r.left)},${Math.round(r.top)}`,
                size: `${Math.round(r.width)}x${Math.round(r.height)}`,
                z: cs.zIndex,
                pos: cs.position,
                display: cs.display,
                visibility: cs.visibility,
                topmost: mid ? `${mid.tagName.toLowerCase()}.${(mid.className || "").toString().slice(0, 24)}` : "none",
              };
            })()
          : null,
      });
    }, 60);
  }
  if (RT_EVENTS.length > 60) RT_EVENTS.splice(0, RT_EVENTS.length - 60);
}
if (!window.__rtEvHooked) {
  window.__rtEvHooked = true;
  for (const type of ["contextmenu", "pointerdown", "click"]) {
    document.addEventListener(
      type,
      (e) => {
        if (e.target && e.target.closest && e.target.closest(".rt-app, .rt-menu")) rtLogEvent(type, e);
      },
      true
    );
  }
}

const RT_STATS = { wfBuilds: 0, mdBuilds: 0, injections: 0, hides: 0, observerPasses: 0 };
let pollFails = 0;

/* ------------------------------------------------------------------ helpers */

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function btn(label, cls, onClick) {
  const b = el("button", "rt-btn" + (cls ? " " + cls : ""), label);
  b.onclick = onClick;
  return b;
}
function badge(text, cls) {
  return el("span", "rt-badge" + (cls ? " " + cls : ""), text);
}
function input(cls, value, placeholder) {
  const i = el("input", "rt-input" + (cls ? " " + cls : ""));
  i.value = value || "";
  if (placeholder) i.placeholder = placeholder;
  return i;
}
function area(value, placeholder) {
  const a = el("textarea", "rt-area");
  a.value = value || "";
  if (placeholder) a.placeholder = placeholder;
  return a;
}
function field(label, node, hint) {
  const f = el("div", "rt-field");
  f.appendChild(el("label", null, label));
  f.appendChild(node);
  if (hint) f.appendChild(el("div", "rt-hint", hint));
  return f;
}
function toast(detail, severity = "success") {
  try {
    app.extensionManager.toast?.add({ severity, summary: "Roans ComfyUI Tools", detail, life: 2200 });
  } catch (e) {
    console.log("[Roans-ComfyUI-Tools]", detail);
  }
}
async function api(path, body) {
  const r = await fetch(API + path, body === undefined
    ? undefined
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}
async function load(force) {
  const data = await api(`/state${force ? "?force=1" : ""}`);
  S.models = data.models;
  S.workflows = data.workflows;
  S.prompts = data.prompts;
  S.wfFolders = data.wf_folders || [];
  S.wfFolderMeta = data.wf_folder_meta || {};
  S.modelFolderMeta = data.model_folder_meta || {};
  S.loadedAt = Date.now();
  return data;
}
function size(bytes) {
  return bytes >= 1073741824 ? (bytes / 1073741824).toFixed(1) + " GB" : (bytes / 1048576).toFixed(0) + " MB";
}
function copy(text, what) {
  navigator.clipboard.writeText(text);
  toast("copied " + what);
}
function openWorkflow(file) {
  api(`/workflow?rel=${encodeURIComponent(file)}`)
    .then((graph) => {
      app.loadGraphData(graph);
      toast("opened " + file);
    })
    .catch(() => toast("could not open " + file, "error"));
}
function select(options, value, onChange) {
  const s = el("select", "rt-select");
  s.style.width = "auto";
  for (const [v, label] of options) {
    const o = el("option", null, label);
    o.value = v;
    s.appendChild(o);
  }
  s.value = value;
  s.onchange = () => onChange(s.value);
  return s;
}

/* ------------------------- talking to the graph (prompts <-> text nodes) ---- */

function isTextNode(node) {
  const t = (node?.type || node?.comfyClass || "").toString();
  return t.includes("CLIPTextEncode") || t.includes("TextEncode");
}
function textNodes() {
  try {
    return (app.graph?._nodes || []).filter(isTextNode);
  } catch (e) {
    return [];
  }
}
function nodeText(node) {
  const w = (node?.widgets || []).find((x) => x.name === "text") || (node?.widgets || [])[0];
  return w ? String(w.value ?? "") : "";
}
function setNodeText(node, text) {
  const w = (node?.widgets || []).find((x) => x.name === "text") || (node?.widgets || [])[0];
  if (!w) return false;
  w.value = text;
  try {
    w.callback?.(text, app.canvas, node, [0, 0], {});
  } catch (e) {}
  try {
    app.graph.setDirtyCanvas(true, true);
  } catch (e) {}
  return true;
}
function selectedTextNode() {
  try {
    const sel = app.canvas?.selected_nodes || {};
    return Object.values(sel).filter((n) => isTextNode(n))[0] || null;
  } catch (e) {
    return null;
  }
}
/** Longest text node is the positive prompt, shortest is the negative, as a rule. */
function rankedTextNodes() {
  return textNodes()
    .slice()
    .sort((a, b) => nodeText(b).length - nodeText(a).length);
}

function promptFromCanvas() {
  const ranked = rankedTextNodes();
  if (!ranked.length) {
    toast("this workflow has no text encode node", "warn");
    return null;
  }
  const pos = nodeText(ranked[0]);
  const neg = ranked.length > 1 ? nodeText(ranked[ranked.length - 1]) : "";
  if (!pos.trim()) {
    toast("the text node is empty", "warn");
    return null;
  }
  let name = "from canvas";
  try {
    name = app.workflowManager?.activeWorkflow?.name || app.graph?.name || name;
  } catch (e) {}
  return { positive: pos, negative: neg, name };
}

/** Push a prompt onto the graph: the selected node, else the natural one for that role. */
function textToNode(text, role) {
  const sel = selectedTextNode();
  if (sel) {
    setNodeText(sel, text);
    toast(`sent to the selected node (${role})`);
    return;
  }
  const ranked = rankedTextNodes();
  if (!ranked.length) {
    toast("this workflow has no text encode node", "warn");
    return;
  }
  const target = role === "negative" ? ranked[ranked.length - 1] : ranked[0];
  if (ranked.length === 1 && role === "negative") {
    setNodeText(target, text);
    toast("only one text node — wrote the negative into it");
    return;
  }
  setNodeText(target, text);
  toast(`sent to ${target.title || target.type || "the text node"} (${role})`);
}
function groupItems(items, keyFn) {
  const groups = new Map();
  for (const it of items) {
    const key = keyFn(it) || "(none)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(it);
  }
  return groups;
}
/** A clickable, collapsible section header, e.g. "CHECKPOINT · 7". */
function section(key, label, count, collapsedSet, repaint) {
  const isOpen = !collapsedSet.has(key);
  const head = el("div", "rt-sec");
  head.style.cursor = "pointer";
  head.title = isOpen ? "collapse" : "expand";
  head.appendChild(el("span", null, (isOpen ? "▾ " : "▸ ") + label));
  head.appendChild(el("span", "rt-dim", String(count)));
  head.onclick = () => {
    if (isOpen) collapsedSet.add(key);
    else collapsedSet.delete(key);
    repaint();
  };
  return { head, isOpen };
}

/* live UI: notice when a file on disk changes under a running ComfyUI */
async function pollUi() {
  try {
    const s = await api("/ui_version");
    pollFails = 0;
    if (uiStamp === null) {
      uiStamp = s;
      return;
    }
    const changed =
      s.js !== uiStamp.js ? "the sidebar UI" : s.library !== uiStamp.library ? "library.py" : null;
    uiStamp = s;
    if (changed === "the sidebar UI") {
      toast("UI updated on disk — reloading", "info");
      setTimeout(() => location.reload(), 900);
    } else if (changed === "library.py") {
      toast("library.py reloaded — refreshing list", "info");
      repaint();
    }
  } catch (e) {
    // older server without the endpoint: stop asking, keep working
    if (++pollFails >= 3) clearInterval(pollTimer);
  }
}
let pollTimer = null;

/* -------------------------------------- ComfyUI's own Models panel, enhanced */

const NATIVE_PREVIEW = "#model-library-model-preview-container, .model-lib-model-preview";
const NATIVE_ROW = ".model-lib-node-container";
const NATIVE_TAB = "[data-testid='model-library-tab-button']";

function modelFor(text) {
  if (!text) return null;
  const t = text.trim();
  const lower = t.toLowerCase();
  return (
    S.models.find((m) => m.filename === t) ||
    S.models.find((m) => lower.includes(m.filename.toLowerCase())) ||
    S.models.find((m) => m.name.length > 5 && lower.includes(m.name.toLowerCase())) ||
    null
  );
}

/** The editor shown inside ComfyUI's own preview card. Saves through our API. */
function nativeEditor(m, onSaved) {
  const box = el("div", "rt-native-editor");
  const f = {
    link: input(null, m.link, "civitai / huggingface url"),
    base: input(null, m.base || m.base_detected, m.base_detected || "base model"),
    file_type: input(null, m.file_type, m.file_type_detected ? `detected: ${m.file_type_detected}` : "file type"),
    version: input(null, m.version || m.version_suggested, "downloaded version"),
    rank: input(null, m.rank, "your verdict"),
    why: input(null, m.why, "why you downloaded it"),
    keyword: input(null, m.keyword, "lora trigger keyword"),
  };
  box.append(
    field("Link", f.link),
    el("div", "rt-row2", field("Base model", f.base), field("File type", f.file_type)),
    el("div", "rt-row2", field("Version", f.version), field("Rank?", f.rank)),
    el("div", "rt-row2", field("Why?", f.why), field("Keyword", f.keyword))
  );
  const note = area(m.note, "notes");
  box.appendChild(field("Notes", note));
  const actions = el("div", "rt-actions");
  actions.append(
    btn("save", "pri", async () => {
      await api("/model", {
        filename: m.filename,
        name: m.name,
        model_type: m.model_type,
        file_type: f.file_type.value,
        version: f.version.value,
        base: f.base.value,
        link: f.link.value,
        rank: f.rank.value,
        why: f.why.value,
        keyword: f.keyword.value,
        note: note.value,
      });
      toast("saved " + m.filename);
      await load(true);
      onSaved();
    }),
    btn("cancel", null, () => box.remove())
  );
  box.appendChild(actions);
  return box;
}

/**
 * ComfyUI's Models panel is a built-in Vue component and cannot be edited from the
 * outside. Its DOM can be augmented though: we append our row data to the model
 * preview card, and a MutationObserver re-attaches it after every Vue re-render.
 */
function enhanceNativeModelLibrary() {
  let injecting = false;

  function buildBlock(host, m) {
    const block = el("div", "rt-native-block");
    block.dataset.for = m.filename;

    const head = el("div", "rt-head");
    head.appendChild(el("span", "rt-sec", "Roans ComfyUI Tools"));
    head.appendChild(el("span", "rt-spacer"));
    head.appendChild(btn("edit", "icon", () => {
      const existing = block.querySelector(".rt-native-editor");
      if (existing) return existing.remove();
      block.appendChild(nativeEditor(m, () => paintBlock(host, m)));
    }));
    block.appendChild(head);

    const grid = el("div", "rt-grid");
    const put = (k, v, dim) => {
      if (!v) return;
      grid.appendChild(el("div", "rt-k", k));
      if (k === "Link") {
        const a = el("a", "rt-v", v);
        a.href = v;
        a.target = "_blank";
        a.style.color = "var(--p-primary-color,#7aa2f7)";
        grid.appendChild(a);
      } else {
        grid.appendChild(el("div", "rt-v" + (dim ? " rt-dim" : ""), v));
      }
    };
    put("File type", m.file_type || m.file_type_detected, !m.file_type);
    put("Version", m.version || m.version_suggested, !m.version);
    put("Base", m.base || m.base_detected, !m.base);
    put("Rank?", m.rank);
    put("Why?", m.why);
    put("Keyword", m.keyword);
    put("Lora dim", m.lora_dim);
    if (m.auto_tags?.length) put("Trained on", m.auto_tags.join(", "), true);
    put("Notes", m.note);
    block.appendChild(grid);

    if (m.link) {
      const a = el("a", "rt-btn", "open model page ↗");
      a.href = m.link;
      a.target = "_blank";
      a.style.display = "inline-block";
      a.style.textDecoration = "none";
      const row = el("div", "rt-actions");
      row.appendChild(a);
      block.appendChild(row);
    }
    if (!m.link) {
      const row = el("div", "rt-actions");
      row.appendChild(btn("add a link", null, () => {
        const existing = block.querySelector(".rt-native-editor");
        if (existing) return existing.remove();
        block.appendChild(nativeEditor(m, () => paintBlock(host, m)));
      }));
      block.appendChild(row);
    }
    return block;
  }

  function paintBlock(host, m) {
    host.querySelector(".rt-native-block")?.remove();
    host.appendChild(buildBlock(host, m));
  }

  /** mark rows in the tree that have a saved link / verdict */
  function markRows() {
    for (const row of document.querySelectorAll(NATIVE_ROW)) {
      const label = (row.textContent || "").trim();
      const m = modelFor(label);
      if (!m || row.dataset.rtRowed === m.filename) continue;
      row.dataset.rtRowed = m.filename;
      row.querySelector(".rt-row-dot")?.remove();
      if (m.link || m.rank || m.why) {
        const dot = el("span", "rt-row-dot", m.link ? "🔗" : "★");
        dot.title = [m.file_type, m.rank, m.why].filter(Boolean).join(" · ") || "you have notes for this model";
        dot.style.cssText = "font-size:9px;opacity:.75;margin-left:4px;";
        row.appendChild(dot);
      }
    }
  }

  function inject() {
    if (injecting) return;
    const host = document.querySelector(NATIVE_PREVIEW);
    if (!host) return;
    const fn = host.querySelector(".model_preview_filename")?.textContent;
    const title = host.querySelector(".model_preview_title")?.textContent;
    const m = modelFor(fn) || modelFor(title);
    if (!m) return;
    const current = host.querySelector(".rt-native-block");
    if (current?.dataset.for === m.filename) return;
    injecting = true;
    try {
      paintBlock(host, m);
    } finally {
      injecting = false;
    }
  }

  // ComfyUI mutates the DOM constantly; scanning on every single mutation saturates
  // the main thread. Coalesce to one pass per animation frame.
  let queued = false;
  const obs = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      rtGuard('inject', inject)();
      rtGuard('markRows', markRows)();
      rtGuard('decorateNativeTabs', decorateNativeTabs)();
      rtGuard('enhanceNativeWorkflows', enhanceNativeWorkflows)();
      rtGuard('enhanceNativeModels', enhanceNativeModels)();
      if (!window.__rtDiagAt || Date.now() - window.__rtDiagAt > 4000) {
        window.__rtDiagAt = Date.now();
        sendDiag();
      }
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
  rtGuard('inject', inject)();
  rtGuard('markRows', markRows)();
  rtGuard('decorateNativeTabs', decorateNativeTabs)();
  rtGuard('enhanceNativeWorkflows', enhanceNativeWorkflows)();
      rtGuard('enhanceNativeModels', enhanceNativeModels)();
      if (!window.__rtDiagAt || Date.now() - window.__rtDiagAt > 4000) {
        window.__rtDiagAt = Date.now();
        sendDiag();
      }
  console.log("[Roans-ComfyUI-Tools] ComfyUI's Models panel enhancer installed");
}

/* ---------------------------------------------------------- prompts tab */

function promptEditor(host, preset, onDone) {
  const form = el("div", "rt-form");
  const name = input(null, preset.name, "name");
  const positive = area(preset.positive, "positive prompt — tag style, comma separated");
  const negative = area(preset.negative, "negative prompt");
  const tags = input(null, (preset.tags || []).join(", "), "tags, comma separated");
  const wf = el("select", "rt-select");
  const none = el("option", null, "— no workflow attached —");
  none.value = "";
  wf.appendChild(none);
  for (const w of S.workflows) {
    const o = el("option", null, w.display_name || w.name);
    o.value = w.rel || w.file;
    wf.appendChild(o);
  }
  wf.value = preset.workflow || "";

  form.append(
    field("Name", name),
    field("Positive", positive),
    field("Negative", negative),
    field("Corresponding workflow", wf, "the workflow this prompt belongs to — lets you reopen it on the canvas"),
    field("Tags", tags)
  );
  const actions = el("div", "rt-actions");
  actions.append(
    btn(preset.id ? "update prompt" : "save prompt", "pri", async () => {
      if (!positive.value.trim()) return toast("positive prompt is empty", "warn");
      await api("/prompt", {
        id: preset.id,
        name: name.value,
        positive: positive.value,
        negative: negative.value,
        workflow: wf.value,
        tags: tags.value.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast(preset.id ? "prompt updated" : "prompt saved");
      await load();
      onDone();
    }),
    btn("cancel", null, () => onDone())
  );
  form.appendChild(actions);
  host.innerHTML = "";
  host.appendChild(form);
  positive.focus();
}

function renderPrompts(root) {
  injectStyles();
  root.innerHTML = "";
  // `rt-app` carries the metric variables (control height, surfaces, radius, muted
  // colour) that every control below reads through var(). Without it the Prompts
  // panel fell back to auto-sized buttons and unstyled labels — the one panel that
  // did not look like the others.
  const wrap = el("div", "rt rt-app");
  root.appendChild(wrap);

  // same title block as the Models and Workflows bars
  const ph = el("div", "rt-panel-head");
  ph.appendChild(el("span", "rt-panel-title", "Prompts"));
  ph.appendChild(el("span", "rt-spacer"));
  ph.appendChild(el("span", "rt-dim", `${S.prompts.length} prompts`));
  wrap.appendChild(ph);

  const bar = el("div", "rt-bar");
  // the divider belongs under the search/button row, not under the title
  const search = input("rt-grow", V.prompt.q, "search prompts, tags…");
  search.oninput = () => {
    V.prompt.q = search.value;
    paintPrompts();
  };
  const add = btn("+ new", "pri", () => {
    editorHost.innerHTML = "";
    promptEditor(editorHost, {}, () => {
      editorHost.innerHTML = "";
      paintPrompts();
    });
  });
  const grab = btn("from canvas", null, () => {
    const p = promptFromCanvas();
    if (!p) return;
    editorHost.innerHTML = "";
    promptEditor(editorHost, p, () => {
      editorHost.innerHTML = "";
      paintPrompts();
    });
  });
  grab.title = "pull the prompt out of the workflow that is open right now";
  const group = select(
    [["none", "group: none"], ["workflow", "group: workflow"], ["tag", "group: tag"], ["checkpoint", "group: checkpoint"]],
    V.prompt.group,
    (v) => {
      V.prompt.group = v;
      paintPrompts();
    }
  );
  bar.append(search, group, grab, add);
  wrap.appendChild(bar);

  const chips = el("div", "rt-chips");
  chips.style.cssText = "padding:0 8px 8px;";
  wrap.appendChild(chips);

  const editorHost = el("div");
  wrap.appendChild(editorHost);

  const list = el("div", "rt-scroll");
  wrap.appendChild(list);

  function paintChips() {
    chips.innerHTML = "";
    const counts = {
      all: S.prompts.length,
      saved: S.prompts.filter((p) => !p.derived).length,
      derived: S.prompts.filter((p) => p.derived).length,
    };
    for (const [k, label] of [["all", "all"], ["saved", "saved"], ["derived", "from workflows"]]) {
      const c = el("button", "rt-chip" + (V.prompt.kind === k ? " on" : ""), `${label} ${counts[k]}`);
      c.onclick = () => {
        V.prompt.kind = k;
        paintPrompts();
      };
      chips.appendChild(c);
    }
  }

  function card(p) {
    const c = el("div", "rt-card");
    const open = V.prompt.open.has(p.id);

    const head = el("div", "rt-head");
    const title = el("span", "rt-title", p.name || "(untitled)");
    title.style.cursor = "pointer";
    title.onclick = () => {
      if (V.prompt.open.has(p.id)) V.prompt.open.delete(p.id);
      else V.prompt.open.add(p.id);
      paintPrompts();
    };
    head.appendChild(title);
    head.appendChild(badge(p.derived ? "workflow" : "saved", p.derived ? undefined : "t"));
    if (p.checkpoint) head.appendChild(badge(p.checkpoint.replace(/\.safetensors$/, "")));
    for (const l of p.loras || []) head.appendChild(badge(l.replace(/\.safetensors$/, "")));
    for (const t of p.tags || []) head.appendChild(badge(t, "k"));
    head.appendChild(el("span", "rt-spacer"));
    head.appendChild(btn(open ? "less" : "more", "icon", () => {
      if (open) V.prompt.open.delete(p.id);
      else V.prompt.open.add(p.id);
      paintPrompts();
    }));
    c.appendChild(head);

    const pos = el("div", "rt-code" + (open ? " open" : ""), p.positive);
    c.appendChild(pos);

    const actions = el("div", "rt-actions");
    actions.append(
      btn("copy positive", null, () => copy(p.positive, "positive prompt")),
      btn("→ node", null, () => textToNode(p.positive, "positive")),
      btn("copy negative", p.negative ? null : "warn", () => {
        if (!p.negative) return toast("this prompt has no negative", "warn");
        copy(p.negative, "negative prompt");
      })
    );
    if (p.negative) {
      actions.appendChild(btn("→ node neg", null, () => textToNode(p.negative, "negative")));
    }
    if (p.negative && !open) {
      actions.appendChild(
        btn("show negative", null, () => {
          V.prompt.open.add(p.id);
          paintPrompts();
        })
      );
    }
    if (p.workflow) actions.appendChild(btn("open in canvas", null, () => openWorkflow(p.workflow)));
    if (p.derived) {
      actions.appendChild(btn("edit + attach workflow", null, () => {
        editorHost.innerHTML = "";
        promptEditor(editorHost, { ...p, id: undefined }, () => {
          editorHost.innerHTML = "";
          paintPrompts();
        });
      }));
      actions.appendChild(btn("save to library", "pri", () => {
        editorHost.innerHTML = "";
        promptEditor(editorHost, { ...p, id: undefined }, () => {
          editorHost.innerHTML = "";
          paintPrompts();
        });
      }));
    } else {
      actions.appendChild(btn("edit", null, () => {
        editorHost.innerHTML = "";
        promptEditor(editorHost, p, () => {
          editorHost.innerHTML = "";
          paintPrompts();
        });
      }));
      actions.appendChild(btn("duplicate", null, async () => {
        await api("/prompt", { name: p.name + " copy", positive: p.positive, negative: p.negative, workflow: p.workflow, tags: p.tags });
        await load();
        paintPrompts();
        toast("duplicated");
      }));
      actions.appendChild(btn("delete", "warn", async () => {
        await api("/prompt_delete", { id: p.id });
        await load();
        paintPrompts();
        toast("deleted");
      }));
    }
    c.appendChild(actions);

    if (open) {
      if (p.negative) {
        c.appendChild(el("div", "rt-sec", "negative"));
        c.appendChild(el("div", "rt-code open", p.negative));
      }
      if (p.workflow) {
        const row = el("div", "rt-actions");
        row.appendChild(el("span", "rt-dim", "workflow: " + p.workflow));
        c.appendChild(row);
      }
      if (p.note) c.appendChild(el("div", "rt-dim", p.note));
    }
    return c;
  }

  function paintPrompts() {
    paintChips();
    list.innerHTML = "";
    const q = V.prompt.q.trim().toLowerCase();
    const hit = (p) =>
      !q ||
      [p.name, p.positive, p.negative, (p.tags || []).join(" "), p.checkpoint, (p.loras || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    const saved = S.prompts.filter((p) => !p.derived && hit(p));
    const derived = S.prompts.filter((p) => p.derived && hit(p));
    const showSaved = V.prompt.kind !== "derived";
    const showDerived = V.prompt.kind !== "saved";
    const visible = [
      ...(showSaved ? saved : []),
      ...(showDerived ? derived : []),
    ];
    if (!visible.length) {
      list.appendChild(el("div", "rt-empty", "no prompts match"));
      return;
    }
    if (V.prompt.group !== "none") {
      const keyFns = {
        workflow: (p) => p.workflow || "(not attached)",
        checkpoint: (p) => (p.checkpoint || "").replace(/\.safetensors$/, "") || "(none)",
        tag: (p) => (p.tags || [])[0] || "(untagged)",
      };
      for (const [key, items] of groupItems(visible, keyFns[V.prompt.group])) {
        const { head, isOpen } = section("prompt:" + key, key, items.length, V.prompt.collapsed, paintPrompts);
        list.appendChild(head);
        if (isOpen) for (const p of items) list.appendChild(card(p));
      }
      return;
    }
    if (showSaved && saved.length) {
      list.appendChild(el("div", "rt-sec", `saved · ${saved.length}`));
      for (const p of saved) list.appendChild(card(p));
    }
    if (showDerived && derived.length) {
      list.appendChild(el("div", "rt-sec", `from your workflow files · ${derived.length}`));
      for (const p of derived) list.appendChild(card(p));
    }
  }

  paintPrompts();
  return paintPrompts;
}

/* ------------------------------------------------------------ registration */

let repaint = () => {};

/* ---------------- your pfp as a badge on the NATIVE tab buttons --------------- */

// The avatar is served out of our own web dir. It is gitignored — a fresh clone
// simply has no badge (img.onerror removes it), so nothing personal goes public.
const AVATAR_URL = "/extensions/Roans-ComfyUI-Tools/avatar.jpg";
const AVATAR_SIZE = 10; // px — the circle in the bottom-right of each icon
const AVATAR_GAP = 5; // px — the spacing, used for BOTH the top and the left offset
// Only the panels we are actively shaping carry the badge; the Node Library is
// ComfyUI's own and stays untouched until we work on it.
const AVATAR_TABS = ["workflows", "model-library", "roansPrompts"];

/**
 * Badges the sidebar tab buttons that this extension is enhancing. The buttons
 * themselves are ComfyUI's: we only append an <img> inside them, and set
 * position/overflow if the native styling would clip it. Vue re-renders the strip
 * from scratch, so this is called from an observer as well as on demand.
 *
 * Anchored top-right, not bottom-right: in the expanded sidebar the tab label sits
 * under the icon, so a bottom badge landed on the text.
 *
 * The left nudge is a transform, not `right`: this button's right edge sits against
 * the sidebar edge, so a `right` offset does not readably shift the badge (it slid
 * `top` fine but not `right`). translateX always applies.
 */
function decorateNativeTabs() {
  for (const id of AVATAR_TABS) {
    const btn = document.querySelector(`[data-testid="${id}-tab-button"]`);
    if (!btn || btn.querySelector(".rt-avatar-badge")) continue;
    const cs = getComputedStyle(btn);
    if (cs.position === "static") btn.style.position = "relative";
    if (cs.overflow === "hidden") btn.style.overflow = "visible";
    const img = el("img", "rt-avatar-badge");
    img.src = AVATAR_URL;
    img.alt = "";
    img.draggable = false;
    img.style.cssText = [
      "position:absolute",
      "right:0",
      `top:${AVATAR_GAP}px`,
      `transform:translateX(-${AVATAR_GAP}px)`,
      `width:${AVATAR_SIZE}px`,
      `height:${AVATAR_SIZE}px`,
      "border-radius:50%",
      "object-fit:cover",
      "pointer-events:none",
      "z-index:5",
      "box-shadow:0 0 0 1px rgba(0,0,0,.6)",
    ].join(";");
    img.onerror = () => img.remove(); // no avatar file -> no badge, no breakage
    btn.appendChild(img);
  }
  orderSidebarTabs();
}

/**
 * Prompts sits directly above Apps. ComfyUI appends extension tabs at the end of
 * the strip (`registerSidebarTab` only offers whole-array prepend), so the position
 * is enforced on the DOM and re-applied from the observer after each Vue re-render.
 * Idempotent: it does nothing once the button already precedes Apps.
 */
function orderSidebarTabs() {
  const ours = document.querySelector('[data-testid="roansPrompts-tab-button"]');
  const apps = document.querySelector('[data-testid="apps-tab-button"]');
  if (!ours || !apps) return;
  const strip = apps.parentElement;
  if (!strip || ours.parentElement !== strip) return;
  if (ours.nextElementSibling === apps) return;
  strip.insertBefore(ours, apps);
}

/* ---- error reporting -------------------------------------------------------- */

// If anything in here throws, the page tells the backend instead of dying quietly.
function rtErr(where, err) {
  try {
    fetch("/Roans-ComfyUI-Tools/api/err", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        where,
        message: (err && (err.message || String(err))) || "unknown",
        stack: (err && err.stack ? String(err.stack).slice(0, 600) : ""),
        at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    /* nothing left to do */
  }
  console.warn("[Roans-ComfyUI-Tools]", where, err);
}
window.addEventListener("error", (e) => {
  if ((e.filename || "").includes("Roans-ComfyUI-Tools")) rtErr("window.onerror " + (e.lineno || ""), e.error || new Error(e.message));
});
window.addEventListener("unhandledrejection", (e) => {
  const r = e.reason;
  if (String(r && (r.stack || r.message || r)).includes("Roans-ComfyUI-Tools")) rtErr("unhandledrejection", r);
});

function rtGuard(where, fn) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (err) {
      rtErr(where, err);
      return undefined;
    }
  };
}

/* ---- tab-aware injection ---------------------------------------------------- */

// The sidebar keeps tab panels in the DOM, so injecting into a panel blindly can
// leave our bar sitting on top of a completely different tab. Rule: our bar only
// exists while its own tab is the selected one — otherwise it is removed again.
function tabIsActive(tabId) {
  const b =
    document.querySelector(`[data-testid="${tabId}-tab-button"]`) ||
    document.querySelector(`[data-testid="${tabId}-tab"]`);
  if (!b) return null; // unknown: caller falls back to visibility
  const sel = b.getAttribute("aria-selected");
  if (sel != null) return sel === "true";
  const state = b.getAttribute("data-state");
  if (state) return state === "active";
  const cls = (b.className || "").toString();
  return /active|selected|current/.test(cls);
}

// Panels we took over: hide ComfyUI's own list so there is only ever ONE way to
// pick something. Restored the moment our bar goes away.
let _rtHidden = [];

function hideNativeSiblings(host, bar) {
  // ComfyUI's tab template puts its own search box and list in slots around the
  // panel body, so hiding only the panel's children is not enough. Walk up from
  // our bar and darken every branch that does not lead to it.
  // Safety: never touch a container that holds the tab buttons themselves.
  let container = host;
  for (let i = 0; i < 4 && container && container.parentElement; i += 1) {
    container = container.parentElement;
    if (container.classList && container.classList.contains("comfy-vue-side-bar-container")) break;
  }
  if (!container || !container.contains(bar)) return false;
  if (container.querySelector("[data-testid$='-tab-button']")) return false;
  let hid = 0;
  const walk = (node) => {
    for (const child of [...node.children]) {
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") continue;
      // Our own bar contains itself — descending into it would hide its contents.
      if (child === bar) continue;
      if (child.contains(bar)) {
        walk(child); // keep descending along the path to our bar
        continue;
      }
      if (child.dataset.rtHidden === "1") continue;
      child.dataset.rtHidden = "1";
      child.style.display = "none";
      _rtHidden.push(child);
      hid += 1;
    }
  };
  walk(container);
  RT_STATS.hides += 1;
  if (hid) console.log(`[Roans-ComfyUI-Tools] hid ${hid} native element(s) behind the takeover`);
  return hid > 0;
}

function showNativeSiblings() {
  for (const el of document.querySelectorAll("[data-rt-hidden]")) {
    delete el.dataset.rtHidden;
    el.style.display = "";
  }
  _rtHidden = [];
}

// A percentage height has nothing definite to resolve against inside ComfyUI's
// scroll panel, so the bar either leaves a gap or grows to its full content.
// Measure the viewport once and pin the bar to it; the list scrolls inside.
function fitBarToViewport(bar) {
  const view =
    document.querySelector(".comfy-vue-side-bar-body") ||
    document.querySelector(".comfy-vue-side-bar-container") ||
    bar.closest(".p-scrollpanel");
  const h = view && view.clientHeight;
  if (h) bar.style.height = `${h}px`;
}
window.addEventListener("resize", () => {
  document.querySelectorAll(".rt-wf-bar, .rt-md-bar").forEach(fitBarToViewport);
});

function guardInjection(tabId, barSelector, findHost, build, label, options = {}) {
  const active = tabIsActive(tabId);
  let bar = document.querySelector(barSelector);
  if (active === false) {
    if (bar) {
      bar.remove(); // switched away: leave no trace behind
      showNativeSiblings();
    }
    return;
  }
  const host = findHost();
  if (bar && (!host || !host.contains(bar))) {
    bar.remove();
    showNativeSiblings();
    bar = null;
  }
  if (!host) return;
  if (active === null && !host.getClientRects().length) return;
  if (!bar) {
    injectStyles();
    bar = build();
    host.prepend(bar);
    console.log(`[Roans-ComfyUI-Tools] ${label} browser mounted`);
  }
  if (options.takeover) hideNativeSiblings(host, bar);
  fitBarToViewport(bar);
}

function reportDiag() {
  const chainOf = (el) => {
    const out = [];
    let n = el;
    while (n && n !== document.body) {
      const cls =
        typeof n.className === "string" && n.className.trim()
          ? "." + n.className.trim().split(/\s+/).slice(0, 3).join(".")
          : "";
      out.push(n.tagName.toLowerCase() + cls);
      n = n.parentElement;
    }
    return out;
  };
  const panels = [
    ["comfyui-workflows-panel", document.querySelector("comfyui-workflows-panel")],
    ["comfyui-workflows-browse", document.querySelector("comfyui-workflows-browse")],
    ["comfyui-workflows-search-panel", document.querySelector("comfyui-workflows-search-panel")],
    ["model-lib-tree-explorer", document.querySelector(".model-lib-tree-explorer")],
  ].map(([name, el]) => ({
    name,
    found: !!el,
    visible: !!(el && el.getClientRects().length),
    chain: el ? chainOf(el).slice(0, 6) : [],
  }));
  const bars = [...document.querySelectorAll(".rt-wf-bar, .rt-md-bar")].map((b) => ({
    kind: b.className,
    visible: !!b.getClientRects().length,
    chain: chainOf(b).slice(0, 7),
  }));
  const tabs = [...document.querySelectorAll("[data-testid$='-tab-button']")].map((t) => ({
    testid: t.getAttribute("data-testid"),
    attrs: [...t.attributes]
      .map((a) => `${a.name}=${a.value}`)
      .filter((a) => !a.startsWith("class=") && !a.startsWith("style=")),
    cls: (t.className || "").toString(),
  }));
  // How many tab bodies exist at once, and which one is on screen?
  const body =
    document.querySelector(".comfy-vue-side-bar-body .p-scrollpanel-content") ||
    document.querySelector(".comfy-vue-side-bar-body");
  const bodyKids = body
    ? [...body.children].map((k) => ({
        tag: k.tagName.toLowerCase(),
        cls: (k.className || "").toString().slice(0, 70),
        visible: !!k.getClientRects().length,
        text: (k.innerText || "").replace(/\s+/g, " ").slice(0, 50),
      }))
    : [];
  const hiddenNow = [...document.querySelectorAll("[data-rt-hidden]")].map((el) => ({
    tag: el.tagName.toLowerCase(),
    cls: (el.className || "").toString().slice(0, 50),
    text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 40),
  }));
  const barParentKids = (() => {
    const b = document.querySelector(".rt-wf-bar");
    const p = b && b.parentElement;
    return p ? [...p.children].map((k) => ({ tag: k.tagName.toLowerCase(), cls: (k.className || "").toString().slice(0, 40), display: k.style.display, visible: !!k.getClientRects().length })) : [];
  })();
  const anyBar = document.querySelector(".rt-wf-bar, .rt-md-bar");
  const panelHost = anyBar && anyBar.parentElement;
  const fill = {
    barH: anyBar ? Math.round(anyBar.getBoundingClientRect().height) : 0,
    hostH: panelHost ? Math.round(panelHost.getBoundingClientRect().height) : 0,
    outerH: panelHost && panelHost.parentElement ? Math.round(panelHost.parentElement.getBoundingClientRect().height) : 0,
    viewH: (document.querySelector(".comfy-vue-side-bar-body") || {}).clientHeight || 0,
  };
  const ctl = [...document.querySelectorAll(".rt-app .rt-btn, .rt-app .rt-input, .rt-app .rt-select")]
    .slice(0, 14)
    .map((e) => `${Math.round(e.getBoundingClientRect().height)}x${Math.round(e.getBoundingClientRect().width)}`);
  const PROPS = [
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "color", "backgroundColor",
    "borderWidth", "borderStyle", "borderColor", "borderRadius", "paddingTop", "paddingRight",
    "paddingBottom", "paddingLeft", "height", "gap", "opacity", "cursor",
  ];
  const native = {};
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  native.tokens = {};
  for (const t of [
    "--fg-color", "--bg-color", "--comfy-menu-bg", "--comfy-menu-secondary-bg", "--comfy-input-bg",
    "--border-color", "--descrip-text", "--input-text", "--primary-bg", "--primary-hover-bg",
    "--p-primary-color", "--color-charcoal-700", "--button-surface", "--button-hover-surface",
    "--p-content-border-radius", "--p-text-muted-color", "--p-surface-100",
  ]) {
    native.tokens[t] = cssVar(t);
  }
  for (const sel of [
    "body",
    "[data-testid='node-library-tab-button']",
    "[data-testid='apps-tab-button']",
    ".comfy-vue-side-bar-container",
    "p-scrollpanel, .p-scrollpanel",
    "input.p-inputtext, .p-inputtext",
    ".p-button",
    ".p-select",
    ".p-select-label",
    ".p-tree-node-content",
    ".model-lib-tree-explorer",
    "comfyui-workflows-search-panel input",
    ".p-divider",
    ".side-bar-panel, .sidebar-content-container",
  ]) {
    const el2 = document.querySelector(sel);
    if (!el2) {
      native[sel] = "absent";
      continue;
    }
    const cs = getComputedStyle(el2);
    const out = {};
    for (const p of PROPS) out[p] = String(cs[p]).slice(0, 40);
    native[sel] = out;
  }
  // Style census of ComfyUI's own sidebar: group its elements by shape and report
  // the computed values, so our CSS can copy the real thing instead of guessing.
  const census = (() => {
    const root =
      document.querySelector(".sidebar-content-container") ||
      document.querySelector(".comfy-vue-side-bar-container") ||
      document.querySelector(".side-bar-panel");
    if (!root) return "no sidebar root";
    const seen = new Map();
    for (const e of root.querySelectorAll("*")) {
      if (e.closest(".rt-app")) continue; // our own stuff does not count
      const cls = (e.className || "").toString().trim().split(/\s+/).slice(0, 2).join(".");
      const key = `${e.tagName.toLowerCase()}${cls ? "." + cls : ""}`;
      if (seen.has(key)) {
        seen.get(key).n += 1;
        continue;
      }
      const cs = getComputedStyle(e);
      seen.set(key, {
        n: 1,
        key,
        font: cs.fontSize,
        weight: cs.fontWeight,
        h: Math.round(e.getBoundingClientRect().height) + "px",
        pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(" "),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        fg: cs.color,
        border: cs.borderWidth + " " + cs.borderColor,
        gap: cs.gap,
      });
    }
    return [...seen.values()]
      .filter((v) => v.n >= 2 || /input|button|a$/.test(v.key))
      .slice(0, 30);
  })();
  // structural check of the new rows: no buttons left, menus and drag wired
  const rowCheck = (() => {
    const card = document.querySelector(".rt-wf-bar .rt-card");
    const folderRow = document.querySelector(".rt-wf-bar .rt-folder");
    const out = {};
    if (card) {
      out.workflowRow = {
        buttons: [...card.querySelectorAll(".rt-head > button")].map((b) => b.textContent.trim()),
        draggable: card.draggable,
        hasMenu: typeof card.oncontextmenu === "function",
        hasDrop: typeof card.ondrop === "function",
      };
    }
    if (folderRow) {
      out.folderRow = {
        buttons: [...folderRow.querySelectorAll("button")].map((b) => b.textContent.trim() || "(icon)"),
        hasFolderIcon: !!folderRow.querySelector(".rt-ficon svg"),
        hasMenu: typeof folderRow.oncontextmenu === "function",
        hasDrop: typeof folderRow.ondrop === "function",
      };
    }
    return out;
  })();
  const hit = (() => {
    const b = document.querySelector(".rt-wf-bar .rt-btn.icon:last-child");
    if (!b) return "no folder button";
    const r = b.getBoundingClientRect();
    if (!r.width) return "button has zero size";
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      at: `${Math.round(r.left + r.width / 2)},${Math.round(r.top + r.height / 2)}`,
      buttonRect: `${Math.round(r.width)}x${Math.round(r.height)} @ ${Math.round(r.left)},${Math.round(r.top)}`,
      topmost: top ? `${top.tagName.toLowerCase()}.${(top.className || "").toString().slice(0, 40)}` : "nothing",
      isTheButton: top === b,
    };
  })();
  const descNow = V.wf.desc;
  const slot = document.querySelector(".rt-folderslot");
  const folderUi = { open: !!slot && slot.childElementCount > 0, newFolder: String(V.wf.newFolder) };
  const integrity = {
    wfRows: document.querySelectorAll(".rt-wf-bar .rt-card").length,
    wfNamed: document.querySelectorAll(".rt-wf-bar .rt-card .rt-title").length,
    mdRows: document.querySelectorAll(".rt-md-bar .rt-card").length,
    mdNamed: document.querySelectorAll(".rt-md-bar .rt-card .rt-title").length,
  };
  const mdRow = document.querySelector(".rt-md-bar .rt-card");
  const mdRowTitle = mdRow && mdRow.querySelector(".rt-title");
  const mdRowInfo = mdRow
    ? {
        text: (mdRow.innerText || "").replace(/\s+/g, " ").slice(0, 90),
        titleText: mdRowTitle ? mdRowTitle.textContent : "(no .rt-title element)",
        titleWidth: mdRowTitle ? Math.round(mdRowTitle.getBoundingClientRect().width) : 0,
        rowWidth: Math.round(mdRow.getBoundingClientRect().width),
        badges: [...mdRow.querySelectorAll(".rt-badge")].map((b) => b.textContent),
      }
    : "(no model row found)";
  const styleTag = document.getElementById("rt-styles");
  const card = document.querySelector(".rt-card");
  const styles = {
    tag: !!styleTag,
    rules: styleTag && styleTag.sheet ? styleTag.sheet.cssRules.length : 0,
    cardFound: !!card,
    cardBg: card ? getComputedStyle(card).backgroundColor : "",
    cardPad: card ? getComputedStyle(card).padding : "",
    cardRadius: card ? getComputedStyle(card).borderRadius : "",
    cardFont: card ? getComputedStyle(card).fontSize : "",
  };
  // "folders will not open" needs the rendered result, not the intent: what the
  // workflows tree actually contains, and what each folder row looks like.
  const wfTree = (() => {
    const tree = document.querySelector(".rt-wf-bar .rt-scroll");
    if (!tree) return "no workflows tree mounted";
    return {
      children: tree.children.length,
      folders: [...tree.querySelectorAll(".rt-folder")].map((f) => ({
        label: (f.querySelector(".rt-name") || {}).textContent || "",
        caret: (f.querySelector("button") || {}).textContent || "",
        fold: (f.dataset || {}).rtKey || "",
        ml: f.style.marginLeft || "",
      })),
      cards: tree.querySelectorAll(".rt-card").length,
      cardsMl: [...tree.querySelectorAll(".rt-card")].slice(0, 6).map((c) => c.style.marginLeft || ""),
      rows: [...tree.children].slice(0, 16).map((c) => ({
        cls: (c.className || "").toString().trim(),
        text: (c.innerText || "").replace(/\s+/g, " ").trim().slice(0, 44),
        ml: c.style.marginLeft || "",
        h: Math.round(c.getBoundingClientRect().height),
      })),
    };
  })();
  // Vertical rhythm of our own labels: the "sections jump closer together" report
  // is a spacing question, so measure it instead of eyeballing CSS.
  const spacing = (() => {
    const out = {};
    const nt = document.querySelector(".comfy-vue-side-bar-header span.truncate.font-bold");
    out.nativeTitle = nt
      ? (() => {
          const cs = getComputedStyle(nt);
          const hr = nt.closest(".comfy-vue-side-bar-header");
          return {
            text: (nt.textContent || "").slice(0, 40),
            font: cs.fontSize,
            weight: cs.fontWeight,
            color: cs.color,
            headerH: hr ? Math.round(hr.getBoundingClientRect().height) : 0,
            headerPad: hr ? getComputedStyle(hr).padding : "",
          };
        })()
      : "no native panel title in this build";
    for (const sel of [".rt-wf-bar", ".rt-md-bar"]) {
      const bar = document.querySelector(sel);
      if (!bar) continue;
      const own = bar.querySelector(".rt-panel-title");
      if (own) {
        const cs = getComputedStyle(own);
        const hd = own.closest(".rt-panel-head");
        out[sel + " title"] = {
          text: (own.textContent || "").slice(0, 40),
          font: cs.fontSize,
          weight: cs.fontWeight,
          headerH: hd ? Math.round(hd.getBoundingClientRect().height) : 0,
        };
      }
      const box = (e) => ({
        cls: (e.className || "").toString().trim().slice(0, 24),
        h: Math.round(e.getBoundingClientRect().height),
        pad: getComputedStyle(e).padding,
        gap: getComputedStyle(e).gap,
      });
      const list = bar.querySelector(".rt-scroll");
      out[sel] = {
        listGap: list ? getComputedStyle(list).gap : "",
        labels: [...bar.querySelectorAll(".rt-sec")].map((s) => {
          const cs = getComputedStyle(s);
          return { t: (s.textContent || "").slice(0, 22), font: cs.fontSize, weight: cs.fontWeight, color: cs.color };
        }),
        // where the crowding happens: each child's box and the step to the next one
        cards: [...bar.querySelectorAll(".rt-card, .rt-folder")].slice(0, 3).map((c) => ({
          ...box(c),
          kids: [...c.children].map((k) => ({ ...box(k), top: Math.round(k.getBoundingClientRect().top) })),
        })),
      };
      // "spacing changes once a scrollbar shows up": measure the scrollport itself,
      // the pixel step between the first rows, and how tall the badge line got (a
      // narrower card wraps its badges, which reads as tighter rows).
      const sc = (e) =>
        e
          ? {
              cls: (e.className || "").toString().trim().slice(0, 28),
              w: e.clientWidth,
              offW: e.offsetWidth,
              sb: e.offsetWidth - e.clientWidth,
              h: e.clientHeight,
              sh: e.scrollHeight,
              over: e.scrollHeight - e.clientHeight,
              gap: getComputedStyle(e).gap,
              pad: getComputedStyle(e).padding,
              gutter: getComputedStyle(e).scrollbarGutter || "",
            }
          : null;
      const kids = list ? [...list.children] : [];
      out[sel + " scroll"] = {
        ours: sc(list),
        native: sc(bar.closest(".p-scrollpanel")),
        barH: Math.round(bar.getBoundingClientRect().height),
        steps: kids.slice(1, 5).map((k, i) => Math.round(k.getBoundingClientRect().top - kids[i].getBoundingClientRect().bottom)),
        kidH: kids.slice(0, 5).map((k) => Math.round(k.getBoundingClientRect().height)),
        badgeH: [...bar.querySelectorAll(".rt-card")].slice(0, 3).map((c) => {
          const b = c.querySelector(".rt-badges");
          return b ? Math.round(b.getBoundingClientRect().height) : 0;
        }),
      };
    }
    return out;
  })();
  return {
    client: RT_CLIENT,
    dpr: devicePixelRatio,
    styles,
    fill,
    menuOpened: RT_STATS.menuOpened || 0,
    lastMenuAt: RT_STATS.lastMenuAt || null,
    lastMenuError: RT_STATS.lastMenuError || null,
    events: RT_EVENTS.slice(-24),
    rowCheck,
    census,
    native,
    wfQ: V.wf.q,
    wfSortState: `${V.wf.sort}/${V.wf.desc}`,
    hit,
    descNow,
    stats: RT_STATS,
    folderUi,
    integrity,
    mdRow: mdRowInfo,
    controlSizes: ctl,
    href: location.href,
    width: innerWidth,
    ready: document.readyState,
    bodyKidsN: document.body ? document.body.children.length : -1,
    bodyHead: document.body ? document.body.innerHTML.slice(0, 200) : "",
    hasCanvas: !!document.querySelector("#graph-canvas, canvas"),
    tabCount: document.querySelectorAll("[data-testid$='-tab-button']").length,
    panels,
    bars,
    tabs,
    bodyKids,
    hiddenNow,
    barParentKids,
    at: new Date().toISOString(),
    wfTree,
    spacing,
  };
}

async function sendDiag() {
  let body;
  try {
    body = JSON.stringify(reportDiag());
  } catch (e) {
    // the report itself failing must never be silent again
    try {
      await fetch("/Roans-ComfyUI-Tools/api/err", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ where: "reportDiag", message: String(e && e.message), stack: String((e && e.stack) || "").slice(0, 500) }),
      });
    } catch (_) {
      /* nothing else to try */
    }
    return;
  }
  try {
    await fetch("/Roans-ComfyUI-Tools/api/diag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (e) {
    /* network hiccup: next tick will retry */
  }
}

/* ------- ComfyUI's own Workflows panel: folders, subfolders, sort, pins ------ */

// ComfyUI's workflow list is flat and searched by filename. This injects a real
// browser into the native panel: nested folders, sorting (name / custom / recent,
// either direction), pins, rename and move — all backed by our API.
const WF_PANEL = ".comfyui-workflows-panel, .comfyui-workflows-browse";
const ROOT_KEY = "";

function wfHaystack(w) {
  return [
    w.display_name,
    w.name,
    w.rel,
    w.checkpoint,
    w.positive,
    w.negative,
    (w.loras || []).map((l) => l.name).join(" "),
    w.sampler?.sampler,
    w.sampler?.scheduler,
    w.size,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function wfMatches(w) {
  const terms = V.wf.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = wfHaystack(w);
  return terms.every((t) => hay.includes(t));
}

function wfSorted(items) {
  const { sort, desc } = V.wf;
  const key = {
    name: (w) => (w.display_name || w.name).toLowerCase(),
    custom: (w) => (w.order == null ? Number.MAX_SAFE_INTEGER : w.order),
    recent: (w) => w.modified,
  }[sort] || ((w) => w.modified);
  const sorted = items.slice().sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0;
    return desc ? -cmp : cmp;
  });
  // pins win over any sort order
  return sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

function folderIcon(withPlus) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const body = document.createElementNS(NS, "path");
  body.setAttribute("d", "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z");
  svg.appendChild(body);
  if (withPlus) {
    const plus = document.createElementNS(NS, "path");
    plus.setAttribute("d", "M12 13.5h5M14.5 11v5");
    svg.appendChild(plus);
  }
  return svg;
}

/* ---------------------------------------------------------------- click menu --
   Everything a row used to show as buttons lives here: rename, move, remove. */
function closeContextMenu() {
  document.querySelectorAll(".rt-menu").forEach((m) => m.remove());
}
document.addEventListener("click", () => closeContextMenu());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeContextMenu();
});

function contextMenu(ev, items) {
  ev.preventDefault();
  ev.stopPropagation();
  closeContextMenu();
  const menu = el("div", "rt-menu");
  menu.onclick = (e) => e.stopPropagation();
  for (const it of items) {
    if (!it) continue;
    if (it.separator) {
      menu.appendChild(el("div", "rt-menu-sep"));
      continue;
    }
    if (it.header) {
      menu.appendChild(el("div", "rt-menu-head", it.header));
      continue;
    }
    const item = el("button", "rt-menu-item" + (it.danger ? " danger" : ""), it.label);
    if (it.disabled) {
      item.disabled = true;
      menu.appendChild(item);
      continue;
    }
    item.onclick = async () => {
      closeContextMenu();
      try {
        await it.action();
      } catch (e) {
        toast(String(e.message || e), "error");
      }
    };
    menu.appendChild(item);
  }
  // Append inside the app root (not body): that keeps the menu in the same
  // stacking context as the UI, so nothing ComfyUI draws can cover it.
  const host =
    document.querySelector(".sidebar-content-container") ||
    document.querySelector("#app") ||
    document.body;
  host.appendChild(menu);
  menu.style.zIndex = "2147483000";
  const r = menu.getBoundingClientRect();
  menu.style.left = `${Math.min(ev.clientX, window.innerWidth - r.width - 8)}px`;
  menu.style.top = `${Math.min(ev.clientY, window.innerHeight - r.height - 8)}px`;
}

// Rows only carry data attributes; the menu itself is built here from that data.
// The listener sits on window in the CAPTURE phase so it runs before anything
// ComfyUI has wired up higher in the tree, which otherwise swallows the event.
function menuFor(kind, key) {
  if (kind === "wf") {
    const w = S.workflows.find((x) => x.rel === key);
    if (!w) return null;
    return [
      { label: "Open", action: () => openWorkflow(w.rel) },
      { label: "Rename…", action: () => { V.wf.editing = w.rel; V.wf.renaming = null; paint(); } },
      { separator: true },
      ...(w.folder
        ? [
            { label: "Remove from folder", action: () => moveWorkflowTo(w.rel, "") },
            { separator: true },
            { header: "move to folder" },
          ]
        : [{ header: "add to folder" }]),
      { label: "New folder…", action: () => newFolderFiling(w.rel) },
      ...folderList()
        .filter((f) => f !== (w.folder || ""))
        .map((f) => ({ label: f, action: () => moveWorkflowTo(w.rel, f) })),
      { separator: true },
      { label: "Move to trash", danger: true, action: () => trashWorkflow(w) },
    ];
  }
  if (kind === "space") {
    return [
      { label: "New folder…", action: () => RT_FOLDER_INPUT && RT_FOLDER_INPUT("") },
      { separator: true },
      { label: "Rescan library", action: async () => { await load(true); paint(); toast("rescanned"); } },
    ];
  }
  if (kind === "folder") {
    const folder = key;
    const meta = wfFolderMetaOf(folder);
    return [
      { label: "New subfolder…", action: () => RT_FOLDER_INPUT && RT_FOLDER_INPUT(folder) },
      { label: "Rename folder…", action: () => { V.wf.renaming = folder; V.wf.editing = null; paint(); } },
      { label: meta.pinned ? "Unpin folder" : "Pin folder to top", action: async () => {
          await api("/wf_folder", { folder, pinned: !meta.pinned });
          await load();
          paint();
        } },
      { separator: true },
      { label: "Move folder to trash", danger: true, action: async () => {
          try {
            await api("/wf_rmdir", { folder });
            await load(true);
            toast("folder moved to .trash");
          } catch (e) {
            toast(String(e.message || e), "error");
          }
          paint();
        } },
    ];
  }
  return null;
}

if (!window.__rtMenuHooked) {
  window.__rtMenuHooked = true;
  window.addEventListener(
    "contextmenu",
    (ev) => {
      const row = ev.target && ev.target.closest && ev.target.closest("[data-rt-kind]");
      if (!row) return;
      const items = menuFor(row.dataset.rtKind, row.dataset.rtKey);
      RT_STATS.menuOpened = (RT_STATS.menuOpened || 0) + 1;
      RT_STATS.lastMenuAt = `${Math.round(ev.clientX)},${Math.round(ev.clientY)}`;
      if (!items) {
        RT_STATS.lastMenuError = `no menu defined for ${row.dataset.rtKind}:${row.dataset.rtKey}`;
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      contextMenu(ev, items);
    },
    true
  );
}

function folderList() {
  return (S.wfFolders || []).slice().sort();
}

// "New folder…" from a workflow's menu: make the folder AND file the workflow
// into it, so there is never a dead end when no folders exist yet.
async function newFolderFiling(rel) {
  if (!RT_FOLDER_INPUT) return;
  RT_FOLDER_INPUT("", async (created) => {
    if (created && rel) await moveWorkflowTo(rel, created);
  });
}

async function moveWorkflowTo(rel, folder) {
  try {
    await api("/wf_move", { rel, folder });
    await load(true);
    toast(folder ? `moved into ${folder}` : "moved to the root");
  } catch (e) {
    toast(String(e.message || e), "error");
  }
  paint();
}

async function trashWorkflow(w) {
  try {
    await api("/wf_delete", { rel: w.rel });
    await load(true);
    toast(`"${w.display_name || w.name}" moved to .trash`);
  } catch (e) {
    toast(String(e.message || e), "error");
  }
  paint();
}

// Drop a workflow onto another one: same folder means reorder, otherwise it is a
// move first and then an insert at that spot in the target folder.
async function dropOntoWorkflow(draggedRel, target) {
  const folder = target.folder || "";
  const base = draggedRel.split("/").pop();
  const from = draggedRel.split("/").slice(0, -1).join("/");
  let rel = draggedRel;
  if (from !== folder) {
    await api("/wf_move", { rel: draggedRel, folder });
    rel = folder ? `${folder}/${base}` : base;
  }
  const list = S.workflows
    .filter((w) => (w.folder || "") === folder && w.rel !== draggedRel && w.rel !== rel)
    .sort((a, b) => (a.order == null ? 1e9 : a.order) - (b.order == null ? 1e9 : b.order))
    .map((w) => w.rel);
  const at = list.indexOf(target.rel);
  list.splice(at < 0 ? list.length : at, 0, rel);
  await api("/wf_order", { rels: list });
  V.wf.sort = "custom";
  await load(true);
  toast("order saved (custom)");
  paint();
}

function dragPayload(ev, value) {
  ev.dataTransfer.setData("text/plain", value);
  ev.dataTransfer.effectAllowed = "move";
}

function wfFolderMetaOf(folder) {
  return (S.wfFolderMeta || {})[folder] || {};
}
function wfFolderSort(a, b) {
  const ma = wfFolderMetaOf(a);
  const mb = wfFolderMetaOf(b);
  if (!!mb.pinned !== !!ma.pinned) return mb.pinned ? 1 : -1;
  const oa = ma.order == null ? Number.MAX_SAFE_INTEGER : ma.order;
  const ob = mb.order == null ? Number.MAX_SAFE_INTEGER : mb.order;
  if (oa !== ob) return oa - ob;
  return a.localeCompare(b);
}

function buildWorkflowBar() {
  RT_STATS.wfBuilds += 1;
  const bar = el("div", "rt-wf-bar rt-app");
  bar.style.cssText =
    "display:flex;flex-direction:column;gap:8px;padding:8px;";

  // same title block as the Models and Prompts panels
  const ph = el("div", "rt-panel-head");
  ph.style.margin = "-8px -8px 0";
  ph.appendChild(el("span", "rt-panel-title", "Workflows"));
  ph.appendChild(el("span", "rt-spacer"));
  ph.appendChild(el("span", "rt-dim", `${S.workflows.length} workflows`));
  bar.appendChild(ph);

  const toolbar = el("div", "rt-head rt-toolbar");
  const search = input("rt-grow", V.wf.q, "search workflows…");
  search.oninput = () => {
    V.wf.q = search.value;
    paint();
  };
  const sort = select(
    [
      ["recent", "recent"],
      ["name", "name"],
      ["custom", "custom"],
    ],
    V.wf.sort,
    (v) => {
      V.wf.sort = v;
      paint();
    }
  );
  const dir = btn(V.wf.desc ? "↓" : "↑", "icon", () => {
    RT_STATS.dirClicks = (RT_STATS.dirClicks || 0) + 1;
    V.wf.desc = !V.wf.desc;
    paint();
  });
  dir.title = V.wf.desc ? "descending — click for ascending" : "ascending — click for descending";
  toolbar.append(search, sort, dir);
  bar.appendChild(toolbar);

  // The name field opens here, right under the button that opened it — not at
  // the end of a long list where it cannot be seen.
  const folderSlot = el("div", "rt-folderslot");
  bar.appendChild(folderSlot);

  const tree = el("div", "rt-scroll");
  tree.style.cssText = "flex:1 1 auto;min-height:0;overflow-y:auto;padding-top:4px;";
  tree.dataset.rtKind = "space";
  tree.dataset.rtKey = "";
  bar.appendChild(tree);

  RT_FOLDER_INPUT = (prefix, onCreated) => {
    V.wf.newFolder = prefix || "";
    folderSlot.innerHTML = "";
    const row = el("div", "rt-newfolder");
    const name = input("rt-grow", prefix ? prefix + "/" : "", "folder name");
    const go = btn("create", "pri", async () => {
      if (!name.value.trim()) return;
      try {
        const created = name.value.trim();
        await api("/wf_mkdir", { folder: created });
        await load(true);
        toast("folder created");
        if (onCreated) await onCreated(created);
      } catch (e) {
        toast("could not create it: " + e, "error");
      }
      V.wf.newFolder = null;
      folderSlot.innerHTML = "";
      paint();
    });
    const cancel = btn("cancel", null, () => {
      V.wf.newFolder = null;
      folderSlot.innerHTML = "";
    });
    name.onkeydown = (ev) => {
      if (ev.key === "Enter") go.click();
      if (ev.key === "Escape") cancel.click();
    };
    row.append(name, go, cancel);
    folderSlot.appendChild(row);
    name.focus();
  };

  function workflowRow(w, depth) {
    const card = el("div", "rt-card");
    card.style.marginLeft = `${depth * 10}px`;

    const row = el("div", "rt-head");
    const star = btn(w.pinned ? "★" : "☆", w.pinned ? "icon on" : "icon", async () => {
      await api("/wf_meta", { rel: w.rel, pinned: !w.pinned });
      await load();
      paint();
    });
    star.title = w.pinned ? "unpin" : "pin to the top";
    row.appendChild(star);

    const title = el("span", "rt-title", w.display_name || w.name);
    title.style.cursor = "pointer";
    title.title = "open " + w.rel;
    title.onclick = () => openWorkflow(w.rel);
    row.appendChild(title);

    row.appendChild(el("span", "rt-spacer"));
    card.appendChild(row);

    // who this row is — the menu is built by the global contextmenu listener
    card.dataset.rtKind = "wf";
    card.dataset.rtKey = w.rel;

    // drag a workflow onto another one to reorder, onto a folder to file it
    card.draggable = true;
    card.ondragstart = (ev) => dragPayload(ev, `wf:${w.rel}`);
    card.ondragover = (ev) => {
      if (!String(ev.dataTransfer.types).includes("text/plain")) return;
      ev.preventDefault();
      card.classList.add("drop-before");
    };
    card.ondragleave = () => card.classList.remove("drop-before");
    card.ondrop = async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      card.classList.remove("drop-before");
      const payload = ev.dataTransfer.getData("text/plain");
      if (!payload.startsWith("wf:")) return;
      const dragged = payload.slice(3);
      if (dragged === w.rel) return;
      await dropOntoWorkflow(dragged, w);
    };

    // model badges live on their own line: long checkpoint names pushed the
    // row buttons onto a second row and made the card look broken.
    const wfBadges = [];
    if (w.checkpoint) wfBadges.push(badge(w.checkpoint.replace(/\.safetensors$/, ""), "t"));
    for (const l of w.loras || []) wfBadges.push(badge(l.name.replace(/\.safetensors$/, ""), "k"));
    if (w.sampler && w.sampler.sampler) wfBadges.push(badge(w.sampler.sampler));
    if (wfBadges.length) {
      const b = el("div", "rt-badges");
      for (const x of wfBadges) b.appendChild(x);
      card.appendChild(b);
    }

    if (V.wf.editing === w.rel) {
      const edit = el("div", "rt-head");
      const name = input("rt-grow", w.display_name || w.name, "display name");
      edit.append(
        name,
        btn("save", "pri", async () => {
          await api("/wf_meta", { rel: w.rel, name: name.value.trim() });
          await load();
          V.wf.editing = null;
          toast("renamed in the list (the file keeps its name)");
          paint();
        }),
        btn("cancel", null, () => {
          V.wf.editing = null;
          paint();
        })
      );
      card.appendChild(edit);
    }

    if (V.wf.moving === w.rel) {
      const move = el("div", "rt-head");
      const target = select(
        [[ROOT_KEY, "(root)"], ...(S.wfFolders || []).map((f) => [f, f])],
        w.folder || ROOT_KEY,
        () => {}
      );
      move.append(
        target,
        btn("move", "pri", async () => {
          try {
            await api("/wf_move", { rel: w.rel, folder: target.value });
            await load(true);
            V.wf.moving = null;
            toast("moved");
          } catch (e) {
            toast("move failed: " + e, "error");
          }
          paint();
        }),
        btn("cancel", null, () => {
          V.wf.moving = null;
          paint();
        })
      );
      card.appendChild(move);
    }
    return card;
  }

  function folderBlock(folder, kids, byFolder, depth) {
    const meta = wfFolderMetaOf(folder);
    const items = wfSorted((byFolder.get(folder) || []).filter(wfMatches));
    const childFolders = (kids.get(folder) || []).slice().sort(wfFolderSort);
    const label = folder === ROOT_KEY ? "all workflows" : folder.split("/").pop();
    const collapsed = V.wf.collapsed.has(folder) || meta.collapsed;

    if (folder === ROOT_KEY) {
      // The root is where the list lives, not a folder: nothing to fold, no label.
      for (const child of childFolders) folderBlock(child, kids, byFolder, depth);
      for (const w of items) tree.appendChild(workflowRow(w, depth));
      return;
    }
    const headRow = el("div", "rt-folder");
    headRow.style.marginLeft = `${depth * 10}px`;
    const caret = btn(collapsed ? "▸" : "▾", "icon", async () => {
      RT_STATS.caretClicks = (RT_STATS.caretClicks || 0) + 1;
      RT_STATS.caretLast = folder;
      if (V.wf.collapsed.has(folder)) V.wf.collapsed.delete(folder);
      else V.wf.collapsed.add(folder);
      await api("/wf_folder", { folder, collapsed: V.wf.collapsed.has(folder) });
      RT_STATS.caretSaved = V.wf.collapsed.has(folder) ? "collapsed" : "expanded";
      paint();
      RT_STATS.caretPaints = (RT_STATS.caretPaints || 0) + 1;
    });
    headRow.appendChild(caret);
    const pin = btn(meta.pinned ? "★" : "☆", "icon", async () => {
      await api("/wf_folder", { folder, pinned: !meta.pinned });
      await load();
      paint();
    });
    pin.title = "pin this folder to the top";
    headRow.appendChild(pin);
    const ficon = el("span", "rt-ficon");
    ficon.appendChild(folderIcon(false));
    headRow.appendChild(ficon);
    headRow.appendChild(el("span", "rt-name", label));
    headRow.appendChild(el("span", "rt-spacer"));
    headRow.appendChild(el("span", "rt-count", String(items.length + childFolders.length)));

    headRow.dataset.rtKind = "folder";
    headRow.dataset.rtKey = folder;

    // dropping a workflow on a folder files it there
    headRow.ondragover = (ev) => {
      if (!String(ev.dataTransfer.types).includes("text/plain")) return;
      ev.preventDefault();
      headRow.classList.add("drop-into");
    };
    headRow.ondragleave = () => headRow.classList.remove("drop-into");
    headRow.ondrop = async (ev) => {
      ev.preventDefault();
      headRow.classList.remove("drop-into");
      const payload = ev.dataTransfer.getData("text/plain");
      if (!payload.startsWith("wf:")) return;
      await moveWorkflowTo(payload.slice(3), folder);
    };
    if (V.wf.sort === "custom") {
      const bump = (delta) => async () => {
        const order = (meta.order == null ? 0 : meta.order) + delta;
        await api("/wf_folder", { folder, order });
        await load();
        paint();
      };
      headRow.appendChild(btn("↑", "icon", bump(-1)));
      headRow.appendChild(btn("↓", "icon", bump(1)));
    }
    tree.appendChild(headRow);

    if (V.wf.renaming === folder) {
      const row = el("div", "rt-newfolder");
      row.style.marginLeft = `${(depth + 1) * 12}px`;
      const name = input("rt-grow", label, "new folder name");
      row.append(
        name,
        btn("save", "pri", async () => {
          try {
            await api("/wf_rename_folder", { folder, name: name.value.trim() });
            await load(true);
            V.wf.renaming = null;
            toast("folder renamed");
          } catch (e) {
            toast(String(e.message || e), "error");
          }
          paint();
        }),
        btn("cancel", null, () => {
          V.wf.renaming = null;
          paint();
        })
      );
      tree.appendChild(row);
      name.focus();
      name.select();
    }

    if (collapsed) return;
    for (const child of childFolders) folderBlock(child, kids, byFolder, depth + 1);
    for (const w of items) tree.appendChild(workflowRow(w, depth + 1));
  }

  function paint() {
    tree.innerHTML = "";
    const byFolder = new Map();
    for (const w of S.workflows) {
      const f = w.folder || ROOT_KEY;
      if (!byFolder.has(f)) byFolder.set(f, []);
      byFolder.get(f).push(w);
    }
    const folders = new Set([ROOT_KEY]);
    for (const f of S.wfFolders || []) folders.add(f);
    for (const f of byFolder.keys()) folders.add(f);
    const kids = new Map();
    for (const f of folders) {
      if (f === ROOT_KEY) continue;
      const parent = f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : ROOT_KEY;
      if (!kids.has(parent)) kids.set(parent, []);
      kids.get(parent).push(f);
    }
    folderBlock(ROOT_KEY, kids, byFolder, 0);

    // Folder creation lives where the folders are, inline at the end of the list,
    // not in a header button that reads like "new tab".
    const shown = S.workflows.filter(wfMatches).length;
    tree.appendChild(el("div", "rt-dim", `${shown} of ${S.workflows.length} workflows`));
  }

  paint();
  return bar;
}

/* ---- ComfyUI's own Models panel: sortable browser with pinned folders ------- */

// ComfyUI's Models tab is a plain tree in file order. The panel body is
// <SidebarTabTemplate>#body -> Divider -> TreeExplorer.model-lib-tree-explorer,
// so the browser mounts in front of the tree, inside the panel it already has.
function rtBytes(n) {
  if (!n && n !== 0) return "";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}

function modelMatches(m) {
  const terms = V.model.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = [m.name, m.filename, m.folder, m.model_type, m.file_type, m.base, m.why, m.keyword, m.note]
    .concat(m.auto_tags || [])
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

function modelsSorted(items) {
  const { sort, desc } = V.model;
  const key = {
    name: (m) => (m.name || m.filename).toLowerCase(),
    size: (m) => m.size || 0,
    date: (m) => m.modified || 0,
    type: (m) => `${m.model_type || ""} ${(m.name || m.filename).toLowerCase()}`,
  }[sort] || ((m) => (m.name || m.filename).toLowerCase());
  const sorted = items.slice().sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0;
    return desc ? -cmp : cmp;
  });
  return sorted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

function modelFolderMetaOf(f) {
  return (S.modelFolderMeta || {})[f] || {};
}

function buildModelsBar() {
  RT_STATS.mdBuilds += 1;
  const bar = el("div", "rt-md-bar rt-app");
  bar.style.cssText =
    "display:flex;flex-direction:column;gap:8px;padding:8px;";

  // Always our own title block: Models, Workflows and Prompts must look identical, and
  // the wording is the plain panel name (not the tab's longer accessible label).
  const ph = el("div", "rt-panel-head");
  ph.style.margin = "-8px -8px 0";
  ph.appendChild(el("span", "rt-panel-title", "Models"));
  ph.appendChild(el("span", "rt-spacer"));
  const missing0 = S.models.filter((m) => !m.link).length;
  ph.appendChild(el("span", "rt-dim", `${S.models.length} files · ${missing0} without a link`));
  bar.appendChild(ph);

  const head = el("div", "rt-head");
  head.appendChild(el("span", "rt-spacer"));
  const missing = S.models.filter((m) => !m.link).length;
  head.appendChild(el("span", "rt-dim", `${S.models.length} files · ${missing} without a link`));
  const relink = btn("fetch links", null, async () => {
    relink.disabled = true;
    relink.textContent = "working…";
    try {
      const r = await api("/relink", { limit: 12 });
      await load(true);
      toast(`${r.linked.length} links found, ${r.unknown.length} unknown (local merges)`);
    } catch (e) {
      toast("lookup failed: " + e, "error");
    }
    paint();
  });
  relink.title = "read the hash of every file that has no link yet and ask Civitai which model it is";
  head.appendChild(relink);
  bar.appendChild(head);

  const toolbar = el("div", "rt-head rt-toolbar");
  const search = input("rt-grow", V.model.q, "search models…");
  search.oninput = () => {
    V.model.q = search.value;
    paint();
  };
  const sort = select(
    [
      ["name", "name"],
      ["size", "size"],
      ["date", "most recent"],
      ["type", "type"],
    ],
    V.model.sort,
    (v) => {
      V.model.sort = v;
      paint();
    }
  );
  const dir = btn(V.model.desc ? "↓" : "↑", "icon", () => {
    V.model.desc = !V.model.desc;
    paint();
  });
  dir.title = V.model.desc ? "descending — click for ascending" : "ascending — click for descending";
  toolbar.append(search, sort, dir);
  bar.appendChild(toolbar);

  const body = el("div", "rt-scroll");
  body.style.cssText = "flex:1 1 auto;min-height:0;overflow-y:auto;padding-top:4px;";
  bar.appendChild(body);

  function modelRow(m, depth) {
    const card = el("div", "rt-card");
    card.style.marginLeft = `${depth * 10}px`;

    const row = el("div", "rt-head");
    const star = btn(m.pinned ? "★" : "☆", m.pinned ? "icon on" : "icon", async () => {
      await api("/model_meta", { filename: m.filename, pinned: !m.pinned });
      await load();
      paint();
    });
    star.title = m.pinned ? "unpin" : "pin to the top of this folder";
    row.appendChild(star);

    const title = el("span", "rt-title", m.name || m.filename);
    title.title = m.filename;
    row.appendChild(title);
    row.appendChild(el("span", "rt-spacer"));

    if (m.link) {
      const open = btn("↗", "icon", () => window.open(m.link, "_blank", "noopener"));
      open.title = m.link;
      row.appendChild(open);
    }
    row.appendChild(
      btn("✎", "icon", () => {
        V.model.open = V.model.open.has(m.filename)
          ? (V.model.open.delete(m.filename), V.model.open)
          : (V.model.open.add(m.filename), V.model.open);
        paint();
      })
    );
    card.appendChild(row); // the builder above produced this row — attach it

    const mdBadges = [];
    if (m.model_type) mdBadges.push(badge(m.model_type, "a"));
    if (m.file_type) mdBadges.push(badge(m.file_type, "t"));
    mdBadges.push(badge(rtBytes(m.size)));
    if (m.base) mdBadges.push(badge(m.base));
    const mb = el("div", "rt-badges");
    for (const x of mdBadges) mb.appendChild(x);
    card.appendChild(mb);

    if (V.model.open.has(m.filename)) {
      const detail = el("div", "rt-detail");
      const pairs = [
        ["why", m.why || ""],
        ["keyword", m.keyword || ""],
        ["rank", m.rank || ""],
        ["note", m.note || ""],
        ["link", m.link || ""],
      ];
      const fields = {};
      const hints = { link: "https://…", rank: "1 = best" };
      for (const [key, val] of pairs) {
        const f = el("div", "rt-head");
        f.appendChild(el("span", "rt-k", key));
        fields[key] = input("rt-grow", val, hints[key] || "");
        f.appendChild(fields[key]);
        detail.appendChild(f);
      }
      const info = el("div", "rt-dim");
      info.textContent = [
        m.base && `base ${m.base}`,
        m.version && `v${m.version}`,
        m.lora_dim && `${m.lora_dim} dim`,
        (m.auto_tags || []).slice(0, 6).join(", "),
      ]
        .filter(Boolean)
        .join(" · ");
      detail.appendChild(info);
      const actions = el("div", "rt-head");
      actions.appendChild(
        btn("save", "pri", async () => {
          await api("/model_meta", {
            filename: m.filename,
            why: fields.why.value,
            keyword: fields.keyword.value,
            rank: fields.rank.value,
            note: fields.note.value,
            link: fields.link.value,
          });
          await load();
          toast("saved");
          paint();
        })
      );
      actions.appendChild(
        btn("copy filename", null, () => {
          navigator.clipboard?.writeText(m.filename);
          toast("filename copied");
        })
      );
      detail.appendChild(actions);
      card.appendChild(detail);
    }
    return card;
  }

  function paint() {
    body.innerHTML = "";
    const byFolder = new Map();
    for (const m of S.models) {
      if (!byFolder.has(m.folder)) byFolder.set(m.folder, []);
      byFolder.get(m.folder).push(m);
    }
    const folders = [...byFolder.keys()].sort((a, b) => {
      const oa = modelFolderMetaOf(a).order;
      const ob = modelFolderMetaOf(b).order;
      const na = oa == null ? Number.MAX_SAFE_INTEGER : oa;
      const nb = ob == null ? Number.MAX_SAFE_INTEGER : ob;
      if (na !== nb) return na - nb;
      return a.localeCompare(b);
    });

    for (const folder of folders) {
      const meta = modelFolderMetaOf(folder);
      const items = modelsSorted(byFolder.get(folder).filter(modelMatches));
      const collapsed = V.model.collapsed.has(folder) || meta.collapsed;

      const fh = el("div", "rt-folder");
      fh.appendChild(
        btn(collapsed ? "▸" : "▾", "icon", () => {
          if (V.model.collapsed.has(folder)) V.model.collapsed.delete(folder);
          else V.model.collapsed.add(folder);
          paint();
        })
      );
      fh.appendChild(el("span", "rt-name", folder));
      fh.appendChild(el("span", "rt-spacer"));
      fh.appendChild(el("span", "rt-count", String(items.length)));
      body.appendChild(fh);

      if (collapsed) continue;
      for (const m of items) body.appendChild(modelRow(m, 1));
    }
    const shown = S.models.filter(modelMatches).length;
    body.appendChild(el("div", "rt-dim", `${shown} of ${S.models.length} models`));
  }

  RT_MD_PAINT = paint;
  paint();
  return bar;
}

function enhanceNativeModels() {
  guardInjection("model-library", ".rt-md-bar", () => {
    const tree = document.querySelector(".model-lib-tree-explorer");
    return tree && tree.parentElement;
  }, buildModelsBar, "models", { takeover: true });
}

function enhanceNativeWorkflows() {
  guardInjection("workflows", ".rt-wf-bar", () => document.querySelector(WF_PANEL), buildWorkflowBar, "workflows", { takeover: true });
}

/**
 * Sidebar tabs in this frontend are rendered as Vue components (`type: "vue"` +
 * `component`), not via the older `type: "custom"` + `render(el)` contract — a
 * custom tab gets a working button but an empty panel. So we pull the Vue runtime
 * the frontend already loaded, discovered through the served asset names (the hash
 * changes every version, so it is never hardcoded), and hand over a real component.
 */
async function loadVue() {
  const html = await (await fetch("/", { cache: "no-store" })).text();
  const entry = html.match(/assets\/index-[\w-]+\.js/)?.[0];
  if (!entry) throw new Error("entry chunk not found");
  const src = await (await fetch("/" + entry, { cache: "no-store" })).text();
  const vueChunk = src.match(/vendor-vue-core-[\w-]+\.js/)?.[0];
  if (!vueChunk) throw new Error("vue core chunk not found");
  const mod = await import(/* @vite-ignore */ new URL("/assets/" + vueChunk, location.origin).href);
  // the chunk may expose the API as named exports or behind a default object
  const vue =
    typeof mod?.defineComponent === "function"
      ? mod
      : typeof mod?.default?.defineComponent === "function"
        ? mod.default
        : null;
  if (!vue) throw new Error("vue API not found; exports: " + Object.keys(mod || {}).join(","));
  return vue;
}

function makeTabComponent(Vue, painter) {
  const paint = async (host) => {
    await load();
    painter(host);
  };
  return Vue.defineComponent({
    name: "RoansComfyUITab",
    setup() {
      const host = Vue.ref(null);
      Vue.onMounted(async () => {
        repaint = () => host.value && paint(host.value);
        if (host.value) await paint(host.value);
      });
      return () => Vue.h("div", { ref: host, class: "rt-host", style: "height:100%" });
    },
  });
}

/**
 * Registers the tab. Prefers the native `vue` component form (that is what this
 * frontend renders for sidebar tabs); if anything about that fails we still get a
 * working button via the older `custom` + `render` contract, and the panel shows
 * one line explaining it, rather than the tab silently not existing.
 */
function registerTab(base, painter, Vue) {
  if (Vue) {
    try {
      app.extensionManager.registerSidebarTab({
        ...base,
        type: "vue",
        component: makeTabComponent(Vue, painter),
      });
      console.log("[Roans-ComfyUI-Tools] registered as a native vue tab");
      return "vue";
    } catch (e) {
      console.warn("[Roans-ComfyUI-Tools] vue tab registration failed, using custom:", e);
    }
  }
  try {
    app.extensionManager.registerSidebarTab({
      ...base,
      type: "custom",
      render: async (root) => {
        try {
          await load();
          painter(root);
        } catch (e) {
          root.innerHTML = `<div style="padding:12px;font-size:12px;opacity:.7">library api unreachable<br>${e}</div>`;
        }
      },
    });
    console.log("[Roans-ComfyUI-Tools] registered as a custom tab");
    return "custom";
  } catch (e) {
    console.error("[Roans-ComfyUI-Tools] could not register the tab:", e);
    toast("could not add the Prompts tab: " + e, "error");
    return null;
  }
}

/**
 * Fallback for when neither tab contract renders a panel in this frontend build.
 * The tab BUTTON is real (ComfyUI still draws it and still owns it); we listen to
 * which tab is active and mount our own panel beside the strip while ours is
 * selected, then remove it from view when another tab is picked.
 */
// Report on a timer as well: if the page stalls, mutation reports go silent and
// I would be looking at a stale snapshot forever.
injectStyles();

setInterval(() => {
  try {
    sendDiag();
  } catch (e) {
    /* best effort */
  }
}, 5000);
window.addEventListener("load", () => setTimeout(sendDiag, 1500));

app.registerExtension({
  name: "roans.comfyui.tools",
  async setup() {
    await load().catch(() => null);

    // install the native-panel enhancer and the tab badges first, so a failure
    // while registering our own tab can never take them down with it
    enhanceNativeModelLibrary();

    let Vue = null;
    try {
      Vue = await loadVue();
      console.log("[Roans-ComfyUI-Tools] Vue runtime loaded");
    } catch (e) {
      console.warn("[Roans-ComfyUI-Tools] could not load Vue:", e);
    }

    // Prompts is the only NEW tab. Models is ComfyUI's own panel, enhanced in place
    // by enhanceNativeModelLibrary() rather than replaced with a second button.
    registerTab(
      {
        id: "roansPrompts",
        icon: "pi pi-comment",
        title: "Prompts",
        tooltip: "Saved prompts plus prompts pulled from your workflows",
      },
      renderPrompts,
      Vue
    );

    // if the tab registered as a component, ComfyUI renders the panel itself, so we
    // do not mount a second one; the fallback exists only for the failed-vue case
    // ComfyUI renders the tab's own panel (the custom/vue tab contract), so there is
    // deliberately no second, floating copy of it.

    pollTimer = setInterval(pollUi, 4000);
    console.log("[Roans-ComfyUI-Tools] setup complete; enhancing ComfyUI's Models panel");
  },
});
