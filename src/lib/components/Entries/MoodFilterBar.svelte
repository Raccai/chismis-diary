<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { createEventDispatcher } from 'svelte';
  import MoodChip from '$lib/components/MoodChip.svelte';

  export let currentFilter = null; // The currently active mood filter value

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
</div>

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
    background-color: var(--filterbar-bg); /* Slightly different from sheet for contrast if needed */
    /* border-bottom: 1px solid var(--border-secondary, #333); */ /* Subtle separator */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  }
  
  .mood-chips-scroll-wrapper {
    margin-left: -1rem;
    margin-right: -1rem;
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
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.04rem;
  }
  .chip:hover {
    border-color: var(--text-accent-hover, #d6d6d6);
    background-color: var(--bg-interactive-hover, #444);
  }
  .chip:active { /* Pressed state */
    transform: scale(0.97);
  }
  .chip.active {
    background-color: var(--text-primary, var(--primary));
    color: var(--text-on-accent, #fff);
    border-color: var(--text-primary);
  }
</style>