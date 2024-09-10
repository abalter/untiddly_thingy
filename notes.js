// Global lists for tags and titles
let tagsList = [];
let titlesList = [];

// Function to collect all titles and tags from notes in the DOM
function collectAllTitlesAndTags() {
    tagsList = [];
    titlesList = [];

    // Get all notes in the DOM
    const notes = document.querySelectorAll('.note');

    // Iterate over each note and update the global lists
    notes.forEach(note => {
        const title = note.querySelector('.note-title').value;
        const tags = Array.from(note.querySelector('.note-tags').selectedOptions).map(option => option.value);

        // Add to titlesList if not already present
        if (!titlesList.includes(title)) {
            titlesList.push(title);
        }

        // Add tags to tagsList if not already present
        tags.forEach(tag => {
            if (!tagsList.includes(tag)) {
                tagsList.push(tag);
            }
        });
    });

    console.log("Collected Tags:", tagsList);
    console.log("Collected Titles:", titlesList);
}

// Function to add a note to the DOM and set event listeners
function addNote(noteData) {
    const template = document.getElementById('note-template');
    
    if (!template) {
        console.error("Note template not found!");
        return;
    }

    const newNote = template.content.cloneNode(true); // Clone the template content
    const noteDiv = newNote.querySelector('.note-form'); // Get the form inside the template
    const titleInput = newNote.querySelector('.note-title');
    const contentTextarea = newNote.querySelector('.note-content');
    const tagsSelect = newNote.querySelector('.note-tags');
    const relatesToSelect = newNote.querySelector('.note-relates-to');
    const dependsOnSelect = newNote.querySelector('.note-depends-on');

    // Set initial values from noteData
    titleInput.value = noteData.title;
    contentTextarea.value = noteData.content;

    // Populate tags, relates-to, and depends-on fields
    const tagsChoices = new Choices(tagsSelect, { removeItemButton: true, items: noteData.tags });
    const relatesToChoices = new Choices(relatesToSelect, { items: noteData.relatesTo ? [noteData.relatesTo] : [] });
    const dependsOnChoices = new Choices(dependsOnSelect, { items: noteData.dependsOn ? [noteData.dependsOn] : [] });

    // Ensure the created and modified date elements are present and updated
    const createdDateElement = newNote.querySelector('.created-date');
    const modifiedDateElement = newNote.querySelector('.modified-date');

    if (createdDateElement) {
        createdDateElement.textContent = `Created: ${new Date(noteData.created).toLocaleString()}`;
    } else {
        console.error("Created date element not found in template.");
    }

    if (modifiedDateElement) {
        modifiedDateElement.textContent = `Modified: ${new Date(noteData.modified).toLocaleString()}`;
    } else {
        console.error("Modified date element not found in template.");
    }

    // Append the new note to the notes display section
    const notesDisplay = document.getElementById('notes-display');
    if (notesDisplay) {
        notesDisplay.appendChild(newNote);
    } else {
        console.error("Notes display container not found!");
    }

    // Add note events for editing and deleting
    addNoteEvents(newNote);
}

// Function to handle editing and saving a note
function addNoteEvents(noteDiv) {
    const form = noteDiv.querySelector('.note-form');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    noteDiv.appendChild(editButton);

    const saveButton = form.querySelector('.save-note-button');

    // Add event listener for edit mode
    editButton.addEventListener('click', () => {
        form.querySelector('.note-title').readOnly = false;
        form.querySelector('.note-content').readOnly = false;
        form.querySelector('.note-tags').disabled = false;
        form.querySelector('.note-relates-to').disabled = false;
        form.querySelector('.note-depends-on').disabled = false;
        saveButton.style.display = 'inline';
        editButton.style.display = 'none';
    });

    // Add event listener to save the note when the save button is clicked
    saveButton.addEventListener('click', () => {
        const title = form.querySelector('.note-title').value;
        const content = form.querySelector('.note-content').value;
        const tags = form.querySelector('.note-tags').value;

        // Update data attributes with new values from the form
        noteDiv.setAttribute('data-title', title);
        noteDiv.setAttribute('data-content', content);
        noteDiv.setAttribute('data-tags', tags);
        noteDiv.setAttribute('data-modified', new Date().toISOString()); // Update modified date

        // Update the modified date display in the form
        const modifiedDateElement = form.querySelector('.modified-date');
        if (modifiedDateElement) {
            modifiedDateElement.textContent = `Modified: ${new Date(noteDiv.getAttribute('data-modified')).toLocaleString()}`;
        } else {
            console.error("Modified date element not found when saving.");
        }

        // After saving the note, update global lists
        collectAllTitlesAndTags();

        // Return to non-editable state
        form.querySelector('.note-title').readOnly = true;
        form.querySelector('.note-content').readOnly = true;
        form.querySelector('.note-tags').disabled = true;
        form.querySelector('.note-relates-to').disabled = true;
        form.querySelector('.note-depends-on').disabled = true;
        saveButton.style.display = 'none';
        editButton.style.display = 'inline';
    });

    // Add delete button and its logic
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    noteDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
            noteDiv.remove();
            // After deleting the note, update global lists
            collectAllTitlesAndTags();
        }
    });
}
