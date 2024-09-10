document.addEventListener("DOMContentLoaded", () => {
    const notesContainer = document.getElementById('notes-container');
    const newNoteButton = document.getElementById('new-note-button');
    const searchForm = document.getElementById('search-form');
    const clearButton = document.getElementById('clear-button');
    const saveButton = document.getElementById('save-button');
    const importNotesInput = document.getElementById('import-notes');
    const noteTemplateContent = document.getElementById('note-template').content;

    let tagsList = [];
    let titlesList = [];

    function initializeEvents() {
        newNoteButton.addEventListener('click', createNoteElement);
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            searchNotes();
        });
        clearButton.addEventListener('click', clearSearchResults);
        saveButton.addEventListener('click', saveAllNotes);
        importNotesInput.addEventListener('change', importNotes);
        loadExistingNotes();
    }

    function clearSearchResults() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => note.style.display = 'none');
    }

    function loadExistingNotes() {
        console.log("Loading existing notes...");
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            console.log("Note Loaded:", note);
            note.style.display = 'none';
        });
        updateLists();
    }

    function updateLists() {
        tagsList = [...new Set([...document.querySelectorAll('.note')].flatMap(note =>
            (note.dataset.tags ? note.dataset.tags.split(',').map(tag => tag.trim()) : [])))];
        titlesList = [...new Set([...document.querySelectorAll('.note')].map(note => note.dataset.title))];
        console.log("Updated Tags List:", tagsList);
        console.log("Updated Titles List:", titlesList);
    }

    function createNoteElement() {
        console.log("Creating new note...");
        const note = document.createElement('div');
        note.classList.add('note');
        notesContainer.insertBefore(note, notesContainer.firstChild);
        updateLists(); // Ensure lists are updated before populating form
        populateForm(note);
    }

    function populateForm(note, data = {}) {
        const form = noteTemplateContent.cloneNode(true).querySelector('.note-form');

        const titleInput = form.querySelector('.note-title');
        const contentInput = form.querySelector('.note-content');
        const tagsInput = form.querySelector('.note-tags');
        const relatesToInput = form.querySelector('.note-relates-to');
        const dependsOnInput = form.querySelector('.note-depends-on');
        const createdDateSpan = form.querySelector('.created-date');
        const modifiedDateSpan = form.querySelector('.modified-date');

        titleInput.value = data.title || '';
        contentInput.value = data.content || '';
        const tags = data.tags ? data.tags.split(', ') : [];
        const relatesTo = data.relatesTo ? data.relatesTo.split(', ') : [];
        const dependsOn = data.dependsOn ? data.dependsOn.split(', ') : [];

        // Convert tags, relates-to, and depends-on into Tagify-friendly format
        const tagsStr = tags.map(tag => ({ value: tag }));
        const relatesToStr = relatesTo.map(item => ({ value: item }));
        const dependsOnStr = dependsOn.map(item => ({ value: item }));

        createdDateSpan.textContent = data.created ? `Created: ${data.created}` : '';
        modifiedDateSpan.textContent = data.modified ? `Modified: ${data.modified}` : '';

        console.log(`Populating Tagify for note: ${data.title}`);
        console.log('Existing tags:', tags);
        console.log('Tags list:', tagsList);

        // Initialize Tagify for Tags
        const tagifyTags = new Tagify(tagsInput, {
            whitelist: tagsList,
            enforceWhitelist: true,
            dropdown: {
                position: 'input',
                enabled: 0
            }
        });
        tagifyTags.addTags(tagsStr);

        // Initialize Tagify for Relates To
        const tagifyRelatesTo = new Tagify(relatesToInput, {
            whitelist: titlesList,
            enforceWhitelist: true,
            dropdown: {
                position: 'input',
                enabled: 0
            }
        });
        tagifyRelatesTo.addTags(relatesToStr);

        // Initialize Tagify for Depends On
        const tagifyDependsOn = new Tagify(dependsOnInput, {
            whitelist: titlesList,
            enforceWhitelist: true,
            dropdown: {
                position: 'input',
                enabled: 0
            }
        });
        tagifyDependsOn.addTags(dependsOnStr);

        form.querySelector('.save-note-button').addEventListener('click', () => saveNote(note, form, tagifyTags, tagifyRelatesTo, tagifyDependsOn));
        form.querySelector('.edit-note-button').addEventListener('click', () => editNoteForm(form, tagifyTags, tagifyRelatesTo, tagifyDependsOn));
        form.querySelector('.delete-note-button').addEventListener('click', () => deleteNoteElement(note));

        // Set fields to readOnly initially to ensure they are not editable
        setFormFieldsEditable(form, false, tagifyTags, tagifyRelatesTo, tagifyDependsOn);

        note.innerHTML = '';
        note.appendChild(form);
        note.style.display = 'block';

        console.log(`Populated form for note with title "${data.title}"`);
    }

    function setFormFieldsEditable(form, editable, tagifyTags, tagifyRelatesTo, tagifyDependsOn) {
        const readOnlyState = editable ? false : true;
        form.querySelector('.note-title').readOnly = readOnlyState;
        form.querySelector('.note-content').readOnly = readOnlyState;

        console.log(`Setting form fields to ${editable ? 'editable' : 'non-editable'}`);

        tagifyTags.settings.readonly = !editable;
        tagifyRelatesTo.settings.readonly = !editable;
        tagifyDependsOn.settings.readonly = !editable;

        tagifyTags.update();  // Apply settings change
        tagifyRelatesTo.update();
        tagifyDependsOn.update();

        // Additional logging for troubleshooting
        console.log('Title Input State:', form.querySelector('.note-title').readOnly);
        console.log('Content Input State:', form.querySelector('.note-content').readOnly);
        console.log('Tags Input Readonly State:', !editable);
        console.log('Relates To Input Readonly State:', !editable);
        console.log('Depends On Input Readonly State:', !editable);
    }

    function editNoteForm(form, tagifyTags, tagifyRelatesTo, tagifyDependsOn) {
        console.log("Editing note...");
        setFormFieldsEditable(form, true, tagifyTags, tagifyRelatesTo, tagifyDependsOn);
        form.querySelector('.save-note-button').style.display = 'inline-block';
        form.querySelector('.edit-note-button').style.display = 'none';
    }

    function saveNote(note, form, tagifyTags, tagifyRelatesTo, tagifyDependsOn) {
        console.log("Saving note...");
        const title = form.querySelector('.note-title').value.trim();
        const content = form.querySelector('.note-content').value.trim();
        const tags = tagifyTags.value.map(tag => tag.value).join(', ');
        const relatesTo = tagifyRelatesTo.value.map(item => item.value).join(', ');
        const dependsOn = tagifyDependsOn.value.map(item => item.value).join(', ');
        const created = form.querySelector('.created-date').textContent.replace("Created: ", "") || new Date().toISOString();
        const modified = new Date().toISOString();

        const existingTitles = [...document.querySelectorAll('.note')].filter(noteEl => noteEl !== note).map(noteEl => noteEl.dataset.title);
        if (existingTitles.includes(title)) {
            alert('Title must be unique!');
            return;
        }

        note.dataset.id = title.toLowerCase().replace(/\s+/g, '-');
        note.dataset.title = title;
        note.dataset.tags = tags;
        note.dataset.relatesTo = relatesTo;
        note.dataset.dependsOn = dependsOn;
        note.dataset.created = created;
        note.dataset.modified = modified;
        note.dataset.content = content;

        form.querySelector('.created-date').textContent = `Created: ${created}`;
        form.querySelector('.modified-date').textContent = `Modified: ${modified}`;

        // Set fields to readOnly after saving
        setFormFieldsEditable(form, false, tagifyTags, tagifyRelatesTo, tagifyDependsOn);

        form.querySelector('.save-note-button').style.display = 'none';
        form.querySelector('.edit-note-button').style.display = 'inline';
        updateLists();
    }

    function deleteNoteElement(note) {
        if (confirm("Are you sure you want to delete this note?")) {
            note.remove();
            updateLists();
        }
    }

    function searchNotes() {
        console.log("Searching notes...");
        const searchTerm = document.getElementById('search-term').value.toLowerCase().trim();
        const field = document.getElementById('search-field').value;
        const notes = document.querySelectorAll('.note');

        notes.forEach(note => {
            const tags = note.dataset.tags ? note.dataset.tags.toLowerCase() : '';
            const title = note.dataset.title.toLowerCase();
            const relatesTo = note.dataset.relatesTo ? note.dataset.relatesTo.toLowerCase() : '';
            const dependsOn = note.dataset.dependsOn ? note.dataset.dependsOn.toLowerCase() : '';
            const content = note.dataset.content ? note.dataset.content.toLowerCase() : '';

            const match = (field === 'global' && (tags.includes(searchTerm) || title.includes(searchTerm) || relatesTo.includes(searchTerm) || dependsOn.includes(searchTerm) || content.includes(searchTerm)))
                || (field !== 'global' && note.dataset[field]?.toLowerCase().includes(searchTerm));

            if (match) {
                populateForm(note, {
                    title: note.dataset.title,
                    tags: note.dataset.tags,
                    relatesTo: note.dataset.relatesTo,
                    dependsOn: note.dataset.dependsOn,
                    content: note.dataset.content,
                    created: note.dataset.created,
                    modified: note.dataset.modified
                });
            } else {
                note.style.display = 'none';
            }
        });
    }

    function saveAllNotes() {
        const notes = document.querySelectorAll('.note');
        const notesData = [];
        notes.forEach(note => {
            notesData.push({
                id: note.dataset.id,
                title: note.dataset.title,
                tags: note.dataset.tags,
                relatesTo: note.dataset.relatesTo,
                dependsOn: note.dataset.dependsOn,
                content: note.dataset.content,
                created: note.dataset.created,
                modified: note.dataset.modified
            });
        });

        const blob = new Blob([JSON.stringify(notesData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function importNotes(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const jsonData = JSON.parse(e.target.result);
                console.log("Imported data:", jsonData);
                jsonData.forEach(data => {
                    console.log("Importing note:", data);
                    const note = document.createElement('div');
                    note.classList.add('note');
                    note.dataset.id = data.id;
                    note.dataset.title = data.title;

                    // Ensure tags split correctly here
                    note.dataset.tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).join(', ') : '';
                    note.dataset.relatesTo = data.relatesTo || '';
                    note.dataset.dependsOn = data.dependsOn || '';
                    note.dataset.created = data.created || '';
                    note.dataset.modified = data.modified || '';
                    note.dataset.content = data.content || '';

                    notesContainer.appendChild(note);
                });

                // Update lists here before populating the forms
                updateLists();

                // Initialize Tagify after appending note to DOM
                jsonData.forEach(data => {
                    const note = notesContainer.querySelector(`div[data-id="${data.id}"]`);
                    if (note) {
                        populateForm(note, data);
                    }
                });
            };
            reader.readAsText(file);
        }
    }

    initializeEvents();
});