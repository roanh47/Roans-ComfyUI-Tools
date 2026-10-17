import { app } from "../../scripts/app.js";

const API = "/Roans-ComfyUI-Tools/api";

const css = {
  wrap: "display:flex;flex-direction:column;gap:7px;padding:9px;font-size:12px;color:var(--fg-color,#ddd);height:100%;box-sizing:border-box;",
  list: "display:flex;flex-direction:column;gap:6px;overflow-y:auto;padding-right:2px;",
  row: "border:1px solid var(--border-color,#444);border-radius:6px;padding:7px 8px;display:flex;flex-direction:column;gap:4px;",
  muted: "opacity:.6;font-size:11px;",
  input: "width:100%;box-sizing:border-box;background:var(--comfy-input-bg,#222);color:inherit;border:1px solid var(--border-color,#444);border-radius:5px;padding:4px 6px;font-size:11px;",
  btn: "background:var(--comfy-input-bg,#2a2a2a);color:inherit;border:1px solid var(--border-color,#444);border-radius:5px;padding:3px 7px;font-size:11px;cursor:pointer;",
  text: "white-space:pre-wrap;word-break:break-word;font-size:11px;max-height:90px;overflow:auto;opacity:.9;",
  chips: "display:flex;flex-wrap:wrap;gap:4px;",
  badge: "font-size:10px;padding:1px 6px;border-radius:99px;border:1px solid var(--border-color,#444);opacity:.85;white-space:nowrap;",
  grid: "display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:11px;align-items:baseline;",
  label: "opacity:.55;white-space:nowrap;",
  val: "word-break:break-word;",
  group: "display:flex;gap:5px;align-items:center;margin-top:4px;font-size:11px;opacity:.7;",
};

let STATE = null;
const FIELDS = [
  ["name", "Name"],
  ["model_type", "Model Type"],
  ["file_type", "File Type"],
  ["version", "Downloaded Version"],
  ["base", "Base model"],
  ["link", "Link"],
  ["why", "Why?"],
  ["keyword", "Lora Keyword"],
  ["rank", "Rank?"],
  ["note", "Notes"],
];

function el(tag, style, text) {
  const n = document.createElement(tag);
  if (style) n.style.cssText = style;
  if (text != null) n.textContent = text;
  return n;
}
function badge(text, extra) {
  return el("span", css.badge + (extra || ""), text);
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
  STATE = await api(`/state${force ? "?force=1" : ""}`);
  return STATE;
}
function size(bytes) {
  return bytes >= 1073741824 ? (bytes / 1073741824).toFixed(1) + " GB" : (bytes / 1048576).toFixed(0) + " MB";
}
function openWorkflow(file) {
  api(`/workflow?file=${encodeURIComponent(file)}`)
    .then((graph) => {
      app.loadGraphData(graph);
      toast("opened " + file);
    })
    .catch((e) => toast("could not open " + file, "error"));
}
function copy(text, what) {
  navigator.clipboard.writeText(text);
  toast("copied " + what);
}

/* ---------------------------------------------------------------- models tab */

