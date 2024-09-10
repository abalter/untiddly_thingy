// note.js

function populateForm(note, data = {}) {
    const template = document.querySelector('#note-template').content.cloneNode(true);

    const titleInput = template.querySelector('.note-title');
    const contentInput = template.querySelector('.note-content');
    const tagsInput = template.querySelector('.note-tags');
    const relatesToInput = template.querySelector('.note-relates-to');
    const dependsOnInput = template.querySelector('.note-depends-on');

    titleInput.value = data.title || note.dataset.title || '';
    contentInput.value = data.content || note.dataset.content || '';
    tagsInput.value = data.tags || note.dataset.tags || '';
    relatesToInput.value = data.relatesTo || note.dataset.relatesTo || '';
    dependsOnInput.value = data.dependsOn || note.dataset.dependsOn || '';

    note.innerHTML = ''; // Clear the note's content
    note.appendChild(template);
}

function saveNote(noteElement) {
    const title = noteElement.querySelector('.note-title').value.trim();
    const content = noteElement.querySelector('.note-content').value.trim();
    const tags = noteElement.querySelector('.note-tags').value.trim();
    const relatesTo = noteElement.querySelector('.note-relates-to').value.trim();
    const dependsOn = noteElement.querySelector('.note-depends-on').value.trim();

    if (!title) {
        alert("Title is required");
        return;
    }

    // Update note dataset
    noteElement.dataset.title = title;
    noteElement.dataset.content = content;
    noteElement.dataset.tags = tags;
    noteElement.dataset.relatesTo = relatesTo;
    noteElement.dataset.dependsOn = dependsOn;
    noteElement.dataset.modified = new Date().toISOString();

    updateLists();
}

function setupNoteEvents() {
    const saveButtons = document.querySelectorAll('.save-note-button');
    saveButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const noteElement = event.target.closest('.note');
            saveNote(noteElement);
        });
    });
}

function createNewNote() {
    const template = document.querySelector('#note-template').content.cloneNode(true);
    const newNote = document.createElement('div');
    newNote.classList.add('note');
    newNote.appendChild(template);

    document.querySelector('#notes-container').prepend(newNote);
    setupNoteEvents(); // Attach save event to the new note
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

function updateLists() {
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
