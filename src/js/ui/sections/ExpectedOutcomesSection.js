(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;
  var ListEditor = global.LP.ListEditor;
  var Dom = global.LP.Dom;
  var el = Dom.el;

  var ExpectedOutcomesSection = {
    id: 'expected_outcomes',
    label: 'Expected Outcomes',
    render: function (container, plan, ctx) {
      var data = plan.expected_outcomes;
      FieldRenderer.renderField(container, data, { key: 'lesson_objective', label: 'Lesson Objective', type: 'textarea', required: true }, ctx.onChange);

      container.appendChild(el('label', {}, ['Assessment Criteria ', el('span', { class: 'required-mark', text: '*' })]));
      container.appendChild(el('p', { class: 'field-help', text: "'Each student will...' statements. At least one is required." }));
      var listHost = el('div');
      container.appendChild(listHost);
      ListEditor.mount(listHost, data, 'assessment_criteria', {
        mode: 'simple', itemLabel: 'Criterion', placeholder: 'Each student will...'
      }, ctx.onChange);

      FieldRenderer.renderField(container, data, { key: 'activity_summary', label: 'Activity Summary', type: 'textarea', required: true }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.expected_outcomes = ExpectedOutcomesSection;
})(window);
