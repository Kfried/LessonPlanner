/**
 * Turns a small field descriptor into a labelled, bound form control.
 * Every section module (HeaderSection, PreparationSection, ...) uses
 * this instead of hand-rolling <input>/<label> pairs, so a single
 * place governs how fields look and how values are coerced/pruned.
 */
(function (global) {
  'use strict';

  var Dom = global.LP.Dom;
  var el = Dom.el;

  function coerce(type, rawValue) {
    if (type === 'number') {
      if (rawValue === '') { return null; }
      var n = Number(rawValue);
      return Number.isNaN(n) ? null : n;
    }
    if (type === 'checkbox') { return !!rawValue; }
    return rawValue;
  }

  function labelRow(descriptor, controlNode) {
    var labelChildren = [descriptor.label];
    if (descriptor.required) {
      labelChildren.push(el('span', { class: 'required-mark', text: ' *' }));
    }
    var wrapper = el('div', { class: 'field field-' + descriptor.type }, [
      el('label', {}, labelChildren),
      controlNode
    ]);
    if (descriptor.help) {
      wrapper.appendChild(el('p', { class: 'field-help', text: descriptor.help }));
    }
    return wrapper;
  }

  function renderField(container, obj, descriptor, onChange) {
    var type = descriptor.type;
    var currentValue = obj[descriptor.key];
    var control;

    if (type === 'textarea') {
      control = el('textarea', {
        rows: descriptor.rows || 3,
        placeholder: descriptor.placeholder || '',
        oninput: function (e) { obj[descriptor.key] = e.target.value; onChange(); }
      });
      control.value = currentValue || '';
    } else if (type === 'select') {
      var options = [];
      if (!descriptor.required || currentValue === '' || currentValue === undefined || currentValue === null) {
        options.push(el('option', { value: '' }, ['-- none --']));
      }
      (descriptor.enumValues || []).forEach(function (value) {
        options.push(el('option', { value: value }, [descriptor.optionLabel ? descriptor.optionLabel(value) : value]));
      });
      control = el('select', {
        onchange: function (e) { obj[descriptor.key] = e.target.value; onChange(); }
      }, options);
      control.value = currentValue || '';
    } else if (type === 'checkbox') {
      control = el('input', {
        type: 'checkbox',
        checked: !!currentValue,
        onchange: function (e) { obj[descriptor.key] = e.target.checked; onChange(); }
      });
    } else if (type === 'number') {
      control = el('input', {
        type: 'number',
        min: descriptor.min,
        max: descriptor.max,
        placeholder: descriptor.placeholder || '',
        oninput: function (e) { obj[descriptor.key] = coerce('number', e.target.value); onChange(); }
      });
      control.value = (currentValue === null || currentValue === undefined) ? '' : currentValue;
    } else if (type === 'date') {
      control = el('input', {
        type: 'date',
        oninput: function (e) { obj[descriptor.key] = e.target.value; onChange(); }
      });
      control.value = currentValue || '';
    } else {
      control = el('input', {
        type: 'text',
        placeholder: descriptor.placeholder || '',
        oninput: function (e) { obj[descriptor.key] = e.target.value; onChange(); }
      });
      control.value = currentValue || '';
    }

    container.appendChild(labelRow(descriptor, control));
    return control;
  }

  function renderCheckboxGroup(container, obj, descriptor, onChange) {
    if (!Array.isArray(obj[descriptor.key])) { obj[descriptor.key] = []; }
    var list = obj[descriptor.key];
    var boxes = descriptor.options.map(function (optionValue) {
      var label = descriptor.optionLabel ? descriptor.optionLabel(optionValue) : optionValue;
      var checkbox = el('input', {
        type: 'checkbox',
        checked: list.indexOf(optionValue) !== -1,
        onchange: function (e) {
          var idx = list.indexOf(optionValue);
          if (e.target.checked && idx === -1) { list.push(optionValue); }
          if (!e.target.checked && idx !== -1) { list.splice(idx, 1); }
          onChange();
        }
      });
      return el('label', { class: 'checkbox-chip' }, [checkbox, ' ' + label]);
    });
    var wrapper = el('div', { class: 'field field-checkbox-group' }, [
      el('label', {}, [descriptor.label]),
      el('div', { class: 'checkbox-grid' }, boxes)
    ]);
    if (descriptor.help) {
      wrapper.appendChild(el('p', { class: 'field-help', text: descriptor.help }));
    }
    container.appendChild(wrapper);
  }

  /**
   * Renders an on/off toggle for a nullable object field (dok_level,
   * moderation, evaluation, reflection). Unchecked -> parentObj[key]
   * is null. Checked -> parentObj[key] is created via createDefault()
   * and options.renderBody populates its fields.
   */
  function renderNullableObject(container, parentObj, key, options, onChange) {
    var wrapper = el('div', { class: 'nullable-object' });
    var bodyHost = el('div', { class: 'nullable-object-body' });

    function renderState() {
      Dom.clear(wrapper);
      var isEnabled = parentObj[key] !== null && parentObj[key] !== undefined;
      var toggle = el('input', {
        type: 'checkbox',
        checked: isEnabled,
        onchange: function (e) {
          if (e.target.checked) {
            parentObj[key] = options.createDefault();
          } else {
            parentObj[key] = null;
          }
          onChange();
          renderState();
        }
      });
      wrapper.appendChild(el('label', { class: 'nullable-object-toggle' }, [toggle, ' ' + options.label]));
      if (options.help) {
        wrapper.appendChild(el('p', { class: 'field-help', text: options.help }));
      }
      if (isEnabled) {
        Dom.clear(bodyHost);
        options.renderBody(bodyHost, parentObj[key], onChange);
        wrapper.appendChild(bodyHost);
      }
    }

    renderState();
    container.appendChild(wrapper);
  }

  global.LP.FieldRenderer = {
    renderField: renderField,
    renderCheckboxGroup: renderCheckboxGroup,
    renderNullableObject: renderNullableObject
  };
})(window);
