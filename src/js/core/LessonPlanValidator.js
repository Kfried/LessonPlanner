/**
 * Small schema-driven validator covering exactly the JSON Schema
 * keywords used by lesson_plan.schema.json (type, required, properties,
 * items, enum, minItems/maxItems, minimum/maximum, allOf/if/then).
 *
 * It walks LP.Schema.definition rather than hard-coding per-field
 * checks, so schema changes (new required field, new enum value) do
 * not require touching this file — only LessonPlanSchema.js.
 *
 * "required" is interpreted as "has a meaningful value" (not empty
 * string/array/object) rather than strict key-presence, since that is
 * the useful signal for a human filling in a form.
 */
(function (global) {
  'use strict';

  function isEmptyValue(value) {
    if (value === '' || value === null || value === undefined) { return true; }
    if (Array.isArray(value)) { return value.length === 0; }
    if (typeof value === 'object') { return Object.keys(value).length === 0; }
    return false;
  }

  function typeMatches(expectedType, value) {
    var types = Array.isArray(expectedType) ? expectedType : [expectedType];
    return types.some(function (t) {
      if (t === 'null') { return value === null; }
      if (t === 'object') { return value !== null && typeof value === 'object' && !Array.isArray(value); }
      if (t === 'array') { return Array.isArray(value); }
      if (t === 'integer') { return typeof value === 'number' && Number.isInteger(value); }
      if (t === 'string') { return typeof value === 'string'; }
      if (t === 'boolean') { return typeof value === 'boolean'; }
      return true;
    });
  }

  function friendlyPath(path) {
    return path.length ? path.join(' → ') : '(root)';
  }

  function LessonPlanValidator(schemaDefinition) {
    this._schema = schemaDefinition;
  }

  LessonPlanValidator.prototype.validate = function (plan) {
    var issues = [];
    this._walk(this._schema, plan, [], issues);
    issues = issues.concat(this._crossFieldWarnings(plan));
    var errors = issues.filter(function (i) { return i.severity === 'error'; });
    var warnings = issues.filter(function (i) { return i.severity === 'warning'; });
    return { valid: errors.length === 0, errors: errors, warnings: warnings };
  };

  LessonPlanValidator.prototype._walk = function (schemaNode, data, path, issues) {
    if (!schemaNode) { return; }

    if (schemaNode.type && data !== undefined && !isEmptyValue(data) && !typeMatches(schemaNode.type, data)) {
      issues.push({ severity: 'error', path: path.slice(), message: friendlyPath(path) + ': expected ' + [].concat(schemaNode.type).join(' or ') });
      return;
    }

    if (schemaNode.enum && !isEmptyValue(data) && schemaNode.enum.indexOf(data) === -1) {
      issues.push({ severity: 'error', path: path.slice(), message: friendlyPath(path) + ': "' + data + '" is not one of the allowed values' });
    }

    if (typeof schemaNode.minimum === 'number' && typeof data === 'number' && data < schemaNode.minimum) {
      issues.push({ severity: 'error', path: path.slice(), message: friendlyPath(path) + ': must be at least ' + schemaNode.minimum });
    }
    if (typeof schemaNode.maximum === 'number' && typeof data === 'number' && data > schemaNode.maximum) {
      issues.push({ severity: 'error', path: path.slice(), message: friendlyPath(path) + ': must be at most ' + schemaNode.maximum });
    }

    if (schemaNode.properties && data && typeof data === 'object' && !Array.isArray(data)) {
      var required = schemaNode.required || [];
      required.forEach(function (key) {
        if (isEmptyValue(data[key])) {
          issues.push({ severity: 'error', path: path.concat(key), message: friendlyPath(path.concat(key)) + ' is required' });
        }
      });

      Object.keys(schemaNode.properties).forEach(function (key) {
        if (data[key] !== undefined) {
          this._walk(schemaNode.properties[key], data[key], path.concat(key), issues);
        }
      }, this);

      if (Array.isArray(schemaNode.allOf)) {
        schemaNode.allOf.forEach(function (clause) {
          if (this._ifConditionMatches(clause.if, data) && clause.then && clause.then.required) {
            clause.then.required.forEach(function (key) {
              if (isEmptyValue(data[key])) {
                issues.push({ severity: 'error', path: path.concat(key), message: friendlyPath(path.concat(key)) + ' is required when ' + friendlyPath(path.concat('learning_strand')) + ' = "' + data.learning_strand + '"' });
              }
            });
          }
        }, this);
      }
    }

    if (schemaNode.items && Array.isArray(data)) {
      if (typeof schemaNode.minItems === 'number' && data.length < schemaNode.minItems) {
        issues.push({ severity: 'error', path: path.slice(), message: friendlyPath(path) + ': needs at least ' + schemaNode.minItems + ' item(s)' });
      }
      data.forEach(function (item, index) {
        this._walk(schemaNode.items, item, path.concat('#' + (index + 1)), issues);
      }, this);
    }
  };

  LessonPlanValidator.prototype._ifConditionMatches = function (ifClause, data) {
    if (!ifClause || !ifClause.properties) { return false; }
    return Object.keys(ifClause.properties).every(function (key) {
      var expected = ifClause.properties[key].const;
      return data[key] === expected;
    });
  };

  LessonPlanValidator.prototype._crossFieldWarnings = function (plan) {
    var warnings = [];
    var header = plan.header || {};
    var episodes = plan.teaching_episode || [];
    var sum = episodes.reduce(function (total, seg) {
      return total + (typeof seg.timing_minutes === 'number' ? seg.timing_minutes : 0);
    }, 0);
    if (typeof header.duration_minutes === 'number' && sum > 0 && header.duration_minutes !== sum) {
      warnings.push({
        severity: 'warning',
        path: ['header', 'duration_minutes'],
        message: 'header → duration_minutes (' + header.duration_minutes + ') does not match the sum of teaching_episode timings (' + sum + ')'
      });
    }
    return warnings;
  };

  global.LP = global.LP || {};
  global.LP.LessonPlanValidator = LessonPlanValidator;
})(window);
