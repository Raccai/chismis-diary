import { createPersistentStore } from './persistentStore.js';

// The initial state is an empty draft.
const initialDraft = {
  title: '',
  text: '',
  mood: 'happy', // A sensible default
  tags: [],
  hasDraft: false // A flag to quickly check if a draft exists
};

// Create a persistent store with a unique key.
export const draftStore = createPersistentStore('chismis-diary-unsaved-draft', initialDraft);

// Clears the saved draft from localStorage.
export function clearDraft() {
  draftStore.set(initialDraft);
}