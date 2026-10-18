# Roans ComfyUI Tools

## Project info
- **Purpose:** Enhances ComfyUI's own **Models** and **Workflows** sidebar panels in place, and
  adds one new **Prompts** tab. Local-only: models live on disk, prompts live on disk, nothing
  talks to the internet.
- **Repo:** https://github.com/roanh47/Roans-ComfyUI-Tools
- **Live install (a git clone):** `%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\Roans-ComfyUI-Tools\`
- **Target runtime:** ComfyUI Desktop 0.37.0, frontend 1.53.6, Python 3.12 (ComfyUI's own venv)
- **Dependencies:** none beyond the Python stdlib. Do not add any.

## How ComfyUI loads it
`custom_nodes/` is scanned at boot. `NODE_CLASS_MAPPINGS` is deliberately **empty** — nothing
appears in the node search. What makes it work:

- `WEB_DIRECTORY = "./web"` → ComfyUI serves `web/` at `/extensions/Roans-ComfyUI-Tools/` and
  injects the JS at page load
- `__init__.py` binds ONE catch-all route onto `PromptServer.instance.routes` at import time

The folder name is load-bearing — it is the URL segment the JS is served from, and the JS imports
`../../scripts/app.js` relative to it. Keep folder name, repo name, JS filename and API route
prefix all spelled `Roans-ComfyUI-Tools`. Dashes and capitals are fine.

## Layout
```
Roans-ComfyUI-Tools/
├── AGENTS.md                      # this file
├── README.md                      # user-facing docs, incl. the clone instructions
├── __init__.py                    # the single catch-all route + hot-reload; no nodes
├── api.py                         # every HTTP handler, dispatched from the catch-all
├── library.py                     # all the real logic: scanning, parsing, store
├── data/library.json              # YOUR data — gitignored, never commit
├── data/library.example.json      # empty template, safe to commit
├── web/avatar.jpg                 # your pfp for the tab badges — gitignored
└── web/Roans-ComfyUI-Tools.js     # Prompts tab + native-panel enhancements
```

## Developing live
| changed | to see it |
|---|---|
| `library.py` | nothing — reloaded per request, lists refresh themselves |
| `api.py` | nothing — reloaded per request, new endpoints included |
| `web/Roans-ComfyUI-Tools.js` | nothing — the open UI polls `api/ui_version` and reloads itself |
| `__init__.py` | restart ComfyUI, or `GET /Roans-ComfyUI-Tools/reload` |

`__init__.py` binds one catch-all route and dispatches into `api.py`; both `api.py` and
`library.py` are `importlib.reload`-ed when their mtime moves. Keep new logic in those two files
and you never restart ComfyUI. Treat `__init__.py` as a coordinator that should never change.

## UI integration rules (learned the hard way)

- **Modify the native panels, never replace them.** ComfyUI's Models and Workflows panels are Vue
  components: they cannot be edited, but their DOM can be appended to, and a throttled
  `MutationObserver` re-applies the injection after each re-render. Never add a second button for
  something ComfyUI already has, and never `unregisterSidebarTab` a native tab.
- **Sidebar tabs in this build render a Vue `component`.** A `type: "custom"` tab gets a working
  button but an empty panel. `type: "vue"` takes a component, and the Vue runtime is discovered at
  runtime from the served asset names (`vendor-vue-core-*.js` — the hash changes every version, so
  never hardcode it). Registration is wrapped so a failure falls back to our own panel mounted
  beside the strip rather than a tab with nothing in it.
- **Symmetric spacing gets ONE constant.** The tab badge used two separate numbers for bottom and
  left, they drifted, and it took three round trips to notice. `AVATAR_GAP` drives both.
- **Offset horizontally with `transform`, not `right`.** The tab buttons sit flush against the
  sidebar edge, so a `right` offset does not readably move the badge while `bottom` does —
  `translateX` always applies. Positioning against an inner icon element is also wrong: that box
  does not match the visible glyph (it landed mid-icon).
- **Throttle DOM work.** One observer pass per animation frame. Full-document scans per mutation
  saturate the main thread and make the page stop answering.
- **Ship no personal data.** `data/library.json` and `web/avatar.jpg` are gitignored, and the
  avatar code removes the badge on load error, so a fresh clone degrades cleanly.

## Conventions
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
- Content search ANDs its terms, so `h0rs3 mud` narrows to one result instead of five.
- The `custom`-tab `render` return value is unused; repaint is driven by `ui_version` polling and
  `repaint`.

## Verifying a change
ComfyUI must be running (`curl http://127.0.0.1:8188/system_stats`). Then:

```bash
curl -s http://127.0.0.1:8188/Roans-ComfyUI-Tools/api/dump | head -40
```

Syntax-check the JS with node before committing:

```bash
cp web/Roans-ComfyUI-Tools.js /tmp/rt.mjs && node --check /tmp/rt.mjs
```

Without ComfyUI running, dry-run the module against ComfyUI's own interpreter — `library.py`
imports standalone with a fallback for `folder_paths`, which is how the parser was tested:

```bash
cd "%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI"
.\\.venv\\Scripts\\python.exe -c "import sys; sys.path.insert(0,'custom_nodes/Roans-ComfyUI-Tools'); import library; print(len(library.scan_models(force=True)),'models', len(library.scan_workflows()),'workflows')"
```

## Committing
```bash
git add -A && git commit -m "..." && git push origin main && git push onedrive HEAD:main
```
`origin` = GitHub (code only). `onedrive` = bare repo backup (`OneDrive\Coding\Roans-ComfyUI-Tools.git`).
Both are pushed on every commit; verify with `git rev-parse HEAD origin/main onedrive/main`.

GitHub auth on this machine goes through **`gh`** (logged in as `roanh47`, `gh auth setup-git`
run once), so `git push origin main` uses gh's credentials. Never put a token in the remote URL,
and use `gh` for anything repo/PR/issue shaped (`gh repo view`, `gh pr create`, `gh run list`).

## Native metrics (measured in the running app, frontend 1.53.6)
- **Panel title** — `SidebarTabTemplate` renders it as `truncate font-bold` inside a `min-h-16 px-3`
  panel: **16px / 700**, 64px min-height, 12px side padding, bottom border. Models and Workflows
  panels in this build draw *no* header of their own, so our bars print one in exactly those values
  (`.rt-panel-head` / `.rt-panel-title`), and `nativeTabTitle()` reads the tab's own aria-label so
  the wording can never drift from the app's.
- Buttons: 32px tall, 14px/500, radius 6, gap 8. Small text and search fields: 12px. Muted:
  `#8a8a8a`. Tab buttons: 12px/500 with 8px padding.
- Tree rows: 2px padding, 4px gap, radius 6. Our cards hold 2-3 lines where the native tree holds
  one, so they use the app's 8px unit internally and a 6px gap between cards — at 6px/2px the badges
  crowded the next card as soon as a folder was expanded.

## Gotcha
Deleting or renaming this folder fails with **"Device or resource busy" / WinError 32** if any
process has it as its working directory — including a Python kernel started with `cd` inside it.
Nothing else fixes it: stop the holder or move its cwd out first.
