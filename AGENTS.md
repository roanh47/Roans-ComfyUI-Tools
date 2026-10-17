# Roans ComfyUI Tools

## Project info
- **Purpose:** Adds **Models** and **Prompts** tabs to the ComfyUI sidebar (next to Workflows).
  Local-only: models live on disk, prompts live on disk, nothing talks to the internet.
- **Repo:** https://github.com/roanh47/Roans-ComfyUI-Tools
- **Live install:** `%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\roans_comfyui_tools\`
- **Target runtime:** ComfyUI Desktop 0.37.0, frontend 1.53.6, Python 3.12 (ComfyUI's own venv)
- **Dependencies:** none beyond the Python stdlib. Do not add any.

## How ComfyUI loads it
`custom_nodes/` is scanned at boot. `NODE_CLASS_MAPPINGS` is deliberately **empty** — nothing
appears in the node search. What makes the tabs work:

- `WEB_DIRECTORY = "./web"` → ComfyUI serves `web/` at `/extensions/roans_comfyui_tools/` and
  injects the JS at page load
- `__init__.py` binds aiohttp routes onto `PromptServer.instance.routes` at import time

The folder name is load-bearing: `/extensions/<folder>/` and `WEB_DIRECTORY` must stay in step.
Renaming the folder to include a space or dash breaks the JS import path
(`import { app } from "../../scripts/app.js"` is relative to that URL).

## Layout
```
roans_comfyui_tools/
├── AGENTS.md                  # this file
├── README.md                  # user-facing docs
├── __init__.py                # HTTP routes + hot-reload; no nodes
├── library.py                 # all the real logic: scanning, parsing, store
├── data/library.json          # YOUR data — gitignored, never commit
├── data/library.example.json  # empty template, safe to commit
└── web/roans_comfyui_tools.js # sidebar tabs (plain DOM, no build step)
```

## Developing live
| changed | to see it |
|---|---|
| `library.py` | nothing — `_reload_library_if_changed()` reloads it on the next request |
| `web/roans_comfyui_tools.js` | refresh the browser tab (Ctrl+Shift+R) |
| `__init__.py` | restart ComfyUI — routes only bind at boot |

The hot-reload watches `library.py`'s mtime and calls `importlib.reload`. Keep new logic in
`library.py` whenever possible so it stays live-editable; treat `__init__.py` as a thin router.

## Conventions
- **No personal data in git.** `data/library.json` holds model filenames, civitai/HF links and
  private notes. It is gitignored — keep it that way, and never paste its contents into README,
  commit messages or issues.
- Stdlib only. HTTP is `aiohttp` via ComfyUI; keep it that way (no `requests`, no `httpx`).
- Model metadata is read from the safetensors header only — never load weights. dtype is picked
  by **byte weight** (`numel * dtype size`), not tensor count: quantized files carry hundreds of
  small fp32 scales that would otherwise report the whole model as fp32.
- Model paths come from `folder_paths` **and** the Desktop extra-paths yaml, merged. The extra
  paths are only registered after `main.py` boots, so relying on `folder_paths` alone silently
  returns zero models in some load orders.
- Workflow parsing handles both UI format (`nodes`/`links`) and API format (`class_type`).
  Positive/negative are resolved by following the KSampler link, not by widget order.
- Anything the user types wins over a detected value; the detected value is only a fallback.

## Verifying a change
ComfyUI must be running (`curl http://127.0.0.1:8188/system_stats`). Then:

```bash
curl -s http://127.0.0.1:8188/roans_comfyui_tools/api/dump | head -40
```

Or dry-run the module without ComfyUI — it imports standalone with a fallback for
`folder_paths`, which is how the parser was tested:

```bash
python3 -c "import sys; sys.path.insert(0,'<live install path>'); import library; \
print(len(library.scan_models(force=True)), 'models', len(library.scan_workflows()), 'workflows')"
```

## Committing
```bash
git add -A && git commit -m "..." && git push origin main && git push onedrive HEAD:main
```
`origin` = GitHub (code only). `onedrive` = bare repo backup of the same clean history.
