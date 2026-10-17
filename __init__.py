"""Roans ComfyUI Tools — Models and Prompts tabs for the ComfyUI sidebar.

No nodes in the graph. This folder exists so ComfyUI loads web/ as a frontend
extension and binds one catch-all route onto its own server.

The catch-all exists so that everything behind it (`api.py`) and everything below
it (`library.py`) can be reloaded from disk per request: edits to either take
effect immediately, with no ComfyUI restart. Only this file needs a restart, and
only when it changes.
"""

import importlib
import os

from aiohttp import web
from server import PromptServer

from . import api, library

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

routes = PromptServer.instance.routes

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
WATCHED = {
    "library": os.path.join(NODE_DIR, "library.py"),
    "api": os.path.join(NODE_DIR, "api.py"),
}
_STAMPS = {name: os.path.getmtime(path) for name, path in WATCHED.items()}


def _reload_if_changed():
    """Reload api.py / library.py in place when their mtime moved."""
    for name, path in WATCHED.items():
        try:
            stamp = os.path.getmtime(path)
        except OSError:
            continue
        if stamp == _STAMPS.get(name):
            continue
        _STAMPS[name] = stamp
        module = library if name == "library" else api
        try:
            importlib.reload(module)
            print(f"[Roans-ComfyUI-Tools] {name}.py reloaded")
        except Exception as exc:  # a broken edit must not take down the server
            print(f"[Roans-ComfyUI-Tools] {name}.py reload failed: {exc}")


@routes.get("/Roans-ComfyUI-Tools/api/{tail:.*}")
@routes.post("/Roans-ComfyUI-Tools/api/{tail:.*}")
async def api_entry(request):
    _reload_if_changed()
    return await api.dispatch(request, request.match_info.get("tail", ""))


@routes.get("/Roans-ComfyUI-Tools/reload")
async def forced_reload(request):
    """Force a reload even for same-second edits — handy while iterating."""
    for name, path in WATCHED.items():
        try:
            importlib.reload(library if name == "library" else api)
            _STAMPS[name] = os.path.getmtime(path)
        except Exception as exc:
            return web.json_response({"ok": False, "module": name, "error": str(exc)}, status=500)
    return web.json_response({"ok": True, "reloaded": sorted(WATCHED)})
