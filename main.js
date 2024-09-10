document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadHTML("sample_notes.html", "#notes-container");
        await loadHTML("note-form-template.html", "#template-container");
        initializeApp();
    } catch (error) {
        console.error("Error loading HTML:", error);
    }
});

// Function to load HTML content into a container element
async function loadHTML(url, containerSelector) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
    const htmlContent = await response.text();
    document.querySelector(containerSelector).innerHTML = htmlContent;
}
