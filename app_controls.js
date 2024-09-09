// app_controls.js

function initializeApp() {
    // Initialize event listeners
    setupSearch();
    setupSorting();
    setupNewNoteButton();
    setupSaveButton();
    setupClearButton();

    // Initialize notes
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

function updateNoteList() {
    // Use note.js to update the notes display
    updateNotesDisplay();
}

// app_controls.js

function sortNotes() {
    const field = document.getElementById('sort-field').value;
    const notes = Array.from(document.querySelectorAll('.note'));

    const sortedNotes = notes.sort((a, b) => {
        if (field === 'title') {
            return a.dataset.title.localeCompare(b.dataset.title);
        } else if (field === 'created') {
            return new Date(a.dataset.created) - new Date(b.dataset.created);
        } else if (field === 'modified') {
            return new Date(a.dataset.modified) - new Date(b.dataset.modified);
        }
    });

    sortedNotes.forEach(note => document.getElementById('notes-container').appendChild(note));
}

// app_controls.js

function saveAllNotes() {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// app_controls.js

function clearSearchResults() {
    // Clear the search input field
    document.getElementById('search-term').value = '';

    // Show all notes again (clear any filters applied by the search)
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.display = 'block'; // Display all notes again
    });
}

function searchNotes() {
    const searchTerm = document.getElementById('search-term').value.toLowerCase();
    const notes = document.querySelectorAll('.note');

    notes.forEach(note => {
        const title = note.dataset.title.toLowerCase();
        const content = note.dataset.content.toLowerCase();
        const tags = note.dataset.tags.toLowerCase();
        const relatesTo = note.dataset.relatesTo.toLowerCase();
        const dependsOn = note.dataset.dependsOn.toLowerCase();

        if (title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm) || relatesTo.includes(searchTerm) || dependsOn.includes(searchTerm)) {
            note.style.display = 'block'; // Show the note
            populateForm(note, {
                title: note.dataset.title,
                content: note.dataset.content,
                tags: note.dataset.tags,
                relatesTo: note.dataset.relatesTo,
                dependsOn: note.dataset.dependsOn
            });
        } else {
            note.style.display = 'none'; // Hide the note
        }
    });
}

function updateAutocomplete() {
    const tagsList = [...new Set([...document.querySelectorAll('.note')].flatMap(note => note.dataset.tags.split(',').map(tag => tag.trim())))];
    const titlesList = [...document.querySelectorAll('.note')].map(note => note.dataset.title);

    const tagsDatalist = document.getElementById('tags-datalist');
    tagsDatalist.innerHTML = '';
    tagsList.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        tagsDatalist.appendChild(option);
    });

    const titlesDatalist = document.getElementById('titles-datalist');
    titlesDatalist.innerHTML = '';
    titlesList.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        titlesDatalist.appendChild(option);
    });
}