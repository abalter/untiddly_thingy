document.addEventListener('DOMContentLoaded', function () {
    let notes = [];
    let tagsList = []; // List of tags will be dynamically populated
    let notesList = []; // List of note titles for relates-to and depends-on

    // Function to add a note to the DOM and initialize autocomplete
    function addNote(noteData) {
        const template = document.getElementById('note-template');
        const newNote = template.content.cloneNode(true);
        const noteDiv = newNote.querySelector('.note');
        const titleInput = newNote.querySelector('.note-title');
        const contentTextarea = newNote.querySelector('.note-content');
        const tagsInput = newNote.querySelector('.note-tags-input');
        const relatesToInput = newNote.querySelector('.note-relates-to-input');
        const dependsOnInput = newNote.querySelector('.note-depends-on-input');
        const editButton = newNote.querySelector('.edit-note');
        const saveButton = newNote.querySelector('.save-note');
        const deleteButton = newNote.querySelector('.delete-note');

        // Set initial values from noteData
        titleInput.value = noteData.title;
        contentTextarea.value = noteData.content;
        tagsInput.value = noteData.tags.join(', ');
        relatesToInput.value = noteData.relatesTo;
        dependsOnInput.value = noteData.dependsOn;

        // Ensure fields are editable for autocomplete to work
        tagsInput.readOnly = false;
        relatesToInput.readOnly = false;
        dependsOnInput.readOnly = false;

        // Add the new note to the DOM
        document.getElementById('notes-display').appendChild(newNote);

        // Initialize Awesomplete for the new note's inputs
        new Awesomplete(tagsInput, { list: tagsList });
        new Awesomplete(relatesToInput, { list: notesList });
        new Awesomplete(dependsOnInput, { list: notesList });

        // Add event listeners for Edit, Save, and Delete functionality
        editButton.addEventListener('click', () => {
            titleInput.readOnly = false;
            contentTextarea.readOnly = false;
            tagsInput.readOnly = false;
            relatesToInput.readOnly = false;
            dependsOnInput.readOnly = false;
            saveButton.style.display = 'inline';
            editButton.style.display = 'none';
        });

        saveButton.addEventListener('click', () => {
            titleInput.readOnly = true;
            contentTextarea.readOnly = true;
            tagsInput.readOnly = true;
            relatesToInput.readOnly = true;
            dependsOnInput.readOnly = true;
            saveButton.style.display = 'none';
            editButton.style.display = 'inline';

            // Update the note data
            noteData.title = titleInput.value;
            noteData.content = contentTextarea.value;
            noteData.tags = tagsInput.value.split(',').map(tag => tag.trim());
            noteData.relatesTo = relatesToInput.value;
            noteData.dependsOn = dependsOnInput.value;
        });

        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this note?')) {
                noteDiv.remove();
                notes = notes.filter(n => n !== noteData);
            }
        });

        // Save note to the global notes array
        notes.push(noteData);
    }

    // Search functionality to filter notes
    function searchNotes(query, field) {
        const noteElements = document.querySelectorAll('.note');
        noteElements.forEach(noteEl => {
            const title = noteEl.querySelector('.note-title').value.toLowerCase();
            const content = noteEl.querySelector('.note-content').value.toLowerCase();
            const tags = noteEl.querySelector('.note-tags-input').value.toLowerCase();
            const relatesTo = noteEl.querySelector('.note-relates-to-input').value.toLowerCase();
            const dependsOn = noteEl.querySelector('.note-depends-on-input').value.toLowerCase();

            let match = false;

            if (field === 'global') {
                match = title.includes(query) || content.includes(query) || tags.includes(query) || relatesTo.includes(query) || dependsOn.includes(query);
            } else if (field === 'title') {
                match = title.includes(query);
            } else if (field === 'content') {
                match = content.includes(query);
            } else if (field === 'tags') {
                match = tags.includes(query);
            } else if (field === 'relates-to') {
                match = relatesTo.includes(query);
            } else if (field === 'depends-on') {
                match = dependsOn.includes(query);
            }

            noteEl.style.display = match ? '' : 'none';
        });
    }

    // Function to initialize Awesomplete for autocomplete fields
    function initializeAutocomplete() {
        document.querySelectorAll('.note-tags-input').forEach(input => {
            new Awesomplete(input, { list: tagsList });
        });

        document.querySelectorAll('.note-relates-to-input').forEach(input => {
            new Awesomplete(input, { list: notesList });
        });

        document.querySelectorAll('.note-depends-on-input').forEach(input => {
            new Awesomplete(input, { list: notesList });
        });
    }

    // Event listener for creating a new note
    document.getElementById('new-note').addEventListener('click', function () {
        const newNoteData = {
            title: 'New Note',
            content: '',
            tags: [],
            relatesTo: '',
            dependsOn: ''
        };

        addNote(newNoteData);
    });

    // Event listener for search functionality
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value.toLowerCase();
        const field = document.getElementById('search-type').value;
        searchNotes(query, field);
    });

    // Import notes from JSON file
    document.getElementById('import-notes').addEventListener('click', function () {
        const fileInput = document.getElementById('import-file');
        fileInput.click();

        fileInput.addEventListener('change', function () {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const importedNotes = JSON.parse(e.target.result);
                importedNotes.forEach(noteData => {
                    addNote(noteData);

                    // Add to tags and notes lists for autocomplete
                    noteData.tags.forEach(tag => {
                        if (!tagsList.includes(tag)) tagsList.push(tag);
                    });

                    if (!notesList.includes(noteData.title)) notesList.push(noteData.title);
                });
            };
            reader.readAsText(file);
        });
    });

    // Export notes to JSON file
    document.getElementById('global-save').addEventListener('click', function () {
        const jsonNotes = JSON.stringify(notes);
        const blob = new Blob([jsonNotes], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'notes.json';
        link.click();
    });

    // Initialize Awesomplete on page load for existing notes
    initializeAutocomplete();
});
