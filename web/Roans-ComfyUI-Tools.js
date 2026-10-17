import { app } from "../../scripts/app.js";

const API = "/Roans-ComfyUI-Tools/api";

/* ------------------------------------------------------------------ styling */

const CSS = `
.rt { display:flex; flex-direction:column; height:100%; box-sizing:border-box;
      font-size:12px; color:var(--fg-color,#d4d4d4); }
.rt-bar { display:flex; gap:6px; align-items:center; padding:8px 9px 7px;
          border-bottom:1px solid var(--border-color,#3a3a3a); flex-wrap:wrap; }
.rt-scroll { flex:1; overflow-y:auto; padding:9px; display:flex; flex-direction:column; gap:8px; }
.rt-input, .rt-select, .rt-area {
      background:var(--comfy-input-bg,#1e1e1e); color:inherit; font:inherit;
      border:1px solid var(--border-color,#3a3a3a); border-radius:7px;
      padding:5px 8px; box-sizing:border-box; width:100%; }
.rt-area { resize:vertical; min-height:64px; line-height:1.45;
           font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px; }
.rt-input:focus, .rt-select:focus, .rt-area:focus {
      outline:none; border-color:var(--p-primary-color,#7aa2f7); }
.rt-grow { flex:1; min-width:90px; }
.rt-btn { background:transparent; color:inherit; font:inherit; font-size:11px;
      border:1px solid var(--border-color,#3a3a3a); border-radius:7px;
      padding:4px 9px; cursor:pointer; white-space:nowrap; transition:border-color .12s,color .12s; }
.rt-btn:hover { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); }
.rt-btn.pri { background:var(--p-primary-color,#7aa2f7); border-color:var(--p-primary-color,#7aa2f7); color:#101010; font-weight:600; }
.rt-btn.pri:hover { color:#101010; filter:brightness(1.08); }
.rt-btn.warn:hover { border-color:#e06c75; color:#e06c75; }
.rt-btn.icon { padding:4px 6px; }
.rt-chips { display:flex; gap:4px; flex-wrap:wrap; }
.rt-chip { font-size:10px; padding:2px 8px; border-radius:99px; cursor:pointer;
      border:1px solid var(--border-color,#3a3a3a); opacity:.8; white-space:nowrap;
      background:transparent; color:inherit; font-family:inherit; }
.rt-chip:hover { opacity:1; }
.rt-chip.on { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); opacity:1; }
.rt-card { border:1px solid var(--border-color,#3a3a3a); border-radius:10px;
      padding:9px 10px; background:color-mix(in srgb, var(--comfy-input-bg,#1e1e1e) 55%, transparent); }
.rt-card:hover { border-color:color-mix(in srgb, var(--p-primary-color,#7aa2f7) 45%, var(--border-color,#3a3a3a)); }
.rt-head { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.rt-title { font-weight:600; font-size:12.5px; }
.rt-spacer { flex:1; }
.rt-dim { opacity:.55; font-size:10.5px; }
.rt-mono { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:10.5px; opacity:.6;
      word-break:break-all; }
.rt-badges { display:flex; gap:4px; flex-wrap:wrap; }
.rt-badge { font-size:9.5px; padding:1.5px 7px; border-radius:99px;
      border:1px solid var(--border-color,#3a3a3a); opacity:.85; white-space:nowrap; }
.rt-badge.t { border-color:#5c8a5c; }
.rt-badge.k { border-color:#8a6a5c; }
.rt-badge.a { border-color:var(--p-primary-color,#7aa2f7); color:var(--p-primary-color,#7aa2f7); }
.rt-grid { display:grid; grid-template-columns:auto 1fr; gap:3px 10px; margin-top:7px; font-size:11px; }
.rt-k { opacity:.5; white-space:nowrap; }
.rt-v { word-break:break-word; min-width:0; }
.rt-code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
      line-height:1.5; white-space:pre-wrap; word-break:break-word; margin-top:6px;
      background:color-mix(in srgb, #000 22%, transparent); border-left:2px solid var(--border-color,#3a3a3a);
      border-radius:5px; padding:6px 8px; max-height:110px; overflow:auto; }
.rt-code.open { max-height:none; }
.rt-actions { display:flex; gap:5px; flex-wrap:wrap; margin-top:7px; align-items:center; }
.rt-sec { font-size:10px; text-transform:uppercase; letter-spacing:.07em; opacity:.42;
      padding:5px 2px 0; display:flex; gap:6px; align-items:center; }
.rt-sec:after { content:""; flex:1; height:1px; background:var(--border-color,#3a3a3a); }
.rt-empty { opacity:.5; padding:16px; text-align:center; font-size:11.5px; }
.rt-form { display:flex; flex-direction:column; gap:7px; border:1px solid var(--p-primary-color,#7aa2f7);
      border-radius:10px; padding:10px; margin:9px 9px 0;
      background:color-mix(in srgb, var(--comfy-input-bg,#1e1e1e) 70%, transparent); }
.rt-field { display:flex; flex-direction:column; gap:3px; }
.rt-field > label { font-size:10px; text-transform:uppercase; letter-spacing:.05em; opacity:.5; }
.rt-row2 { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.rt-hint { font-size:10px; opacity:.45; }
.rt-flash { animation:rtflash .9s ease-out; }
@keyframes rtflash { from { border-color:var(--p-primary-color,#7aa2f7); } }
.rt-native-block { margin-top:10px; padding-top:8px; border-top:1px solid var(--border-color,#3a3a3a); }
.rt-native-block .rt-sec:after { content:""; flex:1; height:1px; background:var(--border-color,#3a3a3a); }
.rt-native-editor { display:flex; flex-direction:column; gap:7px; margin-top:7px;
      border:1px solid var(--p-primary-color,#7aa2f7); border-radius:9px; padding:9px;
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

const S = { models: [], workflows: [], prompts: [], loadedAt: 0 };
const V = {
  model: { q: "", type: "All", sort: "name", group: "type", open: new Set(), collapsed: new Set() },
  prompt: { q: "", kind: "all", group: "none", open: new Set(), collapsed: new Set() },
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
  api(`/workflow?file=${encodeURIComponent(file)}`)
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
      inject();
      markRows();
      decorateNativeTabs();
      enhanceNativeWorkflows();
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
  inject();
  markRows();
  decorateNativeTabs();
  enhanceNativeWorkflows();
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
    const o = el("option", null, w.name);
    o.value = w.file;
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

/* ------------- ComfyUI's own Workflows panel: search inside workflows -------- */

// ComfyUI's workflow search only matches filenames. We already parse every
// workflow's checkpoint, loras, prompts and sampler settings server-side, so this
// injects a content-search bar into the native panel and lists what matches.
const WF_PANEL = ".comfyui-workflows-panel, .comfyui-workflows-browse";

function wfMatches(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const terms = needle.split(/\s+/).filter(Boolean);
  return S.workflows.filter((w) => {
    const hay = [
      w.name,
      w.file,
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
    return terms.every((t) => hay.includes(t)); // every word must hit — "h0rs3 mud"
  });
}

function buildWorkflowBar() {
  const bar = el("div", "rt-wf-bar");
  bar.style.cssText = "display:flex;flex-direction:column;gap:6px;padding:8px 9px;border-bottom:1px solid var(--border-color,#3a3a3a);";

  const head = el("div", "rt-head");
  head.appendChild(el("span", "rt-sec", "search inside workflows"));
  bar.appendChild(head);

  const search = input(null, "", "checkpoint, lora, prompt words…");
  const results = el("div", "rt-scroll");
  results.style.cssText = "max-height:46vh;";

  const paint = () => {
    results.innerHTML = "";
    if (!search.value.trim()) {
      results.style.display = "none";
      return;
    }
    const found = wfMatches(search.value);
    results.style.display = "flex";
    if (!found.length) {
      results.appendChild(el("div", "rt-empty", "no workflow matches"));
      return;
    }
    for (const w of found) {
      const card = el("div", "rt-card");
      card.style.cursor = "pointer";
      card.title = "open " + w.file;
      const row = el("div", "rt-head");
      row.appendChild(el("span", "rt-title", w.name));
      if (w.checkpoint) row.appendChild(badge(w.checkpoint.replace(/\.safetensors$/, "")));
      for (const l of w.loras || []) row.appendChild(badge(l.name.replace(/\.safetensors$/, "")));
      card.appendChild(row);
      if (w.positive) card.appendChild(el("div", "rt-code", w.positive.slice(0, 200)));
      const sk = w.sampler || {};
      card.appendChild(
        el("div", "rt-dim", [w.size, sk.steps ? `${sk.steps} steps` : "", sk.cfg ? `cfg ${sk.cfg}` : "", sk.sampler].filter(Boolean).join(" · "))
      );
      card.onclick = () => openWorkflow(w.file);
      results.appendChild(card);
    }
  };
  search.oninput = paint;
  paint();

  bar.append(search, results);
  return bar;
}

function enhanceNativeWorkflows() {
  const panel = document.querySelector(WF_PANEL);
  if (!panel || panel.querySelector(".rt-wf-bar")) return;
  panel.prepend(buildWorkflowBar());
  console.log("[Roans-ComfyUI-Tools] content search added inside ComfyUI's Workflows panel");
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
    const mode = registerTab(
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
