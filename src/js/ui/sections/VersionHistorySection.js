/**
 * Read-only view of the version_history array embedded in the current
 * plan, with a restore action delegated back to the app controller
 * (ctx.restoreVersion) since restoring replaces the whole document and
 * every other section's rendered state, not just this section's data.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;
  var VersionHistory = global.LP.VersionHistory;

  function formatTimestamp(iso) {
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
  }

  var VersionHistorySection = {
    id: 'version_history',
    label: 'Version History',
    render: function (container, plan, ctx) {
      var listHost = el('div', { class: 'version-history-list' });
      container.appendChild(listHost);

      function renderList() {
        Dom.clear(listHost);
        var versions = VersionHistory.listVersions(plan).slice().reverse();
        if (!versions.length) {
          listHost.appendChild(el('p', { class: 'field-help', text: 'No prior versions yet. A version is recorded automatically each time you save over a previously opened file.' }));
          return;
        }
        versions.forEach(function (entry) {
          listHost.appendChild(el('div', { class: 'version-entry' }, [
            el('div', { class: 'version-entry-header' }, [
              el('span', { class: 'version-entry-title', text: 'Version ' + entry.version + ' — ' + formatTimestamp(entry.timestamp) }),
              el('button', {
                type: 'button', class: 'btn btn-secondary',
                text: 'Restore this version',
                onclick: function () {
                  if (window.confirm('Restore version ' + entry.version + '? Your current unsaved edits in the form will be replaced.')) {
                    ctx.restoreVersion(entry.version);
                  }
                }
              }, [])
            ]),
            entry.summary ? el('p', { class: 'version-entry-summary', text: entry.summary }) : null
          ]));
        });
      }

      renderList();
      ctx.onVersionHistoryChanged = renderList;
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.version_history = VersionHistorySection;
})(window);
