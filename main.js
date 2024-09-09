document.addEventListener("DOMContentLoaded", () => {
    const notesContainer = document.getElementById('notes-container');
    const templateContainer = document.getElementById('template-container');
    const newNoteButton = document.getElementById('new-note-button');
    const searchForm = document.getElementById('search-form');
    const clearButton = document.getElementById('clear-button');  // Define clearButton here
    const tagsDatalist = document.getElementById('tags-datalist');
    const titlesDatalist = document.getElementById('titles-datalist');
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

                // Append the template to the template container
                templateContainer.appendChild(tempDiv.querySelector('template'));

                noteTemplateContent = document.getElementById('note-template').content;

                // Now, ensure the datalists exist
                if (tagsDatalist && titlesDatalist) {
                    loadSampleNotes();
                } else {
                    console.error('Error: Datalist elements not found!');
                }
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

    // Function to update autocomplete options
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

    // Function to update lists of tags and titles
    function updateLists() {
        tagsList = [...new Set([...document.querySelectorAll('.note')].flatMap(note => 
            note.dataset.tags.split(', ').map(tag => tag.trim())))];
        titlesList = [...document.querySelectorAll('.note')].map(note => note.dataset.title);
        updateAutocomplete();
    }

    // Function to populate a form from a template
    window.populateForm = function(note, data = {}) {
        if (!noteTemplateContent) {
            console.error('Error: Template content is not loaded yet.');
            return;
        }

        const form = noteTemplateContent.cloneNode(true).querySelector('.note-form');

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

        form.querySelector('.save-note-button').addEventListener('click', () => saveNote(note, form));

        note.innerHTML = ''; // Clear the note before inserting the form
        note.appendChild(form);
        note.style.display = 'block';
    }

    // Function to create a new note element
    function createNoteElement() {
        const note = document.createElement('div');
        note.classList.add('note');
        notesContainer.insertBefore(note, notesContainer.firstChild);

        populateForm(note); // Populate with empty form for new notes
        updateLists();
    }

    // Function to save a note
    function saveNote(note, form) {
        const title = form.querySelector('.note-title').value.trim();
        const content = form.querySelector('.note-content').value.trim();
        const tags = form.querySelector('.note-tags').value.trim();
        const relatesTo = form.querySelector('.note-relates-to').value.trim();
        const dependsOn = form.querySelector('.note-depends-on').value.trim();

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

        note.dataset.id = title.toLowerCase().replace(/\s/g, '-');
        note.dataset.title = title;
        note.dataset.tags = tags;
        note.dataset.relatesTo = relatesTo;
        note.dataset.dependsOn = dependsOn;
        note.dataset.modified = new Date().toISOString();
        note.dataset.content = content; // Store the content in the data-content attribute

        // Re-populate the form with updated data
        populateForm(note, { title, content, tags, relatesTo, dependsOn });
        updateLists();
    }

    // Event listener for new note button
    newNoteButton.addEventListener('click', createNoteElement);

    // Event listener for search form submission
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchTerm = document.getElementById('search-term').value.toLowerCase().trim();
        const field = document.getElementById('search-field').value;
        const notes = document.querySelectorAll('.note');

        notes.forEach(note => {
            const tags = note.dataset.tags.toLowerCase();
            const title = note.dataset.title.toLowerCase();
            const relatesTo = note.dataset.relatesTo.toLowerCase();
            const dependsOn = note.dataset.dependsOn.toLowerCase();
            const content = note.dataset.content.toLowerCase();

            const match = (field === 'global' && (tags.includes(searchTerm) || title.includes(searchTerm) || relatesTo.includes(searchTerm) || dependsOn.includes(searchTerm) || content.includes(searchTerm)))
                || (field !== 'global' && note.dataset[field].toLowerCase().includes(searchTerm));

            if (match) {
                populateForm(note, {
                    id: note.dataset.id,
                    title: note.dataset.title,
                    tags: note.dataset.tags,
                    relatesTo: note.dataset.relatesTo,
                    dependsOn: note.dataset.dependsOn,
                    content: note.dataset.content // Use the data-content attribute for content
                });
            } else {
                note.style.display = 'none';
            }
        });
    });

    // Clear notes visibility
    clearButton.addEventListener('click', () => {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => note.style.display = 'none');
    });

    // Call the function to load the note template
    loadNoteTemplate();
    updateLists();
    loadExistingNotes();
});