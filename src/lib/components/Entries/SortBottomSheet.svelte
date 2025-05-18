<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  export let show = false;
  export let currentSortKey = 'date_desc'; // e.g., 'date_desc', 'date_asc'

  const dispatch = createEventDispatcher();

  const sortOptions = [
    { label: 'Newest First', value: 'date_desc', icon: '📅⬇️' }, // Simple emoji icons
    { label: 'Oldest First', value: 'date_asc', icon: '📅⬆️' },
    // Add more sort options here if needed
    // { label: 'By Mood (A-Z)', value: 'mood_asc', icon: '😊⬆️' },
  ];

  function selectOption(value) {
    dispatch('sortChange', value);
    close(); // Close after selection
  }

  function close() {
    dispatch('close');
  }

  // Handle Escape key to close
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if show}
  <div
    class="bottom-sheet-overlay"
    on:click={close}
    transition:fade={{ duration: 200 }}
    role="button"
    tabindex="-1"
    aria-label="Close sort options"
  />

  <div
    class="bottom-sheet-content"
    transition:fly={{ y: 200, duration: 300, opacity: 0.5 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="sort-sheet-title"
  >
    <h3 id="sort-sheet-title" class="sheet-title">Sort By</h3>
    <ul class="sort-options-list">
      {#each sortOptions as option (option.value)}
        <li>
          <button
            class="sort-option-button"
            class:active={currentSortKey === option.value}
            on:click={() => selectOption(option.value)}
            aria-pressed={currentSortKey === option.value}
          >
            <span class="option-icon">{option.icon}</span>
            <span class="option-label">{option.label}</span>
            {#if currentSortKey === option.value}
              <span class="checkmark" aria-hidden="true">✓</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
    <button class="close-button" on:click={close} aria-label="Close sort options panel">
      Close
    </button>
  </div>
{/if}

<style>
  .bottom-sheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
  }

  .bottom-sheet-content {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-secondary, #2a2a2a); /* Darker background for sheet */
    color: var(--text-primary, #e0e0e0);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding: 1.5rem 1rem 1rem;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    max-height: 70vh; /* Max height */
    overflow-y: auto;
  }

  .sheet-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    color: var(--text-primary, #f0f0f0);
    text-align: center;
  }

  .sort-options-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }

  .sort-option-button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.9rem 1rem;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--border-secondary, #444);
    color: var(--text-secondary, #b0b0b0);
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .sort-options-list li:last-child .sort-option-button {
    border-bottom: none;
  }

  .sort-option-button:hover {
    background-color: var(--bg-interactive-hover, #3a3a3a);
    color: var(--text-accent, #60a5fa);
  }

  .sort-option-button.active {
    color: var(--text-accent, #60a5fa);
    font-weight: 600;
  }

  .option-icon {
    margin-right: 0.75rem;
    font-size: 1.1rem;
  }
  .option-label {
    flex-grow: 1;
  }
  .checkmark {
    color: var(--text-accent, #60a5fa);
    font-size: 1.1rem;
  }


  .close-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--bg-interactive, #4f4f4f);
    color: var(--text-primary, #e0e0e0);
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 0.5rem; /* Space above close button */
    align-self: center;
  }

  .close-button:hover {
    background-color: var(--bg-interactive-hover, #5a5a5a);
  }
</style>