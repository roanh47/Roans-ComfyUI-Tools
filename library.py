"""Model + prompt library for the Roans ComfyUI Tools sidebar tabs.

Reads the real model folders and the real workflow files, so nothing is kept in
sync by hand. Fields that can be read off the files themselves (fp16/bf16, base
model, lora rank, training tags) are detected; the rest live in data/library.json.
Stdlib only.
"""

import hashlib
import json
import urllib.request
import os
import re
import time

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(NODE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "library.json")

MODEL_EXTS = (".safetensors", ".ckpt", ".pt", ".pth", ".gguf", ".bin")
HEADER_LIMIT = 32 * 1024 * 1024  # safetensors headers are well under this

TYPE_LABELS = {
    "checkpoints": "Checkpoint",
    "loras": "LORA",
    "diffusion_models": "Diffusion Model",
    "unet": "Diffusion Model",
    "vae": "VAE",
    "text_encoders": "Text Encoder",
    "clip": "Text Encoder",
    "clip_vision": "CLIP Vision",
    "controlnet": "ControlNet",
    "embeddings": "Embedding",
    "upscale_models": "Upscaler",
    "latent_upscale_models": "Upscaler",
    "audio_encoders": "Audio Encoder",
    "model_patches": "Model Patch",
    "style_models": "Style Model",
    "background_removal": "Background Removal",
}

DTYPES = {
    "BF16": "bf16",
    "F16": "fp16",
    "F32": "fp32",
    "F64": "fp64",
    "F8_E4M3": "fp8",
    "F8_E5M2": "fp8",
    "I8": "int8",
    "U8": "uint8",
    "I32": "int32",
    "I64": "int64",
}

DTYPE_BYTES = {
    "F64": 8,
    "I64": 8,
    "F32": 4,
    "I32": 4,
    "U32": 4,
    "BF16": 2,
    "F16": 2,
    "U16": 2,
    "F8": 1,
    "I8": 1,
    "U8": 1,
    "BOOL": 1,
}

_CACHE = {"at": 0.0, "models": None}
_META_CACHE = {}


def comfy_base():
    """The ComfyUI install root, whether or not we are imported inside ComfyUI."""
    try:
        import folder_paths

        return folder_paths.base_path
    except Exception:
        return os.path.dirname(os.path.dirname(NODE_DIR))


def _configured_roots():
    """Model roots from Comfy Desktop's extra-paths yaml, plus ComfyUI's own."""
    roots = []
    yaml_dir = os.path.join(os.environ.get("APPDATA", ""), "Comfy Desktop", "instance-model-paths")
    if os.path.isdir(yaml_dir):
        for f in sorted(os.listdir(yaml_dir)):
            if not f.endswith((".yaml", ".yml")):
                continue
            with open(os.path.join(yaml_dir, f), encoding="utf-8", errors="ignore") as fh:
                for line in fh:
                    if line.strip().startswith("base_path:"):
                        base = line.split(":", 1)[1].strip().strip("'\"")
                        if base and base not in roots:
                            roots.append(base)
    roots.append(os.path.join(comfy_base(), "models"))
    return roots


def _root_folders():
    dirs = {}
    for root in _configured_roots():
        if not os.path.isdir(root):
            continue
        for entry in os.listdir(root):
            if os.path.isdir(os.path.join(root, entry)):
                dirs.setdefault(entry, []).append(os.path.join(root, entry))
    return dirs


def model_dirs():
    """{folder_name: [dirs]} for every model folder ComfyUI actually searches."""
    dirs = {}
    try:
        import folder_paths

        for name, (paths, _exts) in folder_paths.folder_names_and_paths.items():
            dirs.setdefault(name, []).extend(paths)
    except Exception:
        pass
    # Merge the extra paths too: they are only registered once ComfyUI boots with
    # its --extra-model-paths-config, which is not guaranteed to have happened yet.
    for folder, paths in _root_folders().items():
        for path in paths:
            dirs.setdefault(folder, []).append(path)
    return dirs


def workflows_dir():
    return os.path.join(comfy_base(), "user", "default", "workflows")


# --------------------------------------------------------------- file inspection


def _safetensors_header(path):
    """The JSON header of a safetensors file — read without touching the weights."""
    try:
        with open(path, "rb") as fh:
            raw = fh.read(8)
            if len(raw) < 8:
                return None
            size = int.from_bytes(raw, "little")
            if size <= 0 or size > HEADER_LIMIT:
                return None
            blob = fh.read(size)
        return json.loads(blob)
    except Exception:
        return None


