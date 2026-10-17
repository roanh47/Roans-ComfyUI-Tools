# Roans ComfyUI Tools

Extra sidebar tabs in ComfyUI: **Models** and **Prompts**.

Nothing appears in the node graph — this folder exists so ComfyUI loads
`web/Roans-ComfyUI-Tools.js` as a frontend extension and the HTTP routes in `__init__.py`
onto its own server. `NODE_CLASS_MAPPINGS` is deliberately empty.

## Install

Clone into your `custom_nodes` folder. ComfyUI scans that folder on every boot, so there is
no service, startup entry or process to maintain.

cmd.exe:

```bat
cd /d "%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git
```

PowerShell:

```powershell
cd "$env:LOCALAPPDATA\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git
```

Git Bash / MSYS:

```bash
cd "$LOCALAPPDATA/Comfy-Desktop/ComfyUI-Installs/ComfyUI/ComfyUI/custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git
```

No target folder argument — git uses the repo name, and the folder has to stay
`Roans-ComfyUI-Tools`. ComfyUI serves it at `/extensions/Roans-ComfyUI-Tools/`, which is where
the sidebar JS loads from.

Comfy Desktop installs under `AppData\Local`, so it is `%LOCALAPPDATA%`. `%APPDATA%` points at
`AppData\Roaming`, where ComfyUI is *not* installed.

Then restart ComfyUI and two tabs appear next to Workflows: **Models** and **Prompts**.

Updating later:

```bash
cd "%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\Roans-ComfyUI-Tools"
git pull
```

`data/library.json` is gitignored, so pulling/updating never touches your links, notes or saved
prompts. Back that file up yourself if you care about it.

## What each tab does

**Models** — every file ComfyUI can actually load, scanned live from `folder_paths`
*and* Comfy Desktop's extra model paths. New downloads appear by themselves; hit
*rescan* to force it. Search covers every field, and you can sort by name/size/newest
and **group** by type, folder, rank or why.

This tab replaces ComfyUI's own built-in `model-library` Models tab — the extension
unregisters it on startup so you don't end up with two (toggle
*"Hide ComfyUI's built-in Models tab"* in ComfyUI's settings to get it back).

| field | source |
|---|---|
| Name | yours, or prettified from the filename |
| Model Type | from the folder it sits in (Checkpoint / LORA / VAE / …) |
| File Type | **detected** from the safetensors header, weighted by tensor bytes: `fp16`/`bf16`/`fp32`/`fp8 SafeTensor`, `int8 SafeTensor`, `GGUF Q5_K_M` |
| Downloaded Version | yours, with a filename-derived suggestion shown dimmed |
| Base model | **detected** from `ss_base_model_version` / `modelspec.architecture`, else yours |
| Link | yours |
| Why? / Rank? / Lora Keyword / Notes | yours |
| Lora dim | **detected** from `ss_network_dim` |
| Trained on | **detected** from `ss_tag_frequency` — the tags the LoRA was trained on |

Anything you type is saved to `data/library.json` and takes priority over the detected value.
That file is yours: it is gitignored and never leaves the machine.

**Prompts** — two groups:

- *saved*: prompts you write in the tab, with positive and negative as separate fields plus an
  optional **corresponding workflow** picked from a dropdown of your actual workflow files
- *from workflows*: pulled out of the workflow files on every load, tagged with the checkpoint
  and loras that prompt belongs to. *save to library* turns one into an editable saved prompt;
  *edit + attach workflow* does the same with the workflow already attached

Every prompt card has copy-positive, copy-negative, and *open in canvas*, which loads the
attached workflow straight into the graph.

## HTTP API

| route | what |
|---|---|
| `GET /Roans-ComfyUI-Tools/api/state` | everything both tabs render (`?force=1` rescans) |
| `GET /Roans-ComfyUI-Tools/api/dump` | same as pretty JSON — handy for grep/scripts |
| `POST /Roans-ComfyUI-Tools/api/model` | save name/type/file type/version/base/link/why/rank/keyword/notes |
| `POST /Roans-ComfyUI-Tools/api/prompt` | create or update a saved prompt |
| `POST /Roans-ComfyUI-Tools/api/prompt_delete` | remove a saved prompt |
| `GET /Roans-ComfyUI-Tools/api/workflow?file=X.json` | raw workflow graph, for *open in canvas* |
| `POST /Roans-ComfyUI-Tools/api/rescan` | drop the folder cache |

## Developing it live

Nothing here needs a ComfyUI restart except `__init__.py` itself.

- `api.py` and `library.py` are **hot-reloaded**: `__init__.py` registers one catch-all route
  (`/Roans-ComfyUI-Tools/api/{tail:.*}`) and dispatches into `api.py`, re-importing both modules
  whenever their mtime moves. So editing a handler, or adding a whole new endpoint to
  `api.ROUTES`, works on the next request.
- The sidebar JS is served from disk, and the running UI polls `api/ui_version` every 4s: if the
  JS file changed, it reloads itself; if only `library.py` changed, it just refreshes the lists.

| you changed | to see it |
|---|---|
| `library.py` | nothing, it's live (lists refresh themselves) |
| `api.py` | nothing, it's live — new endpoints included |
| `web/Roans-ComfyUI-Tools.js` | nothing — the open UI notices and reloads |
| `__init__.py` | restart ComfyUI, or hit `GET /Roans-ComfyUI-Tools/reload` for the modules |

## Notes

- Deleting the folder uninstalls it; `git clone` again to reinstall. (`custom_nodes/` is
  gitignored by ComfyUI itself, so ComfyUI updates leave it alone.)
- Workflow facts (checkpoint, loras, prompts, sampler settings) are read from disk each load,
  so saving a workflow in the UI shows up with no action.
- Supported workflow formats: UI-format (`nodes`/`links`) and API-format (`class_type`).
- No dependencies beyond the Python stdlib. Nothing leaves the machine.
