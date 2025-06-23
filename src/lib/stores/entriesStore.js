import { writable } from 'svelte/store';
import { loadEntries, saveEntries } from '$lib/utils/dataService.js';

// --- THIS IS THE FOOLPROOF PATTERN ---

// 1. Create the store with a starting value of `null`. This represents the "loading" state.
export const entriesStore = writable(null, (set) => {
  // 2. This function runs once when the store is first used.
  async function initialize() {
    console.log("entriesStore: Initializing...");
    try {
      const loaded = await loadEntries();
      set(loaded || []); // Load from filesystem/localStorage and update the store.
      console.log(`entriesStore: Initialization complete. Loaded ${loaded?.length || 0} entries.`);
    } catch (e) {
      console.error("entriesStore: Failed to initialize.", e);
      set([]); // If loading fails, set to an empty array.
    }
  }

  initialize();
});

// 3. Keep the auto-saving subscription separate.
entriesStore.subscribe(currentEntries => {
  // 4. THE CRITICAL FIX: Only save if the store is NOT in its initial "loading" state.
  //    If `currentEntries` is `null`, it means `initialize()` hasn't finished yet, so we DO NOT save.
  if (currentEntries !== null) {
    console.log(`entriesStore: Value changed with ${currentEntries.length} items. Saving...`);
    saveEntries(currentEntries);
  } else {
    console.log("entriesStore: In initial loading state (value is null), not saving.");
  }
});