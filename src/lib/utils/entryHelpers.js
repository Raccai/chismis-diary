import { entriesStore } from "$lib/stores/entriesStore";

// Add title, text, mood, tags
export function addEntry(title, text, mood, tags = []) {
    const newEntry = {
        id: crypto.randomUUID(),
        title: title || "", // Ensure title is at least an empty string
        text,
        mood,
        tags: tags || [],
        date: new Date().toISOString()
    };
    entriesStore.update(currentEntries => [newEntry, ...currentEntries]);
}

// Add id, newTitle, newText, newMood, newTags
export function updateEntry(id, newTitle, newText, newMood, newTags = []) {
    entriesStore.update(currentEntries => {
        return currentEntries.map(entry => {
            if (entry.id === id) {
                return {
                    ...entry,
                    title: newTitle === undefined ? entry.title : newTitle, // Keep old title if newTitle is undefined
                    text: newText,
                    mood: newMood,
                    tags: newTags || []
                };
            }
            return entry;
        });
    });
}

export function deleteEntry(id) {
    entriesStore.update(currentEntries =>
        currentEntries.filter(entry => entry.id !== id)
    );
}