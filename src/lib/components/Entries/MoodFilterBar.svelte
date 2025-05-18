<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { createEventDispatcher } from 'svelte';
  import MoodChip from '$lib/components/MoodChip.svelte';
  import SortBottomSheet from '$lib/components/Entries/SortBottomSheet.svelte'; // Import the new component

  export let currentFilter = null; // The currently active mood filter value
  export let currentSort = 'date_desc'; // Default sort option, e.g., 'date_desc'

  const dispatch = createEventDispatcher();
  let showSortSheet = false;

  function handleMoodSelect(moodValue) {
    if (currentFilter === moodValue) {
      dispatch('filter', null); // Deselect if already selected
    } else {
      dispatch('filter', moodValue);
    }
  }

  function toggleSortSheet() {
    showSortSheet = !showSortSheet;
  }

  function handleSortChange(event) {
    const newSortValue = event.detail;
    // currentSort = newSortValue; // Parent will manage this prop
    dispatch('sort', newSortValue);
    showSortSheet = false; // Close sheet after selection
  }
</script>

<div class="filter-bar-container">
  <div class="mood-chips-scroll-wrapper">
    <!-- "All" Chip -->
    <button
      class="chip all-chip"
      class:active={currentFilter === null}
      on:click={() => handleMoodSelect(null)}
      aria-pressed={currentFilter === null}
    >
      All Moods
    </button>

    {#each $moodStore as moodOption (moodOption.value)}
      <MoodChip
        {moodOption}
        isSelected={moodOption.value === currentFilter}
        on:select={() => handleMoodSelect(moodOption.value)}
      />
    {/each}
  </div>

  <!-- Sort Button -->
  <button
    class="sort-toggle-button"
    class:active={showSortSheet}
    on:click={toggleSortSheet}
    aria-label="Open sort options"
    aria-expanded={showSortSheet}
    aria-controls="sort-sheet-content"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
      <path d="M3 4H21V6H3V4ZM3 11H15V13H3V11ZM3 18H9V20H3V18Z"></path> <!-- Simple sort/filter list icon -->
    </svg>
  </button>
</div>

{#if showSortSheet}
  <SortBottomSheet
    bind:show={showSortSheet}
    currentSortKey={currentSort}
    on:sortChange={handleSortChange}
    on:close={() => showSortSheet = false}
  />
{/if}

<style>
  .filter-bar-container {
    height: 60px;
    position: fixed;
    width: 100%;
    margin-left: -20px;
    display: flex;
    align-items: center;
    gap: 0.75rem; /* Spacing between chip scroll area and sort button */
    padding: 0.75rem 1rem; /* More balanced padding */
    background-color: var(--bg-primary, #1e1e1e); /* Slightly different from sheet for contrast if needed */
    /* border-bottom: 1px solid var(--border-secondary, #333); */ /* Subtle separator */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  }
  
  .mood-chips-scroll-wrapper {
    margin-left: -1rem;
    padding-left: 1rem;
    flex-grow: 1;
    display: flex;
    overflow-x: auto;
    /* padding: 0.5rem 0.1rem; */ /* Removed, handled by container */
    gap: 0.2rem; /* Spacing between chips */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    scrollbar-width: none; /* Firefox */
  }
  .mood-chips-scroll-wrapper::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }

  /* Style for the "All" chip and general chip baseline if MoodChip doesn't fully cover */
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 16px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
  }
  .chip:hover {
    border-color: var(--text-accent-hover, #7bb4fa);
    background-color: var(--bg-interactive-hover, #444);
  }
  .chip:active { /* Pressed state */
    transform: scale(0.97);
  }
  .chip.active {
    background-color: var(--text-accent, #60a5fa);
    color: var(--text-on-accent, #fff);
    border-color: var(--text-accent, #60a5fa);
    font-weight: 600;
  }

  /* Style for the Sort toggle button */
  .sort-toggle-button {
    position: relative;
    flex-shrink: 0;
    background: transparent;
    border: 1px solid var(--border-primary, #555);
    border-radius: 50%; /* Circle */
    width: 40px; /* Slightly larger */
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary, #ccc);
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, transform 0.1s ease;
  }
  .sort-toggle-button:hover {
    background-color: var(--bg-interactive-hover, #444);
    color: var(--text-accent, #60a5fa);
    border-color: var(--text-accent-hover, #7bb4fa);
  }
  .sort-toggle-button.active, /* When sheet is open */
  .sort-toggle-button:active /* When button is pressed */
  {
    background-color: var(--bg-accent-translucent, rgba(96, 165, 250, 0.2)); /* Subtle active state */
    color: var(--text-accent, #60a5fa);
    border-color: var(--text-accent, #60a5fa);
  }
  .sort-toggle-button:active {
     transform: scale(0.95);
  }
</style>