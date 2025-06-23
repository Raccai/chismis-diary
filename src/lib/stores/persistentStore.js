// src/lib/persistentStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function createPersistentStore(key, startValue) {
  const isBrowser = browser; // Cache browser value for module scope
  let initialValue = JSON.parse(JSON.stringify(startValue)); // Deep copy of startValue

  if (isBrowser) {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue !== null && storedValue !== undefined) { // Check for existence explicitly
      try {
        initialValue = JSON.parse(storedValue);
      } catch (error) {
        console.warn(
          `PersistentStore: Error parsing localStorage key "${key}". Value: "${storedValue}". Falling back to default.`,
          error
        );
        // If parsing fails, save the default value back to localStorage to fix corruption
        window.localStorage.setItem(key, JSON.stringify(initialValue)); 
      }
    } else {
      // No value in localStorage, so save the initial startValue
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }

  const store = writable(initialValue);

  if (isBrowser) {
    store.subscribe(currentValue => {
      // currentValue here is the new value after a .set or .update
      window.localStorage.setItem(key, JSON.stringify(currentValue));
    });
  }

  // Expose a custom set and update that ensure deep cloning for objects/arrays
  // to promote better immutability if the store holds complex data.
  // For simple booleans/strings/numbers, this is overkill.
  // For your settings object, it's good practice.
  const set = (newValue) => {
    store.set(JSON.parse(JSON.stringify(newValue)));
  };

  const update = (updaterFn) => {
    store.update(currentValue => {
      // Create a deep copy before passing to updater to prevent direct mutation of current store state
      const currentCopy = JSON.parse(JSON.stringify(currentValue));
      const newValue = updaterFn(currentCopy);
      // Ensure the updater returns a new object, or deep copy its result
      return JSON.parse(JSON.stringify(newValue));
    });
  };

  return {
    subscribe: store.subscribe,
    set, // Use this custom set
    update // Use this custom update
    // Or just return store if you trust all .set/.update calls will handle immutability
  };
  // For simplicity and if your settings object is always replaced fully with .set(),
  // just returning `store` is often fine:
  // return store; 
}