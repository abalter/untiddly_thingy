# Javascript note taking app

## Overview
This application allows the user to create and view notes. The notes 
contain the following editable attributes:  
- Title
- Content
- Tags
- Related-To
- Depends-on

The notes also contain the following non-editable attributes:  
- Creation date
- Modification date
  
The app contains a global controls form that allows the user to:  
- Search for and display existing notes
- Clear search results
- Edit displayed notes
- Create new notes
- Sort displayed notes

## Layout
The app is a single page which consists of  
- Global search and controls (right 1/3 of page)
- Space to display notes (left 1/3 of page)
- Notes which are stored as divs added to the dom. They are invisible by default.
  
## Key Design Principal
- Notes are divs added to the dom when they are created
- The attributes of notes are stored as html attributes of the div:
  - id (Created from the title with title.tolower.replace(/\s/g, "-") or equivalent.)
  - class="note"
  - data-tags
  - data-title
  - data-relates-to
  - data-depends-on
  - data-created (generated timestamp)
  - data-modified (generated timestamp)
- The builtin search capability of the browser/dom is used to search for notes based on their attributes.
  This should make searching fast.
  
## Operation

### When page loads
- Collect list of all tags from data-tags class
- Collect list of titles and ids
- 
### Search
- Page search results brings up and displays matching "notes"
- Search options include boolean combinations of:
  - Global
  - Content
  - Title (auto filled)
  - Tags (auto filled)
  - Relates-To (auto filled)
  - Depends-On (auto filled)
  - Create-date
  - Modify-date
- Results can be sorted as well
- A button to clear search results
- 
### New Notes
New notes are created at the top and other displayed notes pushed down.  

### Global Save
Save the notes as an html file that can be imported.  

### Notes
#### Display
Each "note" is displayed as a form with fields not editable.
Fields:  
- Title
- Content
- Tags (existing tags autocomplete, can add new tags)
- Relates_To (Limited to existing titles, autocomplete)
- Depends_On (Limited to existing titles, autocomplete)
- Create date
- Modified date  
Buttons:  
- Edit: Make fields editable)
- Save: Add the div do the dom with attributes.
- Delete: Delete the note (div) from the dom after warning and approval.
  
#### Editing
When the "Edit" button is clicked, the form fields for that note become editable.

**NOTE:** _This excludes the creation and modification dates which cannot be edited._

#### Saving
- The "note" id attribute is title title.tolower.replace(/\s/g, "-")
- Title (and therefore id) must be unique. Warn if not.
- The div attributes are updated from the form (and timestamp)
- When note divs are saved, only the attributes are saved. The form is only used to display the notes.
- 
### Fields
### Tags
- Tags should autocomplete from the existing list of all tags from all notes
- When typing a tag, suggestions should appear based on what has been typed.
- User can go through the list with the tab key
- Enter key chooses that tag
- Tag appears in the list as a box with an "x" allowing it to be deleted.
- Hitting enter at any point creates a tag, whether or not the tag already exists
- Also, when typing a tag, typing a comma "," has the same behavior.
- 
### Relates-to and Depends-on
- These behave the same way as tags, except that the choices are based on
  currently existing titles.
- New values are not allowed to be created.