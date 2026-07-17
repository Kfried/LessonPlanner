/**
 * Both evaluation and reflection are nullable objects only completed
 * after delivery, with an identical two-textarea shape — grouped in
 * one file since each is a few lines, but still registered as two
 * independent tabs matching the schema's two top-level properties.
 */
(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;

  var EvaluationSection = {
    id: 'evaluation',
    label: 'Evaluation',
    render: function (container, plan, ctx) {
      FieldRenderer.renderNullableObject(container, plan, 'evaluation', {
        label: 'This lesson has been taught and evaluated',
        help: 'Leave unchecked for lesson plans not yet taught.',
        createDefault: function () { return { pupil_progress: '', implications_for_future_lessons: '' }; },
        renderBody: function (body, evaluation, onChange) {
          FieldRenderer.renderField(body, evaluation, { key: 'pupil_progress', label: 'Pupil Progress', type: 'textarea' }, onChange);
          FieldRenderer.renderField(body, evaluation, { key: 'implications_for_future_lessons', label: 'Implications for Future Lessons', type: 'textarea' }, onChange);
        }
      }, ctx.onChange);
    }
  };

  var ReflectionSection = {
    id: 'reflection',
    label: 'Reflection',
    render: function (container, plan, ctx) {
      FieldRenderer.renderNullableObject(container, plan, 'reflection', {
        label: 'This lesson has a recorded reflection',
        help: 'Leave unchecked for lesson plans not yet taught.',
        createDefault: function () { return { successes: '', action_points: '' }; },
        renderBody: function (body, reflection, onChange) {
          FieldRenderer.renderField(body, reflection, { key: 'successes', label: 'Successes', type: 'textarea', help: 'What aspects of the teaching episode were successful?' }, onChange);
          FieldRenderer.renderField(body, reflection, { key: 'action_points', label: 'Action Points', type: 'textarea', help: 'What are your action points for your next teaching episode?' }, onChange);
        }
      }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.evaluation = EvaluationSection;
  global.LP.Sections.reflection = ReflectionSection;
})(window);
