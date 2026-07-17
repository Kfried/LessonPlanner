(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;
  var ListEditor = global.LP.ListEditor;
  var Dom = global.LP.Dom;
  var el = Dom.el;

  var LearningSequenceSection = {
    id: 'learning_sequence_context',
    label: 'Learning Sequence',
    render: function (container, plan, ctx) {
      var data = plan.learning_sequence_context;
      FieldRenderer.renderField(container, data, { key: 'position_in_sequence', label: 'Position in Sequence', type: 'text', required: true, placeholder: "e.g. 'Lesson 3 of 6 — Selection'" }, ctx.onChange);
      FieldRenderer.renderField(container, data, { key: 'previous_lesson_summary', label: 'Previous Lesson Summary', type: 'textarea', placeholder: 'Last lesson I...' }, ctx.onChange);
      FieldRenderer.renderField(container, data, { key: 'next_lesson_link', label: 'Next Lesson Link', type: 'textarea', help: 'What this lesson sets up for next.' }, ctx.onChange);

      container.appendChild(el('label', { text: 'Prerequisite Lesson IDs' }));
      var listHost = el('div');
      container.appendChild(listHost);
      ListEditor.mount(listHost, data, 'prerequisite_lesson_ids', {
        mode: 'simple', itemLabel: 'Prerequisite', placeholder: 'lesson_id of a lesson that should precede this one'
      }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.learning_sequence_context = LearningSequenceSection;
})(window);
