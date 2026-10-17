"""Roans ComfyUI Tools — Models and Prompts tabs for the ComfyUI sidebar.

No nodes in the graph. This folder exists so ComfyUI loads web/ as a frontend
extension and the routes below onto its own server.
"""

import importlib
import json
import os

from aiohttp import web
from server import PromptServer

from . import library

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

routes = PromptServer.instance.routes

MODEL_FIELDS = (
    "name",
    "model_type",
    "file_type",
    "version",
    "base",
    "link",
    "why",
    "keyword",
    "rank",
    "note",
    "tags",
)

_LIB_FILE = os.path.join(os.path.dirname(os.path.abspath(library.__file__)), "library.py")
_LIB_STAMP = os.path.getmtime(_LIB_FILE)


def _reload_library_if_changed():
    """Pick up edits to library.py without restarting ComfyUI.

    Only the routes in __init__.py need a restart; everything the tabs actually do
    lives in library.py, so watching its mtime is enough.
    """
    global _LIB_STAMP
    try:
        stamp = os.path.getmtime(_LIB_FILE)
        if stamp != _LIB_STAMP:
            _LIB_STAMP = stamp
            importlib.reload(library)
            print("[roans_comfyui_tools] library.py reloaded")
    except Exception as exc:  # never let a hot-reload bug take down a request
        print(f"[roans_comfyui_tools] reload skipped: {exc}")


def _body(request):
    return request.get_json(silent=True) or {}


@routes.get("/roans_comfyui_tools/api/state")
async def api_state(request):
    _reload_library_if_changed()
    force = request.query.get("force") == "1"
    return web.json_response(
        {
            "models": library.scan_models(force=force),
            "workflows": library.scan_workflows(force=force),
            "prompts": library.saved_prompts() + library.live_prompts(),
            "workflows_dir": library.workflows_dir(),
        }
    )


@routes.get("/roans_comfyui_tools/api/dump")
async def api_dump(request):
    """Everything the tabs show, as plain JSON — handy for grep and scripts."""
    return web.Response(
        text=json.dumps(
            {
                "models": library.scan_models(),
                "workflows": library.scan_workflows(),
                "prompts": library.saved_prompts() + library.live_prompts(),
            },
            indent=1,
            ensure_ascii=False,
        ),
        content_type="application/json",
    )


@routes.post("/roans_comfyui_tools/api/model")
async def api_model(request):
    data = _body(request)
    name = data.get("filename") or data.get("file")
    if not name:
        return web.json_response({"error": "filename is required"}, status=400)
    store = library.load_store()
    entry = store["models"].setdefault(name, {})
    for key in MODEL_FIELDS:
        if key in data:
            entry[key] = data[key]
    library.save_store(store)
    library.scan_models(force=True)
    return web.json_response({"ok": True, "model": entry})


@routes.post("/roans_comfyui_tools/api/prompt")
async def api_prompt(request):
    data = _body(request)
    positive = (data.get("positive") or "").strip()
    if not positive:
        return web.json_response({"error": "positive prompt is required"}, status=400)
    store = library.load_store()
    pid = data.get("id")
    entry = {
        "id": pid or f"user::{int(os.stat(library.DATA_FILE).st_mtime * 1000)}::{len(store['prompts'])}",
        "name": (data.get("name") or "").strip() or positive[:48],
        "positive": positive,
        "negative": (data.get("negative") or "").strip(),
        "workflow": (data.get("workflow") or "").strip(),
        "tags": data.get("tags") or [],
        "note": (data.get("note") or "").strip(),
    }
    for i, existing in enumerate(store["prompts"]):
        if existing.get("id") == entry["id"]:
            store["prompts"][i] = entry
            break
    else:
        store["prompts"].insert(0, entry)
    library.save_store(store)
    return web.json_response({"ok": True, "prompt": entry})


@routes.post("/roans_comfyui_tools/api/prompt_delete")
async def api_prompt_delete(request):
    pid = _body(request).get("id")
    store = library.load_store()
    before = len(store["prompts"])
    store["prompts"] = [p for p in store["prompts"] if p.get("id") != pid]
    library.save_store(store)
    return web.json_response({"ok": True, "removed": before - len(store["prompts"])})


@routes.get("/roans_comfyui_tools/api/workflow")
async def api_workflow(request):
    """The raw workflow graph, so the UI can open a file straight onto the canvas."""
    name = os.path.basename(request.query.get("file", ""))
    path = os.path.join(library.workflows_dir(), name)
    if not name.endswith(".json") or not os.path.isfile(path):
        return web.json_response({"error": f"no such workflow: {name}"}, status=404)
    with open(path, encoding="utf-8") as fh:
        return web.json_response(json.load(fh))


@routes.post("/roans_comfyui_tools/api/rescan")
async def api_rescan(request):
    items = library.scan_models(force=True)
    return web.json_response({"ok": True, "count": len(items)})
