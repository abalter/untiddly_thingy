document.addEventListener("DOMContentLoaded", () => {
    const notesContainer = document.getElementById('notes-container');
    const newNoteButton = document.getElementById('new-note-button');
    const searchForm = document.getElementById('search-form');
    const clearButton = document.getElementById('clear-button');
    const saveButton = document.getElementById('save-button');
    const importNotesInput = document.getElementById('import-notes');
    const noteTemplateContent = document.getElementById('note-template')?.content;

    if (!noteTemplateContent) {
        console.error('Note template content not found. Please check your HTML.');
        return;
    }

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

    function loadExistingNotes() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            console.log("Loading existing note:", note);
            note.style.display = 'none';
        });
        updateLists();
    }

    function updateLists() {
        const notes = document.querySelectorAll('.note');

        tagsList = [...new Set([...notes].flatMap(note => 
            note.dataset.tags ? note.dataset.tags.split(',').map(tag => tag.trim()) : []))];
        titlesList = [...new Set([...notes].map(note => note.dataset.title).filter(title => title !== ''))];

        console.log("Updated Tags List:", tagsList);
        console.log("Updated Titles List:", titlesList);

        notes.forEach(note => {
            const form = note.querySelector('.note-form');
            if (form) {
                const tagsInput = form.querySelector('.note-tags');
                const relatesToInput = form.querySelector('.note-relates-to');
                const dependsOnInput = form.querySelector('.note-depends-on');

                if (tagsInput.tagify) tagsInput.tagify.settings.whitelist = tagsList;
                if (relatesToInput.tagify) relatesToInput.tagify.settings.whitelist = titlesList;
                if (dependsOnInput.tagify) dependsOnInput.tagify.settings.whitelist = titlesList;
            }
        });
    }

    function createNoteElement() {
        console.log("Creating new note...");
        const note = document.createElement('div');
        note.classList.add('note');
        note.dataset.id = 'new-note-' + Date.now();
        note.dataset.title = '';
        note.dataset.content = '';
        note.dataset.tags = '';
        note.dataset.relatesTo = '';
        note.dataset.dependsOn = '';
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

        titleInput.value = data.title || note.dataset.title || '';
        contentInput.value = data.content || note.dataset.content || '';

        const initializeTagify = () => {
            const initOrUpdateTagify = (input, whitelist, existingData) => {
                const config = {
                    whitelist: whitelist || [],
                    enforceWhitelist: false,
                    dropdown: {
                        position: 'input',
                        enabled: 0,
                        maxItems: 10
                    },
                    originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(', ')
                };

                if (input.tagify) {
                    input.tagify.destroy();
                }

                input.tagify = new Tagify(input, config);

                if (existingData && existingData.length > 0) {
                    input.tagify.addTags(existingData);
                }
            };

            const safelyGetTags = (tagString) => {
                return tagString ? tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
            };

            initOrUpdateTagify(tagsInput, tagsList, safelyGetTags(data.tags || note.dataset.tags));
            initOrUpdateTagify(relatesToInput, titlesList, safelyGetTags(data.relatesTo || note.dataset.relatesTo));
            initOrUpdateTagify(dependsOnInput, titlesList, safelyGetTags(data.dependsOn || note.dataset.dependsOn));
        };

        initializeTagify();

        form.querySelector('.save-note-button').addEventListener('click', () => {
            if (validateForm(form)) {
                saveNote(note, form);
                toggleFormEditable(form, false);
            }
        });

        form.querySelector('.edit-note-button').addEventListener('click', () => {
            toggleFormEditable(form, true);
            initializeTagify();
        });

        form.querySelector('.delete-note-button').addEventListener('click', () => {
            deleteNoteElement(note);
            updateLists();
        });

        toggleFormEditable(form, false);

        note.innerHTML = '';
        note.appendChild(form);
        note.style.display = 'block';
    }

    function toggleFormEditable(form, isEditable) {
        form.querySelector('.note-title').readOnly = !isEditable;
        form.querySelector('.note-content').readOnly = !isEditable;

        const saveButton = form.querySelector('.save-note-button');
        const editButton = form.querySelector('.edit-note-button');

        saveButton.style.display = isEditable ? 'inline' : 'none';
        editButton.style.display = isEditable ? 'none' : 'inline';
    }

    function validateForm(form) {
        const titleInput = form.querySelector('.note-title');
        const contentInput = form.querySelector('.note-content');

        return (titleInput.value.trim() !== '' && contentInput.value.trim() !== '');
    }

    function saveNote(note, form) {
        console.log("Saving note...");

        const titleInput = form.querySelector('.note-title');
        const contentInput = form.querySelector('.note-content');
        const tagsInput = form.querySelector('.note-tags');
        const relatesToInput = form.querySelector('.note-relates-to');
        const dependsOnInput = form.querySelector('.note-depends-on');

        if (!titleInput || !contentInput) {
            console.error("Title or content input not found. Check the template structure.");
            return;
        }

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title) {
            alert('Title cannot be empty!');
            return;
        }

        if (note.dataset.id.startsWith('new-note-')) {
            delete note.dataset.id;
        }
        note.dataset.id = title.toLowerCase().replace(/\s+/g, '-');
        note.dataset.title = title;
        note.dataset.content = content;

        note.dataset.tags = tagsInput.tagify ? tagsInput.tagify.value.map(tag => tag.value).join(', ') : '';
        note.dataset.relatesTo = relatesToInput.tagify ? relatesToInput.tagify.value.map(item => item.value).join(', ') : '';
        note.dataset.dependsOn = dependsOnInput.tagify ? dependsOnInput.tagify.value.map(item => item.value).join(', ') : '';

        note.dataset.modified = new Date().toISOString();
        form.querySelector('.modified-date').textContent = `Modified: ${note.dataset.modified}`;

        updateLists();
    }

    function deleteNoteElement(note) {
        if (confirm("Are you sure you want to delete this note?")) {
            note.remove();
            updateLists();
        }
    }

    function searchNotes() {
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

            note.style.display = match ? 'block' : 'none';
        });
    }

    function clearSearchResults() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            if (note.dataset.id && note.dataset.id.startsWith('new-note-')) {
                note.remove();
            } else {
                note.style.display = 'none';
            }
        });
        console.log("Cleared search results.");
        updateLists();
    }

    function saveAllNotes() {
        const notesData = Array.from(document.querySelectorAll('.note')).map(note => ({
            id: note.dataset.id,
            title: note.dataset.title,
            content: note.dataset.content,
            tags: note.dataset.tags,
            relatesTo: note.dataset.relatesTo,
            dependsOn: note.dataset.dependsOn,
            created: note.dataset.created,
            modified: note.dataset.modified
        }));

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
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            console.log("Imported notes data:", jsonData);
            jsonData.forEach(data => {
                const note = document.createElement('div');
                note.classList.add('note');
                note.dataset.id = data.id || '';
                note.dataset.title = data.title || '';
                note.dataset.content = data.content || '';
                note.dataset.tags = data.tags || '';
                note.dataset.relatesTo = data.relatesTo || '';
                note.dataset.dependsOn = data.dependsOn || '';
                note.dataset.created = data.created || '';
                note.dataset.modified = data.modified || '';

                notesContainer.appendChild(note);
                populateForm(note, data);
            });
            updateLists();
        }
        reader.readAsText(file);
    }

    initializeEvents();
});