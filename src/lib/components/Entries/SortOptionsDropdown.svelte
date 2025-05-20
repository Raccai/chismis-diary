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
    background-color: var(--bw-bg-primary, #ffffff);
    border: 1px solid var(--bw-border-primary, #d1d5db);
    border-radius: 12px;
    box-shadow: 0 5px 15px var(--bw-shadow-color-medium, rgba(0,0,0,0.1));
    padding: 0.5rem 0;
    min-width: 220px; /* Wider for sort options */
    max-height: 250px;
    overflow-y: auto;
  }

  .dropdown-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background-color: transparent;
    border: none;
    color: var(--bw-text-primary, #1c1c1e);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  .dropdown-option:hover {
    background-color: var(--bw-bg-tertiary, #eff1f3);
  }
  .dropdown-option.active {
    color: var(--bw-accent-pink, #ff69b4);
    font-weight: 500;
  }
  .dropdown-option.active .option-icon {
    /* color: var(--bw-accent-pink, #ff69b4); */ /* Emoji color doesn't easily change */
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
    color: var(--bw-accent-pink, #ff69b4);
    margin-left: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
  }
</style>