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

/* ----------------------------------------------------------- models tab */

function renderModels(root) {
  injectStyles();
  root.innerHTML = "";
  const wrap = el("div", "rt");

  const bar = el("div", "rt-bar");
  const search = input("rt-grow", V.model.q, "search models…");
  search.oninput = () => {
    V.model.q = search.value;
    paintModels();
  };
  const sort = select(
    [["name", "sort: name"], ["size", "sort: size"], ["date", "sort: newest"], ["type", "sort: type"]],
    V.model.sort,
    (v) => {
      V.model.sort = v;
      paintModels();
    }
  );
  const group = select(
    [["type", "group: type"], ["folder", "group: folder"], ["rank", "group: rank"], ["why", "group: why"], ["none", "group: none"]],
    V.model.group,
    (v) => {
      V.model.group = v;
      paintModels();
    }
  );
  const rescan = btn("rescan", null, async () => {
    await api("/rescan", {});
    await load(true);
    paintModels();
    toast("rescanned the model folders");
  });
  bar.append(search, sort, group, rescan);
  wrap.appendChild(bar);

  const chips = el("div", "rt-bar");
  chips.style.paddingTop = "0";
  wrap.appendChild(chips);

  const list = el("div", "rt-scroll");
  wrap.appendChild(list);

  const fieldText = (m) =>
    [m.name, m.filename, m.why, m.keyword, m.rank, m.note, m.base, m.version, m.model_type, m.file_type]
      .concat(m.auto_tags || [])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  function paintChips() {
    chips.innerHTML = "";
    const counts = {};
    for (const m of S.models) counts[m.model_type] = (counts[m.model_type] || 0) + 1;
    const opts = [["All", S.models.length], ...Object.entries(counts).sort()];
    for (const [t, n] of opts) {
      const c = el("button", "rt-chip" + (V.model.type === t ? " on" : ""), `${t} ${n}`);
      c.onclick = () => {
        V.model.type = t;
        paintModels();
      };
      chips.appendChild(c);
    }
  }

  function editForm(m) {
    const form = el("div", "rt-form");
    const f = {};
    const fName = input(null, m.name, "display name");
    const fVer = input(null, m.version || m.version_suggested,
      m.version_suggested ? `suggested: ${m.version_suggested}` : "e.g. v1.0");
    const fBase = input(null, m.base || m.base_detected, m.base_detected || "base model");
    const fType = input(null, m.file_type, m.file_type_detected ? `detected: ${m.file_type_detected}` : "file type");
    const fLink = input(null, m.link, "civitai / huggingface url");
    const fWhy = input(null, m.why, "why you downloaded it");
    const fRank = input(null, m.rank, "your verdict");
    const fKw = input(null, m.keyword, "lora trigger keyword");
    Object.assign(f, { name: fName, version: fVer, base: fBase, file_type: fType, link: fLink, why: fWhy, rank: fRank, keyword: fKw });
    const fNote = area(m.note, "notes");
    const fModelType = input(null, m.model_type);
    fModelType.readOnly = true;
    form.append(
      field("Name", fName),
      field("Filename", el("div", "rt-mono", m.filename)),
      el("div", "rt-row2",
        field("Model Type", fModelType, "set by the folder it lives in"),
        field("File Type", fType, m.file_type_detected ? `detected: ${m.file_type_detected}` : "")),
      el("div", "rt-row2", field("Downloaded Version", fVer), field("Base model", fBase)),
      field("Link", fLink),
      el("div", "rt-row2", field("Why?", fWhy), field("Rank?", fRank)),
      field("Lora Keyword", fKw),
      field("Notes", fNote)
    );
    const actions = el("div", "rt-actions");
    actions.append(
      btn("save", "pri", async () => {
        await api("/model", {
          filename: m.filename,
          name: f.name.value,
          model_type: m.model_type,
          file_type: f.file_type.value,
          version: f.version.value,
          base: f.base.value,
          link: f.link.value,
          why: f.why.value,
          rank: f.rank.value,
          keyword: f.keyword.value,
          note: fNote.value,
        });
        toast("saved " + m.name);
        await load(true);
        paintModels();
      }),
      btn("cancel", null, () => {
        V.model.open.delete(m.filename);
        paintModels();
      })
    );
    form.appendChild(actions);
    return form;
  }

  function card(m) {
    const c = el("div", "rt-card");
    const head = el("div", "rt-head");
    head.appendChild(el("span", "rt-title", m.name));
    head.appendChild(badge(m.model_type, "t"));
    if (m.file_type) head.appendChild(badge(m.file_type));
    head.appendChild(el("span", "rt-spacer"));
    head.appendChild(el("span", "rt-dim", size(m.size)));
    head.appendChild(
      btn(V.model.open.has(m.filename) ? "close" : "edit", "icon", () => {
        if (V.model.open.has(m.filename)) V.model.open.delete(m.filename);
        else V.model.open.add(m.filename);
        paintModels();
      })
    );
    c.appendChild(head);
    c.appendChild(el("div", "rt-mono", m.filename));

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
    put("Version", m.version || m.version_suggested, !m.version);
    put("Base", m.base || m.base_detected, !m.base);
    put("Link", m.link);
    put("Why?", m.why);
    put("Rank?", m.rank);
    put("Keyword", m.keyword);
    if (m.lora_dim) put("Lora dim", m.lora_dim);
    if (m.auto_tags?.length) put("Trained on", m.auto_tags.join(", "), true);
    put("Notes", m.note);
    if (grid.children.length) c.appendChild(grid);

    if (V.model.open.has(m.filename)) c.appendChild(editForm(m));
    return c;
  }

  function paintModels() {
    paintChips();
    list.innerHTML = "";
    const q = V.model.q.trim().toLowerCase();
    let rows = S.models.filter((m) => (V.model.type === "All" || m.model_type === V.model.type) && (!q || fieldText(m).includes(q)));
    const by = {
      type: (a, b) => (a.model_type + a.name).localeCompare(b.model_type + b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      size: (a, b) => b.size - a.size,
      date: (a, b) => b.modified - a.modified,
    }[V.model.sort];
    rows = rows.slice().sort(by);
    if (!rows.length) {
      list.appendChild(el("div", "rt-empty", "no models match"));
      return;
    }
    const keyFns = {
      type: (m) => m.model_type,
      folder: (m) => m.folder,
      rank: (m) => m.rank,
      why: (m) => m.why,
    };
    if (V.model.group === "none" || !keyFns[V.model.group]) {
      for (const m of rows) list.appendChild(card(m));
      return;
    }
    for (const [key, items] of groupItems(rows, keyFns[V.model.group])) {
      const { head, isOpen } = section("model:" + key, key, items.length, V.model.collapsed, paintModels);
      list.appendChild(head);
      if (isOpen) for (const m of items) list.appendChild(card(m));
    }
  }

  paintModels();
  return paintModels;
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
  const group = select(
    [["none", "group: none"], ["workflow", "group: workflow"], ["tag", "group: tag"], ["checkpoint", "group: checkpoint"]],
    V.prompt.group,
    (v) => {
      V.prompt.group = v;
      paintPrompts();
    }
  );
  bar.append(search, group, add);
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
      btn("copy negative", p.negative ? null : "warn", () => {
        if (!p.negative) return toast("this prompt has no negative", "warn");
        copy(p.negative, "negative prompt");
      })
    );
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

/* ---- replace ComfyUI's own Models tab (it ships one called model-library) ---- */

const HIDE_CORE_SETTING = "RoansComfyUITools.HideCoreModelsTab";

function coreTabIds() {
  try {
    return (app.extensionManager.getSidebarTabs?.() || []).map((t) => t.id);
  } catch (e) {
    return [];
  }
}
function dropCoreModelsTab() {
  if (coreTabIds().includes("model-library")) {
    try {
      app.extensionManager.unregisterSidebarTab("model-library");
    } catch (e) {
      console.log("[Roans-ComfyUI-Tools] could not remove core Models tab:", e);
    }
  }
  return !coreTabIds().includes("model-library");
}
function syncCoreModelsTab() {
  let on = true;
  try {
    const v = app.extensionManager.setting?.get?.(HIDE_CORE_SETTING);
    if (typeof v === "boolean") on = v;
  } catch (e) {}
  if (!on) return;
  // core tabs are registered during app init, so retry briefly rather than assume order
  if (dropCoreModelsTab()) {
    console.log("[Roans-ComfyUI-Tools] removed ComfyUI's built-in Models tab");
    return;
  }
  let tries = 0;
  const t = setInterval(() => {
    if (dropCoreModelsTab() || ++tries > 12) {
      clearInterval(t);
      if (tries <= 12) console.log("[Roans-ComfyUI-Tools] removed ComfyUI's built-in Models tab");
    }
  }, 400);
}

app.registerExtension({
  name: "roans.comfyui.tools",
  settings: [
    {
      id: HIDE_CORE_SETTING,
      name: "Hide ComfyUI's built-in Models tab (Roans ComfyUI Tools supplies its own)",
      type: "boolean",
      defaultValue: true,
      onChange: () => {
        toast("reload the page to apply", "info");
      },
    },
  ],
  async setup() {
    await load().catch(() => null);

    const make = (id, icon, title, tooltip, painter) => {
      app.extensionManager.registerSidebarTab({
        id,
        icon,
        title,
        tooltip,
        type: "custom",
        destroy: () => {
          if (pollTimer) clearInterval(pollTimer);
        },
        render: async (root) => {
          try {
            await load();
            repaint = painter(root);
          } catch (e) {
            root.innerHTML = `<div style="padding:12px;font-size:12px;opacity:.7">library api unreachable<br>${e}</div>`;
          }
        },
      });
    };

    make("roansModels", "pi pi-database", "Models", "Local models, links and notes", renderModels);
    make("roansPrompts", "pi pi-comment", "Prompts", "Saved prompts plus prompts pulled from your workflows", renderPrompts);

    syncCoreModelsTab();
    pollTimer = setInterval(pollUi, 4000);
    console.log("[Roans-ComfyUI-Tools] Models + Prompts tabs registered");
  },
});
