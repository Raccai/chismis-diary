import { createPersistentStore } from './persistentStore.js';

// Define the default state for our settings
const initialSettings = {
  notifications: {
    enabled: false,
    time: '20:00' // Default to 8:00 PM
  }
};

// Create a persistent store with a unique key and the initial state
export const settingsStore = createPersistentStore('chismis-diary-settings', initialSettings);