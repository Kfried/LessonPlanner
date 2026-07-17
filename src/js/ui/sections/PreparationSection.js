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

  var PreparationSection = {
    id: 'preparation',
    label: 'Preparation',
    render: function (container, plan, ctx) {
      var data = plan.preparation;

      subheading(container, 'Resources');
      var resourcesHost = el('div');
      container.appendChild(resourcesHost);
      ListEditor.mount(resourcesHost, data, 'resources', {
        mode: 'simple', itemLabel: 'Resource', placeholder: 'e.g. PowerPoint presentation'
      }, ctx.onChange);

      subheading(container, 'Key Vocabulary');
      container.appendChild(el('p', { class: 'field-help', text: 'Disciplinary literacy metadata (Tier 2/3 vocabulary), per EEF Improving Literacy in Secondary Schools.' }));
      var vocabHost = el('div');
      container.appendChild(vocabHost);
      ListEditor.mount(vocabHost, data, 'key_vocabulary', {
        mode: 'objects',
        itemLabel: 'Vocabulary Term',
        createItem: function () { return { term: '', tier: '', polysemous: false, definition: '' }; },
        summary: function (item, index) { return item.term ? item.term : ('Term #' + (index + 1)); },
        fields: [
          { key: 'term', label: 'Term', type: 'text', required: true },
          { key: 'tier', label: 'Tier', type: 'select', enumValues: enums.vocabTier, required: true },
          { key: 'polysemous', label: 'Polysemous?', type: 'checkbox', help: "Flag words with a distinct everyday meaning, e.g. 'variable', 'argument'." },
          { key: 'definition', label: 'Definition', type: 'textarea', rows: 2 }
        ]
      }, ctx.onChange);

      subheading(container, 'Additional Support');
      FieldRenderer.renderField(container, data, { key: 'additional_adult_role', label: 'Additional Adult Role', type: 'textarea', help: 'What role will an additional adult assume, if available?' }, ctx.onChange);

      FieldRenderer.renderCheckboxGroup(container, data, {
        key: 'send_five_a_day', label: 'SEND Five-a-Day Strategies', options: enums.sendFiveADay
      }, ctx.onChange);

      subheading(container, 'Accessibility');
      var accessHost = el('div');
      container.appendChild(accessHost);
      ListEditor.mount(accessHost, data, 'accessibility', {
        mode: 'simple', itemLabel: 'Accessibility Note', placeholder: 'e.g. Dyslexia-friendly font on slides'
      }, ctx.onChange);
    }
  };

  global.LP = global.LP || {};
  global.LP.Sections = global.LP.Sections || {};
  global.LP.Sections.preparation = PreparationSection;
})(window);
