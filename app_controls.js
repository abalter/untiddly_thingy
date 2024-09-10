// app_controls.js

function initializeApp() {
    setupSearch();
    setupSorting();
    setupNewNoteButton();
    setupSaveButton();
    setupClearButton();
    updateNoteList();
}

function setupSearch() {
    document.getElementById('search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        searchNotes();
    });
}

function setupSorting() {
    document.getElementById('sort-button').addEventListener('click', sortNotes);
}

function setupNewNoteButton() {
    document.getElementById('new-note-button').addEventListener('click', createNewNote);
}

function setupSaveButton() {
    document.getElementById('save-button').addEventListener('click', saveAllNotes);
}

function setupClearButton() {
    document.getElementById('clear-button').addEventListener('click', clearSearchResults);
}

function searchNotes() {
    const searchTerm = document.getElementById('search-term').value.toLowerCase();
    const notes = document.querySelectorAll('.note');

    notes.forEach(note => {
        const tags = note.dataset.tags.toLowerCase();
        const title = note.dataset.title.toLowerCase();
        const relatesTo = note.dataset.relatesTo.toLowerCase();
        const dependsOn = note.dataset.dependsOn.toLowerCase();
        const content = note.dataset.content.toLowerCase();

        if (tags.includes(searchTerm) || title.includes(searchTerm) || relatesTo.includes(searchTerm) || dependsOn.includes(searchTerm) || content.includes(searchTerm)) {
            populateForm(note, {
                title: note.dataset.title,
                content: note.dataset.content,
                tags: note.dataset.tags,
                relatesTo: note.dataset.relatesTo,
                dependsOn: note.dataset.dependsOn
            });
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
}


function updateNoteList() {
    updateAutocomplete();
}
