// app_controls.js

function initializeApp() {
    setupSearch();
    setupSorting();
    setupClearButton();
    setupNewNoteButton();
    setupSaveButton();
}

function setupSearch() {
    const searchForm = document.getElementById("search-form");
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        searchNotes();
    });
}

function setupSorting() {
    const sortButton = document.getElementById("sort-button");
    sortButton.addEventListener("click", () => {
        sortNotes();
    });
}

function setupClearButton() {
    const clearButton = document.getElementById("clear-button");
    clearButton.addEventListener("click", () => {
        clearSearchResults();
    });
}

function setupNewNoteButton() {
    const newNoteButton = document.getElementById("new-note-button");
    newNoteButton.addEventListener("click", () => {
        createNewNote();
    });
}

function setupSaveButton() {
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", () => {
        saveAllNotes();
    });
}

// Sorting notes (stub function, to be fully implemented)
function sortNotes() {
    const sortField = document.getElementById("sort-field").value;
    const notes = [...document.querySelectorAll(".note")];

    notes.sort((a, b) => {
        const fieldA = a.dataset[sortField].toLowerCase();
        const fieldB = b.dataset[sortField].toLowerCase();
        return fieldA.localeCompare(fieldB);
    });

    const notesContainer = document.getElementById("notes-container");
    notesContainer.innerHTML = ""; // Clear container
    notes.forEach((note) => notesContainer.appendChild(note));
}

// Function to clear search results
function clearSearchResults() {
    const notes = document.querySelectorAll(".note");
    notes.forEach((note) => {
        note.style.display = "none";
    });
}

// Function to create a new note (stub, needs implementation)
function createNewNote() {
    const noteContainer = document.getElementById("notes-container");
    const template = document.getElementById("note-template").content.cloneNode(true);
    noteContainer.insertBefore(template, noteContainer.firstChild);

    // Initialize note events for this newly created note
    const newNote = noteContainer.querySelector(".note");
    setupNoteEvents(newNote);
}

// Function to save all notes (stub, needs implementation)
function saveAllNotes() {
    // This function should save all notes to disk or local storage
    console.log("Saving notes...");
}

