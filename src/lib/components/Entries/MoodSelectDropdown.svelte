<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { moodStore } from '$lib/stores/moodStore.js'; // To get mood options

  export let currentMood = null; // The currently selected mood value

  const dispatch = createEventDispatcher();

  function selectMood(moodValue) {
    dispatch('select', { value: moodValue }); // Dispatch an object with value property
    // Parent (MoodFilterBar) will handle closing
  }

  function closeDropdown() {
    dispatch('close');
  }

  // Handle Escape key to close
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
    >
      <span class="option-icon">{moodOption.emoji}</span>
      <span class="option-label">{moodOption.label}</span>
      {#if currentMood === moodOption.value}
        <span class="checkmark">✓</span>
      {/if}
    </button>
  {/each}
  <!-- <button class="dropdown-close-button" on:click={closeDropdown}>Close</button> -->
</div>

<style>
  .custom-dropdown-content {
    background-color: var(--dropdown-bg-color);
    border: 2px solid var(--dropdown-border-color);
    border-radius: 12px; /* Rounded corners for dropdown */
    box-shadow: 0 4px 4px var(--dropdown-shadow, rgba(0,0,0,0.4));
    min-width: 200px; /* Ensure it's not too narrow */
    max-height: 250px; /* Allow scrolling for many moods */
    overflow-y: auto;
  }

  .dropdown-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem; /* Padding for each option */
    text-align: left;
    background-color: transparent;
    border: none;
    color: var(--main-bg);
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.2rem;
    letter-spacing: 0.08rem;
  }
  .dropdown-option:hover {
    background-color: var(--dropdown-select-color);
  }
  .dropdown-option.active {
    background-color: var(--dropdown-select-color);
    font-weight: 500;
  }

  .option-icon {
    margin-right: 0.75rem;
    font-size: 1.1em;
    width: 24px; /* Align icons */
    text-align: center;
  }
  .option-label {
    flex-grow: 1;
  }
  .checkmark {
    background-color: var(--dropdown-select-color);
    margin-left: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
  }

  .dropdown-close-button { /* If you want an explicit close button inside */
    display: block;
    width: calc(100% - 2rem); /* Full width minus padding */
    margin: 0.75rem auto 0.25rem auto;
    padding: 0.6rem;
    background-color: var(--bw-button-secondary-bg, #eff1f3);
    color: var(--bw-button-secondary-text, #1c1c1e);
    border: 1px solid var(--bw-button-secondary-border, #d1d5db);
    border-radius: 8px;
    font-weight: 500;
  }
</style>