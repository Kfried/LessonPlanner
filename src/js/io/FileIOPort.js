/**
 * Contract every file I/O adapter must satisfy. AppController depends
 * only on this shape (Dependency Inversion) — it never knows whether it
 * is talking to the File System Access API or the download/upload
 * fallback, so a new adapter can be added without touching the
 * controller (Open/Closed).
 *
 * All methods return Promises and resolve to:
 *   openFile()              -> { content: string, handle: any|null, name: string }
 *   saveFile(handle, text)  -> { handle: any|null, name: string }
 *   saveFileAs(text, name)  -> { handle: any|null, name: string }
 *
 * `handle` is an opaque token meaningful only to the adapter that
 * produced it; callers just pass it back in on the next save.
 */
(function (global) {
  'use strict';

  function FileIOPort() {}

  FileIOPort.prototype.canSaveInPlace = function () {
    throw new Error('Not implemented');
  };
  FileIOPort.prototype.openFile = function () {
    throw new Error('Not implemented');
  };
  FileIOPort.prototype.saveFile = function (/* handle, text */) {
    throw new Error('Not implemented');
  };
  FileIOPort.prototype.saveFileAs = function (/* text, suggestedName */) {
    throw new Error('Not implemented');
  };

  global.LP = global.LP || {};
  global.LP.FileIOPort = FileIOPort;
})(window);
