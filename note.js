const tagsDatalist = document.getElementById('tags-datalist');
const titlesDatalist = document.getElementById('titles-datalist');

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

// Save note
function saveNote(note, form) {
    const title = form.querySelector('.note-title').value.trim();
    const content = form.querySelector('.note-content').value.trim();
    const tags = Array.from(form.querySelectorAll('.tag')).map(tagElement => tagElement.textContent.trim().slice(0, -1)).join(', ');
    const relatesTo = form.querySelector('.note-relates-to').value.trim();
    const dependsOn = form.querySelector('.note-depends-on').value.trim();

    if (titlesList.includes(title) && note.dataset.id !== title.toLowerCase().replace(/\s/g, '-')) {
        alert('Title must be unique!');
        return;
    }

    note.dataset.id = title.toLowerCase().replace(/\s/g, '-');
    note.dataset.title = title;
    note.dataset.tags = tags;
    note.dataset.relatesTo = relatesTo;
    note.dataset.dependsOn = dependsOn;
    note.dataset.modified = new Date().toISOString();
    note.dataset.content = content; // Store the content in the data-content attribute

    // Update lists and autocomplete
    tagsList = [...new Set([...tagsList, ...tags.split(', ').map(tag => tag.trim()).filter(tag => tag)])];
    updateLists();
    updateAutocomplete();

    // Re-populate the form with updated data
    populateForm(note, {
        title,
        content,
        tags,
        relatesTo,
        dependsOn
    });
}

// Function to add tags with autocomplete and remove functionality
function addTags(tagsInput, tags) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';

    // Add initial tags
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = `${tag} `;
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&times;';
        removeButton.onclick = () => {
            tagsContainer.removeChild(tagElement);
        };
        tagElement.appendChild(removeButton);
        tagsContainer.appendChild(tagElement);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tags-autocomplete';

    input.addEventListener('input', function () {
        const value = input.value;
        const suggestions = tagsList.filter(tag => tag.startsWith(value) && !tags.includes(tag));
        const autocomplete = document.createElement('datalist');
        autocomplete.id = 'tags-datalist';
        suggestions.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            autocomplete.appendChild(option);
        });
        if (input.list) {
            input.list.innerHTML = '';
            input.list = null;
        }
        input.setAttribute('list', 'tags-datalist');
        input.appendChild(autocomplete);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.value.trim().replace(/,/, '');
            if (val && !tags.includes(val)) {
                tags.push(val);
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = `${val} `;
                const removeButton = document.createElement('button');
                removeButton.innerHTML = '&times;';
                removeButton.onclick = () => {
                    tagsContainer.removeChild(tagElement);
                    tags = tags.filter(tag => tag !== val);
                };
                tagElement.appendChild(removeButton);
                tagsContainer.appendChild(tagElement);
                input.value = '';
            }
        }
    });

    tagsInput.parentNode.insertBefore(tagsContainer, tagsInput);
    tagsInput.parentNode.insertBefore(input, tagsInput);
    tagsInput.style.display = 'none';
}

function updateLists() {
    tagsList = [...new Set([...document.querySelectorAll('.note')].flatMap(note => note.dataset.tags.split(', ').map(tag => tag.trim())))];
    titlesList = [...document.querySelectorAll('.note')].map(note => note.dataset.title);
    updateAutocomplete();
}