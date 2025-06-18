import { entriesStore } from "$lib/stores/entriesStore.js";
import { userProgress } from "$lib/stores/userProgressStore.js"; // IMPORT userProgressStore
import { get } from 'svelte/store'; // Import get if you plan to use it for delete logic later

export function addEntry(title, text, mood, tags = []) {
  const newEntry = {
    id: crypto.randomUUID(),
    title: title || `Chismis - ${new Date().toLocaleDateString()}`, // Ensure title exists
    text: text,
    mood: mood,
    tags: tags || [],
    date: new Date().toISOString()
  };

  entriesStore.update(currentEntries => [newEntry, ...currentEntries]);

  if (userProgress && typeof userProgress.logMoodEntry === 'function') {
    console.log(`entryHelpers: Calling userProgress.logMoodEntry for mood: ${newEntry.mood}, with entry details:`, newEntry);
    // Pass the whole newEntry object, or specific parts needed by logMoodEntry
    userProgress.logMoodEntry(newEntry); // Pass the full entry object
  } else {
    console.error("entryHelpers: userProgress.logMoodEntry function is not available or userProgress store is not imported correctly!");
  }
}

export function updateEntry(id, newTitle, newText, newMood, newTags = []) {
  entriesStore.update(currentEntries => {
    let oldMood = null;
    let moodHasChanged = false;
    const updatedEntries = currentEntries.map(entry => {
      if (entry.id === id) {
        if (entry.mood !== newMood) {
          oldMood = entry.mood;
          moodHasChanged = true;
        }
        return {
          ...entry,
          title: newTitle,
          text: newText,
          mood: newMood,
          tags: newTags || [],
          lastEdited: new Date().toISOString()
        };
      }
      return entry;
    });

    // If mood changed during an update, you might want to log it for achievements
    if (moodHasChanged) {
      if (userProgress && typeof userProgress.logMoodEntry === 'function') {
        // This will count the new mood. If you need to decrement the old mood count,
        // userProgressStore would need a separate method or more complex logic in logMoodEntry.
        console.log(`entryHelpers: Mood changed on update. Logging new mood: ${newMood}`);
        // Create a temporary entry-like object for the updated mood log
        userProgress.logMoodEntry({ mood: newMood, title: newTitle, text: newText, tags: newTags });
      }
    }
    return updatedEntries;
  });
}

export function deleteEntry(id) {
  // Optional: If deleting an entry should affect progress (e.g., decrement counts)
  const entryToDelete = get(entriesStore).find(e => e.id === id); // Get entry before deleting

  entriesStore.update(currentEntries =>
    currentEntries.filter(entry => entry.id !== id)
  );

  if (entryToDelete && userProgress && typeof userProgress.decrementStatsForEntry === 'function') {
    // You would need to implement decrementStatsForEntry in userProgressStore
    // userProgress.decrementStatsForEntry(entryToDelete);
    console.log("entryHelpers: Entry deleted. If implemented, would call userProgress.decrementStatsForEntry.");
  }
}