// src/lib/utils/dataUtils.js
import { get } from 'svelte/store';
import { entriesStore } from '$lib/stores/entriesStore.js';
import { theme } from '$lib/stores/themeStore.js'; 
import { toasts } from '$lib/stores/toastStore.js';

// --- EXPORT ---
export function exportData() {
  try {
    const dataToExport = {
      appVersion: '1.0.0', // Consider making this dynamic from a const
      exportedAt: new Date().toISOString(),
      entries: get(entriesStore),
      theme: get(theme) // Export current theme preference
      // Add other stores if needed: e.g., settings specific to other features
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    a.href = url;
    a.download = `chismis-diary-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Toasts.success("Data exported successfully!"); // Parent component handles toast for now
  } catch (error) {
    console.error("Error during data export:", error);
    toasts.error("Data export failed. See console for details.");
  }
}

// --- IMPORT ---
export function importData(jsonFile, onCompleteCallback, onErrorCallback) {
  if (!jsonFile) {
    if (onErrorCallback) onErrorCallback("No file selected for import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedRaw = JSON.parse(event.target.result);

      // --- Basic Validation (expand this significantly) ---
      if (!importedRaw || typeof importedRaw !== 'object') throw new Error("Invalid file content.");
      if (!importedRaw.entries || !Array.isArray(importedRaw.entries)) {
        throw new Error("Invalid file: 'entries' array is missing or not an array.");
      }
      // Add more checks: appVersion compatibility, structure of entries etc.
      console.log("Imported data version:", importedRaw.appVersion);

      // --- Update Stores ---
      // Be very careful: This overwrites existing data.
      entriesStore.set(importedRaw.entries);
      
      if (importedRaw.theme && (importedRaw.theme === 'light' || importedRaw.theme === 'dark')) {
        theme.set(importedRaw.theme);
      } else {
        console.warn("Theme data missing or invalid in import file. Theme not restored.");
      }

      if (onCompleteCallback) onCompleteCallback("Data imported successfully!");
    } catch (error) {
      console.error("Error processing imported data:", error);
      if (onErrorCallback) onErrorCallback(`Import failed: ${error.message}`);
    }
  };
  reader.onerror = () => {
    if (onErrorCallback) onErrorCallback("Error reading the selected file.");
  };
  reader.readAsText(jsonFile);
}

// --- CLEAR ALL APP DATA ---
export function clearAllAppData() {
  // This function should reset all relevant stores to their initial state
  // and clear corresponding localStorage items.
  try {
    entriesStore.set([]); // Reset entries
    theme.set('light'); // Reset theme to default (or system preference logic)

    // Explicitly clear localStorage items (though stores might do this on set([]) if subscribed)
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('entries');
        localStorage.removeItem('userChismisProgress');
        localStorage.removeItem('theme');
        // Remove any other app-specific localStorage items
    }
    toasts.success("All app data has been cleared!");
    console.log("All app data cleared.");
  } catch (error) {
    console.error("Error clearing app data:", error);
    toasts.error("Failed to clear all data. See console.");
  }
}