function renderModels(root) {
  root.innerHTML = "";
  const wrap = el("div", css.wrap);
  root.appendChild(wrap);

  const head = el("div", "display:flex;gap:5px;");
  const search = el("input", css.input);
  search.placeholder = "search name, file, why, keyword…";
  const rescan = el("button", css.btn, "rescan");
  head.append(search, rescan);
  wrap.appendChild(head);

  const chips = el("div", css.chips);
  wrap.appendChild(chips);
  const count = el("div", css.muted);
  wrap.appendChild(count);
  const list = el("div", css.list);
  wrap.appendChild(list);

  let filter = "All";
  const fieldText = (m) => FIELDS.map(([k]) => m[k] || "").join(" ") + " " + (m.auto_tags || []).join(" ");

  function draw() {
    chips.innerHTML = "";
    const types = ["All", ...new Set(STATE.models.map((m) => m.model_type))];
    for (const t of types) {
      const c = el("button", css.btn + (t === filter ? ";border-color:#7aa2f7;color:#7aa2f7;" : ""), t);
      c.onclick = () => {
        filter = t;
        draw();
      };
      chips.appendChild(c);
    }
    list.innerHTML = "";
    const q = search.value.toLowerCase().trim();
    const rows = STATE.models.filter(
      (m) => (filter === "All" || m.model_type === filter) && (!q || fieldText(m).toLowerCase().includes(q))
    );
    count.textContent = `${rows.length} of ${STATE.models.length} models on disk`;
    if (!rows.length) list.appendChild(el("div", css.muted, "nothing matches"));

    for (const m of rows) {
      const row = el("div", css.row);
      const title = el("div", "display:flex;gap:5px;align-items:center;flex-wrap:wrap;");
      title.appendChild(el("strong", "font-size:12px;", m.name));
      title.appendChild(badge(m.model_type, ";border-color:#5b8a5b;"));
      if (m.file_type) title.appendChild(badge(m.file_type, ";border-color:#a06ca0;"));
      title.appendChild(badge(size(m.size)));
      title.appendChild(el("span", "flex:1;"));
      const edit = el("button", css.btn, "edit");
      title.appendChild(edit);
      row.appendChild(title);

      const grid = el("div", css.grid);
      const put = (label, value, dim) => {
        if (!value) return;
        grid.appendChild(el("div", css.label, label));
        if (label === "Link") {
          const a = el("a", "color:#7aa2f7;word-break:break-all;", value);
          a.href = value;
          a.target = "_blank";
          grid.appendChild(a);
        } else {
          grid.appendChild(el("div", css.val + (dim ? ";opacity:.6;" : ""), value));
        }
      };
      put("Filename", m.filename);
      put("Downloaded Version", m.version || m.version_suggested, !m.version);
      put("Base model", m.base || m.base_detected, !m.base);
      put("Link", m.link);
      put("Why?", m.why);
      put("Lora Keyword", m.keyword);
      put("Rank?", m.rank);
      put("Notes", m.note);
      if (m.lora_dim) put("Lora dim", m.lora_dim);
      if (m.auto_tags?.length) put("Trained on", m.auto_tags.join(", "), true);
      row.appendChild(grid);

      const form = el("div", "display:none;flex-direction:column;gap:4px;");
      const inputs = {};
      for (const [key, label] of FIELDS) {
        const i = el(key === "note" ? "textarea" : "input", css.input);
        if (key === "note") i.rows = 3;
        i.placeholder = label;
        i.value =
          key === "version" ? m.version || m.version_suggested
          : key === "base" ? m.base || m.base_detected
          : m[key] || "";
        if (key === "file_type") i.placeholder = `File Type (detected: ${m.file_type_detected || "?"})`;
        inputs[key] = i;
        form.appendChild(i);
      }
      const save = el("button", css.btn, "save");
      save.onclick = async () => {
        const payload = { filename: m.filename };
        for (const [key] of FIELDS) payload[key] = inputs[key].value;
        await api("/model", payload);
        toast("saved " + m.filename);
        await load(true);
        draw();
      };
      const reset = el("button", css.btn, "save + rescan");
      reset.onclick = async () => {
        const payload = { filename: m.filename };
        for (const [key] of FIELDS) payload[key] = inputs[key].value;
        await api("/model", payload);
        toast("saved, folders rescanned");
        await load(true);
        draw();
      };
      form.append(el("div", "display:flex;gap:5px;", ""), save, reset);
      edit.onclick = () => {
        form.style.display = form.style.display === "none" ? "flex" : "none";
      };
      row.appendChild(form);
      list.appendChild(row);
    }
  }

  search.oninput = draw;
  rescan.onclick = async () => {
    await api("/rescan", {});
    await load(true);
    draw();
    toast("rescanned");
  };
  draw();
}

/* --------------------------------------------------------------- prompts tab */

function promptForm(host, preset, onDone) {
  const form = el("div", "display:flex;flex-direction:column;gap:4px;border:1px dashed var(--border-color,#444);border-radius:6px;padding:7px;");
  const name = el("input", css.input);
  name.placeholder = "name";
  name.value = preset.name || "";
  const positive = el("textarea", css.input);
  positive.rows = 4;
  positive.placeholder = "positive prompt";
  positive.value = preset.positive || "";
  const negative = el("textarea", css.input);
  negative.rows = 3;
  negative.placeholder = "negative prompt";
  negative.value = preset.negative || "";
  const tags = el("input", css.input);
  tags.placeholder = "tags, comma separated";
  tags.value = (preset.tags || []).join(", ");

  const wf = el("select", css.input);
  const none = el("option", null, "— no workflow attached —");
  none.value = "";
  wf.appendChild(none);
  for (const w of STATE.workflows) {
    const o = el("option", null, w.name);
    o.value = w.file;
    wf.appendChild(o);
  }
  wf.value = preset.workflow || "";
  const wfLabel = el("div", css.muted, "corresponding workflow");

  const actions = el("div", "display:flex;gap:5px;");
  const save = el("button", css.btn, preset.id ? "update" : "save prompt");
  const cancel = el("button", css.btn, "cancel");
  actions.append(save, cancel);
  form.append(name, positive, negative, tags, wfLabel, wf, actions);
  host.appendChild(form);

  cancel.onclick = () => form.remove();
  save.onclick = async () => {
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
    form.remove();
    await load();
    onDone();
  };
}

