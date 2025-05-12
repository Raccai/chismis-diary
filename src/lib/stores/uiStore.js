// src/lib/stores/uiStore.js
import { writable } from 'svelte/store';

function createUiStore() {
  const { subscribe, update, set } = writable({
    isFormVisible: false,
    entryToEdit: null,
    isSideMenuVisible: false
  });

  return {
    subscribe,
    showEntryForm: (entry = null) => {
      update(currentState => ({ // Renamed 'state' to 'currentState' for clarity
        ...currentState, // Spread the existing state first
        isFormVisible: true,
        entryToEdit: entry
      }));
      console.log("uiStore: showEntryForm called. Entry to edit:", entry);
    },
    hideEntryForm: () => {
      update(currentState => ({
        ...currentState,
        isFormVisible: false,
        entryToEdit: null
      }));
      console.log("uiStore: hideEntryForm called.");
    },
    toggleSideMenu: () => {
      update(currentState => { // Correctly use the 'currentState' argument
        console.log("uiStore: toggleSideMenu called. Current sideMenuVisible:", currentState.isSideMenuVisible, "New value will be:", !currentState.isSideMenuVisible);
        return {
          ...currentState,
          isSideMenuVisible: !currentState.isSideMenuVisible // Use currentState here
        };
      });
    },
    closeSideMenu: () => {
        update(currentState => {
            console.log("uiStore: closeSideMenu called. Current sideMenuVisible:", currentState.isSideMenuVisible);
            return {
                ...currentState,
                isSideMenuVisible: false
            };
        });
    },
    reset: () => set({ isFormVisible: false, entryToEdit: null, isSideMenuVisible: false })
  };
}

export const uiStore = createUiStore();