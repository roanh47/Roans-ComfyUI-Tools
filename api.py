"""Every HTTP handler for the sidebar tabs.

`__init__.py` registers ONE catch-all route and hands each request to `dispatch()`
below. This module is reloaded from disk when it changes, so adding or editing an
endpoint takes effect on the next request — no ComfyUI restart, ever.
"""

import json
import os

from aiohttp import web

from . import library

PREFIX = "/Roans-ComfyUI-Tools/api/"


def _body(request):
    return request.get_json(silent=True) or {}


def _js_path():
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "Roans-ComfyUI-Tools.js")


# ------------------------------------------------------------------- handlers


async def get_state(request):
    force = request.query.get("force") == "1"
    return web.json_response(
        {
            "models": library.scan_models(force=force),
            "workflows": library.scan_workflows(force=force),
            "prompts": library.saved_prompts() + library.live_prompts(),
            "workflows_dir": library.workflows_dir(),
        }
    )


async def get_dump(request):
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


async def post_model(request):
    data = _body(request)
    name = data.get("filename") or data.get("file")
    if not name:
        return web.json_response({"error": "filename is required"}, status=400)
    store = library.load_store()
    entry = store["models"].setdefault(name, {})
    for key in ("name", "model_type", "file_type", "version", "base", "link", "why",
                "keyword", "rank", "note", "tags"):
        if key in data:
            entry[key] = data[key]
    library.save_store(store)
    library.scan_models(force=True)
    return web.json_response({"ok": True, "model": entry})


async def post_prompt(request):
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


async def post_prompt_delete(request):
    pid = _body(request).get("id")
    store = library.load_store()
    before = len(store["prompts"])
    store["prompts"] = [p for p in store["prompts"] if p.get("id") != pid]
    library.save_store(store)
    return web.json_response({"ok": True, "removed": before - len(store["prompts"])})


async def get_workflow(request):
    """The raw workflow graph, so the UI can open a file straight onto the canvas."""
    name = os.path.basename(request.query.get("file", ""))
    path = os.path.join(library.workflows_dir(), name)
    if not name.endswith(".json") or not os.path.isfile(path):
        return web.json_response({"error": f"no such workflow: {name}"}, status=404)
    with open(path, encoding="utf-8") as fh:
        return web.json_response(json.load(fh))


async def post_rescan(request):
    return web.json_response({"ok": True, "count": len(library.scan_models(force=True))})


async def get_ui_version(request):
    """Stamps the UI polls to notice that a file on disk changed under it."""
    def stamp(path):
        try:
            return int(os.path.getmtime(path))
        except OSError:
            return 0

    return web.json_response(
        {
            "js": stamp(_js_path()),
            "library": stamp(os.path.abspath(library.__file__)),
            "api": stamp(os.path.abspath(__file__)),
        }
    )


ROUTES = {
    ("GET", "state"): get_state,
    ("GET", "dump"): get_dump,
    ("GET", "workflow"): get_workflow,
    ("GET", "ui_version"): get_ui_version,
    ("POST", "model"): post_model,
    ("POST", "prompt"): post_prompt,
    ("POST", "prompt_delete"): post_prompt_delete,
    ("POST", "rescan"): post_rescan,
}


async def dispatch(request, tail):
    handler = ROUTES.get((request.method, tail.strip("/")))
    if handler is None:
        known = sorted(f"{m} {t}" for m, t in ROUTES)
        return web.json_response({"error": f"unknown route {request.method} {tail}", "known": known}, status=404)
    return await handler(request)
