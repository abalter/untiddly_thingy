// core.js
import { createTagElement, createRelationElement, setupAutocomplete, updateNoteAttributes, updateAllTags, sortNotes } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const notesDisplay = document.getElementById('notes-display');
    const newNoteButton = document.getElementById('new-note');
    const searchForm = document.getElementById('search-form');
    const clearSearchButton = document.getElementById('clear-search');
    const globalSaveButton = document.getElementById('global-save');
    const sortSelect = document.getElementById('sort-select');
    const importFileInput = document.getElementById('import-file');
    const importNotesButton = document.getElementById('import-notes');

    let allTags = new Set();
    let allTitles = new Set();

    function createNoteElement(noteData = {}) {
        const template = document.getElementById('note-template');
        const noteElement = template.content.cloneNode(true).querySelector('.note');

        if (noteData.id) {
            noteElement.id = noteData.id;
        }

        const titleInput = noteElement.querySelector('.note-title');
        const contentTextarea = noteElement.querySelector('.note-content');
        const tagsInput = noteElement.querySelector('.note-tags-input');
        const tagsDiv = noteElement.querySelector('.note-tags');
        const relatesToInput = noteElement.querySelector('.note-relates-to-input');
        const relatesToDiv = noteElement.querySelector('.note-relates-to');
        const dependsOnInput = noteElement.querySelector('.note-depends-on-input');
        const dependsOnDiv = noteElement.querySelector('.note-depends-on');
        const createdDateSpan = noteElement.querySelector('.created-date');
        const modifiedDateSpan = noteElement.querySelector('.modified-date');

        titleInput.value = noteData.title || '';
        contentTextarea.value = noteData.content || '';

        if (!noteData.created) {
            noteData.created = new Date().toISOString();
        }
        createdDateSpan.textContent = `Created: ${new Date(noteData.created).toLocaleString()}`;

        noteData.modified = noteData.modified || noteData.created;
        modifiedDateSpan.textContent = `Modified: ${new Date(noteData.modified).toLocaleString()}`;

        function setTags(tags) {
            tagsDiv.innerHTML = '';
            tags.forEach(tag => {
                const tagElement = createTagElement(tag, noteElement);
                tagsDiv.appendChild(tagElement);
                allTags.add(tag);
            });
            updateNoteAttributes(noteElement, { tags: tags });
        }

        function setRelations(relations, div, type) {
            div.innerHTML = '';
            relations.forEach(relation => {
                const relationElement = createRelationElement(relation, noteElement);
                div.appendChild(relationElement);
            });
            updateNoteAttributes(noteElement, { [type]: relations });
        }

        setTags(noteData.tags || []);
        setRelations(noteData.relatesTo || [], relatesToDiv, 'relatesTo');
        setRelations(noteData.dependsOn || [], dependsOnDiv, 'dependsOn');

        const editButton = noteElement.querySelector('.edit-note');
        const saveButton = noteElement.querySelector('.save-note');
        const deleteButton = noteElement.querySelector('.delete-note');

        editButton.addEventListener('click', () => {
            titleInput.readOnly = false;
            contentTextarea.readOnly = false;
            tagsInput.readOnly = false;
            relatesToInput.readOnly = false;
            dependsOnInput.readOnly = false;
            editButton.style.display = 'none';
            saveButton.style.display = 'inline-block';
        });

        saveButton.addEventListener('click', () => {
            const newTitle = titleInput.value.trim();
            const newId = newTitle.toLowerCase().replace(/\s/g, '-');

            if (allTitles.has(newId) && newId !== noteData.id) {
                alert('Title must be unique. Please choose a different title.');
                return;
            }

            if (noteData.id && noteData.id !== newId) {
                allTitles.delete(noteData.id);
                noteElement.id = newId;
            }

            allTitles.add(newId);

            noteData.id = newId;
            noteData.title = newTitle;
            noteData.content = contentTextarea.value;
            noteData.tags = Array.from(tagsDiv.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
            noteData.relatesTo = Array.from(relatesToDiv.querySelectorAll('.relation')).map(relation => relation.textContent.trim());
            noteData.dependsOn = Array.from(dependsOnDiv.querySelectorAll('.relation')).map(relation => relation.textContent.trim());
            noteData.modified = new Date().toISOString();

            modifiedDateSpan.textContent = `Modified: ${new Date(noteData.modified).toLocaleString()}`;

            titleInput.readOnly = true;
            contentTextarea.readOnly = true;
            tagsInput.readOnly = true;
            relatesToInput.readOnly = true;
            dependsOnInput.readOnly = true;
            editButton.style.display = 'inline-block';
            saveButton.style.display = 'none';

            updateNoteAttributes(noteElement, noteData);
            sortNotes(notesDisplay, sortSelect.value);
        });

        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this note?')) {
                allTitles.delete(noteData.id);
                noteElement.remove();
                updateAllTags();
            }
        });

        setupAutocomplete(tagsInput, Array.from(allTags), tagsDiv, (tag) => createTagElement(tag, noteElement), 'tags');
        setupAutocomplete(relatesToInput, Array.from(allTitles), relatesToDiv, (relation) => createRelationElement(relation, noteElement), 'relatesTo');
        setupAutocomplete(dependsOnInput, Array.from(allTitles), dependsOnDiv, (relation) => createRelationElement(relation, noteElement), 'dependsOn');

        return noteElement;
    }

    newNoteButton.addEventListener('click', () => {
        const newNote = createNoteElement();
        notesDisplay.insertBefore(newNote, notesDisplay.firstChild);
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.toLowerCase();
        const searchType = document.getElementById('search-type').value;

        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            let matchesSearch;
            if (query === '') {
                matchesSearch = true;  // Show all notes if search is blank
            } else {
                switch (searchType) {
                    case 'global':
                        matchesSearch = note.textContent.toLowerCase().includes(query) ||
                            (note.getAttribute('data-tags') || '').toLowerCase().includes(query) ||
                            (note.getAttribute('data-relates-to') || '').toLowerCase().includes(query) ||
                            (note.getAttribute('data-depends-on') || '').toLowerCase().includes(query);
                        break;
                    case 'content':
                        matchesSearch = note.querySelector('.note-content').value.toLowerCase().includes(query);
                        break;
                    case 'title':
                        matchesSearch = (note.getAttribute('data-title') || '').toLowerCase().includes(query);
                        break;
                    case 'tags':
                        matchesSearch = (note.getAttribute('data-tags') || '').toLowerCase().includes(query);
                        break;
                    case 'relates-to':
                        matchesSearch = (note.getAttribute('data-relates-to') || '').toLowerCase().includes(query);
                        break;
                    case 'depends-on':
                        matchesSearch = (note.getAttribute('data-depends-on') || '').toLowerCase().includes(query);
                        break;
                    case 'create-date':
                        matchesSearch = (note.getAttribute('data-created') || '').toLowerCase().includes(query);
                        break;
                    case 'modify-date':
                        matchesSearch = (note.getAttribute('data-modified') || '').toLowerCase().includes(query);
                        break;
                }
            }
            note.style.display = matchesSearch ? 'block' : 'none';
        });
    });

    clearSearchButton.addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => note.style.display = 'block');
    });

    globalSaveButton.addEventListener('click', () => {
        const notes = document.querySelectorAll('.note');
        const notesData = Array.from(notes).map(note => ({
            id: note.id,
            title: note.getAttribute('data-title'),
            content: note.querySelector('.note-content').value,
            tags: (note.getAttribute('data-tags') || '').split(',').filter(tag => tag.trim() !== ''),
            relatesTo: (note.getAttribute('data-relates-to') || '').split(',').filter(relation => relation.trim() !== ''),
            dependsOn: (note.getAttribute('data-depends-on') || '').split(',').filter(relation => relation.trim() !== ''),
            created: note.getAttribute('data-created'),
            modified: note.getAttribute('data-modified')
        }));

        const blob = new Blob([JSON.stringify(notesData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    sortSelect.addEventListener('change', () => sortNotes(notesDisplay, sortSelect.value));

    importNotesButton.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedNotes = JSON.parse(e.target.result);
                    importNotes(importedNotes);
                } catch (error) {
                    console.error('Error parsing imported file:', error);
                    alert('Error importing notes. Please make sure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
        }
    });

    function importNotes(importedNotes) {
        importedNotes.forEach(noteData => {
            const existingNote = document.getElementById(noteData.id);
            if (existingNote) {
                // Update existing note
                updateNoteElement(existingNote, noteData);
            } else {
                // Create new note
                const newNote = createNoteElement(noteData);
                notesDisplay.appendChild(newNote);
            }
        });

        updateAllTags();
        initializeTagsAndTitles();
        sortNotes(notesDisplay, sortSelect.value);
        alert('Notes imported successfully!');
    }

    function updateNoteElement(noteElement, noteData) {
        noteElement.querySelector('.note-title').value = noteData.title;
        noteElement.querySelector('.note-content').value = noteData.content;

        const tagsDiv = noteElement.querySelector('.note-tags');
        tagsDiv.innerHTML = '';
        noteData.tags.forEach(tag => {
            const tagElement = createTagElement(tag, noteElement);
            tagsDiv.appendChild(tagElement);
        });

        const relatesToDiv = noteElement.querySelector('.note-relates-to');
        relatesToDiv.innerHTML = '';
        noteData.relatesTo.forEach(relation => {
            const relationElement = createRelationElement(relation, noteElement);
            relatesToDiv.appendChild(relationElement);
        });

        const dependsOnDiv = noteElement.querySelector('.note-depends-on');
        dependsOnDiv.innerHTML = '';
        noteData.dependsOn.forEach(relation => {
            const relationElement = createRelationElement(relation, noteElement);
            dependsOnDiv.appendChild(relationElement);
        });

        noteElement.querySelector('.created-date').textContent = `Created: ${new Date(noteData.created).toLocaleString()}`;
        noteElement.querySelector('.modified-date').textContent = `Modified: ${new Date(noteData.modified).toLocaleString()}`;

        updateNoteAttributes(noteElement, noteData);
    }

    // Initialize allTags and allTitles
    function initializeTagsAndTitles() {
        allTags.clear();
        allTitles.clear();
        document.querySelectorAll('.note').forEach(note => {
            const tags = (note.getAttribute('data-tags') || '').split(',').filter(tag => tag.trim() !== '');
            tags.forEach(tag => allTags.add(tag));

            const title = note.getAttribute('data-title');
            if (title) {
                allTitles.add(title.toLowerCase().replace(/\s/g, '-'));
            }
        });
    }

    // Call this function to initialize tags and titles when the page loads
    initializeTagsAndTitles();
});