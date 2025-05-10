<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  
  export let entry;
  const dispatch = createEventDispatcher();

  // Find the mood label and emoji
  const moodData = get(moodStore).find(m => m.value === entry.mood) || { label: entry.mood, emoji: '' };

  function handleDelete() {
    if (confirm('Burahin ang tsismis na ito?')) {
      dispatch("delete", entry.id);
    }
  }

  function handleEdit() {
    dispatch("edit", entry);
  }
</script>

<article class="entry-card">
  <header>
    <span class="mood">{moodData.emoji} {moodData.label}</span>
    <time>{new Date(entry.date).toLocaleString()}</time>
  </header>

  <p class="entry-text">{entry.text}</p>

  <footer>
    <button class="edit" on:click={handleEdit}>Edit</button>
    <button class="delete" on:click={handleDelete}>Delete</button>
  </footer>
</article>

<style>
  .entry-card {
    background: #fff8ec;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  header {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .mood {
    font-weight: bold;
  }

  .entry-text {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  footer {
    text-align: right;
  }

  button.delete {
    background: #ffdddd;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  button.delete:hover {
    background: #ffcccc;
  }

  button.edit {
    background: #d2ff8a;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  button.edit:hover {
    background: #c9f360;
  }
</style>