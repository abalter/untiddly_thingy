// main.js

document.addEventListener('DOMContentLoaded', function () {
    loadHTML('sample_notes.html', '#notes-container', () => {
        loadHTML('note-form-template.html', '#template-container', () => {
            // After loading HTML, initialize the app
            initializeApp();
        });
    });
});

function loadHTML(url, selector, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.error('Error loading HTML:', error));
}
