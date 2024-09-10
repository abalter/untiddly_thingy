import { NoteManager } from './note.js';

export class AppControl {
    constructor() {
        this.noteManager = new NoteManager();
        this.searchForm = document.getElementById('search-form');
        this.clearButton = document.getElementById('clear-button');
        this.newNoteButton = document.getElementById('new-note-button');
        this.saveButton = document.getElementById('save-button');
        this.advancedSearchButton = document.getElementById('advanced-search-button');
        this.addConditionButton = document.getElementById('add-condition');
        this.applySortButton = document.getElementById('apply-sort');
    }

    init() {
        this.loadNoteTemplate();
        this.loadSampleNotes();
        this.setupEventListeners();
        this.noteManager.updateLists();
    }

    async loadNoteTemplate() {
        const response = await fetch('note-form-template.html');
        const template = await response.text();
        document.body.insertAdjacentHTML('beforeend', template);
    }

    async loadSampleNotes() {
        const response = await fetch('sample_notes.html');
        const sampleNotes = await response.text();
        document.getElementById('notes-container').innerHTML = sampleNotes;
    }

    setupEventListeners() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.noteManager.globalSearch(document.getElementById('search').value);
        });

        this.clearButton.addEventListener('click', () => this.noteManager.clearSearch());
        this.newNoteButton.addEventListener('click', () => this.noteManager.createNoteElement());
        this.saveButton.addEventListener('click', () => this.saveToDisk());
        this.advancedSearchButton.addEventListener('click', () => this.noteManager.advancedSearch());
        this.addConditionButton.addEventListener('click', () => this.addSearchCondition());
        this.applySortButton.addEventListener('click', () => this.noteManager.sortNotes());
    }

    saveToDisk() {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes_app.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    addSearchCondition() {
        // Implementation for adding a search condition
    }
}
