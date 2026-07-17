/**
 * Chooses the best available FileIOPort implementation for this
 * browser. This is the only place that knows both adapters exist —
 * everything else (AppController) codes against FileIOPort.
 */
(function (global) {
  'use strict';

  function create() {
    if (global.LP.FileSystemAccessAdapter.isSupported()) {
      return new global.LP.FileSystemAccessAdapter();
    }
    return new global.LP.DownloadUploadAdapter();
  }

  global.LP = global.LP || {};
  global.LP.FileIOFactory = { create: create };
})(window);
