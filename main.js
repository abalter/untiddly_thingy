document.addEventListener("DOMContentLoaded", () => {
    const notesContainer = document.getElementById('notes-container');
    let noteTemplateContent;

    let tagsList = [];
    let titlesList = [];

    // Load the note form template
    function loadNoteTemplate() {
        fetch('note-form-template.html')
            .then(response => response.text())
            .then(data => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data;
                noteTemplateContent = tempDiv.querySelector('template').content;
                loadSampleNotes(); // Load sample notes after the template is loaded
            })
            .catch(error => console.error('Error loading note template:', error));
    }

    // Load content from sample_notes.html
    function loadSampleNotes() {
        fetch('sample_notes.html')
            .then(response => response.text())
            .then(data => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data;
                const notes = tempDiv.querySelectorAll('.note');
                notes.forEach(note => notesContainer.appendChild(note));
                loadExistingNotes();
            })
            .catch(error => console.error('Error loading sample notes:', error));
    }

    // Load existing notes into the DOM, hidden by default
    function loadExistingNotes() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            note.style.display = 'none'; // Ensure notes are hidden initially
        });
        updateLists();
    }

    // Update the lists of tags and titles
    function updateLists() {
        tagsList = [...new Set([...document.querySelectorAll('.note')].flatMap(note => note.dataset.tags.split(', ').map(tag => tag.trim())))];
        titlesList = [...document.querySelectorAll('.note')].map(note => note.dataset.title);
        updateAutocomplete();
    }

    // Populate form from template
    window.populateForm = function(note, data = {}) {
        const form = noteTemplateContent.cloneNode(true).querySelector('.note-form');

        const titleInput = form.querySelector('.note-title');
        const contentInput = form.querySelector('.note-content');
        const tagsInput = form.querySelector('.note-tags');
        const relatesToInput = form.querySelector('.note-relates-to');
        const dependsOnInput = form.querySelector('.note-depends-on');

        titleInput.value = data.title || '';
        contentInput.value = data.content || '';
        addTags(tagsInput, data.tags ? data.tags.split(', ') : []);
        relatesToInput.value = data.relatesTo || '';
        dependsOnInput.value = data.dependsOn || '';

        form.querySelector('.save-note-button').addEventListener('click', () => saveNote(note, form));

        note.innerHTML = ''; // Clear the note before inserting the form
        note.appendChild(form);
        note.style.display = 'block';
    };

    // Update the autocomplete suggestions
    function updateAutocomplete() {
        tagsDatalist.innerHTML = '';
        tagsList.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            tagsDatalist.appendChild(option);
        });

        titlesDatalist.innerHTML = '';
        titlesList.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            titlesDatalist.appendChild(option);
        });
    }

    // Call the function to load the note template
    loadNoteTemplate();
});