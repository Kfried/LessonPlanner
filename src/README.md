# Lesson Plan Editor

A standalone HTML/JS editor for lesson plan JSON files conforming to
[`DataStructures/lesson_plan.schema.json`](../DataStructures/lesson_plan.schema.json).
No build step, no Node runtime, no external dependencies — just a
browser.

## Running it

Double-click [`index.html`](index.html). That's it.

**Browser recommendation: Chrome or Edge.** The editor uses the File
System Access API for true "open this file" / "save back to this
file" behaviour. In Chrome/Edge, Save silently overwrites the file you
opened; Save As lets you pick a new location.

In other browsers (Firefox, Safari), the editor automatically falls
back to a download/upload model: Open uses a file picker that reads
the file's contents into the app, and Save/Save As triggers a browser
download every time — it cannot overwrite the original file in place.
A one-time notice appears on startup if you're on a fallback browser.

## Layout

- Left column: section tabs (Header, Learning Sequence, Expected
  Outcomes, Pedagogical Metadata, Preparation, Teaching Episode,
  Evaluation, Reflection, Version History) — one per top-level object
  in the schema.
- Right column: live validation panel, listing schema issues (missing
  required fields, bad enum values, etc.) and non-blocking warnings
  (e.g. header duration not matching the sum of segment timings).
- You can still save with outstanding validation errors; you'll get a
  confirmation prompt first.

## Versioning

Every time you **Save** (not Save As on a brand-new file) over a file
that was already opened or previously saved, the editor appends a
snapshot of the file's prior content to a `version_history` array
inside the same JSON file, along with an optional note you can type
into the "Version note" box in the toolbar before saving. The
**Version History** tab lists every past version and lets you restore
one — restoring loads that snapshot into the editor (your current
unsaved edits are replaced) and you still need to Save to persist the
restore.

`version_history` is an editor-managed field, not part of the
pedagogical content itself — it's documented as an optional property
in the schema for transparency, but nothing reads it except this
editor.

## Keeping the embedded schema in sync

Because the app runs from `file://` (no server), it cannot `fetch()`
`../DataStructures/lesson_plan.schema.json` at runtime — Chrome blocks
XHR/fetch of local files under `file://`. Instead, a copy of the
schema is embedded as a plain JS object in
[`js/core/LessonPlanSchema.js`](js/core/LessonPlanSchema.js).

**If you change `lesson_plan.schema.json`, mirror the change in
`LessonPlanSchema.js` by hand** (same `properties`/`required`/`enum`/
`allOf` structure — the file's `definition` constant is a direct
transcription). The validator and every dropdown's option list are
derived from that one embedded object, so a mismatch there is the only
way the editor's behaviour can drift from the schema file.

## Project structure (SOLID boundaries)

```
src/
  index.html               Composition shell — loads every script in dependency order
  css/styles.css            All presentation
  js/
    core/                   Pure domain logic, no DOM access
      LessonPlanSchema.js    Embedded schema + derived enum lists (single source of truth)
      LessonPlanFactory.js   Blank-document creation, loaded-document normalization, save pruning
      LessonPlanValidator.js Generic schema-driven validator (type/required/enum/allOf-if-then)
      VersionHistory.js      Recording/restoring version_history entries
      EventBus.js             Small pub/sub, available for cross-cutting notifications
    io/                     File persistence, swappable behind one interface
      FileIOPort.js           Abstract contract (Dependency Inversion boundary)
      FileSystemAccessAdapter.js  Chrome/Edge implementation
      DownloadUploadAdapter.js    Universal fallback implementation
      FileIOFactory.js        Picks an adapter via feature detection
    ui/                     DOM rendering, depends on core/ but not vice versa
      DomUtils.js, FieldRenderer.js, ListEditor.js, TabsController.js,
      ValidationPanel.js, NotificationService.js
      sections/              One file per schema top-level object; each exposes
                              { id, label, render(container, plan, ctx) }
    app/
      AppController.js       Orchestrator — owns current document, wires I/O + validation + UI
      main.js                 Composition root — the only file that knows every concrete class
```

Every module is attached to a shared `window.LP` namespace rather than
using ES `import`/`export`, because Chrome refuses to load
`type="module"` scripts from a `file://` origin (a CORS restriction on
local files). Load order in `index.html` therefore matters and mirrors
the dependency graph above.
