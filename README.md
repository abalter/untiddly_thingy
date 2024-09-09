# untiddly_thingy
A single-file, self-updating web application with features like tiddlywiki, but very different.

Classless CSS Frameworks:
https://dev.to/logrocket/comparing-classless-css-frameworks-3267#classless-css-framework-comparison
https://github.com/kevquirk/simple.css
https://github.com/dbohdan/classless-css

## Implementing today (9/9/2024)

Here are the items I'd like to work on. We can do them in stages.

1. Button to save the HTML file to my local drive (I know this is not a smooth thing to do with browsers. But we just need to make it work. TiddlyWiki does this.

2. Improve app layout and design: 
  - Notes on left 2/3 of screen. Search and other functions on right 1/3.
  - Use a classless CSS library. We can try MVP. It's tiny. https://andybrewer.github.io/mvp/#docs
     <link rel="stylesheet" href="https://unpkg.com/mvp.css">
  - Notes form UI. Title on top. Content full width of notes. Tags and other fields below.

3. Improve search/filter capability:
  - Global search
  - Search by field
  - Boolean combined search
  - Sorting by fields

4. Note types. Can switch between.
  - Note
  - Idea
  - Task

5. Special field types for note types
  - Note (same default fields)
  - Task
    - Priority
    - Due date
    - Status: (same default fields)
      - Not started
      - In process
      - Stalled
      - Paused
      - Completed
    - Idea (same default fields)
      - Supports
      - Supported by
    - Resource (same default fields)
      - URL
      - Description/type
      