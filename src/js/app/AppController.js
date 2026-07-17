/**
 * Orchestrates the editor: owns the current document, wires the
 * toolbar to the file I/O port, drives validation, and asks
 * TabsController to (re)mount sections when the whole document is
 * replaced (New / Open / Restore Version). Depends only on the
 * FileIOPort abstraction, not a concrete adapter (Dependency
 * Inversion) — the concrete choice is made once, outside this class,
 * by FileIOFactory.
 */
(function (global) {
  'use strict';

  var Factory = global.LP.LessonPlanFactory;
  var VersionHistory = global.LP.VersionHistory;

  function AppController(deps) {
    this._fileIO = deps.fileIO;
    this._validator = deps.validator;
    this._tabs = deps.tabsController;
    this._validationPanel = deps.validationPanel;
    this._notifications = deps.notifications;
    this._sections = deps.sections;
    this._elements = deps.elements; // { fileStatus, versionNoteInput }

    this._plan = null;
    this._fileHandle = null;
    this._fileName = 'untitled.json';
    this._dirty = false;
    this._hasBeenSavedOnce = false;
    this._lastSavedSnapshot = null;
    this._ctx = null;
  }

  AppController.prototype.start = function () {
    this._loadBlankPlan();
    if (!this._fileIO.canSaveInPlace()) {
      this._notifications.info('Your browser lacks the File System Access API — Save will download a new copy each time instead of overwriting in place.');
    }
  };

  AppController.prototype._buildCtx = function () {
    var self = this;
    return {
      onChange: function () { self._markDirty(); },
      restoreVersion: function (versionNumber) { self._restoreVersion(versionNumber); }
    };
  };

  AppController.prototype._mountAll = function () {
    this._ctx = this._buildCtx();
    this._tabs.mount(this._sections, this._plan, this._ctx);
    this._runValidation();
    this._updateStatus();
  };

  AppController.prototype._loadBlankPlan = function () {
    this._plan = Factory.createBlank();
    this._fileHandle = null;
    this._fileName = 'untitled.json';
    this._dirty = false;
    this._hasBeenSavedOnce = false;
    this._lastSavedSnapshot = null;
    this._mountAll();
  };

  AppController.prototype._markDirty = function () {
    this._dirty = true;
    this._runValidation();
    this._updateStatus();
  };

  AppController.prototype._runValidation = function () {
    var result = this._validator.validate(this._plan);
    this._validationPanel.render(result);
    return result;
  };

  AppController.prototype._updateStatus = function () {
    var status = this._fileName + (this._dirty ? ' — unsaved changes' : ' — saved');
    this._elements.fileStatus.textContent = status;
  };

  AppController.prototype.newPlan = function () {
    if (this._dirty && !window.confirm('Discard unsaved changes and start a new lesson plan?')) { return; }
    this._loadBlankPlan();
    this._notifications.info('Started a new lesson plan.');
  };

  AppController.prototype.openPlan = function () {
    if (this._dirty && !window.confirm('Discard unsaved changes and open a different file?')) { return; }
    var self = this;
    this._fileIO.openFile().then(function (result) {
      var parsed;
      try {
        parsed = JSON.parse(result.content);
      } catch (e) {
        self._notifications.error('That file is not valid JSON: ' + e.message);
        return;
      }
      self._plan = Factory.normalizeLoaded(parsed);
      self._fileHandle = result.handle;
      self._fileName = result.name;
      self._dirty = false;
      self._hasBeenSavedOnce = true;
      self._lastSavedSnapshot = JSON.parse(JSON.stringify(self._plan));
      self._mountAll();
      self._notifications.success('Opened ' + result.name + '.');
    }).catch(function (err) {
      if (err && err.name === 'AbortError') { return; }
      self._notifications.error('Could not open file: ' + err.message);
    });
  };

  AppController.prototype.save = function () {
    this._persist(this._fileIO.saveFile.bind(this._fileIO, this._fileHandle));
  };

  AppController.prototype.saveAs = function () {
    var self = this;
    this._persist(function (text) {
      return self._fileIO.saveFileAs(text, self._fileName);
    });
  };

  AppController.prototype._persist = function (writeFn) {
    var self = this;
    var validation = this._runValidation();
    if (!validation.valid && !window.confirm('This plan has ' + validation.errors.length + ' schema issue(s). Save anyway?')) {
      return;
    }

    if (this._hasBeenSavedOnce) {
      var note = this._elements.versionNoteInput.value.trim();
      VersionHistory.recordVersion(this._plan, this._lastSavedSnapshot, note);
      this._elements.versionNoteInput.value = '';
    }

    var text = JSON.stringify(Factory.pruneForSave(this._plan), null, 2);
    writeFn(text).then(function (result) {
      self._fileHandle = result.handle;
      self._fileName = result.name;
      self._dirty = false;
      self._hasBeenSavedOnce = true;
      self._lastSavedSnapshot = JSON.parse(JSON.stringify(self._plan));
      self._updateStatus();
      if (self._ctx.onVersionHistoryChanged) { self._ctx.onVersionHistoryChanged(); }
      self._notifications.success('Saved ' + result.name + '.');
    }).catch(function (err) {
      if (err && err.name === 'AbortError') { return; }
      self._notifications.error('Could not save file: ' + err.message);
    });
  };

  AppController.prototype.isDirty = function () {
    return this._dirty;
  };

  AppController.prototype._restoreVersion = function (versionNumber) {
    var restored = VersionHistory.restoreVersion(this._plan, versionNumber);
    if (!restored) {
      this._notifications.error('That version could not be found.');
      return;
    }
    this._plan = Factory.normalizeLoaded(restored);
    this._dirty = true;
    this._mountAll();
    this._notifications.success('Restored version ' + versionNumber + '. Save to keep this.');
  };

  global.LP = global.LP || {};
  global.LP.AppController = AppController;
})(window);
