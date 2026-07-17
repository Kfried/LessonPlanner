(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;
  var enums = global.LP.Schema.enums;

  var HeaderSection = {
    id: 'header',
    label: 'Header',
    render: function (container, plan, ctx) {
      var header = plan.header;
      FieldRenderer.renderField(container, plan, { key: 'lesson_id', label: 'Lesson ID', type: 'text', required: true, placeholder: "e.g. 'cs-algo-selection-l03'", help: 'Stable unique identifier for this lesson plan.' }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'date', label: 'Date', type: 'date', help: 'Leave blank for template/bank lessons not yet scheduled.' }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'year_group', label: 'Year Group / Class', type: 'text', help: 'Anonymised class identifier only — never an identifiable pupil list.' }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'topic', label: 'Topic', type: 'text', required: true }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'key_stage', label: 'Key Stage', type: 'select', required: true, enumValues: enums.keyStage }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'exam_board', label: 'Exam Board', type: 'select', enumValues: enums.examBoard }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'specification_code', label: 'Specification Code', type: 'text', placeholder: "e.g. '8525' (AQA), 'J277' (OCR)" }, ctx.onChange);
      FieldRenderer.renderField(container, header, { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number', min: 1, help: 'Should equal the sum of the teaching episode segment timings.' }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.header = HeaderSection;
})(window);
