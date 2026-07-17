/**
 * Renders one tab button + one panel per registered section and
 * switches the active panel on click. Each section is mounted exactly
 * once (not re-rendered on tab switch) so in-progress edits and focus
 * are never disturbed by navigation.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;

  function TabsController(tabsHost, panelsHost) {
    this._tabsHost = tabsHost;
    this._panelsHost = panelsHost;
  }

  TabsController.prototype.mount = function (sections, plan, ctx) {
    Dom.clear(this._tabsHost);
    Dom.clear(this._panelsHost);
    var buttons = {};
    var panels = {};

    sections.forEach(function (section, index) {
      var panel = el('div', { class: 'section-panel' + (index === 0 ? ' active' : '') });
      panels[section.id] = panel;
      this._panelsHost.appendChild(panel);
      section.render(panel, plan, ctx);

      var button = el('button', {
        type: 'button',
        class: 'tab-button' + (index === 0 ? ' active' : ''),
        text: section.label,
        onclick: activate.bind(null, section.id)
      });
      buttons[section.id] = button;
      this._tabsHost.appendChild(button);
    }, this);

    function activate(sectionId) {
      Object.keys(panels).forEach(function (id) {
        panels[id].classList.toggle('active', id === sectionId);
        buttons[id].classList.toggle('active', id === sectionId);
      });
    }
  };

  global.LP = global.LP || {};
  global.LP.TabsController = TabsController;
})(window);
