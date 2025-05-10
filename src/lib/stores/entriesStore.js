import { writable } from 'svelte/store';

let initial = [];

if (typeof localStorage !== 'undefined') {
  const stored = localStorage.getItem("entries");
  initial = stored ? JSON.parse(stored) : [];
}

export const entriesStore = writable(initial);

// Save to localStorage only in the browser
if (typeof localStorage !== 'undefined') {
  entriesStore.subscribe(value => {
    localStorage.setItem("entries", JSON.stringify(value));
  });
}