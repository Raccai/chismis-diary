import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const ENTRIES_FILE_NAME = 'chismisEntries.json';

const isCapacitor = () => Capacitor.isNativePlatform();

export async function loadEntries() {
  if (isCapacitor()) {
    try {
      const readFileResult = await Filesystem.readFile({
        path: ENTRIES_FILE_NAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return JSON.parse(readFileResult.data);
    } catch (e) {
      console.warn('Capacitor: Could not read entries file, returning empty array.', e);
      return [];
    }
  } else {
    const stored = localStorage.getItem("entries");
    console.log("Web: Loaded entries from LocalStorage");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveEntries(entries) {
  if (isCapacitor()) {
    try {
      await Filesystem.writeFile({
        path: ENTRIES_FILE_NAME,
        data: JSON.stringify(entries, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true
      });
      console.log('Capacitor: Entries saved to filesystem.');
    } catch (e) {
      console.error('Capacitor: Error saving entries to filesystem', e);
    }
  } else {
    try {
      localStorage.setItem("entries", JSON.stringify(entries));
      console.log("Web: Entries saved to LocalStorage");
    } catch (e) {
      console.error("Web: Error saving to LocalStorage (possibly full).", e);
    }
  }
}