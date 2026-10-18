# Verifying this panel in a running ComfyUI

Synthetic events prove nothing here. `el.dispatchEvent(new MouseEvent("contextmenu"))`
and a real right-click take different paths through the app — the first one runs
whatever handler you wired, the second runs whatever the app *actually* receives.
A drag cannot be faked this way at all.

So verify with **trusted input**: Chromium's DevTools Protocol `Input` domain,
attached to the running ComfyUI Desktop renderer. `tools/cdp.mjs` and
`tools/live-test.mjs` do exactly that with no dependencies beyond `node >= 22`.

## 1. Start the app with a debug port

```bash
# stop the whole Electron tree (taskskill needs the MAIN pid)
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='Comfy Desktop.exe'\" | Select-Object ProcessId,ParentProcessId"
taskkill /T /F /PID <main pid>

# relaunch with the port open
powershell.exe -NoProfile -Command "Start-Process -FilePath '$env:LOCALAPPDATA\Programs\Comfy Desktop\Comfy Desktop.exe' -ArgumentList '--remote-debugging-port=9222'"
```

The app comes back on the **launcher**, not serving. The instance card can now be
clicked over CDP instead of hunting pixels:

```bash
node tools/cdp.mjs targets                        # panel.html = the launcher
CDP_URL_MATCH=panel.html node tools/cdp.mjs eval "document.body.innerText.slice(0,200)"
CDP_URL_MATCH=panel.html node tools/cdp.mjs click 492 534   # the ComfyUI instance card
curl -s -o /dev/null -w "%{http_code}" http://localhost:8188/   # 200 when it is up
```

Electron also exposes its auxiliary windows (title bar, system modal), so
`CDP_URL_MATCH` exists to pick the right one — `8188` selects the ComfyUI app.

## 2. Real input

```bash
node tools/cdp.mjs rect "[data-testid=workflows-tab-button]"   # viewport CSS px
node tools/cdp.mjs click 28 259                                # real left click
node tools/cdp.mjs rightclick 488 332                          # real right-click -> contextmenu
node tools/cdp.mjs drag 488 253 488 440                        # press, move, real drop
node tools/cdp.mjs evalfile probe.js                           # an expression in a file
node tools/cdp.mjs screenshot shot.png
```

Coordinates are viewport CSS pixels — the same space as `getBoundingClientRect`,
so measure and click with the same numbers.

## 3. The whole check, scripted

```bash
node tools/live-test.mjs     # exit 0 = all checks passed
```

It opens the Workflows tab with a real click, right-clicks a row, asserts the menu
exists, is the topmost element at its own centre and fits on screen, then drags a
row and asserts it lands **exactly where the blue line was drawn**.

## Traps found the hard way

- **Chromium never starts a native HTML5 drag in this build.** No `dragstart`, no
  `Input.dragIntercepted`, even with `Input.setInterceptDrags` enabled — something
  in the Vue layer eats it. Everything therefore depends on the panel's own
  pointer path (`pointerdown` + `pointermove` + `pointerup`). If that path does not
  handle an interaction, the interaction does not exist for the user, no matter how
  correct the `ondrop` handler looks. `Input.dispatchMouseEvent` still drives it,
  because Chromium does deliver trusted pointer events.
- **Escape is not a neutral key.** ComfyUI treats it as "close the sidebar", so a
  test that closes a menu with Escape finds no rows afterwards.
- **A fixed click can hit something meaningful.** Closing a menu with a click at a
  hardcoded y once hit a folder header and collapsed the folder, which made the next
  measurement point at nothing.
- **Clicking a selected sidebar tab closes it.** Read
  `side-bar-button-selected` before clicking, or the test toggles the panel shut and
  reports the panel cannot be opened.
- **Editing the served JS reloads the open page** (the UI polls `api/ui_version`).
  A test that runs right after an edit measures one page and clicks another — wait
  a few seconds, or re-run.
- **A swallowed error is a silent test failure.** A `try { ... } catch {}` around a
  diagnostic POST hid `RT_EVENTS is not defined` for several minutes. Diagnostics
  must report their own failure. There is a `POST /api/err {clear:true}` to reset
  the channel.
- **A partial order list scrambles the whole folder.** Writing order indices for
  only the rows that happened to be on screen leaves the rest holding their previous
  numbers, and the two numbering schemes interleave. Always write the complete list
  for that folder.
- **The visible order is not the stored order.** With the panel sorted by name or
  recency, `indexOf` against an order-sorted array gives the wrong insertion point.
  Read the sequence from the rows that are actually rendered.

## Diagnostics channel

`POST /api/diag` (the page posts a report of its own state) and `POST /api/err`
(JS errors with file, line and stacktrace) are the error channel, because this
build offers no readable console from outside. `GET /api/diag` returns one report
per open page, keyed by a per-page id — read them, do not assume which page is
which: match on the reported window size or the bars it found.

`api/diag` is development scaffolding and is meant to shrink as real CDP input
takes over the job of proving things.
