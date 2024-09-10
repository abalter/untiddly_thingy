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
        populateForm(note);
        updateLists();
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
        const tags = typeof data.tags === 'string' ? data.tags : '';
        const relatesTo = typeof data.relatesTo === 'string' ? data.relatesTo : '';
        const dependsOn = typeof data.dependsOn === 'string' ? data.dependsOn : '';

        createdDateSpan.textContent = data.created ? `Created: ${data.created}` : '';
        modifiedDateSpan.textContent = data.modified ? `Modified: ${data.modified}` : '';

        const tagsChoices = new Choices(tagsInput, {
            removeItemButton: true,
            duplicateItemsAllowed: false,
            items: tags ? tags.split(', ').map(tag => ({ value: tag, label: tag })) : [],
            choices: tagsList.map(tag => ({ value: tag, label: tag }))
        });

        const relatesToChoices = new Choices(relatesToInput, {
            searchEnabled: true,
            shouldSort: false,
            choices: titlesList.map(title => ({ value: title, label: title })),
            items: relatesTo ? relatesTo.split(', ').map(rel => ({ value: rel, label: rel })) : []
        });

        const dependsOnChoices = new Choices(dependsOnInput, {
            searchEnabled: true,
            shouldSort: false,
            choices: titlesList.map(title => ({ value: title, label: title })),
            items: dependsOn ? dependsOn.split(', ').map(dep => ({ value: dep, label: dep })) : []
        });

        form.querySelector('.save-note-button').addEventListener('click', () => saveNote(note, form, tagsChoices, relatesToChoices, dependsOnChoices));
        form.querySelector('.edit-note-button').addEventListener('click', () => editNoteForm(form, tagsChoices, relatesToChoices, dependsOnChoices));
        form.querySelector('.delete-note-button').addEventListener('click', () => deleteNoteElement(note));

        note.innerHTML = '';
        note.appendChild(form);
        note.style.display = 'block';
    }

    function editNoteForm(form, tagsChoices, relatesToChoices, dependsOnChoices) {
        console.log("Editing note...");
        const inputs = form.querySelectorAll('.note-title, .note-content, .note-tags, .note-relates-to, .note-depends-on');
        inputs.forEach(input => input.removeAttribute('readonly'));
        tagsChoices.setChoices(tagsList.map(tag => ({ value: tag, label: tag })), 'value', 'label', true);
        relatesToChoices.setChoices(titlesList.map(title => ({ value: title, label: title })), 'value', 'label', true);
        dependsOnChoices.setChoices(titlesList.map(title => ({ value: title, label: title })), 'value', 'label', true);
        form.querySelector('.save-note-button').style.display = 'inline-block';
        form.querySelector('.edit-note-button').style.display = 'none';
    }

    function saveNote(note, form, tagsChoices, relatesToChoices, dependsOnChoices) {
        console.log("Saving note...");
        const title = form.querySelector('.note-title').value.trim();
        const content = form.querySelector('.note-content').value.trim();
        const tags = tagsChoices.getValue(true).join(', ') || '';
        const relatesTo = relatesToChoices.getValue(true).join(', ');
        const dependsOn = dependsOnChoices.getValue(true).join(', ');
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

        const inputs = form.querySelectorAll('.note-title, .note-content, .note-tags, .note-relates-to, .note-depends-on');
        inputs.forEach(input => input.setAttribute('readonly', true));
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
                jsonData.forEach(data => {
                    console.log("Importing note:", data);
                    const note = document.createElement('div');
                    note.classList.add('note');
                    note.dataset.id = data.id;
                    note.dataset.title = data.title;
                    note.dataset.tags = data.tags || '';
                    note.dataset.relatesTo = data.relatesTo || '';
                    note.dataset.dependsOn = data.dependsOn || '';
                    note.dataset.created = data.created || '';
                    note.dataset.modified = data.modified || '';
                    note.dataset.content = data.content || '';

                    notesContainer.appendChild(note);
                    // Initialize Choices.js after appending note to DOM
                    populateForm(note, data);
                });
                updateLists();
            };
            reader.readAsText(file);
        }
    }

    initializeEvents();
});