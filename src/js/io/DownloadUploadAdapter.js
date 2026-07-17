/**
 * FileIOPort implementation for browsers without the File System
 * Access API (Firefox, Safari). "Open" uses a hidden file input;
 * "Save" triggers a browser download. Cannot overwrite a file silently
 * — every save re-prompts the browser's own download UI, and the
 * "handle" it deals in is just the last-used filename.
 */
(function (global) {
  'use strict';

  function DownloadUploadAdapter() {
    global.LP.FileIOPort.call(this);
  }
  DownloadUploadAdapter.prototype = Object.create(global.LP.FileIOPort.prototype);
  DownloadUploadAdapter.prototype.constructor = DownloadUploadAdapter;

  DownloadUploadAdapter.prototype.canSaveInPlace = function () {
    return false;
  };

  DownloadUploadAdapter.prototype.openFile = function () {
    return new Promise(function (resolve, reject) {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.style.display = 'none';
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        document.body.removeChild(input);
        if (!file) { reject(new Error('No file selected')); return; }
        var reader = new FileReader();
        reader.onload = function () {
          resolve({ content: String(reader.result), handle: file.name, name: file.name });
        };
        reader.onerror = function () { reject(reader.error || new Error('Failed to read file')); };
        reader.readAsText(file);
      });
      document.body.appendChild(input);
      input.click();
    });
  };

  DownloadUploadAdapter.prototype.saveFile = function (handle, text) {
    return this.saveFileAs(text, handle || 'lesson-plan.json');
  };

  DownloadUploadAdapter.prototype.saveFileAs = function (text, suggestedName) {
    var name = suggestedName || 'lesson-plan.json';
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return new Promise(function (resolve) {
      setTimeout(function () {
        URL.revokeObjectURL(url);
        resolve({ handle: name, name: name });
      }, 0);
    });
  };

  global.LP = global.LP || {};
  global.LP.DownloadUploadAdapter = DownloadUploadAdapter;
})(window);
