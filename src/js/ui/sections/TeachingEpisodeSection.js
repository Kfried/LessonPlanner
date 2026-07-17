/**
 * The proforma's Do Now / Introduction / Model / Continued Learning /
 * Review structure. Uses ListEditor's 'custom' mode because a segment
 * nests a check_for_understanding object, which itself nests a
 * distractors list — one level deeper than the declarative 'objects'
 * mode handles.
 */
(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;
  var ListEditor = global.LP.ListEditor;
  var Dom = global.LP.Dom;
  var el = Dom.el;
  var enums = global.LP.Schema.enums;
  var Factory = global.LP.LessonPlanFactory;

  function segmentSummary(segment, index) {
    var label = segment.segment_type === 'custom' && segment.segment_label ? segment.segment_label : segment.segment_type;
    return (index + 1) + '. ' + (label || 'Untitled segment') + (segment.timing_minutes ? ' (' + segment.timing_minutes + ' min)' : '');
  }

  function renderSegment(body, segment, onChange) {
    FieldRenderer.renderField(body, segment, { key: 'segment_type', label: 'Segment Type', type: 'select', required: true, enumValues: enums.segmentType }, onChange);
    if (segment.segment_type === 'custom') {
      FieldRenderer.renderField(body, segment, { key: 'segment_label', label: 'Custom Segment Label', type: 'text', required: true }, onChange);
    }
    FieldRenderer.renderField(body, segment, { key: 'timing_minutes', label: 'Timing (minutes)', type: 'number', min: 1, required: true }, onChange);
    FieldRenderer.renderField(body, segment, { key: 'notation_used', label: 'Notation Used', type: 'select', enumValues: enums.notationUsed }, onChange);
    FieldRenderer.renderField(body, segment, { key: 'teacher_actions', label: 'Teacher', type: 'textarea', required: true, help: "What the teacher does at this stage." }, onChange);
    FieldRenderer.renderField(body, segment, { key: 'pupil_actions', label: 'Pupil', type: 'textarea', required: true, help: "What pupils will be doing/thinking at this stage." }, onChange);

    body.appendChild(el('h4', { class: 'subheading-minor', text: 'Check for Understanding' }));
    FieldRenderer.renderNullableObject(body, segment, 'check_for_understanding', {
      label: 'This segment has a hinge-question check',
      createDefault: function () { return { question: '', format: '', distractors: [], decision_rule: '' }; },
      renderBody: function (checkBody, check, onChange2) {
        FieldRenderer.renderField(checkBody, check, { key: 'question', label: 'Question', type: 'textarea', rows: 2 }, onChange2);
        FieldRenderer.renderField(checkBody, check, { key: 'format', label: 'Format', type: 'select', enumValues: enums.checkFormat }, onChange2);

        checkBody.appendChild(el('label', { text: 'Distractors' }));
        var distractorHost = el('div');
        checkBody.appendChild(distractorHost);
        ListEditor.mount(distractorHost, check, 'distractors', {
          mode: 'objects',
          itemLabel: 'Distractor',
          createItem: function () { return { option: '', misconception_id: '' }; },
          summary: function (item, index) { return item.option || ('Option #' + (index + 1)); },
          fields: [
            { key: 'option', label: 'Option Text', type: 'text' },
            { key: 'misconception_id', label: 'Misconception ID', type: 'text', help: 'Links to pedagogical_metadata.misconception_ids.' }
          ]
        }, onChange2);

        FieldRenderer.renderField(checkBody, check, { key: 'decision_rule', label: 'Decision Rule', type: 'textarea', rows: 2, placeholder: "e.g. 'advance if >80% correct, else reteach with worked example'" }, onChange2);
      }
    }, onChange);
  }

  var TeachingEpisodeSection = {
    id: 'teaching_episode',
    label: 'Teaching Episode',
    render: function (container, plan, ctx) {
      container.appendChild(el('p', { class: 'field-help', text: 'Ordered sequence of segments. At least one is required.' }));
      var listHost = el('div');
      container.appendChild(listHost);
      ListEditor.mount(listHost, plan, 'teaching_episode', {
        mode: 'custom',
        itemLabel: 'Segment',
        createItem: function () { return Factory.createSegment('do_now'); },
        summary: segmentSummary,
        renderItem: renderSegment
      }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.teaching_episode = TeachingEpisodeSection;
})(window);
