import { writable } from 'svelte/store';

const TOAST_DEFAULT_DURATION = 3000; // 3 seconds

function createToastStore() {
  const { subscribe, update } = writable([]); // Array of toast objects

  function addToast(message, type = 'info', duration = TOAST_DEFAULT_DURATION) {
    const id = crypto.randomUUID(); // Unique ID for each toast
    const newToast = { id, message, type, duration };

    update(toasts => [...toasts, newToast]);

    // Automatically remove the toast after its duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    show: addToast, // Shortcut for info toasts
    info: (message, duration) => addToast(message, 'info', duration),
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    remove: removeToast
  };
}

export const toasts = createToastStore();