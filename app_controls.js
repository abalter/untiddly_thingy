newNoteButton.addEventListener('click', createNoteElement);

clearButton.addEventListener('click', () => {
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => note.style.display = 'none');
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const field = searchField.value;
    const term = searchTerm.value.toLowerCase().trim(); // Added trim to avoid leading/trailing spaces
    const notes = document.querySelectorAll('.note');

    // Reset all notes to hidden initially
    notes.forEach(note => note.style.display = 'none');

    console.log(`Searching for "${term}" in field "${field}" using operator "or"`);

    // Filter notes based on attributes using .matches
    notes.forEach(note => {
        const attributes = ['data-title', 'data-content', 'data-tags', 'data-relates-to', 'data-depends-on'];
        let match = false;

        if (field === 'global') {
            // If global search, check all attributes
            match = attributes.some(attr => note.getAttribute(attr)?.toLowerCase().includes(term));
        } else {
            // Check only the selected attribute
            const attribute = `data-${field}`;
            match = note.getAttribute(attribute)?.toLowerCase().includes(term);
        }

        console.log(`Checking note: ${note.dataset.id}, match: ${match}`);

        if (match) {
            populateForm(note, {
                title: note.dataset.title,
                content: note.dataset.content,
                tags: note.dataset.tags,
                relatesTo: note.dataset.relatesTo,
                dependsOn: note.dataset.dependsOn
            });
            note.style.display = 'block';
            console.log(`Note displayed: ${note.dataset.id}`);
        }
    });
});

// Sorting by field
sortButton.addEventListener('click', () => {
    const field = sortField.value;
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

    sortedNotes.forEach(note => notesContainer.appendChild(note));
});

// Save HTML to local drive
saveButton.addEventListener('click', () => {
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
});

function loadExistingNotes() {
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.display = 'none'; // Ensure notes are hidden initially
    });
}
