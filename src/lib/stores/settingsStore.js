import { createPersistentStore } from './persistentStore.js';

const defaultSettings = {
    notificationsEnabled: false,
    notificationTime: '20:00'
};

export const settingsStore = createPersistentStore('chismis_settings', defaultSettings);