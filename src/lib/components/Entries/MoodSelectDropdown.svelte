<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { moodStore } from '$lib/stores/moodStore.js';

  export let currentMood = null; // This prop determines the selection
  const dispatch = createEventDispatcher();

  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }

  function selectMood(moodValue) {
    dispatch('select', { value: moodValue }); // Parent handles this
  }

  function closeDropdown() { // Called by parent or Escape key
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  }

  onMount(() => window.addEventListener('keydown', handleKeydown));
  onDestroy(() => window.removeEventListener('keydown', handleKeydown));
</script>

<div class="custom-dropdown-content mood-select-dropdown" role="listbox" aria-label="Select Mood">
  <button
    class="dropdown-option"
    class:active={currentMood === null}
    on:click={() => selectMood(null)}
    aria-pressed={currentMood === null}
  >
    <span class="option-icon">🌐</span>
    <span class="option-label">All Moods</span>
    {#if currentMood === null}
      <span class="checkmark">✓</span>
    {/if}
  </button>

  {#each $moodStore as moodOption (moodOption.value)}
    <button
      class="dropdown-option"
      class:active={currentMood === moodOption.value} 
      on:click={() => selectMood(moodOption.value)}
      aria-pressed={currentMood === moodOption.value}
    >
      {#if isEmojiImage(moodOption.emoji)}
        <img src={moodOption.emoji} alt={moodOption.label} class="selected-mood-emoji-img">
      {:else}
        <span class="option-emoji">{moodOption.emoji}</span>
      {/if}

      <span class="option-label">{moodOption.label}</span>
      {#if currentMood === moodOption.value} <!-- Checkmark based on prop -->
        <span class="checkmark">✓</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .custom-dropdown-content {
    background-color: var(--dropdown-bg-color, var(--bw-bg-primary, #ffffff));
    border-radius: 12px;
    box-shadow: var(--dropdown-shadow, 0 5px 15px rgba(0,0,0,0.1));
    min-width: 200px;
    max-height: 250px;
    overflow-y: auto;
    padding: 0.5rem 0;
    border: 1px solid var(--dropdown-border-color, var(--bw-border-primary));
  }
  .dropdown-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background-color: transparent;
    border: none;
    color: var(--dropdown-text-color, var(--bw-text-primary));
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1rem; /* Adjusted for BWP theme */
    letter-spacing: 0.05rem;
  }
  .dropdown-option:hover {
    background-color: var(--dropdown-hover-bg-color, var(--bw-bg-tertiary, #eff1f3));
  }
  .dropdown-option.active { /* Style for the selected item */
    background-color: var(--dropdown-select-bg-color, var(--bw-accent-pink-subtle-bg));
    color: var(--dropdown-select-text-color, var(--bw-accent-pink));
    font-weight: 500;
  }
  .option-icon {
    margin-right: 0.75rem;
    font-size: 1.2em; /* Consistent emoji size */
    width: 24px;
    text-align: center;
  }
  .option-emoji { /* Class for text emojis in the list */
    font-size: 1.2em;
    margin-right: 0.75rem;
    width: 24px;
    text-align: center;
  }
  .selected-mood-emoji-img { /* For image emojis */
    width: 24px; /* Consistent size with text emojis */
    height: 24px;
    margin-right: 0.75rem;
    object-fit: contain;
  }
  .option-label {
    flex-grow: 1;
  }
  .checkmark {
    color: var(--dropdown-select-text-color, var(--bw-accent-pink));
    margin-left: auto; /* Push checkmark to the right */
    font-size: 1rem;
    font-weight: bold;
    padding-left: 0.5rem;
  }
</style>