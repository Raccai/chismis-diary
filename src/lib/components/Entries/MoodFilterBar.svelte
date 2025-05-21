<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { moodStore } from '$lib/stores/moodStore.js';

  // Import the new dropdown components
  import MoodSelectDropdown from './MoodSelectDropdown.svelte';
  import SortOptionsDropdown from './SortOptionsDropdown.svelte';

  export let currentMoodFilter = null;
  export let currentSortKey = 'date_desc';
  export let isSearchActive = false;

  const dispatch = createEventDispatcher();

  let showMoodDropdown = false;
  let showSortDropdown = false;

  // DOM element references for positioning dropdowns
  let moodTriggerButton;
  let sortTriggerButton;

  function toggleMoodDropdown() {
    showSortDropdown = false; // Close other dropdown
    if (isSearchActive && !showMoodDropdown) {
      dispatch('toggleSearch');
    }
    showMoodDropdown = !showMoodDropdown;
  }

  function toggleSortDropdown() {
    showMoodDropdown = false; 
    if (isSearchActive && !showSortDropdown) {
        dispatch('toggleSearch'); 
    }
    showSortDropdown = !showSortDropdown;
  }

  function toggleSearchInterface() {
    showMoodDropdown = false;
    showSortDropdown = false;
    dispatch('toggleSearch'); // Parent page handles actual search bar
  }

  function handleMoodSelected(event) {
    dispatch('filter', event.detail.value); // event.detail should be the mood value
    showMoodDropdown = false;
  }

  function handleSortSelected(event) {
    dispatch('sort', event.detail.value); // event.detail should be the sort key
    showSortDropdown = false;
  }

  // Close dropdowns if clicked outside
  function handleClickOutside(event) {
    if (showMoodDropdown && moodTriggerButton && !moodTriggerButton.contains(event.target)) {
        // Check if click is also outside the dropdown content itself
        const moodDropdownElement = document.querySelector('.mood-dropdown-positioner .custom-dropdown-content');
        if (moodDropdownElement && !moodDropdownElement.contains(event.target)) {
            showMoodDropdown = false;
        }
    }
    if (showSortDropdown && sortTriggerButton && !sortTriggerButton.contains(event.target)) {
        const sortDropdownElement = document.querySelector('.sort-dropdown-positioner .custom-dropdown-content');
        if (sortDropdownElement && !sortDropdownElement.contains(event.target)) {
            showSortDropdown = false;
        }
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, true); // Use capture phase
  });
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside, true);
  });


  $: moodFilterText = currentMoodFilter ? ($moodStore.find(m=>m.value === currentMoodFilter)?.label || 'Filtered') : 'Filter Mood';
  $: sortText = currentSortKey === 'date_desc' ? 'Newest' : (currentSortKey === 'date_asc' ? 'Oldest' : (currentSortKey === 'none' ? 'Default Order' : 'Sort By'));

</script>

<div class="filter-trigger-bar">
  <div class="trigger-button-wrapper" bind:this={moodTriggerButton}>
    <button
      class="filter-trigger-button mood-trigger"
      class:active={showMoodDropdown || currentMoodFilter}
      on:click={toggleMoodDropdown}
      aria-expanded={showMoodDropdown}
      aria-haspopup="listbox"
      aria-controls="mood-dropdown-list"
    >
      <span class="button-icon">🎨</span>
      <span class="button-text">{moodFilterText}</span>
      <span class="dropdown-arrow">{showMoodDropdown ? '▲' : '▼'}</span>
    </button>
    {#if showMoodDropdown}
      <div class="dropdown-positioner mood-dropdown-positioner"
           in:fade="{{duration:100}}" out:fade="{{duration:100}}">
        <MoodSelectDropdown
          currentMood={currentMoodFilter}
          on:select={handleMoodSelected}
          on:close={toggleMoodDropdown}
          id="mood-dropdown-list"
        />
      </div>
    {/if}
  </div>

  <div class="trigger-button-wrapper" bind:this={sortTriggerButton}>
    <button
      class="filter-trigger-button sort-trigger"
      class:active={showSortDropdown}
      on:click={toggleSortDropdown}
      aria-expanded={showSortDropdown}
      aria-haspopup="listbox"
      aria-controls="sort-dropdown-list"
    >
      <span class="button-icon">⇅</span>
      <span class="button-text">{sortText}</span>
      <span class="dropdown-arrow">{showSortDropdown ? '▲' : '▼'}</span>
    </button>
    {#if showSortDropdown}
      <div class="dropdown-positioner sort-dropdown-positioner"
            in:fade="{{duration:100}}" out:fade="{{duration:100}}">
        <SortOptionsDropdown
          currentSort={currentSortKey}
          on:select={handleSortSelected}
          on:close={toggleSortDropdown}
          id="sort-dropdown-list"
        />
      </div>
    {/if}
  </div>

  <button
    class="filter-trigger-button search-trigger"
    class:active={isSearchActive}
    on:click={toggleSearchInterface}
    aria-expanded={isSearchActive}
  >
    <span class="button-icon">🔍</span>
  </button>
</div>

<style>
  .filter-trigger-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
    width: 100%;
    align-items: center;
    position: relative; /* For dropdown positioning context if needed */
    border-bottom: 4px solid var(--card-border);
  }

  .trigger-button-wrapper {
    position: relative; /* Each button wrapper is a positioning context for its dropdown */
    flex: 1; /* Make them take equal space */
  }

  .filter-trigger-button {
    width: 100%; /* Make button fill its wrapper */
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Align content to start */
    padding: 0.6rem 0.8rem;
    background-color: var(--card-border, #f7f8fa);
    color: var(--card-bg, #5f6368);
    border-radius: 20px;
    font-family: 'Urbanist', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.08rem;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
    text-align: left;
    white-space: nowrap;
  }

  .filter-trigger-button:hover {
    border-color: var(--card-select-color);
    color: var(--dropdown-text-color);
  }

  .filter-trigger-button.active {
    background-color: var(--card-select-bg);
    color: var(--card-select-text);
    border-color: var(--card-select-text);
  }

  .button-icon { margin-right: 0.4rem; font-size: 0.9rem; }
  .button-text { flex-grow: 1; overflow: hidden; text-overflow: ellipsis;}
  .dropdown-arrow { margin-left: auto; font-size: 0.7rem; padding-left: 0.4rem; }


  /* Dropdown Positioning */
  .dropdown-positioner {
    position: absolute;
    top: calc(100% + 4px); /* Position below the trigger button with a small gap */
    left: 0;
    z-index: 1000; /* Ensure dropdowns are above other content */
    min-width: 100%; /* At least as wide as the button */
    /* For centering dropdown if it's wider or narrower than button:
       left: 50%;
       transform: translateX(-50%);
    */
  }
  .sort-dropdown-positioner {
      /* If sort dropdown needs to align right, for example */
      /* left: auto; right: 0; */
  }

  .search-trigger {
    display: flex;
    justify-content: center;
  }

  .search-trigger span {
    margin-right: -0.02rem;
  }
</style>