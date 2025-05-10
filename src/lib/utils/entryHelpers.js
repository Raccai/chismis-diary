import { entriesStore } from "$lib/stores/entriesStore";

export function addEntry(text, mood) {
    const newEntry = {
        id: crypto.randomUUID(),
        text,
        mood,
        date: new Date().toISOString()
    };

    entriesStore.update(entries =>
        [newEntry, ...entries]
    );
}

export function updateEntry(id, newText, newMood) {
    entriesStore.update(entries =>
        entries.map(entry =>
            entry.id === id ? { 
                ...entry, 
                text: newText, 
                mood: newMood
            } : entry
        )
    );
}

export function deleteEntry(id) {
    entriesStore.update(entries => 
        entries.filter(entry => entry.id !== id)
    );
}