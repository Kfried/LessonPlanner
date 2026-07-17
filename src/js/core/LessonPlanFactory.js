/**
 * Builds blank lesson plan documents and prunes empty optional data
 * before it is written to disk. Single responsibility: object shape,
 * not validation (see LessonPlanValidator) and not persistence (see io/*).
 */
(function (global) {
  'use strict';

  function createBlank() {
    return {
      lesson_id: '',
      header: {
        date: '',
        year_group: '',
        topic: '',
        key_stage: '',
        exam_board: '',
        specification_code: '',
        duration_minutes: null
      },
      learning_sequence_context: {
        position_in_sequence: '',
        previous_lesson_summary: '',
        prerequisite_lesson_ids: [],
        next_lesson_link: ''
      },
      expected_outcomes: {
        lesson_objective: '',
        assessment_criteria: [],
        activity_summary: ''
      },
      pedagogical_metadata: {
        learning_strand: '',
        notation_form: '',
        tool: '',
        primm_phase: '',
        algorithm_skill_ids: [],
        notation_skill_ids: [],
        application_skill_ids: [],
        concept_skill_ids: [],
        markup_skill_ids: [],
        threshold_concept: false,
        rosenshine_principles: [],
        dok_level: null,
        assessment_objectives: [],
        misconception_ids: [],
        moderation: null
      },
      preparation: {
        resources: [],
        key_vocabulary: [],
        additional_adult_role: '',
        send_five_a_day: [],
        accessibility: []
      },
      teaching_episode: [],
      evaluation: null,
      reflection: null,
      version_history: []
    };
  }

  function createSegment(segmentType) {
    return {
      segment_type: segmentType || 'do_now',
      segment_label: '',
      timing_minutes: null,
      teacher_actions: '',
      pupil_actions: '',
      notation_used: '',
      check_for_understanding: null
    };
  }

  // Recursively drop empty strings, empty arrays, null placeholders and
  // now-empty objects so saved files stay close to the schema's own
  // examples rather than accumulating editor scaffolding.
  function isPrunableEmpty(value) {
    if (value === '' || value === null || value === undefined) { return true; }
    if (Array.isArray(value)) { return value.length === 0; }
    if (typeof value === 'object') { return Object.keys(value).length === 0; }
    return false;
  }

  function pruneForSave(value) {
    if (Array.isArray(value)) {
      return value
        .map(pruneForSave)
        .filter(function (item) { return !isPrunableEmpty(item); });
    }
    if (value && typeof value === 'object') {
      var result = {};
      Object.keys(value).forEach(function (key) {
        var pruned = pruneForSave(value[key]);
        if (!isPrunableEmpty(pruned)) {
          result[key] = pruned;
        }
      });
      return result;
    }
    return value;
  }

  // Deep-fills any keys missing from a loaded document using the blank
  // template's shape, while preserving every key the loaded document
  // already has (including ones the schema doesn't define) — opening a
  // file never silently drops data it doesn't recognise.
  function fillDefaults(data, defaults) {
    if (Array.isArray(defaults)) {
      return Array.isArray(data) ? data : defaults.slice();
    }
    if (defaults && typeof defaults === 'object') {
      var result = {};
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach(function (k) { result[k] = data[k]; });
      }
      Object.keys(defaults).forEach(function (k) {
        var defaultVal = defaults[k];
        var dataVal = (data && typeof data === 'object') ? data[k] : undefined;
        if (dataVal === undefined || dataVal === null) {
          result[k] = (defaultVal && typeof defaultVal === 'object') ? fillDefaults(undefined, defaultVal) : defaultVal;
        } else {
          result[k] = fillDefaults(dataVal, defaultVal);
        }
      });
      return result;
    }
    return (data === undefined) ? defaults : data;
  }

  function normalizeLoaded(loadedDocument) {
    return fillDefaults(loadedDocument, createBlank());
  }

  global.LP = global.LP || {};
  global.LP.LessonPlanFactory = {
    createBlank: createBlank,
    createSegment: createSegment,
    pruneForSave: pruneForSave,
    normalizeLoaded: normalizeLoaded
  };
})(window);
