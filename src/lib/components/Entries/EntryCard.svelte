<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';

  export let entry;
  const dispatch = createEventDispatcher();

  function deriveMoodDetails(currentMoodValue, storeData) {
    if (!currentMoodValue || !storeData) {
      return { label: currentMoodValue || 'Unknown', emoji: '😐' };
    }
    const item = storeData.find(m => m.value === currentMoodValue);
    return {
      label: item ? item.label : (currentMoodValue || 'Unknown'),
      emoji: item ? item.emoji : '😐'
    };
  }

  $: moodDetails = deriveMoodDetails(entry.mood, get(moodStore));

  function formatDate(dateInput) {
    if (!dateInput) return 'No date';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function handleDelete() {
    if (confirm('Burahin ang tsismis na ito?')) {
      dispatch("delete", entry.id);
    }
  }

  function handleEdit() {
    dispatch("edit", entry);
  }

  $: displayTags = entry.tags && Array.isArray(entry.tags) ? entry.tags.slice(0, 3) : [];
</script>

<article class="entry-card">
  <div class="card-header">
    <div class="mood-chip-large">
      <span class="emoji">{moodDetails.emoji}</span>
      <span class="label">{moodDetails.label}</span>
    </div>
    <time class="date-display">{formatDate(entry.date)}</time>
  </div>

  <h2 class="entry-title">{entry.title || "Untitled Chismis"}</h2>

  {#if entry.text}
    <p class="entry-text-body">{entry.text}</p>
  {/if}

  {#if displayTags.length > 0}
    <div class="tag-chips-container">
      {#each displayTags as tag (tag)}
        <span class="tag-chip">{tag}</span>
      {/each}
    </div>
  {/if}

  <footer class="card-actions">
    <button class="action-button edit" on:click={handleEdit}>Edit</button>
    <button class="action-button delete" on:click={handleDelete}>Delete</button>
  </footer>
</article>

<style>
  .entry-card {
    background: white; /* Cleaner background */
    padding: 1.25rem; /* Slightly more padding */
    margin: 1rem 0;
    border-radius: 12px; /* More rounded corners */
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Softer, more modern shadow */
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Space between elements */
    border: 1px solid #e5e7eb; /* Subtle border */
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Vertically align mood and date */
    margin-bottom: 0.25rem;
  }

  .mood-chip-large {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #f3f4f6; /* Light gray */
    border-radius: 20px; /* Pill shape */
    font-weight: 500;
    color: #374151; /* Darker gray text */
  }
  .mood-chip-large .emoji {
    font-size: 1.5em; /* Larger emoji */
    margin-right: 0.5rem;
    line-height: 1;
  }
  .mood-chip-large .label {
    font-size: 0.9rem;
  }

  .date-display {
    font-size: 0.8rem;
    color: #6b7280; /* Medium gray */
    font-style: italic;
  }

  .entry-title {
    font-size: 1.3rem; /* Larger title */
    font-weight: 600; /* Bolder title */
    color: #1f2937; /* Very dark gray / near black */
    margin: 0; /* Remove default margin */
    line-height: 1.3;

    /* Truncation for title */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Single line for title */
  }

  .entry-text-body {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #4b5563; /* Dark gray text */
    margin: 0;

    /* Multi-line truncation for body */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* Show 3 lines */
    line-clamp: 3; /* Standard property */
    -webkit-box-orient: vertical;
  }

  .tag-chips-container {
    display: flex;
    flex-wrap: wrap; /* Allow tags to wrap if many */
    gap: 0.4rem; /* Space between tag chips */
    margin-top: 0.25rem;
  }

  .tag-chip {
    display: inline-block;
    background-color: #e0e7ff; /* Lighter indigo */
    color: #3730a3; /* Darker indigo */
    padding: 0.25rem 0.6rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .card-actions {
    margin-top: 0.5rem; /* Bring actions closer if content is short */
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 0.5rem; /* Space between buttons */
  }

  .action-button {
    border: 1px solid transparent;
    padding: 0.5rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  }

  .action-button.edit {
    background-color: #e0f2fe; /* Light blue */
    color: #0ea5e9; /* Blue text */
    border-color: #bae6fd;
  }
  .action-button.edit:hover {
    background-color: #bae6fd;
  }

  .action-button.delete {
    background-color: #fee2e2; /* Light red */
    color: #ef4444; /* Red text */
    border-color: #fecaca;
  }
  .action-button.delete:hover {
    background-color: #fecaca;
  }
</style>