def _meta_for(path, name):
    """Cached {file_type, base, lora_dim, auto_tags} straight off the model file."""
    try:
        st = os.stat(path)
    except OSError:
        return {}
    key = (path, st.st_size, int(st.st_mtime))
    if key in _META_CACHE:
        return _META_CACHE[key]

    out = {"file_type": "", "base": "", "lora_dim": "", "auto_tags": []}
    if name.lower().endswith(".gguf"):
        m = re.search(r"[._-]((?:IQ|Q)\d+(?:[_A-Z0-9]+)?|F16|F32|BF16|F8)", name, re.I)
        out["file_type"] = ("GGUF " + m.group(1).upper()) if m else "GGUF"
    elif name.lower().endswith(".safetensors"):
        header = _safetensors_header(path)
        if header:
            # weight by bytes: a model's real dtype is its bulk, not its most
            # numerous tensor — quantized files carry lots of small fp32 scales.
            tally = {}
            for k, v in header.items():
                if k == "__metadata__" or not isinstance(v, dict):
                    continue
                dt = v.get("dtype")
                if not dt:
                    continue
                try:
                    numel = 1
                    for dim in v.get("shape") or []:
                        numel *= int(dim)
                except Exception:
                    numel = 1
                tally[dt] = tally.get(dt, 0) + numel * DTYPE_BYTES.get(dt.split("_")[0], 4)
            if tally:
                top = max(tally, key=tally.get)
                label = DTYPES.get(top)
                out["file_type"] = f"{label} SafeTensor" if label else "SafeTensor"
            else:
                out["file_type"] = "SafeTensor"
            meta = header.get("__metadata__") or {}
            out["base"] = (
                meta.get("ss_base_model_version")
                or meta.get("modelspec.architecture")
                or meta.get("ss_sd_model_name")
                or ""
            )
            dim = meta.get("ss_network_dim")
            out["lora_dim"] = str(dim) if dim else ""
            tags = meta.get("ss_tag_frequency")
            if tags:
                try:
                    buckets = json.loads(tags)
                    tally = {}
                    for bucket in buckets.values():
                        if isinstance(bucket, dict):
                            for tag, n in bucket.items():
                                tally[tag] = tally.get(tag, 0) + (n if isinstance(n, (int, float)) else 0)
                    out["auto_tags"] = [t for t, _ in sorted(tally.items(), key=lambda kv: -kv[1])[:8]]
                except Exception:
                    pass
    else:
        out["file_type"] = name.rsplit(".", 1)[-1].upper()
    _META_CACHE[key] = out
    return out


def suggest_version(name):
    """Last-resort 'Downloaded Version' guess from the filename."""
    m = re.search(r"[._-][vV](\d+(?:[._]\d+)*)", name)
    if m:
        return "v" + m.group(1).replace("_", ".")
    m = re.search(r"[._-]e(\d+)\b", name)
    if m:
        return "e" + m.group(1)
    return ""


def pretty_name(name):
    """Give an un-named file something readable to show as its Name."""
    stem = re.sub(r"\.(safetensors|ckpt|pt|pth|gguf|bin)$", "", name, flags=re.I)
    return re.sub(r"[_-]+", " ", stem).strip()


# ------------------------------------------------------------------ store


def load_store():
    if not os.path.exists(DATA_FILE):
        return {"models": {}, "prompts": []}
    with open(DATA_FILE, encoding="utf-8") as fh:
        data = json.load(fh)
    data.setdefault("models", {})
    data.setdefault("prompts", [])
    data.setdefault("wf_meta", {})       # per workflow: display name, pin, custom order
    data.setdefault("wf_folders", {})    # per folder: order, pin, collapsed
    data.setdefault("model_folders", {})  # per model folder: order, pin
    data.setdefault("hashes", {})        # filename -> {size, mtime, sha256}
    data.setdefault("lookups", {})       # sha256 -> whatever the lookup returned
    for entry in data["models"].values():
        if "type" in entry and "model_type" not in entry:  # older key name
            entry["model_type"] = entry.pop("type")
    return data


