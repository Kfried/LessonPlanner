/**
 * Owns the version_history array embedded in a lesson plan document.
 * Single responsibility: recording/restoring snapshots. Knows nothing
 * about files or the DOM.
 */
(function (global) {
  'use strict';

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function stripHistory(plan) {
    var copy = deepClone(plan);
    delete copy.version_history;
    return copy;
  }

  var VersionHistory = {
    /**
     * Called just before writing an already-opened file back to disk.
     * Appends a snapshot of the plan as it stood *before* this save
     * (i.e. the state currently on disk / last loaded), so that state
     * remains restorable.
     */
    recordVersion: function (planBeingSaved, priorState, summary) {
      var history = Array.isArray(planBeingSaved.version_history) ? planBeingSaved.version_history : [];
      var nextVersion = history.length + 1;
      history.push({
        version: nextVersion,
        timestamp: new Date().toISOString(),
        summary: summary || '',
        snapshot: stripHistory(priorState)
      });
      planBeingSaved.version_history = history;
      return planBeingSaved;
    },

    listVersions: function (plan) {
      return Array.isArray(plan.version_history) ? plan.version_history : [];
    },

    /**
     * Returns a full plan object restored to the given historical
     * version, with the (unmodified) version_history array carried
     * forward so the audit trail is preserved.
     */
    restoreVersion: function (plan, versionNumber) {
      var entry = this.listVersions(plan).filter(function (v) { return v.version === versionNumber; })[0];
      if (!entry) { return null; }
      var restored = deepClone(entry.snapshot);
      restored.version_history = deepClone(plan.version_history);
      return restored;
    }
  };

  global.LP = global.LP || {};
  global.LP.VersionHistory = VersionHistory;
})(window);
