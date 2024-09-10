document.addEventListener('DOMContentLoaded', function () {

    // Load initial notes from sample data or any other source
    // loadSampleNotes();
    collectAllTitlesAndTags(); // Collect initial tags and titles from the loaded notes

    // Search functionality to filter notes based on HTML attributes
    function searchNotes(query, field) {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            let match = false;

            const noteTitle = note.getAttribute('data-title').toLowerCase();
            const noteTags = note.getAttribute('data-tags').toLowerCase();
            const noteRelatesTo = note.getAttribute('data-relates-to').toLowerCase();
            const noteDependsOn = note.getAttribute('data-depends-on').toLowerCase();
            const noteContent = note.getAttribute('data-content').toLowerCase();

            if (!query && field === 'global') {
                match = true; // Show all notes if global search is empty
            } else {
                if (field === 'global') {
                    match = noteTitle.includes(query) || noteTags.includes(query) || noteRelatesTo.includes(query) || noteDependsOn.includes(query) || noteContent.includes(query);
                } else if (field === 'title') {
                    match = noteTitle.includes(query);
                } else if (field === 'tags') {
                    match = noteTags.includes(query);
                } else if (field === 'relates-to') {
                    match = noteRelatesTo.includes(query);
                } else if (field === 'depends-on') {
                    match = noteDependsOn.includes(query);
                } else if (field === 'content') {
                    match = noteContent.includes(query);
                }
            }

            note.style.display = match ? '' : 'none'; // Show or hide notes based on search
        });
    }

    // Function to display all current tags and titles
    function displayAllTagsAndTitles() {
        const tagsDisplay = document.getElementById('tags-display');
        const titlesDisplay = document.getElementById('titles-display');

        // Clear current lists
        tagsDisplay.innerHTML = '';
        titlesDisplay.innerHTML = '';

        // Display tags
        tagsList.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.textContent = tag;
            tagsDisplay.appendChild(tagElement);
        });

        // Display titles
        titlesList.forEach(title => {
            const titleElement = document.createElement('div');
            titleElement.textContent = title;
            titlesDisplay.appendChild(titleElement);
        });

        // Log to console for debugging
        console.log("Displayed tags:", tagsList);
        console.log("Displayed titles:", titlesList);
    }

    // Event listener for the "Display All Tags and Titles" button
    document.getElementById('display-tags-titles').addEventListener('click', displayAllTagsAndTitles);

    // Event listener for search form submission
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value.toLowerCase();
        const field = document.getElementById('search-type').value;
        searchNotes(query, field);
    });

    // Event listener for clearing search results
    document.getElementById('clear-search').addEventListener('click', function () {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => note.style.display = 'none'); // Hide all notes when clear is clicked
    });

    // Event listener for global search when the input is blank
    document.getElementById('search-input').addEventListener('input', function () {
        const query = document.getElementById('search-input').value.toLowerCase();
        if (query === '') {
            searchNotes('', 'global'); // Show all notes if the search field is empty
        }
    });

    // Import notes from JSON file
    document.getElementById('import-notes').addEventListener('click', function () {
        const fileInput = document.getElementById('import-file');
        fileInput.click();

        fileInput.addEventListener('change', function () {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const importedNotes = JSON.parse(e.target.result);
                importedNotes.forEach(noteData => addNote(noteData)); // Call addNote to create the notes in the DOM
                
                // After importing notes, update global lists
                collectAllTitlesAndTags(); // Update tags and titles
            };
            reader.readAsText(file);
        });
    });

    // Export notes to JSON file
    document.getElementById('global-save').addEventListener('click', function () {
        const notes = [];
        document.querySelectorAll('.note').forEach(noteDiv => {
            const note = {
                id: noteDiv.getAttribute('data-id'),
                title: noteDiv.getAttribute('data-title'),
                tags: noteDiv.getAttribute('data-tags').split(', ').map(tag => tag.trim()),
                relatesTo: noteDiv.getAttribute('data-relates-to'),
                dependsOn: noteDiv.getAttribute('data-depends-on'),
                content: noteDiv.getAttribute('data-content'),
                created: noteDiv.getAttribute('data-created'),
                modified: noteDiv.getAttribute('data-modified')
            };
            notes.push(note);
        });
        const jsonNotes = JSON.stringify(notes);
        const blob = new Blob([jsonNotes], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'notes.json';
        link.click();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Load initial notes from sample data or other sources
    loadSampleNotes();

    // After loading notes, collect all titles and tags
    collectAllTitlesAndTags();

    // Now, populate each note form
    document.querySelectorAll('.note').forEach(note => {
        populateNoteForm(note);
    });
});
