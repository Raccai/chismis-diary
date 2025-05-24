<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let currentSort = 'date_desc'; // currentSortKey from parent

  const dispatch = createEventDispatcher();

  const sortActions = [
    { label: 'Newest First', value: 'date_desc', icon: '📅⬇️' },
    { label: 'Oldest First', value: 'date_asc', icon: '📅⬆️' },
    { label: 'Reset Sort', value: 'none', icon: '🔄' }
  ];

  function selectAction(value) {
    dispatch('select', { value: value }); // Dispatch an object with value
    // Parent (MoodFilterBar) will handle closing
  }

  function closeDropdown() {
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

<div class="custom-dropdown-content sort-options-dropdown" role="listbox" aria-label="Select Sort Order">
  {#each sortActions as action (action.value)}
    <button
      class="dropdown-option"
      class:active={currentSort === action.value && action.value !== 'none'}
      on:click={() => selectAction(action.value)}
      aria-pressed={currentSort === action.value && action.value !== 'none'}
    >
      <span class="option-icon">{action.icon}</span>
      <span class="option-label">{action.label}</span>
      {#if currentSort === action.value && action.value !== 'none'}
        <span class="checkmark">✓</span>
      {/if}
    </button>
  {/each}
  <!-- <button class="dropdown-close-button" on:click={closeDropdown}>Close</button> -->
</div>

<style>
  /* Re-use styles from MoodSelectDropdown or define them here if they differ significantly */
  .custom-dropdown-content {
    background-color: var(--dropdown-bg-color);
    border-radius: 12px; /* Rounded corners for dropdown */
    box-shadow: var(--bw-shadow-color-medium);
    min-width: 160px; /* Ensure it's not too narrow */
    max-height: 180px; /* Allow scrolling for many moods */
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
    color: var(--dropdown-text-color);
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
    width: 24px;
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
</style>