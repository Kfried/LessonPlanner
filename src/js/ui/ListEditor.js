/**
 * Generic editor for a schema array field: add/remove/reorder plus a
 * per-item body. Three modes cover every array shape in the schema
 * (Open/Closed — new list usages are added via config, not new code):
 *   - 'simple':  array of strings (resources, misconception_ids, ...)
 *   - 'objects': array of flat objects, rendered via a field list
 *                (key_vocabulary, assessment_objectives, raters, ...)
 *   - 'custom':  caller supplies renderItem(container, item, onChange)
 *                for shapes deeper than a flat field list
 *                (teaching_episode segments, distractors nested inside
 *                check_for_understanding).
 *
 * Structural changes (add/remove/reorder) trigger a full re-render;
 * individual field edits do not, so focus is never lost mid-keystroke.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;
  var FieldRenderer = global.LP.FieldRenderer;

  function mount(container, parentObj, key, config, onChange) {
    if (!Array.isArray(parentObj[key])) { parentObj[key] = []; }
    var list = parentObj[key];

    function renderAll() {
      Dom.clear(container);
      container.appendChild(el('div', { class: 'list-editor' }, [
        el('div', { class: 'list-items' }, list.map(function (item, index) {
          return renderItemCard(item, index);
        })),
        el('button', {
          type: 'button',
          class: 'btn btn-add',
          text: '+ Add ' + config.itemLabel,
          onclick: function () {
            list.push(config.mode === 'simple' ? '' : (config.createItem ? config.createItem() : {}));
            renderAll();
            onChange();
          }
        })
      ]));
    }

    function renderItemCard(item, index) {
      var body = el('div', { class: 'list-item-body' });

      if (config.mode === 'simple') {
        var input = el('input', {
          type: 'text',
          placeholder: config.placeholder || '',
          oninput: function (e) { list[index] = e.target.value; onChange(); }
        });
        input.value = item || '';
        body.appendChild(input);
      } else if (config.mode === 'objects') {
        (config.fields || []).forEach(function (fieldDescriptor) {
          FieldRenderer.renderField(body, item, fieldDescriptor, onChange);
        });
      } else if (config.mode === 'custom' && typeof config.renderItem === 'function') {
        config.renderItem(body, item, onChange, index);
      }

      var title = config.summary ? config.summary(item, index) : ('#' + (index + 1));
      return el('div', { class: 'list-item-card' }, [
        el('div', { class: 'list-item-header' }, [
          el('span', { class: 'list-item-title', text: title }),
          el('div', { class: 'list-item-controls' }, [
            el('button', {
              type: 'button', class: 'btn btn-icon', title: 'Move up', disabled: index === 0,
              onclick: function () { swap(index, index - 1); }
            }, ['↑']),
            el('button', {
              type: 'button', class: 'btn btn-icon', title: 'Move down', disabled: index === list.length - 1,
              onclick: function () { swap(index, index + 1); }
            }, ['↓']),
            el('button', {
              type: 'button', class: 'btn btn-icon btn-danger', title: 'Remove',
              onclick: function () {
                list.splice(index, 1);
                renderAll();
                onChange();
              }
            }, ['✕'])
          ])
        ]),
        body
      ]);
    }

    function swap(a, b) {
      var tmp = list[a];
      list[a] = list[b];
      list[b] = tmp;
      renderAll();
      onChange();
    }

    renderAll();
  }

  global.LP = global.LP || {};
  global.LP.ListEditor = { mount: mount };
})(window);
