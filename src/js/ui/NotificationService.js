/**
 * Transient toast messages. Single responsibility: show/auto-dismiss
 * status feedback, independent of who triggered it.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;

  function NotificationService(hostElement) {
    this._host = hostElement;
  }

  NotificationService.prototype.show = function (message, level) {
    var toast = el('div', { class: 'toast toast-' + (level || 'info'), text: message });
    this._host.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('toast-visible'); });
    setTimeout(function () {
      toast.classList.remove('toast-visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, level === 'error' ? 5000 : 3000);
  };

  NotificationService.prototype.info = function (message) { this.show(message, 'info'); };
  NotificationService.prototype.success = function (message) { this.show(message, 'success'); };
  NotificationService.prototype.error = function (message) { this.show(message, 'error'); };

  global.LP = global.LP || {};
  global.LP.NotificationService = NotificationService;
})(window);
