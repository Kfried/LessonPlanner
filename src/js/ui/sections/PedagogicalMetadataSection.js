/**
 * The one section whose shape depends on another field's value
 * (learning_strand) via the schema's allOf/if/then rules. The
 * conditional skill-ID list is re-rendered whenever learning_strand
 * changes; everything else in the section renders once.
 */
(function (global) {
  'use strict';

  var FieldRenderer = global.LP.FieldRenderer;
  var ListEditor = global.LP.ListEditor;
  var Dom = global.LP.Dom;
  var el = Dom.el;
  var enums = global.LP.Schema.enums;

  function subheading(container, text) {
    container.appendChild(el('h3', { class: 'subheading', text: text }));
  }

  // notation_form only disambiguates PRIMM phase for the non-text-code
  // cases; the schema's text-code -> Investigate/Modify/Make split
  // cannot be derived from notation_form alone (that enum has a single
  // 'text-code' value covering all three), so this is a best-effort
  // default the user can still override, not an enforced lock.
  var PRIMM_SUGGESTION = {
    pseudocode: 'Predict',
    flowchart: 'Run',
    'markup': 'not-applicable',
    'application-gui': 'not-applicable',
    'binary-representation': 'not-applicable',
    'not-applicable': 'not-applicable'
  };

  var STRAND_SKILL_FIELD = {
    'ks3-digital-literacy': { key: 'application_skill_ids', label: 'Application Skill IDs', example: 'e.g. app.mindmap.hierarchical-structure' },
    'ks3-computational-foundations': { key: 'concept_skill_ids', label: 'Concept Skill IDs', example: 'e.g. concept.binary.place-value' },
    'ks3-web-markup': { key: 'markup_skill_ids', label: 'Markup Skill IDs', example: 'e.g. html.structure.semantic-tags' },
    'ks3-ks4-programming-track': { key: 'algorithm_skill_ids', label: 'Algorithm Skill IDs', example: 'e.g. algo.selection.if-else' }
  };

  function renderConditionalArea(container, data, ctx) {
    Dom.clear(container);
    var strandConfig = STRAND_SKILL_FIELD[data.learning_strand];
    if (!strandConfig) {
      container.appendChild(el('p', { class: 'field-help', text: 'Choose a learning strand above to reveal its strand-specific fields.' }));
      return;
    }

    container.appendChild(el('p', { class: 'field-note', text: 'Required for ' + data.learning_strand + ':' }));
    var listHost = el('div');
    container.appendChild(listHost);
    ListEditor.mount(listHost, data, strandConfig.key, {
      mode: 'simple', itemLabel: strandConfig.label.replace(/ IDs$/, ''), placeholder: strandConfig.example
    }, ctx.onChange);

    if (data.learning_strand === 'ks3-computational-foundations' || data.learning_strand === 'ks3-web-markup' || data.learning_strand === 'ks3-ks4-programming-track') {
      FieldRenderer.renderField(container, data, { key: 'notation_form', label: 'Notation Form', type: 'select', enumValues: enums.notationForm, required: true }, ctx.onChange);
    }
    if (data.learning_strand === 'ks3-computational-foundations' || data.learning_strand === 'ks3-ks4-programming-track') {
      FieldRenderer.renderField(container, data, { key: 'tool', label: 'Tool', type: 'text', required: true, placeholder: "e.g. 'Flowol', 'Small-Basic', 'Python'" }, ctx.onChange);
    }
    if (data.learning_strand === 'ks3-ks4-programming-track') {
      FieldRenderer.renderField(container, data, {
        key: 'primm_phase', label: 'PRIMM Phase', type: 'select', enumValues: enums.primmPhase, required: true,
        help: 'Suggested from Notation Form (pseudocode→Predict, flowchart→Run); text-code lessons need a manual choice between Investigate/Modify/Make.'
      }, ctx.onChange);
      if (!data.primm_phase && data.notation_form && PRIMM_SUGGESTION[data.notation_form]) {
        data.primm_phase = PRIMM_SUGGESTION[data.notation_form];
      }
      var notationSkillsHost = el('div');
      container.appendChild(el('label', { text: 'Notation Skill IDs' }));
      container.appendChild(notationSkillsHost);
      ListEditor.mount(notationSkillsHost, data, 'notation_skill_ids', {
        mode: 'simple', itemLabel: 'Notation Skill', placeholder: "e.g. notation.pseudocode.fluency"
      }, ctx.onChange);
    }
  }

  var PedagogicalMetadataSection = {
    id: 'pedagogical_metadata',
    label: 'Pedagogical Metadata',
    render: function (container, plan, ctx) {
      var data = plan.pedagogical_metadata;

      FieldRenderer.renderField(container, data, {
        key: 'learning_strand', label: 'Learning Strand', type: 'select', required: true, enumValues: enums.learningStrand,
        help: 'Determines which skill-ID field and which optional fields are meaningful for this lesson.'
      }, function () {
        ctx.onChange();
        renderConditionalArea(conditionalArea, data, ctx);
      });

      var conditionalArea = el('div', { class: 'conditional-area' });
      container.appendChild(conditionalArea);
      renderConditionalArea(conditionalArea, data, ctx);

      FieldRenderer.renderField(container, data, { key: 'threshold_concept', label: 'Threshold Concept', type: 'checkbox', help: 'Set where the topic is a designated threshold concept in the curriculum DAG (e.g. Selection).' }, ctx.onChange);

      FieldRenderer.renderCheckboxGroup(container, data, {
        key: 'rosenshine_principles', label: "Rosenshine's Principles Enacted", options: enums.rosenshinePrinciples
      }, ctx.onChange);

      subheading(container, 'Depth of Knowledge (DOK)');
      FieldRenderer.renderNullableObject(container, data, 'dok_level', {
        label: 'This lesson has an assigned DOK level',
        help: 'Programming-track lessons only. Cognitive complexity demanded by the tasks, independent of the objective wording.',
        createDefault: function () { return { primary: null, range: [], rationale: '' }; },
        renderBody: function (body, dok, onChange) {
          FieldRenderer.renderField(body, dok, { key: 'primary', label: 'Primary DOK Level', type: 'number', min: 1, max: 4, required: true }, onChange);
          var rangeHost = el('div');
          body.appendChild(el('label', { text: 'DOK Range [min, max]' }));
          body.appendChild(rangeHost);
          renderDokRange(rangeHost, dok, onChange);
          FieldRenderer.renderField(body, dok, { key: 'rationale', label: 'Rationale', type: 'textarea', required: true, help: 'Why this level was assigned, tied to specific teaching_episode segments.' }, onChange);
        }
      }, ctx.onChange);

      subheading(container, 'Assessment Objectives');
      var aoHost = el('div');
      container.appendChild(aoHost);
      ListEditor.mount(aoHost, data, 'assessment_objectives', {
        mode: 'objects',
        itemLabel: 'Assessment Objective',
        createItem: function () { return { board: '', ao_code: '', specification_reference: '', rationale: '' }; },
        summary: function (item, index) { return (item.board || 'AO') + ' ' + (item.ao_code || '#' + (index + 1)); },
        fields: [
          { key: 'board', label: 'Board', type: 'select', enumValues: enums.aoBoard, required: true },
          { key: 'ao_code', label: 'AO Code', type: 'text', required: true, placeholder: 'e.g. AO2' },
          { key: 'specification_reference', label: 'Specification Reference', type: 'text', help: 'Section/appendix reference within the spec.' },
          { key: 'rationale', label: 'Rationale', type: 'textarea', required: true }
        ]
      }, ctx.onChange);

      subheading(container, 'Misconceptions');
      var miscHost = el('div');
      container.appendChild(miscHost);
      ListEditor.mount(miscHost, data, 'misconception_ids', {
        mode: 'simple', itemLabel: 'Misconception ID', placeholder: 'e.g. misc.selection.missing-else-branch'
      }, ctx.onChange);

      subheading(container, 'Moderation');
      FieldRenderer.renderNullableObject(container, data, 'moderation', {
        label: 'This lesson has moderation tracking',
        help: 'Provenance/audit trail for dok_level, assessment_objectives and misconception_ids.',
        createDefault: function () { return { status: 'unmoderated', raters: [], reconciled_by: null, reconciled_at: null }; },
        renderBody: function (body, moderation, onChange) {
          FieldRenderer.renderField(body, moderation, { key: 'status', label: 'Status', type: 'select', enumValues: enums.moderationStatus, required: true }, onChange);

          body.appendChild(el('label', { text: 'Raters' }));
          var ratersHost = el('div');
          body.appendChild(ratersHost);
          ListEditor.mount(ratersHost, moderation, 'raters', {
            mode: 'objects',
            itemLabel: 'Rater Pass',
            createItem: function () { return { rater_id: '', dok_primary: null, ao_codes: [], misconception_ids: [], rationale: '', timestamp: new Date().toISOString() }; },
            summary: function (item, index) { return item.rater_id || ('Rater #' + (index + 1)); },
            fields: [
              { key: 'rater_id', label: 'Rater ID', type: 'text', required: true, placeholder: 'e.g. ai-pass-1' },
              { key: 'dok_primary', label: 'DOK Primary', type: 'number', min: 1, max: 4, required: true },
              { key: 'rationale', label: 'Rationale', type: 'textarea' },
              { key: 'timestamp', label: 'Timestamp', type: 'text', required: true, help: 'ISO date-time, auto-filled when the rater pass is added.' }
            ]
          }, onChange);

          FieldRenderer.renderField(body, moderation, { key: 'reconciled_by', label: 'Reconciled By', type: 'text', help: 'Human identifier, or leave blank if not yet reconciled.' }, onChange);
        }
      }, ctx.onChange);
    }
  };

  function renderDokRange(container, dok, onChange) {
    if (!Array.isArray(dok.range)) { dok.range = []; }
    var minInput = el('input', {
      type: 'number', min: 1, max: 4, placeholder: 'min',
      oninput: function (e) { dok.range[0] = e.target.value === '' ? undefined : Number(e.target.value); onChange(); }
    });
    minInput.value = dok.range[0] !== undefined ? dok.range[0] : '';
    var maxInput = el('input', {
      type: 'number', min: 1, max: 4, placeholder: 'max',
      oninput: function (e) { dok.range[1] = e.target.value === '' ? undefined : Number(e.target.value); onChange(); }
    });
    maxInput.value = dok.range[1] !== undefined ? dok.range[1] : '';
    container.appendChild(el('div', { class: 'inline-pair' }, [minInput, maxInput]));
  }

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.pedagogical_metadata = PedagogicalMetadataSection;
})(window);
