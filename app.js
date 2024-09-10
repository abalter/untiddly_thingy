// Assume notesState is an array holding all the notes
let notesState = [];

// Collect and update titles and tags for autocomplete
function collectAndUpdateTitlesAndTags() {
    const allTitles = notesState.map(note => note.title);
    const allTags = [...new Set(notesState.flatMap(note => Array.isArray(note.tags) ? note.tags : []))]; // Unique tags
    console.log("Collected Tags: ", allTags);
    console.log("Collected Titles: ", allTitles);
}

function renderNotes() {
    const notesDisplay = document.getElementById('notes-display');
    notesDisplay.innerHTML = ''; // Clear existing notes

    // Collect all existing titles and tags for autocomplete
    const allTitles = notesState.map(note => note.title);
    const allTags = [...new Set(notesState.flatMap(note => Array.isArray(note.tags) ? note.tags : []))]; // Unique tags

    notesState.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');

        const noteForm = document.createElement('form');
        noteForm.classList.add('note-form');

        // Title
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Title:';
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.classList.add('note-title');
        titleInput.value = note.title;
        titleInput.readOnly = true; // Initially disabled

        // Content
        const contentLabel = document.createElement('label');
        contentLabel.textContent = 'Content:';
        const contentTextarea = document.createElement('textarea');
        contentTextarea.classList.add('note-content');
        contentTextarea.value = note.content;
        contentTextarea.readOnly = true; // Initially disabled

        // Tags (Tagify)
        const tagsLabel = document.createElement('label');
        tagsLabel.textContent = 'Tags:';
        const tagsInput = document.createElement('input');
        tagsInput.type = 'text';
        tagsInput.classList.add('note-tags');
        tagsInput.value = note.tags.join(','); // Join tags with commas
        tagsInput.disabled = true; // Initially disabled

        // Relates To (Tagify)
        const relatesToLabel = document.createElement('label');
        relatesToLabel.textContent = 'Relates To:';
        const relatesToInput = document.createElement('input');
        relatesToInput.type = 'text';
        relatesToInput.classList.add('note-relates-to');
        const relatesToItems = Array.isArray(note.relatesTo) ? note.relatesTo : [];
        relatesToInput.value = relatesToItems.join(',');
        relatesToInput.disabled = true; // Initially disabled

        // Depends On (Tagify)
        const dependsOnLabel = document.createElement('label');
        dependsOnLabel.textContent = 'Depends On:';
        const dependsOnInput = document.createElement('input');
        dependsOnInput.type = 'text';
        dependsOnInput.classList.add('note-depends-on');
        const dependsOnItems = Array.isArray(note.dependsOn) ? note.dependsOn : [];
        dependsOnInput.value = dependsOnItems.join(',');
        dependsOnInput.disabled = true; // Initially disabled

        // Dates
        const createdDate = document.createElement('p');
        createdDate.textContent = `Created: ${new Date(note.created).toLocaleString()}`;
        const modifiedDate = document.createElement('p');
        modifiedDate.textContent = `Modified: ${new Date(note.modified).toLocaleString()}`;

        // Edit and Save Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';

        // Append elements to the form and div
        noteForm.appendChild(titleLabel);
        noteForm.appendChild(titleInput);
        noteForm.appendChild(contentLabel);
        noteForm.appendChild(contentTextarea);
        noteForm.appendChild(tagsLabel);
        noteForm.appendChild(tagsInput);
        noteForm.appendChild(relatesToLabel);
        noteForm.appendChild(relatesToInput);
        noteForm.appendChild(dependsOnLabel);
        noteForm.appendChild(dependsOnInput);
        noteForm.appendChild(createdDate);
        noteForm.appendChild(modifiedDate);
        noteForm.appendChild(editButton);
        noteDiv.appendChild(noteForm);
        notesDisplay.appendChild(noteDiv); // Append the note div before initializing Tagify

        // Initialize Tagify after the elements are appended to the DOM
        const tagifyTags = new Tagify(tagsInput, {
            whitelist: allTags,
            dropdown: {
                maxItems: 10,
                enabled: 0, // Show all options on focus
            }
        });

        const tagifyRelatesTo = new Tagify(relatesToInput, {
            whitelist: allTitles,
            dropdown: {
                maxItems: 10,
                enabled: 0, // Show all options on focus
            }
        });

        const tagifyDependsOn = new Tagify(dependsOnInput, {
            whitelist: allTitles,
            dropdown: {
                maxItems: 10,
                enabled: 0, // Show all options on focus
            }
        });

        // Function to toggle between edit and save mode
        function toggleEditMode(isEditMode) {
            titleInput.readOnly = !isEditMode;
            contentTextarea.readOnly = !isEditMode;
            tagifyTags.setReadonly(!isEditMode); // Enable/disable Tagify
            tagifyRelatesTo.setReadonly(!isEditMode); // Enable/disable Tagify
            tagifyDependsOn.setReadonly(!isEditMode); // Enable/disable Tagify

            editButton.textContent = isEditMode ? 'Save' : 'Edit';
        }

        // Edit/Save button click event
        editButton.addEventListener('click', function (e) {
            e.preventDefault();

            if (editButton.textContent === 'Edit') {
                // Enable edit mode
                toggleEditMode(true);
            } else {
                const newTitle = titleInput.value;
                const isTitleChanged = newTitle !== note.title;

                // Check if the new title is unique across all notes
                const isTitleUnique = notesState.every(n => n.title !== newTitle || n === note);

                if (!isTitleUnique) {
                    alert('Title must be unique.');
                    return; // Prevent saving if the title isn't unique
                }

                // Save changes and disable edit mode
                note.title = newTitle;
                note.content = contentTextarea.value;
                note.tags = tagifyTags.value.map(item => item.value);
                note.relatesTo = tagifyRelatesTo.value.map(item => item.value);
                note.dependsOn = tagifyDependsOn.value.map(item => item.value);
                note.modified = new Date().toISOString();

                toggleEditMode(false); // Disable edit mode after saving
                renderNotes(); // Re-render notes to reflect saved changes
            }
        });
    });
}

// Import notes and ensure unique titles when importing
function importNotes(importedNotes) {
    const titlesInState = new Set(notesState.map(note => note.title));

    importedNotes.forEach(note => {
        if (titlesInState.has(note.title)) {
            alert(`Duplicate title found: "${note.title}". Skipping this note.`);
            return; // Skip notes with duplicate titles
        }
        notesState.push(note);
        titlesInState.add(note.title); // Track the new title
    });

    collectAndUpdateTitlesAndTags(); // Refresh titles and tags for autocomplete
    renderNotes(); // Re-render notes with updated autocomplete options
}

// Event listener for the import notes button
document.getElementById('import-notes-button').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedNotes = JSON.parse(e.target.result);
                importNotes(importedNotes); // Call the importNotes function
            } catch (error) {
                alert('Invalid file format. Please upload a valid JSON file.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file first.');
    }
});
