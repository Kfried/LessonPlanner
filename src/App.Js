// --- 1. Storage Services (Single Responsibility Principle) ---

class FileStorageService {
    saveDocument(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename.endsWith('.json') ? filename : `${filename}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    loadDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error("Failed to parse JSON document. Ensure the file is valid."));
                }
            };
            reader.onerror = () => reject(new Error("Error reading file."));
            reader.readAsText(file);
        });
    }
}

// --- 2. User Interface Controller ---

class LessonPlanEditor {
    constructor(storageService) {
        this.storageService = storageService;
        this.episodesContainer = document.getElementById('episodes-container');
        this.outcomesContainer = document.getElementById('outcomes-container'); // NEW
        this.initialiseEventListeners();

        this.addTeachingEpisode();
        this.addOutcome(); // NEW
    }

    initialiseEventListeners() {
        document.getElementById('btn-save')?.addEventListener('click', () => this.handleSave());
        document.getElementById('btn-new')?.addEventListener('click', () => this.clearForm());
        document.getElementById('file-upload')?.addEventListener('change', (e) => this.handleLoad(e));
        document.getElementById('btn-add-episode')?.addEventListener('click', () => this.addTeachingEpisode());
        document.getElementById('btn-add-outcome')?.addEventListener('click', () => this.addOutcome()); // NEW
    }

    // --- Dynamic Teaching Episodes Logic ---

    addTeachingEpisode(data = null) {
        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'episode-segment';
        
        // Construct the internal HTML for the episode segment
        episodeDiv.innerHTML = `
            <button class="btn-remove material-icons" onclick="this.parentElement.remove()" title="Remove Segment">delete</button>
            <div class="grid-2">
                <div class="form-group">
                    <label>Segment Type *</label>
                    <select class="ep-segment_type">
                        <option value="do_now">Do Now</option>
                        <option value="introduction">Introduction</option>
                        <option value="provide_model">Provide Model</option>
                        <option value="continued_learning">Continued Learning</option>
                        <option value="review_of_learning">Review of Learning</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Timing (Minutes) *</label>
                    <input type="number" class="ep-timing" min="1" value="${data?.timing_minutes || 5}">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Teacher Actions *</label>
                    <textarea class="ep-teacher" rows="3">${data?.teacher_actions || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Pupil Actions *</label>
                    <textarea class="ep-pupil" rows="3">${data?.pupil_actions || ''}</textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Check for Understanding (Hinge Question / Task)</label>
                <input type="text" class="ep-check" value="${data?.check_for_understanding?.question || ''}">
            </div>
        `;

        if (data && data.segment_type) {
            episodeDiv.querySelector('.ep-segment_type').value = data.segment_type;
        }

        this.episodesContainer.appendChild(episodeDiv);
    }

    extractTeachingEpisodes() {
        const episodes = [];
        const segments = document.querySelectorAll('.episode-segment');
        
        segments.forEach(segment => {
            episodes.push({
                segment_type: segment.querySelector('.ep-segment_type').value,
                timing_minutes: parseInt(segment.querySelector('.ep-timing').value) || 0,
                teacher_actions: segment.querySelector('.ep-teacher').value,
                pupil_actions: segment.querySelector('.ep-pupil').value,
                check_for_understanding: {
                    question: segment.querySelector('.ep-check').value
                }
            });
        });
        
        return episodes;
    }

    // --- Data Extraction and Hydration ---

    getFormData() {
        // Splitting resources input into an array, removing empty spaces
        const resourcesStr = document.getElementById('resources').value;
        const resourcesArray = resourcesStr ? resourcesStr.split(',').map(item => item.trim()) : [];

        return {
            lesson_id: document.getElementById('lesson_id').value,
            header: {
                unit_of_work: document.getElementById('unit_of_work').value,
                topic: document.getElementById('topic').value,
                key_stage: document.getElementById('key_stage').value,
                exam_board: document.getElementById('exam_board').value,
                class_group: document.getElementById('class_group').value
            },
            learning_sequence_context: {
                position_in_sequence: document.getElementById('position_in_sequence').value,
                previous_lesson_summary: document.getElementById('previous_lesson_summary').value
            },
            expected_outcomes: this.extractOutcomes(),

            pedagogical_metadata: {
                learning_strand: document.getElementById('learning_strand').value,
                notation_form: document.getElementById('notation_form').value
            },
            preparation: {
                resources: resourcesArray,
                additional_adult_role: document.getElementById('additional_adult_role').value
            },
            teaching_episode: this.extractTeachingEpisodes(),
            evaluation: {
                pupil_progress: document.getElementById('pupil_progress').value,
                implications_for_future_lessons: document.getElementById('implications').value
            },
            reflection: {
                successes: document.getElementById('successes').value,
                action_points: document.getElementById('action_points').value
            }
        };
    }

    populateForm(data) {
        document.getElementById('lesson_id').value = data.lesson_id || '';
        
        if (data.header) {
            document.getElementById('unit_of_work').value = data.header.unit_of_work || '';
            document.getElementById('topic').value = data.header.topic || '';
            document.getElementById('key_stage').value = data.header.key_stage || 'KS3';
            document.getElementById('exam_board').value = data.header.exam_board || 'board-agnostic';
            document.getElementById('class_group').value = data.header.class_group || '';
        }

        if (data.learning_sequence_context) {
            document.getElementById('position_in_sequence').value = data.learning_sequence_context.position_in_sequence || '';
            document.getElementById('previous_lesson_summary').value = data.learning_sequence_context.previous_lesson_summary || '';
        }

        if (data.expected_outcomes) {
            document.getElementById('lesson_objective').value = data.expected_outcomes.lesson_objective || '';
            document.getElementById('activity_summary').value = data.expected_outcomes.activity_summary || '';
        }

        if (data.pedagogical_metadata) {
            document.getElementById('learning_strand').value = data.pedagogical_metadata.learning_strand || 'ks3-digital-literacy';
            document.getElementById('notation_form').value = data.pedagogical_metadata.notation_form || 'not-applicable';
        }

        if (data.preparation) {
            document.getElementById('resources').value = (data.preparation.resources || []).join(', ');
            document.getElementById('additional_adult_role').value = data.preparation.additional_adult_role || '';
        }

        if (data.evaluation) {
            document.getElementById('pupil_progress').value = data.evaluation.pupil_progress || '';
            document.getElementById('implications').value = data.evaluation.implications_for_future_lessons || '';
        }

        if (data.reflection) {
            document.getElementById('successes').value = data.reflection.successes || '';
            document.getElementById('action_points').value = data.reflection.action_points || '';
        }

        // NEW: Hydrate Dynamic Expected Outcomes array
        this.outcomesContainer.innerHTML = '';
        if (data.expected_outcomes && Array.isArray(data.expected_outcomes) && data.expected_outcomes.length > 0) {
            data.expected_outcomes.forEach(out => this.addOutcome(out));
        } else {
            this.addOutcome(); // Ensure at least one empty row exists
        }

        // Hydrate Teaching Episodes
        this.episodesContainer.innerHTML = '';
        if (data.teaching_episode && data.teaching_episode.length > 0) {
            data.teaching_episode.forEach(ep => this.addTeachingEpisode(ep));
        } else {
            this.addTeachingEpisode();
        }

        // Hydrate Teaching Episodes
        this.episodesContainer.innerHTML = ''; // Clear current
        if (data.teaching_episode && data.teaching_episode.length > 0) {
            data.teaching_episode.forEach(ep => this.addTeachingEpisode(ep));
        } else {
            this.addTeachingEpisode(); // ensure at least one empty row
        }
    }

    handleSave() {
        const data = this.getFormData();
        const filename = data.lesson_id ? `${data.lesson_id}.json` : 'new_lesson_plan.json';
        this.storageService.saveDocument(data, filename);
    }

    async handleLoad(event) {
        const input = event.target;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        try {
            const documentData = await this.storageService.loadDocument(file);
            this.populateForm(documentData);
            alert('Document loaded successfully.');
        } catch (error) {
            alert(error);
        } finally {
            input.value = '';
        }
    }

    clearForm() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => input.value = '');

        const selects = document.querySelectorAll('select');
        selects.forEach(select => select.selectedIndex = 0);

        this.episodesContainer.innerHTML = '';
        this.addTeachingEpisode();

        // NEW: Clear and reset outcomes
        this.outcomesContainer.innerHTML = '';
        this.addOutcome();
    }

    // --- Dynamic Expected Outcomes Logic ---

    addOutcome(data = null) {
        const outcomeDiv = document.createElement('div');
        outcomeDiv.className = 'episode-segment'; // Reusing the visual style from episodes

        // Convert array of criteria back to a comma-separated string for editing
        const criteriaStr = data?.assessment_criteria ? data.assessment_criteria.join(', ') : '';

        outcomeDiv.innerHTML = `
            <button class="btn-remove material-icons" onclick="this.parentElement.remove()" title="Remove Outcome">delete</button>
            <div class="form-group">
                <label>Lesson Objective *</label>
                <input type="text" class="out-objective" value="${data?.lesson_objective || ''}" required>
            </div>
            <div class="form-group">
                <label>Assessment Criteria ('Each student will...', comma separated) *</label>
                <input type="text" class="out-criteria" value="${criteriaStr}" required>
            </div>
            <div class="form-group">
                <label>Activity Summary *</label>
                <textarea class="out-activity" rows="2" required>${data?.activity_summary || ''}</textarea>
            </div>
        `;

        this.outcomesContainer.appendChild(outcomeDiv);
    }

    extractOutcomes() {
        const outcomes = [];
        const segments = document.querySelectorAll('#outcomes-container .episode-segment');

        segments.forEach(segment => {
            const criteriaInput = segment.querySelector('.out-criteria').value;
            // Convert comma-separated string into an array, ignoring empty spaces
            const criteriaArray = criteriaInput ? criteriaInput.split(',').map(item => item.trim()).filter(item => item) : [];

            outcomes.push({
                lesson_objective: segment.querySelector('.out-objective').value,
                assessment_criteria: criteriaArray,
                activity_summary: segment.querySelector('.out-activity').value
            });
        });

        return outcomes;
    }
}

// --- 3. Application Bootstrapping ---

document.addEventListener('DOMContentLoaded', () => {
    const storageService = new FileStorageService();
    new LessonPlanEditor(storageService);
});