def save_store(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp = DATA_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
    os.replace(tmp, DATA_FILE)


CIVITAI_BY_HASH = "https://civitai.com/api/v1/model-versions/by-hash/"
LOOKUP_UA = "Roans-ComfyUI-Tools/1.0"


def file_sha256(path, store=None):
    """SHA256 of a model file, remembered per (name, size, mtime) so a rescan
    never rehashes gigabytes. Pass the caller's store so caches are not
    clobbered by a stale copy being saved afterwards."""
    store = store if store is not None else load_store()
    name = os.path.basename(path)
    try:
        st = os.stat(path)
    except OSError:
        return ""
    key = (name, st.st_size, int(st.st_mtime))
    cached = store["hashes"].get(name)
    if cached and (cached.get("size"), cached.get("mtime")) == key[1:]:
        return cached.get("sha256", "")
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 22), b""):
            h.update(chunk)
    digest = h.hexdigest()
    store["hashes"][name] = {"size": st.st_size, "mtime": int(st.st_mtime), "sha256": digest}
    save_store(store)
    return digest


def civitai_by_hash(digest, store=None):
    """Ask Civitai which model version this file is. None when it is unknown."""
    if not digest:
        return None
    store = store if store is not None else load_store()
    if digest in store["lookups"]:
        return store["lookups"][digest]
    try:
        req = urllib.request.Request(CIVITAI_BY_HASH + digest, headers={"User-Agent": LOOKUP_UA})
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception:
        return None
    store["lookups"][digest] = data
    return data


def relink_models(limit=None, only=None, mirror="civitai.red", refresh=False):
    """Fill in the model metadata nobody should have to type: page link, base
    model, version and trigger words, taken from the file's own hash.

    Only empty fields are written — anything you typed yourself stays."""
    store = load_store()
    linked, failed, skipped = [], [], []
    targets = scan_models()
    if only:
        targets = [m for m in targets if m["filename"] == only]
    for m in targets:
        if not only and m.get("link") and not refresh:
            continue
        if limit is not None and len(linked) + len(failed) >= limit:
            break
        path = m.get("path") or ""
        if not path or not os.path.isfile(path):
            skipped.append(m["filename"])
            continue
        digest = file_sha256(path, store)
        data = civitai_by_hash(digest, store)
        if not data:
            failed.append(m["filename"])
            continue
        entry = store["models"].setdefault(m["filename"], {})
        auto = bool(entry.get("auto_linked"))
        model_id = data.get("modelId")
        version_id = data.get("id")
        if model_id and version_id and (not entry.get("link") or refresh):
            entry["link"] = f"https://{mirror}/models/{model_id}?modelVersionId={version_id}"
        if data.get("baseModel") and (not entry.get("base") or refresh):
            entry["base"] = data["baseModel"]
        if data.get("name") and (not entry.get("version") or refresh):
            # labels read "v{version}", so drop a leading v ONLY when a digit
            # follows ("v17.0" -> "17.0"); names like "VAE" must survive intact
            entry["version"] = re.sub(r"^[vV](?=\d)", "", str(data["name"]))

        words = [w for w in (data.get("trainedWords") or []) if w]
        if words and (not entry.get("keyword") or (refresh and auto)):
            entry["keyword"] = ", ".join(words[:8])
        if not entry.get("auto_linked"):
            entry["auto_linked"] = int(time.time())
        linked.append({
            "file": m["filename"],
            "link": entry.get("link", ""),
            "base": entry.get("base", ""),
            "version": entry.get("version", ""),
            "keyword": entry.get("keyword", ""),
        })
    save_store(store)
    return {"linked": linked, "unknown": failed, "skipped": skipped}


def scan_models(force=False):
    """Every model on disk, with detected fields merged over the saved ones."""
    if not force and _CACHE["models"] is not None and time.time() - _CACHE["at"] < 5:
        return _CACHE["models"]

    store = load_store()
    items = []
    seen = set()
    for folder, dirs in model_dirs().items():
        label = TYPE_LABELS.get(folder, folder.replace("_", " ").title())
        for d in dirs:
            if not os.path.isdir(d):
                continue
            for root, _sub, files in os.walk(d):
                for name in files:
                    if not name.lower().endswith(MODEL_EXTS) or name in seen:
                        continue
                    seen.add(name)
                    full = os.path.join(root, name)
                    try:
                        st = os.stat(full)
                    except OSError:
                        continue
                    saved = store["models"].get(name, {})
                    meta = _meta_for(full, name)
                    items.append(
                        {
                            "filename": name,
                            "folder": folder,
                            "name": saved.get("name") or pretty_name(name),
                            "name_custom": bool(saved.get("name")),
                            "model_type": saved.get("model_type") or label,
                            "file_type": saved.get("file_type") or meta.get("file_type", ""),
                            "file_type_detected": meta.get("file_type", ""),
                            "version": saved.get("version", ""),
                            "version_suggested": suggest_version(name),
                            "base": saved.get("base", ""),
                            "base_detected": meta.get("base", ""),
                            "link": saved.get("link", ""),
                            "why": saved.get("why", ""),
                            "keyword": saved.get("keyword", ""),
                            "rank": saved.get("rank", ""),
                            "note": saved.get("note", ""),
                            "pinned": bool(saved.get("pinned")),
                            "tags": saved.get("tags", []),
                            "lora_dim": meta.get("lora_dim", ""),
                            "auto_tags": meta.get("auto_tags", []),
                            "size": st.st_size,
                            "modified": int(st.st_mtime),
                            "path": full,
                        }
                    )
    order = list(TYPE_LABELS.values())
    items.sort(key=lambda i: (order.index(i["model_type"]) if i["model_type"] in order else 99, i["filename"].lower()))
    _CACHE.update(at=time.time(), models=items)
    return items


