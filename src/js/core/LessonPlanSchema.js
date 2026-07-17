/**
 * Embedded copy of DataStructures/lesson_plan.schema.json.
 *
 * The app is loaded via file:// so it cannot fetch() the schema file at
 * runtime (Chrome blocks XHR/fetch of local files under file://). This
 * constant must be kept in sync with the JSON file whenever that schema
 * changes — see README.md for the one-step resync instruction.
 */
(function (global) {
  'use strict';

  var definition = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://strata-advantage.internal/schemas/lesson_plan.schema.json",
    "title": "Generic Lesson Plan Schema",
    "description": "Schema developed for GCSE Computer Science lesson plans. Based on the Teach First Planning Proforma structure, extended with metadata linking each lesson to the project's DOK/AO/PRIMM/BKT skill model.",
    "type": "object",
    "required": [
      "lesson_id", "header", "learning_sequence_context", "expected_outcomes",
      "pedagogical_metadata", "preparation", "teaching_episode"
    ],
    "properties": {
      "lesson_id": { "type": "string", "description": "Stable unique identifier, e.g. 'cs-algo-selection-l03'." },
      "header": {
        "type": "object",
        "required": ["topic", "key_stage"],
        "properties": {
          "date": { "type": "string", "format": "date" },
          "year_group": { "type": "string" },
          "topic": { "type": "string" },
          "key_stage": { "type": "string", "enum": ["KS3", "KS4"] },
          "exam_board": { "type": "string", "enum": ["AQA", "OCR", "Edexcel", "WJEC/Eduqas", "board-agnostic"] },
          "specification_code": { "type": "string" },
          "duration_minutes": { "type": "integer", "minimum": 1 }
        }
      },
      "learning_sequence_context": {
        "type": "object",
        "required": ["position_in_sequence"],
        "properties": {
          "position_in_sequence": { "type": "string" },
          "previous_lesson_summary": { "type": "string" },
          "prerequisite_lesson_ids": { "type": "array", "items": { "type": "string" } },
          "next_lesson_link": { "type": "string" }
        }
      },
      "expected_outcomes": {
        "type": "object",
        "required": ["lesson_objective", "assessment_criteria", "activity_summary"],
        "properties": {
          "lesson_objective": { "type": "string" },
          "assessment_criteria": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
          "activity_summary": { "type": "string" }
        }
      },
      "pedagogical_metadata": {
        "type": "object",
        "required": ["learning_strand"],
        "properties": {
          "learning_strand": {
            "type": "string",
            "enum": ["ks3-digital-literacy", "ks3-computational-foundations", "ks3-web-markup", "ks3-ks4-programming-track"]
          },
          "notation_form": {
            "type": "string",
            "enum": ["pseudocode", "flowchart", "text-code", "markup", "application-gui", "binary-representation", "not-applicable"]
          },
          "tool": { "type": "string" },
          "primm_phase": { "type": "string", "enum": ["Predict", "Run", "Investigate", "Modify", "Make", "not-applicable"] },
          "algorithm_skill_ids": { "type": "array", "items": { "type": "string" } },
          "notation_skill_ids": { "type": "array", "items": { "type": "string" } },
          "application_skill_ids": { "type": "array", "items": { "type": "string" } },
          "concept_skill_ids": { "type": "array", "items": { "type": "string" } },
          "markup_skill_ids": { "type": "array", "items": { "type": "string" } },
          "threshold_concept": { "type": "boolean", "default": false },
          "rosenshine_principles": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "daily-review", "small-steps", "questioning", "models",
                "guided-practice", "checking-for-understanding",
                "high-success-rate", "scaffolds-for-difficult-tasks",
                "independent-practice", "weekly-monthly-review"
              ]
            }
          },
          "dok_level": {
            "type": "object",
            "required": ["primary", "rationale"],
            "properties": {
              "primary": { "type": "integer", "minimum": 1, "maximum": 4 },
              "range": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 4 }, "minItems": 2, "maxItems": 2 },
              "rationale": { "type": "string" }
            }
          },
          "assessment_objectives": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["board", "ao_code", "rationale"],
              "properties": {
                "board": { "type": "string", "enum": ["AQA", "OCR", "Edexcel", "WJEC/Eduqas"] },
                "ao_code": { "type": "string" },
                "specification_reference": { "type": "string" },
                "rationale": { "type": "string" }
              }
            }
          },
          "misconception_ids": { "type": "array", "items": { "type": "string" } },
          "moderation": {
            "type": "object",
            "required": ["status"],
            "properties": {
              "status": { "type": "string", "enum": ["unmoderated", "provisional", "disputed", "expert-assigned"] },
              "raters": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["rater_id", "dok_primary", "timestamp"],
                  "properties": {
                    "rater_id": { "type": "string" },
                    "dok_primary": { "type": "integer", "minimum": 1, "maximum": 4 },
                    "ao_codes": { "type": "array", "items": { "type": "string" } },
                    "misconception_ids": { "type": "array", "items": { "type": "string" } },
                    "rationale": { "type": "string" },
                    "timestamp": { "type": "string", "format": "date-time" }
                  }
                }
              },
              "reconciled_by": { "type": ["string", "null"] },
              "reconciled_at": { "type": ["string", "null"], "format": "date-time" }
            }
          }
        },
        "allOf": [
          { "if": { "properties": { "learning_strand": { "const": "ks3-digital-literacy" } } }, "then": { "required": ["application_skill_ids"] } },
          { "if": { "properties": { "learning_strand": { "const": "ks3-computational-foundations" } } }, "then": { "required": ["concept_skill_ids", "notation_form", "tool"] } },
          { "if": { "properties": { "learning_strand": { "const": "ks3-web-markup" } } }, "then": { "required": ["markup_skill_ids", "notation_form"] } },
          { "if": { "properties": { "learning_strand": { "const": "ks3-ks4-programming-track" } } }, "then": { "required": ["algorithm_skill_ids", "notation_form", "tool", "primm_phase"] } }
        ]
      },
      "preparation": {
        "type": "object",
        "required": ["resources"],
        "properties": {
          "resources": { "type": "array", "items": { "type": "string" } },
          "key_vocabulary": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["term", "tier"],
              "properties": {
                "term": { "type": "string" },
                "tier": { "type": "string", "enum": ["tier2-academic", "tier3-subject-specific"] },
                "polysemous": { "type": "boolean", "default": false },
                "definition": { "type": "string" }
              }
            }
          },
          "additional_adult_role": { "type": "string" },
          "send_five_a_day": {
            "type": "array",
            "items": { "type": "string", "enum": ["explicit-instruction", "cognitive-metacognitive-strategies", "scaffolding", "flexible-grouping", "technology"] }
          },
          "accessibility": { "type": "array", "items": { "type": "string" } }
        }
      },
      "teaching_episode": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["segment_type", "timing_minutes", "teacher_actions", "pupil_actions"],
          "properties": {
            "segment_type": { "type": "string", "enum": ["do_now", "introduction", "provide_model", "continued_learning", "review_of_learning", "custom"] },
            "segment_label": { "type": "string" },
            "timing_minutes": { "type": "integer", "minimum": 1 },
            "teacher_actions": { "type": "string" },
            "pupil_actions": { "type": "string" },
            "notation_used": {
              "type": "string",
              "enum": [
                "pseudocode", "flowchart", "basic-256", "small-basic", "constrained-python", "full-python",
                "html-markup", "application-gui", "binary-representation", "flowol-control",
                "verbal-only", "not-applicable"
              ]
            },
            "check_for_understanding": {
              "type": "object",
              "properties": {
                "question": { "type": "string" },
                "format": { "type": "string", "enum": ["hinge-mcq", "verbal-cold-call", "mini-whiteboard", "live-code-check", "other"] },
                "distractors": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "option": { "type": "string" },
                      "misconception_id": { "type": "string" }
                    }
                  }
                },
                "decision_rule": { "type": "string" }
              }
            }
          }
        }
      },
      "evaluation": {
        "type": ["object", "null"],
        "properties": {
          "pupil_progress": { "type": "string" },
          "implications_for_future_lessons": { "type": "string" }
        }
      },
      "reflection": {
        "type": ["object", "null"],
        "properties": {
          "successes": { "type": "string" },
          "action_points": { "type": "string" }
        }
      },
      "version_history": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["version", "timestamp", "snapshot"],
          "properties": {
            "version": { "type": "integer", "minimum": 1 },
            "timestamp": { "type": "string", "format": "date-time" },
            "summary": { "type": "string" },
            "snapshot": { "type": "object" }
          }
        }
      }
    }
  };

  var pm = definition.properties.pedagogical_metadata.properties;
  var enums = {
    keyStage: definition.properties.header.properties.key_stage.enum,
    examBoard: definition.properties.header.properties.exam_board.enum,
    learningStrand: pm.learning_strand.enum,
    notationForm: pm.notation_form.enum,
    primmPhase: pm.primm_phase.enum,
    rosenshinePrinciples: pm.rosenshine_principles.items.enum,
    aoBoard: pm.assessment_objectives.items.properties.board.enum,
    moderationStatus: pm.moderation.properties.status.enum,
    vocabTier: definition.properties.preparation.properties.key_vocabulary.items.properties.tier.enum,
    sendFiveADay: definition.properties.preparation.properties.send_five_a_day.items.enum,
    segmentType: definition.properties.teaching_episode.items.properties.segment_type.enum,
    notationUsed: definition.properties.teaching_episode.items.properties.notation_used.enum,
    checkFormat: definition.properties.teaching_episode.items.properties.check_for_understanding.properties.format.enum
  };

  global.LP = global.LP || {};
  global.LP.Schema = {
    definition: definition,
    enums: enums
  };
})(window);
