/**
 * Tiny DOM construction helper. Single responsibility: turn a
 * tag/attrs/children triple into a real element, nothing else.
 */
(function (global) {
  'use strict';

  var BOOL_ATTRS = { checked: true, disabled: true, required: true, selected: true };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];
      if (value === undefined || value === null) { return; }
      if (key === 'class') {
        node.className = value;
      } else if (key.indexOf('on') === 0 && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (BOOL_ATTRS[key]) {
        node[key] = !!value;
      } else if (key === 'text') {
        node.textContent = value;
      } else {
        node.setAttribute(key, value);
      }
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) { return; }
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  }

  global.LP = global.LP || {};
  global.LP.Dom = { el: el, clear: clear };
})(window);
