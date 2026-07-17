/**
 * FileIOPort implementation backed by the File System Access API.
 * Gives true "open this exact file" / "save back to the same file"
 * behaviour. Available in Chromium browsers (Chrome, Edge); feature
 * detection is centralised in FileIOFactory, not here.
 */
(function (global) {
  'use strict';

  var JSON_PICKER_OPTIONS = {
    types: [{
      description: 'Lesson plan JSON',
      accept: { 'application/json': ['.json'] }
    }],
    excludeAcceptAllOption: false
  };

  function FileSystemAccessAdapter() {
    global.LP.FileIOPort.call(this);
  }
  FileSystemAccessAdapter.prototype = Object.create(global.LP.FileIOPort.prototype);
  FileSystemAccessAdapter.prototype.constructor = FileSystemAccessAdapter;

  FileSystemAccessAdapter.isSupported = function () {
    return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function';
  };

  FileSystemAccessAdapter.prototype.canSaveInPlace = function () {
    return true;
  };

  FileSystemAccessAdapter.prototype.openFile = function () {
    return window.showOpenFilePicker(JSON_PICKER_OPTIONS).then(function (handles) {
      var handle = handles[0];
      return handle.getFile().then(function (file) {
        return file.text().then(function (content) {
          return { content: content, handle: handle, name: file.name };
        });
      });
    });
  };

  FileSystemAccessAdapter.prototype.saveFile = function (handle, text) {
    if (!handle) {
      return this.saveFileAs(text, 'lesson-plan.json');
    }
    return writeToHandle(handle, text).then(function () {
      return { handle: handle, name: handle.name };
    });
  };

  FileSystemAccessAdapter.prototype.saveFileAs = function (text, suggestedName) {
    var options = Object.assign({ suggestedName: suggestedName || 'lesson-plan.json' }, JSON_PICKER_OPTIONS);
    return window.showSaveFilePicker(options).then(function (handle) {
      return writeToHandle(handle, text).then(function () {
        return { handle: handle, name: handle.name };
      });
    });
  };

  function writeToHandle(handle, text) {
    return handle.createWritable().then(function (writable) {
      return writable.write(text).then(function () {
        return writable.close();
      });
    });
  }

  global.LP = global.LP || {};
  global.LP.FileSystemAccessAdapter = FileSystemAccessAdapter;
})(window);