# ------------------------------------------------------------- workflow files


def _widgets(node):
    return node.get("widgets_values") or []


def _resolve_text(nodes_by_id, links, target_id, input_name):
    node = nodes_by_id.get(target_id)
    if not node:
        return None
    for inp in node.get("inputs") or []:
        if inp.get("name") != input_name:
            continue
        for link in links:
            if link and link[0] == inp.get("link"):
                src = nodes_by_id.get(link[1])
                if src and src.get("type") == "CLIPTextEncode":
                    wv = _widgets(src)
                    return wv[0] if wv else None
    return None


def parse_workflow(path):
    """Pull the model/prompt/settings facts out of a saved workflow file."""
    name = os.path.basename(path)[:-5]
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except Exception as exc:
        return {"name": name, "file": os.path.basename(path), "rel": wf_rel(path), "error": str(exc)}

    out = {
        "name": name,
        "file": os.path.basename(path),
        "rel": wf_rel(path),
        "folder": os.path.dirname(wf_rel(path).replace("\\", "/")),
        "path": path,
        "modified": int(os.path.getmtime(path)),
        "format": "ui",
        "checkpoint": "",
        "vae": "",
        "clip_skip": None,
        "loras": [],
        "positive": "",
        "negative": "",
        "sampler": {},
        "size": "",
        "nodes": 0,
    }

    if "nodes" in data:
        nodes = data.get("nodes") or []
        links = data.get("links") or []
        out["nodes"] = len(nodes)
        by_id = {n.get("id"): n for n in nodes}
        texts = []
        for node in nodes:
            t = node.get("type") or ""
            wv = _widgets(node)
            if t in ("CheckpointLoaderSimple", "CheckpointLoader") and wv:
                out["checkpoint"] = str(wv[0])
            elif t == "VAELoader" and wv:
                out["vae"] = str(wv[0])
            elif t == "CLIPSetLastLayer" and wv:
                out["clip_skip"] = wv[0]
            elif t == "LoraLoader" and len(wv) >= 3:
                out["loras"].append(
                    {"name": str(wv[0]), "strength": wv[1], "strength_clip": wv[2], "equal": wv[1] == wv[2]}
                )
            elif t == "CLIPTextEncode" and wv and isinstance(wv[0], str):
                texts.append((node.get("id"), wv[0]))
            elif t == "EmptyLatentImage" and len(wv) >= 2:
                out["size"] = f"{wv[0]}x{wv[1]}"
            elif t == "KSampler" and len(wv) >= 7:
                out["sampler"] = {
                    "seed": wv[0],
                    "steps": wv[2],
                    "cfg": wv[3],
                    "sampler": wv[4],
                    "scheduler": wv[5],
                    "denoise": wv[6],
                }
                out["_ks"] = node.get("id")
        if out.get("_ks") is not None:
            pos = _resolve_text(by_id, links, out["_ks"], "positive")
            neg = _resolve_text(by_id, links, out["_ks"], "negative")
            out["positive"] = pos if pos is not None else (texts[0][1] if texts else "")
            out["negative"] = neg if neg is not None else (texts[1][1] if len(texts) > 1 else "")
        elif texts:
            out["positive"] = texts[0][1]
            out["negative"] = texts[1][1] if len(texts) > 1 else ""
        out.pop("_ks", None)
    else:
        out["format"] = "api"
        out["nodes"] = len(data)
        texts = []
        for _id, node in data.items():
            if not isinstance(node, dict):
                continue
            ct = node.get("class_type") or ""
            inp = node.get("inputs") or {}
            if ct in ("CheckpointLoaderSimple", "CheckpointLoader"):
                out["checkpoint"] = str(inp.get("ckpt_name", ""))
            elif ct == "VAELoader":
                out["vae"] = str(inp.get("vae_name", ""))
            elif ct == "CLIPSetLastLayer":
                out["clip_skip"] = inp.get("stop_at_clip_layer")
            elif ct == "LoraLoader":
                out["loras"].append(
                    {
                        "name": str(inp.get("lora_name", "")),
                        "strength": inp.get("strength_model"),
                        "strength_clip": inp.get("strength_clip"),
                        "equal": inp.get("strength_model") == inp.get("strength_clip"),
                    }
                )
            elif ct == "CLIPTextEncode":
                texts.append(str(inp.get("text", "")))
            elif ct == "EmptyLatentImage":
                out["size"] = f"{inp.get('width')}x{inp.get('height')}"
            elif ct == "KSampler":
                out["sampler"] = {
                    "seed": inp.get("seed"),
                    "steps": inp.get("steps"),
                    "cfg": inp.get("cfg"),
                    "sampler": inp.get("sampler_name"),
                    "scheduler": inp.get("scheduler"),
                    "denoise": inp.get("denoise"),
                }
        if texts:
            out["positive"] = texts[0]
            out["negative"] = texts[1] if len(texts) > 1 else ""

    return out


