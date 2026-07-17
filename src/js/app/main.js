/**
 * Composition root. The only file that knows every concrete class and
 * wires them together — every other module only knows the
 * abstractions/collaborators it's handed.
 */
(function (global) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var tabsHost = document.getElementById('tabs-host');
    var panelsHost = document.getElementById('panels-host');
    var validationHost = document.getElementById('validation-host');
    var toastHost = document.getElementById('toast-host');
    var fileStatus = document.getElementById('file-status');
    var versionNoteInput = document.getElementById('version-note');

    var sectionOrder = [
      'header', 'learning_sequence_context', 'expected_outcomes', 'pedagogical_metadata',
      'preparation', 'teaching_episode', 'evaluation', 'reflection', 'version_history'
    ];
    var sections = sectionOrder.map(function (id) { return global.LP.Sections[id]; });

    var app = new global.LP.AppController({
      fileIO: global.LP.FileIOFactory.create(),
      validator: new global.LP.LessonPlanValidator(global.LP.Schema.definition),
      tabsController: new global.LP.TabsController(tabsHost, panelsHost),
      validationPanel: new global.LP.ValidationPanel(validationHost),
      notifications: new global.LP.NotificationService(toastHost),
      sections: sections,
      elements: { fileStatus: fileStatus, versionNoteInput: versionNoteInput }
    });

    document.getElementById('btn-new').addEventListener('click', function () { app.newPlan(); });
    document.getElementById('btn-open').addEventListener('click', function () { app.openPlan(); });
    document.getElementById('btn-save').addEventListener('click', function () { app.save(); });
    document.getElementById('btn-save-as').addEventListener('click', function () { app.saveAs(); });

    window.addEventListener('beforeunload', function (e) {
      if (app.isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    app.start();
  });
})(window);
