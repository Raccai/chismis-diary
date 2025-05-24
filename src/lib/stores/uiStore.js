import { writable, get as getStoreValue } from 'svelte/store'; // Renamed get to avoid confusion
import { browser } from '$app/environment';

const initialModalOptions = {
  title: 'Confirm Action',
  message: 'Are you sure?',
  contentComponent: null,
  componentProps: {},
  confirmText: 'OK',
  cancelText: 'Cancel',
  onConfirm: () => {},
  onCancel: () => {},
  hideCancelButton: false,
  confirmClass: 'confirm-button',
  _confirmed: false
};

const initialUiState = {
  isFormVisible: false,
  entryToEdit: null,
  isSideMenuVisible: false,
  isModalVisible: false,
  modalOptions: { ...initialModalOptions }
};

function createUiStore() {
  // Create the store instance and keep a reference to it
  const store = writable(initialUiState);
  const { subscribe, update, set } = store; // Destructure for convenience

  return {
    subscribe,
    set,

    // --- Entry Form Methods ---
    showEntryForm: (entry = null) => {
      update(s => {
        console.log("uiStore: showEntryForm called. Entry to edit:", entry);
        return {
          ...s,
          isFormVisible: true,
          entryToEdit: entry,
          isSideMenuVisible: false, // Close side menu if form opens
          isModalVisible: false     // Close modal if form opens
        };
      });
    },
    hideEntryForm: () => {
      update(s => {
        console.log("uiStore: hideEntryForm called.");
        return { ...s, isFormVisible: false, entryToEdit: null };
      });
    },

    // --- Side Menu Methods ---
    toggleSideMenu: () => {
      update(s => {
        console.log("uiStore: toggleSideMenu called. New state:", !s.isSideMenuVisible);
        return {
          ...s,
          isSideMenuVisible: !s.isSideMenuVisible,
          isFormVisible: false,     // Close form if side menu opens
          isModalVisible: false   // Close modal if side menu opens
        };
      });
    },
    openSideMenu: () => {
      update(s => {
        console.log("uiStore: openSideMenu called.");
        return {
          ...s,
          isSideMenuVisible: true,
          isFormVisible: false,
          isModalVisible: false
        };
      });
    },
    closeSideMenu: () => {
      update(s => {
        console.log("uiStore: closeSideMenu called.");
        return { ...s, isSideMenuVisible: false };
      });
    },

    // --- Modal (Popup) Methods ---
    showModal: (options) => {
      update(s => {
        console.log("uiStore: showModal called with options:", options);
        return {
          ...s,
          isModalVisible: true,
          // Merge provided options with defaults, ensuring all keys from initialModalOptions are present
          modalOptions: { ...initialModalOptions, ...options, _confirmed: false },
          isFormVisible: true,     // Close form if modal opens
          isSideMenuVisible: false  // Close side menu if modal opens
        };
      });
    },
    hideModal: () => {
      update(s => {
        console.log("uiStore: hideModal called.");
        // Check if there's an onCancel and it wasn't explicitly confirmed/cancelled via button
        // This is tricky because Escape key also calls this.
        // Typically, onCancel is for the "Cancel" button action.
        // If an onCancel exists and the action wasn't _confirmed, it might be called.
        // For simplicity, let's assume Escape key / overlay click are "implicit cancels"
        // and only button clicks trigger the specific onCancel/onConfirm.
        // The Modal component can call uiStore.cancelModal() on overlay click if that's desired.
        return {
            ...s,
            isModalVisible: false,
            // Reset modalOptions to defaults when hiding
            modalOptions: { ...initialModalOptions }
        };
      });
    },
    confirmModal: () => {
      // Get current modal options before they are reset
      const currentOptions = getStoreValue(store).modalOptions; // Use `getStoreValue` for one-time read
      if (currentOptions.onConfirm) {
        currentOptions.onConfirm();
      }
      update(s => {
        console.log("uiStore: confirmModal called.");
        return {
            ...s,
            isModalVisible: false,
            modalOptions: { ...initialModalOptions } // Reset options
        };
      });
    },
    cancelModal: () => { // For explicit cancel button click
      const currentOptions = getStoreValue(store).modalOptions;
      if (currentOptions.onCancel) {
        currentOptions.onCancel();
      }
      update(s => {
        console.log("uiStore: cancelModal called.");
        return {
            ...s,
            isModalVisible: false,
            modalOptions: { ...initialModalOptions } // Reset options
        };
      });
    },

    // --- Full UI Reset (Optional) ---
    resetAllUI: () => {
      console.log("uiStore: resetAllUI called.");
      set({ ...initialUiState }); // Reset to the very initial state
    }
  };
}

export const uiStore = createUiStore();