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
        const title = note.getAttribute('data-title');
        const tags = note.getAttribute('data-tags').split(', ').filter(tag => tag);

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

    // Log the collected tags and titles for debugging
    console.log("Collected Tags:", tagsList);
    console.log("Collected Titles:", titlesList);
}


// Function to create a note div with the necessary attributes and add it to the DOM
function addNote(noteData) {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');
    
    // Set data attributes based on noteData
    noteDiv.setAttribute('data-id', noteData.id || noteData.title.toLowerCase().replace(/\s+/g, '-'));
    noteDiv.setAttribute('data-title', noteData.title);
    noteDiv.setAttribute('data-tags', noteData.tags.join(', '));
    noteDiv.setAttribute('data-relates-to', noteData.relatesTo || '');
    noteDiv.setAttribute('data-depends-on', noteData.dependsOn || '');
    noteDiv.setAttribute('data-content', noteData.content);
    noteDiv.setAttribute('data-created', noteData.created || new Date().toISOString());
    noteDiv.setAttribute('data-modified', noteData.modified || new Date().toISOString());

    // Populate the form inside the note
    populateNoteForm(noteDiv);

    // Add the note div to the DOM
    document.getElementById('notes-display').appendChild(noteDiv);

    // Add event listeners for editing and saving the note
    addNoteEvents(noteDiv);
}

// Function to populate the note form with values from the data attributes and initialize Choices.js
// Function to populate the note form with values from the data attributes and initialize Choices.js
// Function to populate the note form with values from the data attributes and initialize Choices.js
function populateNoteForm(noteDiv) {
    const template = document.getElementById('note-template').content.cloneNode(true);
    const form = template.querySelector('.note-form');

    // Populate form fields with values from data attributes
    form.querySelector('.note-title').value = noteDiv.getAttribute('data-title');
    form.querySelector('.note-content').value = noteDiv.getAttribute('data-content');

    // Get the tags, relates-to, and depends-on values from the noteDiv
    const tags = noteDiv.getAttribute('data-tags').split(', ').filter(tag => tag);
    const relatesTo = noteDiv.getAttribute('data-relates-to');
    const dependsOn = noteDiv.getAttribute('data-depends-on');

    // Remove any previous Choices.js instances
    if (form.querySelector('.choices')) {
        form.querySelectorAll('.choices').forEach(el => el.remove());
    }

    // Initialize or update Choices.js for Tags
    const tagsElement = form.querySelector('.note-tags');
    const tagsChoices = new Choices(tagsElement, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
        items: tags, // Prepopulate with existing tags
        choices: tagsList.map(tag => ({ value: tag, label: tag }))
    });
    console.log("Initialized Choices.js for Tags:", tagsList);

    // Initialize or update Choices.js for Relates-To
    const relatesToElement = form.querySelector('.note-relates-to');
    const relatesToChoices = new Choices(relatesToElement, {
        searchEnabled: true,
        shouldSort: false,
        choices: titlesList.map(title => ({ value: title, label: title })),
        items: relatesTo ? [relatesTo] : []
    });
    console.log("Initialized Choices.js for Relates-To:", titlesList);

    // Initialize or update Choices.js for Depends-On
    const dependsOnElement = form.querySelector('.note-depends-on');
    const dependsOnChoices = new Choices(dependsOnElement, {
        searchEnabled: true,
        shouldSort: false,
        choices: titlesList.map(title => ({ value: title, label: title })),
        items: dependsOn ? [dependsOn] : []
    });
    console.log("Initialized Choices.js for Depends-On:", titlesList);

    // Add created and modified date fields (display only, not editable)
    const createdDate = document.createElement('p');
    createdDate.textContent = `Created: ${new Date(noteDiv.getAttribute('data-created')).toLocaleString()}`;
    form.appendChild(createdDate);

    const modifiedDate = document.createElement('p');
    modifiedDate.textContent = `Modified: ${new Date(noteDiv.getAttribute('data-modified')).toLocaleString()}`;
    modifiedDate.classList.add('modified-date');
    form.appendChild(modifiedDate);

    // Append the form inside the note div
    noteDiv.appendChild(form);

    // Hide the save button by default and set non-editable state
    form.querySelector('.save-note-button').style.display = 'none';
    form.querySelector('.note-title').readOnly = true;
    form.querySelector('.note-content').readOnly = true;
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
        form.querySelector('.note-tags').readOnly = false;
        form.querySelector('.note-relates-to').readOnly = false;
        form.querySelector('.note-depends-on').readOnly = false;
        saveButton.style.display = 'inline';
        editButton.style.display = 'none';
    });

    // Add event listener to save the note when the save button is clicked
    saveButton.addEventListener('click', () => {
        const title = form.querySelector('.note-title').value;
        const content = form.querySelector('.note-content').value;
        const tags = form.querySelector('.note-tags').value;
        const relatesTo = form.querySelector('.note-relates-to').value;
        const dependsOn = form.querySelector('.note-depends-on').value;

        // Update data attributes with new values from the form
        noteDiv.setAttribute('data-title', title);
        noteDiv.setAttribute('data-content', content);
        noteDiv.setAttribute('data-tags', tags);
        noteDiv.setAttribute('data-relates-to', relatesTo);
        noteDiv.setAttribute('data-depends-on', dependsOn);
        noteDiv.setAttribute('data-modified', new Date().toISOString()); // Update modified date

        // Update the modified date display in the form
        const modifiedDate = form.querySelector('.modified-date');
        if (modifiedDate) {
            modifiedDate.textContent = `Modified: ${new Date(noteDiv.getAttribute('data-modified')).toLocaleString()}`;
        }

        // After saving the note, update global lists
        collectAllTitlesAndTags();

        // Return to non-editable state
        form.querySelector('.note-title').readOnly = true;
        form.querySelector('.note-content').readOnly = true;
        form.querySelector('.note-tags').readOnly = true;
        form.querySelector('.note-relates-to').readOnly = true;
        form.querySelector('.note-depends-on').readOnly = true;
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
