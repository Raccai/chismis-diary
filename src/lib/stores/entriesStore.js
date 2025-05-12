import { writable } from 'svelte/store';
import { loadEntries, saveEntries } from '$lib/utils/dataService.js'; // Make sure path is correct

// Initial state is an empty array. The actual data will be loaded asynchronously.
export const entriesStore = writable([], (set) => {
  // This 'start' function is called when the first subscriber subscribes to the store.
  // It's a good place for one-time setup or async data loading.
  let storeInitialized = false; // Flag to track if initial load has happened

  async function initializeStore() {
    console.log("entriesStore: Initializing - attempting to load entries...");
    try {
      const loadedEntriesArray = await loadEntries(); // Returns an array
      set(loadedEntriesArray || []); // Ensure `set` receives an array
      console.log("entriesStore: Successfully loaded and set entries:", (loadedEntriesArray || []).length, "items");
    } catch (e) {
      console.error("entriesStore: Error during initial load:", e);
      set([]); // Fallback to empty array on critical error during load
    }
    storeInitialized = true;
  }

  initializeStore();

  // The 'start' function can optionally return a 'stop' function,
  // which is called when the last subscriber unsubscribes.
  // Not strictly needed for this use case unless you have specific cleanup.
  return () => {
    // console.log('entriesStore: Last subscriber unsubscribed (or component unmounted if not global)');
  };
});

// Subscribe to store changes to save them (auto-save feature)
// This subscription runs *after* the store is created and after the initial `set` inside `initializeStore`.
let isFirstSubscribeCall = true; // To potentially skip saving the very initial empty array state if not desired

entriesStore.subscribe(async (currentEntriesValue) => {
  // We want to save any meaningful state.
  // The initial `writable([])` will trigger this with an empty array.
  // Then `initializeStore()` calls `set(loadedEntriesArray)`, triggering this again.
  // This is generally fine.

  // Simple check: if currentEntriesValue is an array, proceed to save.
  if (Array.isArray(currentEntriesValue)) {
    if (isFirstSubscribeCall) {
        // console.log("entriesStore: First subscribe call, value length:", currentEntriesValue.length);
        // This will be the initial [] or the first loaded data.
        // We can let it save. `saveEntries` handles empty arrays fine.
        isFirstSubscribeCall = false;
    }
    // console.log("entriesStore: Subscription triggered. Current value length:", currentEntriesValue.length, ". Attempting to save.");
    await saveEntries(currentEntriesValue);
  } else {
    console.warn("entriesStore: Subscription triggered with non-array value. Not saving.", currentEntriesValue);
  }
});