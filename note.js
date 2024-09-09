// note.js

function createNewNote() {
    const template = document.querySelector('#note-template');
    const newNote = template.content.cloneNode(true);

    // Append new note to container
    document.querySelector('#notes-container').prepend(newNote);

    // Additional logic for new notes (e.g., setting up event listeners)
    setupNoteEvents();
}

function saveNote(noteElement) {
    // Logic for saving individual notes
    const title = noteElement.querySelector('.note-title').value;
    const content = noteElement.querySelector('.note-content').value;
    // Update the dataset attributes
    noteElement.dataset.title = title;
    noteElement.dataset.content = content;

    // Handle saving or updating logic
}

function updateNotesDisplay() {
    // Logic to update and refresh notes based on search or sorting
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        // Perform any necessary updates to each note
    });
}

function setupNoteEvents() {
    const saveButtons = document.querySelectorAll('.save-note-button');
    saveButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const noteElement = event.target.closest('.note'); // Closest note element
            if (noteElement) {
                saveNote(noteElement);
            } else {
                console.error('Error: noteElement is null');
            }
        });
    });
}

function saveNote(noteElement) {
    const title = noteElement.querySelector('.note-title').value.trim();
    const content = noteElement.querySelector('.note-content').value.trim();
    const tags = noteElement.querySelector('.note-tags').value.trim();
    const relatesTo = noteElement.querySelector('.note-relates-to').value.trim();
    const dependsOn = noteElement.querySelector('.note-depends-on').value.trim();

    // Check if the note already exists
    if (!noteElement) {
        console.error('Error: Note element not found.');
        return;
    }

    // Update dataset attributes
    noteElement.dataset.title = title;
    noteElement.dataset.content = content;
    noteElement.dataset.tags = tags;
    noteElement.dataset.relatesTo = relatesTo;
    noteElement.dataset.dependsOn = dependsOn;
    noteElement.dataset.modified = new Date().toISOString();

    // Update autocomplete lists
    updateAutocomplete();

    // Re-populate the form with updated data
    populateForm(noteElement, { title, content, tags, relatesTo, dependsOn });
}

function populateForm(note, data = {}) {
    const form = document.querySelector('#note-template').content.cloneNode(true);

    const titleInput = form.querySelector('.note-title');
    const contentInput = form.querySelector('.note-content');
    const tagsInput = form.querySelector('.note-tags');
    const relatesToInput = form.querySelector('.note-relates-to');
    const dependsOnInput = form.querySelector('.note-depends-on');

    titleInput.value = data.title || note.dataset.title || '';
    contentInput.value = data.content || note.dataset.content || '';
    tagsInput.value = data.tags || note.dataset.tags || '';
    relatesToInput.value = data.relatesTo || note.dataset.relatesTo || '';
    dependsOnInput.value = data.dependsOn || note.dataset.dependsOn || '';

    note.innerHTML = ''; // Clear the current content of the note div
    note.appendChild(form);
}