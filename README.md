# Roans ComfyUI Tools

Extra sidebar tabs in ComfyUI: **Models** and **Prompts**.

Nothing appears in the node graph — this folder exists so ComfyUI loads
`web/roans_comfyui_tools.js` as a frontend extension and the HTTP routes in `__init__.py`
onto its own server. `NODE_CLASS_MAPPINGS` is deliberately empty.

## What each tab does

**Models** — every file ComfyUI can actually load, scanned live from `folder_paths`
*and* Comfy Desktop's extra model paths. New downloads appear by themselves; hit
*rescan* to force it.

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
| `GET /roans_comfyui_tools/api/state` | everything both tabs render (`?force=1` rescans) |
| `GET /roans_comfyui_tools/api/dump` | same as pretty JSON — handy for grep/scripts |
| `POST /roans_comfyui_tools/api/model` | save name/type/file type/version/base/link/why/rank/keyword/notes |
| `POST /roans_comfyui_tools/api/prompt` | create or update a saved prompt |
| `POST /roans_comfyui_tools/api/prompt_delete` | remove a saved prompt |
| `GET /roans_comfyui_tools/api/workflow?file=X.json` | raw workflow graph, for *open in canvas* |
| `POST /roans_comfyui_tools/api/rescan` | drop the folder cache |

## Developing it live

`library.py` is **hot-reloaded**: every request checks its mtime and calls `importlib.reload`
when it changed, so edits to the scanning/parsing logic take effect on the next click — no
ComfyUI restart.

| you changed | to see it |
|---|---|
| `library.py` | nothing, it's live |
| `web/roans_comfyui_tools.js` | refresh the browser tab (Ctrl+Shift+R) |
| `__init__.py` (routes) | restart ComfyUI — aiohttp routes only bind at boot |

## Install

ComfyUI scans `custom_nodes/` on every boot, so there is no service, startup entry or process
to maintain. Delete the folder to uninstall; clone it back to reinstall. (`custom_nodes/` is
gitignored by ComfyUI itself, so ComfyUI updates leave it alone.)

Comfy Desktop installs under `AppData\Local`, so `%LOCALAPPDATA%` is the variable that resolves —
`%APPDATA%` points at `AppData\Roaming`, where ComfyUI is *not* installed.

cmd.exe:

```bat
cd /d "%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git roans_comfyui_tools
```

PowerShell:

```powershell
cd "$env:LOCALAPPDATA\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git roans_comfyui_tools
```

Git Bash / MSYS:

```bash
cd "$LOCALAPPDATA/Comfy-Desktop/ComfyUI-Installs/ComfyUI/ComfyUI/custom_nodes"
git clone https://github.com/roanh47/Roans-ComfyUI-Tools.git roans_comfyui_tools
```

The folder name has to stay `roans_comfyui_tools` (underscores, no spaces) — ComfyUI serves it
at `/extensions/roans_comfyui_tools/`, which is where the sidebar JS loads from.

Then restart ComfyUI and two tabs appear next to Workflows: **Models** and **Prompts**.

`data/library.json` is gitignored, so a fresh clone starts empty and your model links, notes and
saved prompts are never committed. Back that file up yourself if you care about it.

## Notes

- Workflow facts (checkpoint, loras, prompts, sampler settings) are read from disk each load,
  so saving a workflow in the UI shows up with no action.
- Supported workflow formats: UI-format (`nodes`/`links`) and API-format (`class_type`).
- No dependencies beyond the Python stdlib. Nothing leaves the machine.
