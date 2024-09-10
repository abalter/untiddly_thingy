// utils.js

export function createTagElement(tag, noteElement) {
    const tagElement = document.createElement('span');
    tagElement.classList.add('tag');
    tagElement.textContent = tag;
    const removeButton = document.createElement('span');
    removeButton.classList.add('tag-remove');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
        tagElement.remove();
        updateAllTags();
        updateNoteAttributes(noteElement, {
            tags: Array.from(noteElement.querySelector('.note-tags').querySelectorAll('.tag')).map(t => t.textContent.trim())
        });
    });
    tagElement.appendChild(removeButton);
    return tagElement;
}

export function createRelationElement(relation, noteElement) {
    const relationElement = document.createElement('span');
    relationElement.classList.add('relation');
    relationElement.textContent = relation;
    const removeButton = document.createElement('span');
    removeButton.classList.add('relation-remove');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
        relationElement.remove();
        const type = relationElement.closest('.note-relates-to') ? 'relatesTo' : 'dependsOn';
        updateNoteAttributes(noteElement, {
            [type]: Array.from(noteElement.querySelector(`.note-${type.toLowerCase()}`).querySelectorAll('.relation')).map(r => r.textContent.trim())
        });
    });
    relationElement.appendChild(removeButton);
    return relationElement;
}

export function setupAutocomplete(input, items, container, createElementFunction, type) {
    function showAllItems() {
        const a = document.createElement('DIV');
        a.setAttribute('id', input.id + 'autocomplete-list');
        a.setAttribute('class', 'autocomplete-items');
        input.parentNode.appendChild(a);

        items.forEach(item => {
            const b = document.createElement('DIV');
            b.innerHTML = item;
            b.addEventListener('click', function(e) {
                input.value = '';
                const element = createElementFunction(this.textContent);
                container.appendChild(element);
                closeAllLists();
                updateAllTags();
                const noteElement = input.closest('.note');
                updateNoteAttributes(noteElement, {
                    [type]: Array.from(container.querySelectorAll(type === 'tags' ? '.tag' : '.relation')).map(el => el.textContent.trim())
                });
            });
            a.appendChild(b);
        });
    }

    input.addEventListener('focus', showAllItems);

    input.addEventListener('input', function(e) {
        let val = this.value;
        closeAllLists();
        if (!val) { 
            showAllItems();
            return false;
        }
        const a = document.createElement('DIV');
        a.setAttribute('id', this.id + 'autocomplete-list');
        a.setAttribute('class', 'autocomplete-items');
        this.parentNode.appendChild(a);

        items.forEach(item => {
            if (item.toUpperCase().includes(val.toUpperCase())) {
                const b = document.createElement('DIV');
                const startIndex = item.toUpperCase().indexOf(val.toUpperCase());
                b.innerHTML = item.substr(0, startIndex);
                b.innerHTML += '<strong>' + item.substr(startIndex, val.length) + '</strong>';
                b.innerHTML += item.substr(startIndex + val.length);
                b.addEventListener('click', function(e) {
                    input.value = '';
                    const element = createElementFunction(this.textContent);
                    container.appendChild(element);
                    closeAllLists();
                    updateAllTags();
                    const noteElement = input.closest('.note');
                    updateNoteAttributes(noteElement, {
                        [type]: Array.from(container.querySelectorAll(type === 'tags' ? '.tag' : '.relation')).map(el => el.textContent.trim())
                    });
                });
                a.appendChild(b);
            }
        });
    });

    input.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            const element = createElementFunction(this.value);
            container.appendChild(element);
            this.value = '';
            closeAllLists();
            updateAllTags();
            const noteElement = input.closest('.note');
            updateNoteAttributes(noteElement, {
                [type]: Array.from(container.querySelectorAll(type === 'tags' ? '.tag' : '.relation')).map(el => el.textContent.trim())
            });
        }
    });

    function closeAllLists(elmnt) {
        const x = document.getElementsByClassName('autocomplete-items');
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener('click', function (e) {
        closeAllLists(e.target);
    });
}

export function updateNoteAttributes(noteElement, noteData) {
    for (const [key, value] of Object.entries(noteData)) {
        if (Array.isArray(value)) {
            noteElement.setAttribute(`data-${key.toLowerCase()}`, value.join(','));
        } else {
            noteElement.setAttribute(`data-${key.toLowerCase()}`, value);
        }
    }
}

export function updateAllTags() {
    const allTags = new Set();
    document.querySelectorAll('.note-tags .tag').forEach(tag => {
        allTags.add(tag.textContent.trim());
    });
    return allTags;
}

export function sortNotes(notesDisplay, sortBy) {
    const notes = Array.from(notesDisplay.querySelectorAll('.note'));
    notes.sort((a, b) => {
        const aValue = a.getAttribute(`data-${sortBy}`) || '';
        const bValue = b.getAttribute(`data-${sortBy}`) || '';
        return aValue.localeCompare(bValue);
    });
    notes.forEach(note => notesDisplay.appendChild(note));
}    