def wf_rel(path):
    """A workflow's path relative to the workflows root, forward slashes."""
    return os.path.relpath(path, workflows_dir()).replace("\\", "/")


def wf_abs(rel):
    """Absolute path for a workflow-relative path, refusing anything outside the root."""
    root = os.path.abspath(workflows_dir())
    target = os.path.abspath(os.path.join(root, rel.replace("/", os.sep)))
    if target != root and not target.startswith(root + os.sep):
        raise ValueError(f"path escapes the workflows folder: {rel}")
    return target


def wf_folders():
    """Every folder under the workflows root, nested ones included.

    Dot-folders (.trash) are bookkeeping, not content: they stay hidden."""
    root = workflows_dir()
    if not os.path.isdir(root):
        return []
    out = []
    for dirpath, dirs, _files in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        rel = os.path.relpath(dirpath, root).replace("\\", "/")
        if rel != "." and not rel.startswith("."):
            out.append(rel)
    return sorted(out)


def wf_mkdir(folder):
    """Create a folder (and parents) under the workflows root."""
    folder = (folder or "").strip().strip("/")
    if not folder:
        raise ValueError("folder name is required")
    target = wf_abs(folder)
    os.makedirs(target, exist_ok=True)
    return folder


def wf_move(rel, folder):
    """Move a workflow file into a folder under the workflows root."""
    src = wf_abs(rel)
    if not os.path.isfile(src):
        raise FileNotFoundError(rel)
    folder = (folder or "").strip().strip("/")
    dest_dir = wf_abs(folder) if folder else os.path.abspath(workflows_dir())
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, os.path.basename(src))
    if os.path.abspath(src) == os.path.abspath(dest):
        return wf_rel(dest)
    if os.path.exists(dest):
        raise FileExistsError(f"{os.path.basename(src)} already exists in {folder or 'the root'}")
    os.replace(src, dest)
    return wf_rel(dest)


def wf_trash_dir():
    """Deletions move here instead of disappearing."""
    d = os.path.join(workflows_dir(), ".trash")
    os.makedirs(d, exist_ok=True)
    return d


def _unique(path):
    if not os.path.exists(path):
        return path
    base, n = path, 1
    while os.path.exists(f"{base}-{n}"):
        n += 1
    return f"{base}-{n}"


def _move_meta_prefix(store, old, new):
    """Keep folder metadata and per-workflow metadata pointing at the new path."""
    for key in list(store.get("wf_folders", {})):
        if key == old or key.startswith(old + "/"):
            store["wf_folders"][new + key[len(old):]] = store["wf_folders"].pop(key)
    for key in list(store.get("wf_meta", {})):
        if key == old or key.startswith(old + "/"):
            store["wf_meta"][new + key[len(old):]] = store["wf_meta"].pop(key)


def wf_delete(rel):
    """Move one workflow into .trash — recoverable, never a hard delete."""
    src = wf_abs(rel)
    if not os.path.isfile(src):
        raise FileNotFoundError(rel)
    if rel.split("/")[0] == ".trash":
        raise ValueError("that file is already in the trash")
    dest = _unique(os.path.join(wf_trash_dir(), os.path.basename(src)))
    os.replace(src, dest)
    store = load_store()
    store.get("wf_meta", {}).pop(rel, None)
    save_store(store)
    return os.path.basename(dest)


