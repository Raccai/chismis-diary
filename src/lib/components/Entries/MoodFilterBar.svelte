<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { createEventDispatcher } from 'svelte';
  import MoodChip from '$lib/components/MoodChip.svelte'; // Assuming MoodChip is reusable

  export let currentFilter = null; // The currently active mood filter value
  export let showSearch = false; // To style search button if needed

  const dispatch = createEventDispatcher();

  function handleMoodSelect(moodValue) {
    if (currentFilter === moodValue) {
      dispatch('filter', null); // Deselect if already selected
    } else {
      dispatch('filter', moodValue);
    }
  }

  function toggleSearch() {
    dispatch('toggleSearch');
  }
</script>

<div class="filter-bar-container">
  <div class="mood-chips-scroll-wrapper">
    <!-- "All" Chip -->
    <button
      class="chip all-chip"
      class:active={currentFilter === null}
      on:click={() => handleMoodSelect(null)}
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

  <button class="search-toggle-button" on:click={toggleSearch} aria-label="Toggle search bar">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
    </svg>
  </button>
</div>

<style>
  .filter-bar-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0; /* Adjust padding as needed based on page layout */
    /* background-color: var(--bg-tertiary); /* Optional background */
    /* border-bottom: 1px solid var(--border-secondary); */
  }

  .mood-chips-scroll-wrapper {
    flex-grow: 1; /* Takes up most space */
    display: flex;
    overflow-x: auto;
    padding: 0.5rem 0.1rem;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  /* Hide scrollbar */
  .mood-chips-scroll-wrapper::-webkit-scrollbar { display: none; }
  .mood-chips-scroll-wrapper { -ms-overflow-style: none; scrollbar-width: none; }

  /* Style for the "All" chip */
  .chip { /* Generic chip styles if MoodChip doesn't cover it */
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    margin-right: 0.5rem;
    border-radius: 16px;
    border: 1px solid var(--border-primary);
    background-color: var(--bg-interactive);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    white-space: nowrap;
  }
  .chip:hover {
    border-color: var(--text-accent);
  }
  .chip.active {
    background-color: var(--text-accent);
    color: var(--text-on-accent);
    border-color: var(--text-accent);
    font-weight: 500;
  }

  .all-chip { /* Specifics if needed */
    font-weight: 500;
  }

  /* Style for the search toggle button */
  .search-toggle-button {
    flex-shrink: 0; /* Don't shrink */
    background: none;
    border: 1px solid var(--border-primary);
    border-radius: 50%; /* Circle */
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  }
  .search-toggle-button:hover {
    background-color: var(--bg-interactive-hover);
    color: var(--text-accent);
    border-color: var(--text-accent);
  }
</style>