function renderPrompts(root) {
  root.innerHTML = "";
  const wrap = el("div", css.wrap);
  root.appendChild(wrap);

  const head = el("div", "display:flex;gap:5px;");
  const search = el("input", css.input);
  search.placeholder = "search prompts…";
  const add = el("button", css.btn, "+ new");
  head.append(search, add);
  wrap.appendChild(head);

  const formHost = el("div");
  wrap.appendChild(formHost);
  add.onclick = () => promptForm(formHost, {}, () => draw());

  const list = el("div", css.list);
  wrap.appendChild(list);

  function card(p) {
    const row = el("div", css.row);
    const title = el("div", "display:flex;gap:5px;align-items:center;flex-wrap:wrap;");
    title.appendChild(el("strong", "font-size:12px;", p.name));
    title.appendChild(badge(p.derived ? "from workflow" : "saved", p.derived ? "" : ";border-color:#5b8a5b;"));
    if (p.checkpoint) title.appendChild(badge(p.checkpoint.replace(/\.safetensors$/, "")));
    for (const l of p.loras || []) title.appendChild(badge(l.replace(/\.safetensors$/, "")));
    for (const t of p.tags || []) title.appendChild(badge(t));
    row.appendChild(title);

    row.appendChild(el("div", css.text, p.positive));

    const actions = el("div", "display:flex;gap:5px;flex-wrap:wrap;");
    const cpos = el("button", css.btn, "copy positive");
    cpos.onclick = () => copy(p.positive, "positive");
    actions.appendChild(cpos);
    if (p.negative) {
      const cneg = el("button", css.btn, "copy negative");
      cneg.onclick = () => copy(p.negative, "negative");
      actions.appendChild(cneg);
      const showNeg = el("button", css.btn, "negative");
      const negBox = el("div", css.text + "display:none;");
      negBox.textContent = p.negative;
      showNeg.onclick = () => {
        negBox.style.display = negBox.style.display === "none" ? "block" : "none";
      };
      actions.appendChild(showNeg);
      row.appendChild(actions);
      row.appendChild(negBox);
    } else {
      row.appendChild(actions);
    }

    if (p.workflow) {
      const line = el("div", "display:flex;gap:5px;align-items:center;flex-wrap:wrap;");
      line.appendChild(el("span", css.label, "workflow:"));
      line.appendChild(badge(p.workflow));
      const open = el("button", css.btn, "open in canvas");
      open.onclick = () => openWorkflow(p.workflow);
      line.appendChild(open);
      row.appendChild(line);
    }

    const foot = el("div", "display:flex;gap:5px;flex-wrap:wrap;");
    if (p.derived) {
      const keep = el("button", css.btn, "save to library");
      keep.onclick = () => promptForm(formHost, { ...p, id: undefined }, () => draw());
      foot.appendChild(keep);
      const attach = el("button", css.btn, "edit + attach workflow");
      attach.onclick = () => promptForm(formHost, p, () => draw());
      foot.appendChild(attach);
    } else {
      const edit = el("button", css.btn, "edit");
      edit.onclick = () => promptForm(formHost, p, () => draw());
      foot.appendChild(edit);
      const del = el("button", css.btn, "delete");
      del.onclick = async () => {
        await api("/prompt_delete", { id: p.id });
        await load();
        draw();
        toast("deleted");
      };
      foot.appendChild(del);
    }
    if (p.note) row.appendChild(el("div", css.muted, p.note));
    row.appendChild(foot);
    return row;
  }

  function draw() {
    list.innerHTML = "";
    const q = search.value.toLowerCase().trim();
    const hit = (p) =>
      !q ||
      p.positive.toLowerCase().includes(q) ||
      (p.negative || "").toLowerCase().includes(q) ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.tags || []).join(" ").toLowerCase().includes(q);
    const saved = STATE.prompts.filter((p) => !p.derived && hit(p));
    const derived = STATE.prompts.filter((p) => p.derived && hit(p));
    list.appendChild(el("div", css.group, `saved (${saved.length})`));
    for (const p of saved) list.appendChild(card(p));
    list.appendChild(el("div", css.group, `pulled from workflow files (${derived.length})`));
    for (const p of derived) list.appendChild(card(p));
    if (!saved.length && !derived.length) list.appendChild(el("div", css.muted, "nothing matches"));
  }

  search.oninput = draw;
  draw();
}

/* ------------------------------------------------------------ registration */

app.registerExtension({
  name: "roans.comfyui.tools",
  async setup() {
    await load().catch(() => null);

    const make = (id, icon, title, tooltip, painter) => {
      app.extensionManager.registerSidebarTab({
        id,
        icon,
        title,
        tooltip,
        type: "custom",
        render: async (root) => {
          try {
            await load(); // always rescan, so newly downloaded models show up
            painter(root);
          } catch (e) {
            root.innerHTML = `<div style="padding:10px;font-size:12px;opacity:.7">library api unreachable<br>${e}</div>`;
          }
        },
      });
    };

    make("hermesModels", "pi pi-database", "Models", "Local models, links and notes", renderModels);
    make("hermesPrompts", "pi pi-comment", "Prompts", "Saved prompts plus prompts pulled from your workflows", renderPrompts);
    console.log("[Roans-ComfyUI-Tools] Models + Prompts tabs registered");
  },
});