def wf_rmdir(folder):
    """Move a whole folder into .trash, metadata included.

    A folder row can exist with no directory behind it: a name that only ever reached the
    store, or a directory that was removed outside the UI. Trashing it still succeeds —
    the bookkeeping is parked under .trash and the stale keys are dropped — instead of
    answering 400, which left the row undeletable.
    """
    folder = (folder or "").strip().strip("/")
    if not folder:
        raise ValueError("refusing to delete the root")
    src = wf_abs(folder)
    store = load_store()
    if not os.path.isdir(src):
        parked = ".trash/" + os.path.basename(folder)
        _move_meta_prefix(store, folder, parked)
        save_store(store)
        return parked
    dest = _unique(os.path.join(wf_trash_dir(), os.path.basename(folder)))
    os.replace(src, dest)
    _move_meta_prefix(store, folder, ".trash/" + os.path.basename(dest))
    # the folder is gone, so its metadata goes too
    for key in list(store.get("wf_folders", {})):
        if key == folder or key.startswith(folder + "/"):
            store["wf_folders"].pop(key, None)
    for key in list(store.get("wf_meta", {})):
        if key == folder or key.startswith(folder + "/"):
            store["wf_meta"].pop(key, None)
    save_store(store)
    return wf_rel(dest)


def wf_rename_folder(folder, name):
    """Rename a folder on disk, keeping its metadata and order."""
    folder = (folder or "").strip().strip("/")
    name = (name or "").strip().strip("/")
    if not folder:
        raise ValueError("the root has no name")
    if not name or "/" in name or name.startswith("."):
        raise ValueError("a folder name cannot be empty, contain / or start with a dot")
    src = wf_abs(folder)
    if not os.path.isdir(src):
        raise FileNotFoundError(folder)
    parent = os.path.dirname(folder)
    target_rel = f"{parent}/{name}" if parent else name
    dest = wf_abs(target_rel)
    if os.path.exists(dest):
        raise FileExistsError(target_rel)
    os.rename(src, dest)
    store = load_store()
    _move_meta_prefix(store, folder, target_rel)
    _move_meta_prefix(store, "", "")
    for key in list(store.get("wf_meta", {})):
        if key.startswith(folder + "/"):
            store["wf_meta"][target_rel + key[len(folder):]] = store["wf_meta"].pop(key)
    save_store(store)
    return target_rel


def wf_set_order(rels):
    """Remember a manual order: the list position becomes the stored index."""
    store = load_store()
    n = 0
    for i, rel in enumerate(rels or []):
        if not isinstance(rel, str) or not rel.lower().endswith(".json"):
            continue
        store["wf_meta"].setdefault(rel, {})["order"] = i
        n += 1
    save_store(store)
    return n


def scan_workflows(force=False):
    """Every workflow under the root, nested folders included, meta merged in."""
    root = workflows_dir()
    if not os.path.isdir(root):
        return []
    store = load_store()
    meta = store.get("wf_meta", {})
    items = []
    for dirpath, dirs, filenames in os.walk(root):
        dirs[:] = [d for d in dirs if not d.startswith(".")]  # skip .trash
        for name in sorted(filenames):
            if not name.lower().endswith(".json"):
                continue
            item = parse_workflow(os.path.join(dirpath, name))
            m = meta.get(item.get("rel", ""), {})
            item["display_name"] = m.get("name") or item["name"]
            item["pinned"] = bool(m.get("pinned"))
            item["order"] = m.get("order")
            items.append(item)
    items.sort(key=lambda i: i["modified"], reverse=True)
    return items


def live_prompts():
    """Prompt entries derived from whatever is in the workflow folder right now."""
    out = []
    for wf in scan_workflows():
        if not wf.get("positive"):
            continue
        out.append(
            {
                "id": f"wf::{wf.get('rel', wf['file'])}::pos",
                "name": wf["name"],
                "positive": wf["positive"],
                "negative": wf.get("negative", ""),
                "workflow": wf.get("rel", wf["file"]),
                "tags": [],
                "note": "",
                "checkpoint": wf.get("checkpoint", ""),
                "loras": [l["name"] for l in wf.get("loras", [])],
                "derived": True,
            }
        )
    return out


def saved_prompts():
    out = []
    for p in load_store()["prompts"]:
        entry = dict(p)
        entry["positive"] = entry.get("positive") or entry.get("prompt", "")
        entry["derived"] = False
        out.append(entry)
    return out
