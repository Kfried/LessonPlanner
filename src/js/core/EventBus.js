/**
 * Minimal publish/subscribe hub. Decouples the app controller and UI
 * sections so neither needs a direct reference to the other (Observer
 * pattern) — new listeners can be added without touching the emitter.
 */
(function (global) {
  'use strict';

  function EventBus() {
    this._listeners = Object.create(null);
  }

  EventBus.prototype.on = function (eventName, handler) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(handler);
    var self = this;
    return function unsubscribe() {
      self._listeners[eventName] = self._listeners[eventName].filter(function (h) {
        return h !== handler;
      });
    };
  };

  EventBus.prototype.emit = function (eventName, payload) {
    var handlers = this._listeners[eventName];
    if (!handlers) { return; }
    handlers.slice().forEach(function (handler) {
      handler(payload);
    });
  };

  global.LP = global.LP || {};
  global.LP.EventBus = EventBus;
})(window);
