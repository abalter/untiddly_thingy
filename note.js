// note.js

// Function to populate the note form with the provided data
function populateNoteForm(note, data) {
    const form = document.getElementById('note-template').content.cloneNode(true);
    
    const titleInput = form.querySelector('.note-title');
    const contentInput = form.querySelector('.note-content');
    const tagsInput = form.querySelector('.note-tags');
    const relatesToInput = form.querySelector('.note-relates-to');
    const dependsOnInput = form.querySelector('.note-depends-on');

    titleInput.value = data.title || '';
    contentInput.value = data.content || '';
    tagsInput.value = data.tags || '';
    relatesToInput.value = data.relatesTo || '';
    dependsOnInput.value = data.dependsOn || '';

    form.querySelector('.save-note-button').addEventListener('click', () => saveNoteData(note, form));

    note.innerHTML = ''; // Clear the note before inserting the form
    note.appendChild(form);
    note.style.display = 'block';
}

// Function to save the note data
function saveNoteData(note, form) {
    const title = form.querySelector('.note-title').value.trim();
    const content = form.querySelector('.note-content').value.trim();
    const tags = form.querySelector('.note-tags').value.trim();
    const relatesTo = form.querySelector('.note-relates-to').value.trim();
    const dependsOn = form.querySelector('.note-depends-on').value.trim();

    // Validate title uniqueness
    if (titlesList.includes(title) && note.dataset.id !== title.toLowerCase().replace(/\s/g, '-')) {
        alert('Title must be unique!');
        return;
    }

    if (relatesTo && !titlesList.includes(relatesTo)) {
        alert(`Relates_To must match an existing title. '${relatesTo}' does not exist.`);
        return;
    }

    if (dependsOn && !titlesList.includes(dependsOn)) {
        alert(`Depends_On must match an existing title. '${dependsOn}' does not exist.`);
        return;
    }

    // Update the note's data attributes
    note.dataset.id = title.toLowerCase().replace(/\s/g, '-');
    note.dataset.title = title;
    note.dataset.tags = tags;
    note.dataset.relatesTo = relatesTo;
    note.dataset.dependsOn = dependsOn;
    note.dataset.modified = new Date().toISOString();
    note.dataset.content = content;

    // Repopulate the form with updated data
    populateNoteForm(note, { title, content, tags, relatesTo, dependsOn });
    updateLists();
}

// Function to create a new note
function createNewNote() {
    const note = document.createElement('div');
    note.classList.add('note');
    notesContainer.insertBefore(note, notesContainer.firstChild);

    populateNoteForm(note, {}); // Populate with empty form for new note
    updateLists();
}

// Function to setup the events for note buttons
function setupNoteEvents(note) {
    const editButton = note.querySelector('.edit-note-button');
    const deleteButton = note.querySelector('.delete-note-button');

    // Add event listener for edit button
    editButton.addEventListener('click', () => {
        populateNoteForm(note, {
            title: note.dataset.title,
            content: note.dataset.content,
            tags: note.dataset.tags,
            relatesTo: note.dataset.relatesTo,
            dependsOn: note.dataset.dependsOn
        });
    });

    // Add event listener for delete button
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
            note.remove();
        }
    });
}
