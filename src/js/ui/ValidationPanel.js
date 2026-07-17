/**
 * Renders the current validation result. Purely presentational — it
 * has no idea how validation was computed.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;

  function ValidationPanel(hostElement) {
    this._host = hostElement;
  }

  ValidationPanel.prototype.render = function (result) {
    Dom.clear(this._host);
    if (!result) { return; }

    var summaryClass = result.errors.length ? 'validation-summary-error' : 'validation-summary-ok';
    var summaryText = result.errors.length
      ? result.errors.length + ' issue(s) to fix before this plan is schema-valid'
      : 'Schema-valid';
    if (result.warnings.length) {
      summaryText += ' · ' + result.warnings.length + ' warning(s)';
    }

    this._host.appendChild(el('div', { class: 'validation-summary ' + summaryClass, text: summaryText }));

    if (result.errors.length) {
      this._host.appendChild(el('ul', { class: 'validation-list validation-errors' },
        result.errors.map(function (issue) { return el('li', { text: issue.message }); })
      ));
    }
    if (result.warnings.length) {
      this._host.appendChild(el('ul', { class: 'validation-list validation-warnings' },
        result.warnings.map(function (issue) { return el('li', { text: issue.message }); })
      ));
    }
  };

  global.LP = global.LP || {};
  global.LP.ValidationPanel = ValidationPanel;
})(window);
