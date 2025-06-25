import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// WARNING: For demonstration only. In a real app, use a secure storage plugin
// like 'capacitor-secure-storage-plugin' to store the PIN.
const PIN_STORAGE_KEY = 'user_app_pin';
const BIOMETRICS_ENABLED_KEY = 'user_biometrics_enabled';

function createAuthStore() {
  const { subscribe, update, set } = writable({
    isLocked: true, // Start the app in a locked state by default
    isBiometricsEnabled: false,
    hasPinSetup: false,
  });

  // Method to run on app startup
  function initialize() {
    if (!browser) return;

    const biometricsEnabled = localStorage.getItem(BIOMETRICS_ENABLED_KEY) === 'true';
    const pinIsSet = !!localStorage.getItem(PIN_STORAGE_KEY);
    
    update(store => ({
        ...store,
        isBiometricsEnabled: biometricsEnabled,
        hasPinSetup: pinIsSet,
        // The app is only locked if the user has actually set up a PIN/biometrics
        isLocked: pinIsSet 
    }));
  }

  function unlockApp() {
    update(store => ({ ...store, isLocked: false }));
  }
  
  function lockApp() {
    // Only lock if they have security set up
    if (localStorage.getItem(PIN_STORAGE_KEY)) {
        update(store => ({ ...store, isLocked: true }));
    }
  }
  
  // --- PIN and Biometrics Management ---
  
  function setPin(pin) {
    if (!browser) return;
    localStorage.setItem(PIN_STORAGE_KEY, pin); // Insecure, for demo only!
    update(store => ({ ...store, hasPinSetup: true }));
  }

  function checkPin(pin) {
    if (!browser) return false;
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    return pin === storedPin;
  }
  
  function enableBiometrics() {
      if (!browser) return;
      localStorage.setItem(BIOMETRICS_ENABLED_KEY, 'true');
      update(store => ({...store, isBiometricsEnabled: true }));
  }


  return {
    subscribe,
    initialize,
    unlockApp,
    lockApp,
    setPin,
    checkPin,
    enableBiometrics
  };
}

export const authStore = createAuthStore();