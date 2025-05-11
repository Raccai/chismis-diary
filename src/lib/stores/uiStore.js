import { writable } from 'svelte/store';

function createUiStore() {
  const { subscribe, update, set } = writable({
    isFormVisible: false,
    entryToEdit: null // Will hold the entry object if editing, null for new
  });

  return {
    subscribe,
    showEntryForm: (entry = null) => { // Pass entry object for editing, or nothing for new
      update(state => ({
        isFormVisible: true,
        entryToEdit: entry
      }));
      console.log("uiStore: showEntryForm called. Entry to edit:", entry);
    },
    hideEntryForm: () => {
      update(state => ({
        isFormVisible: false,
        entryToEdit: null
      }));
      console.log("uiStore: hideEntryForm called.");
    },
    reset: () => set({ isFormVisible: false, entryToEdit: null }) // For initial state or full reset
  };
}

export const uiStore = createUiStore();