import { app } from "../../scripts/app.js";

const API = "/Roans-ComfyUI-Tools/api";
const RT_CLIENT = Math.random().toString(36).slice(2, 8); // one id per page load

/* ------------------------------------------------------------------ styling */

const CSS = `
/* One control height for every button, input and select, so nothing looks
   improvised. Colours come from ComfyUI's own variables, never hard-coded. */
.rt { display:flex; flex-direction:column; height:100%; box-sizing:border-box;
      font-size:12px; color:var(--fg-color,#d4d4d4); }
.rt-app { --rt-ctl:26px; --rt-line:var(--border-color,#3a3a3a);
          height:100%; min-height:0; box-sizing:border-box; overflow:hidden;
          display:flex; flex-direction:column; }
.rt-bar { padding:8px; display:flex; flex-direction:column; gap:7px;
          border-bottom:1px solid var(--rt-line); flex:0 0 auto; }
.rt-head { display:flex; gap:6px; align-items:center; min-width:0; flex-wrap:nowrap; }
.rt-head.wrap { flex-wrap:wrap; }
.rt-spacer { flex:1 1 auto; min-width:0; }
.rt-scroll { flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden;
             padding:8px; display:flex; flex-direction:column; gap:6px; }

/* controls */
.rt-btn, .rt-input, .rt-select, .rt-area {
      background:transparent; color:inherit; font:inherit; font-size:11.5px;
      border:1px solid var(--rt-line); border-radius:6px; box-sizing:border-box;
      height:var(--rt-ctl); padding:0 9px; }
.rt-input, .rt-select { background:color-mix(in srgb, #000 20%, transparent); padding:0 7px; }
.rt-select { padding-right:4px; }
.rt-area { height:auto; min-height:62px; padding:6px 8px; resize:vertical;
      line-height:1.45; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; }
.rt-btn { cursor:pointer; white-space:nowrap; transition:border-color .12s,color .12s,background .12s;
      display:inline-flex; align-items:center; justify-content:center; gap:4px; }
.rt-btn:hover { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); }
.rt-btn.icon { width:var(--rt-ctl); padding:0; flex:0 0 auto; opacity:.75; }
.rt-btn.icon:hover { opacity:1; }
.rt-btn.icon.on { opacity:1; color:var(--p-primary-color,#7aa2f7); border-color:transparent; }
.rt-btn.pri { background:var(--p-primary-color,#7aa2f7); border-color:var(--p-primary-color,#7aa2f7);
      color:#101010; font-weight:600; }
.rt-btn.pri:hover { color:#101010; filter:brightness(1.08); }
.rt-btn.warn:hover { border-color:#e06c75; color:#e06c75; }
.rt-input:focus, .rt-select:focus, .rt-area:focus { outline:none;
      border-color:var(--p-primary-color,#7aa2f7); }
.rt-grow { flex:1 1 auto; min-width:0; }

/* header + folder rows */
.rt-sec { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em;
      opacity:.45; white-space:nowrap; }
.rt-root { display:flex; align-items:center; gap:6px; padding:2px 2px 4px; }
.rt-root .rt-name { font-size:11px; font-weight:700; text-transform:uppercase;
      letter-spacing:.07em; opacity:.5; }
.rt-folder { display:flex; align-items:center; gap:6px; min-width:0; padding:2px 2px 3px; }
.rt-folder .rt-name { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden;
      text-overflow:ellipsis; min-width:0; }
.rt-count { font-size:10.5px; opacity:.45; white-space:nowrap; font-variant-numeric:tabular-nums; }
.rt-add { display:flex; align-items:center; gap:6px; height:26px; margin-top:2px; padding:0 8px;
      font:inherit; font-size:11.5px; color:inherit; opacity:.5; cursor:pointer;
      background:transparent; border:1px dashed var(--rt-line); border-radius:6px; }
.rt-add:hover { opacity:.9; border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); }
.rt-newfolder { display:flex; gap:6px; align-items:center; padding:0; }
.rt-folderslot:not(:empty) { margin-top:1px; }

/* cards */
.rt-card { border:1px solid var(--rt-line); border-radius:8px; padding:7px 8px;
      background:color-mix(in srgb, var(--comfy-input-bg,#1e1e1e) 45%, transparent);
      display:flex; flex-direction:column; gap:5px; min-width:0; }
.rt-card:hover { border-color:color-mix(in srgb, var(--p-primary-color,#7aa2f7) 40%, var(--rt-line)); }
.rt-title { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden;
      text-overflow:ellipsis; min-width:0; flex:0 1 auto; cursor:pointer; }
.rt-title:hover { color:var(--p-primary-color,#7aa2f7); }
.rt-detail { display:flex; flex-direction:column; gap:6px; padding-top:2px; }
.rt-dim { font-size:10.5px; opacity:.5; white-space:nowrap; }
.rt-mono { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10.5px; opacity:.6;
      word-break:break-all; }
.rt-badges { display:flex; gap:4px; flex-wrap:wrap; align-items:center; }
.rt-badge { font-size:9.5px; padding:1px 6px; border-radius:99px; opacity:.7;
      border:1px solid var(--rt-line); white-space:nowrap; }
.rt-badge.t { border-color:#5c8a5c; }
.rt-badge.k { border-color:#8a6a5c; }
.rt-badge.a { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); opacity:1; }
.rt-chips { display:flex; gap:4px; flex-wrap:wrap; }
.rt-chip { font-size:10px; height:22px; padding:0 9px; border-radius:99px; cursor:pointer;
      border:1px solid var(--rt-line); background:transparent; color:inherit; font-family:inherit;
      opacity:.75; white-space:nowrap; display:inline-flex; align-items:center; }
.rt-chip:hover { opacity:1; }
.rt-chip.on { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); opacity:1; }
.rt-grid { display:grid; grid-template-columns:auto 1fr; gap:3px 10px; margin-top:7px; font-size:11px; }
.rt-k { opacity:.5; white-space:nowrap; }
.rt-v { word-break:break-word; min-width:0; }
.rt-code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
      line-height:1.5; white-space:pre-wrap; word-break:break-word; margin-top:6px;
      background:color-mix(in srgb, #000 22%, transparent); border-left:2px solid var(--rt-line);
      border-radius:5px; padding:6px 8px; max-height:110px; overflow:auto; }
.rt-code.open { max-height:none; }
.rt-actions { display:flex; gap:5px; flex-wrap:wrap; margin-top:7px; align-items:center; }
.rt-empty { opacity:.5; padding:16px; text-align:center; font-size:11.5px; }
.rt-form { display:flex; flex-direction:column; gap:7px; border:1px solid var(--p-primary-color,#7aa2f7);
      border-radius:8px; padding:10px; margin:8px 8px 0;
      background:color-mix(in srgb, var(--comfy-input-bg,#1e1e1e) 70%, transparent); }
.rt-field { display:flex; flex-direction:column; gap:3px; }
.rt-field > label { font-size:10px; text-transform:uppercase; letter-spacing:.05em; opacity:.5; }
.rt-row2 { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.rt-hint { font-size:10px; opacity:.45; }
.rt-flash { animation:rtflash .9s ease-out; }
@keyframes rtflash { from { border-color:var(--p-primary-color,#7aa2f7); } }
.rt-native-block { margin-top:10px; padding-top:8px; border-top:1px solid var(--rt-line); }
.rt-native-editor { display:flex; flex-direction:column; gap:7px; margin-top:7px;
      border:1px solid var(--p-primary-color,#7aa2f7); border-radius:8px; padding:9px;
      background:color-mix(in srgb, var(--comfy-input-bg,#1e1e1e) 75%, transparent); }
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
  const wrap = el("div", "rt");
  root.appendChild(wrap);

  const bar = el("div", "rt-bar");
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

  const chips = el("div", "rt-bar");
  chips.style.paddingTop = "0";
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
const AVATAR_TABS = ["workflows", "node-library", "model-library", "roansPrompts"];

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
  return {
    client: RT_CLIENT,
    dpr: devicePixelRatio,
    styles,
    fill,
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
  };
}

async function sendDiag() {
  try {
    await fetch("/Roans-ComfyUI-Tools/api/diag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportDiag()),
    });
  } catch (e) {
    /* diagnostics are best-effort */
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
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
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
  const bar = el("div", "rt-wf-bar rt-app");
  bar.style.cssText =
    "display:flex;flex-direction:column;gap:6px;padding:8px 9px;border-bottom:1px solid var(--border-color,#3a3a3a);";

  const toolbar = el("div", "rt-head");
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
    V.wf.desc = !V.wf.desc;
    paint();
  });
  dir.title = V.wf.desc ? "descending — click for ascending" : "ascending — click for descending";
  const newFolder = btn("", "icon", () => openFolderInput(""));
  newFolder.appendChild(folderIcon(true));
  newFolder.title = "new folder — / makes subfolders";
  toolbar.append(search, sort, dir, newFolder);
  bar.appendChild(toolbar);

  // The name field opens here, right under the button that opened it — not at
  // the end of a long list where it cannot be seen.
  const folderSlot = el("div", "rt-folderslot");
  bar.appendChild(folderSlot);

  const tree = el("div", "rt-scroll");
  tree.style.cssText = "flex:1 1 auto;min-height:0;overflow-y:auto;padding-top:4px;";
  bar.appendChild(tree);

  function openFolderInput(prefix) {
    V.wf.newFolder = prefix || "";
    folderSlot.innerHTML = "";
    const row = el("div", "rt-newfolder");
    const name = input("rt-grow", prefix ? prefix + "/" : "", "folder name");
    const go = btn("create", "pri", async () => {
      if (!name.value.trim()) return;
      try {
        await api("/wf_mkdir", { folder: name.value.trim() });
        await load(true);
        toast("folder created");
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
  }

  function workflowRow(w, depth) {
    const card = el("div", "rt-card");
    card.style.cssText = `padding:6px 8px;margin-left:${depth * 10}px;`;

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
    row.appendChild(btn("open", null, () => openWorkflow(w.rel)));
    row.appendChild(
      btn("✎", "icon", () => {
        V.wf.editing = V.wf.editing === w.rel ? null : w.rel;
        V.wf.moving = null;
        paint();
      })
    );
    row.appendChild(
      btn("⇢", "icon", () => {
        V.wf.moving = V.wf.moving === w.rel ? null : w.rel;
        V.wf.editing = null;
        paint();
      })
    );
    card.appendChild(row);

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
    headRow.style.cssText = `margin-left:${depth * 10}px;`;
    const caret = btn(collapsed ? "▸" : "▾", "icon", async () => {
      if (V.wf.collapsed.has(folder)) V.wf.collapsed.delete(folder);
      else V.wf.collapsed.add(folder);
      await api("/wf_folder", { folder, collapsed: V.wf.collapsed.has(folder) });
      paint();
    });
    headRow.appendChild(caret);
    const pin = btn(meta.pinned ? "★" : "☆", "icon", async () => {
      await api("/wf_folder", { folder, pinned: !meta.pinned });
      await load();
      paint();
    });
    pin.title = "pin this folder to the top";
    headRow.appendChild(pin);
    headRow.appendChild(el("span", "rt-name", label));
    const sub = btn("", "icon", () => openFolderInput(folder));
    sub.appendChild(folderIcon(true));
    sub.title = "new subfolder inside " + folder;
    headRow.appendChild(sub);
    headRow.appendChild(el("span", "rt-spacer"));
    headRow.appendChild(el("span", "rt-count", String(items.length + childFolders.length)));
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
  const bar = el("div", "rt-md-bar rt-app");
  bar.style.cssText =
    "display:flex;flex-direction:column;gap:6px;padding:8px 9px;border-bottom:1px solid var(--border-color,#3a3a3a);";

  const head = el("div", "rt-head");
  head.appendChild(el("span", "rt-sec", "models"));
  head.appendChild(el("span", "rt-spacer"));
  const groups = new Set(S.models.map((m) => m.folder));
  head.appendChild(el("span", "rt-dim", `${S.models.length} files · ${groups.size} folders`));
  bar.appendChild(head);

  const toolbar = el("div", "rt-head");
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
    card.style.cssText = `padding:6px 8px;margin-left:${depth * 10}px;`;

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
        ["note", m.note || ""],
      ];
      const fields = {};
      for (const [key, val] of pairs) {
        const f = el("div", "rt-head");
        f.appendChild(el("span", "rt-dim", key));
        fields[key] = input("rt-grow", val);
        f.appendChild(fields[key]);
        detail.appendChild(f);
      }
      const info = el("div", "rt-dim");
      info.textContent = [
        m.base && `base ${m.base}`,
        m.version && `v${m.version}`,
        m.rank && `rank ${m.rank}`,
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
            note: fields.note.value,
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
