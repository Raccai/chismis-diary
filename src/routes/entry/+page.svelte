<script>
    import { entriesStore } from "$lib/stores/entriesStore.js";
    import { deleteEntry } from "$lib/utils/entryHelpers";
    import EntryCard from "$lib/components/Entries/EntryCard.svelte";
    import { uiStore } from '$lib/stores/uiStore.js';
    import { quintOut } from "svelte/easing";
    import { fly, slide } from "svelte/transition"; // Added slide transition
    import MoodFilterBar from "$lib/components/Entries/MoodFilterBar.svelte";
    import { tick } from 'svelte'; // For focusing input

    let selectedMoodFilter = null;
    let searchTerm = "";
    let showSearchBar = false;
    let searchInputEl; // For binding to the input element to focus

    $: filteredEntries = $entriesStore.filter(entry => { // Renamed from filterEntries to filteredEntries for clarity
      const moodMatch = !selectedMoodFilter || entry.mood === selectedMoodFilter;
      const term = searchTerm.trim().toLowerCase();
      const searchMatch = !term ||
                          (entry.title && entry.title.toLowerCase().includes(term)) ||
                          (entry.text && entry.text.toLowerCase().includes(term));
      return moodMatch && searchMatch;
    });

    function handleMoodFilterChange(e) {
      selectedMoodFilter = e.detail;
    }

    async function handleToggleSearch() { // Made async for tick
      showSearchBar = !showSearchBar;
      if (!showSearchBar) {
        searchTerm = ""; // Clear search when hiding
      } else {
        await tick(); // Wait for DOM to update
        if (searchInputEl) {
            searchInputEl.focus(); // Focus input when shown
        }
      }
    }

    let debounceTimer;
    function handleSearchInput(e) {
      clearTimeout(debounceTimer);
      const value = e.target.value;
      debounceTimer = setTimeout(() => {
        searchTerm = value;
      }, 300);
    }

    function handleEdit(event) {
      const entryToEdit = event.detail;
      if (entryToEdit && typeof entryToEdit.id !== 'undefined') {
        uiStore.showEntryForm(entryToEdit);
      } else {
        console.error("Page: handleEdit - Invalid event detail:", event.detail);
      }
    }

    function handleDelete(event) {
      const entryId = event.detail;
      if (typeof entryId === 'string' || typeof entryId === 'number') {
        deleteEntry(entryId);
      } else {
        console.error("Page: handleDelete - Invalid event detail (ID):", event.detail);
      }
    }

    function clearSearch() {
        searchTerm = "";
        if(searchInputEl) searchInputEl.value = ""; // Also clear the input visually
    }
</script>

<!-- The outer section for fly transition can be removed if filters are sticky,
     as the content below will scroll, not the whole filter section.
     Or, keep it if you want the whole page content to fly in.
     For now, I'll assume sticky filters are primary. -->

<div class="filters-and-content-wrapper">
  <div class="sticky-filters-header">
    {#if showSearchBar}
      <div class="search-bar-container" transition:slide="{{ duration: 300, easing: quintOut }}">
        <input
          bind:this={searchInputEl}
          type="search"
          placeholder="Search chismis..."
          value={searchTerm}
          on:input={handleSearchInput}
          class="search-input"
        />
        {#if searchTerm}
          <button class="clear-search-button" on:click={clearSearch} aria-label="Clear search">×</button>
        {/if}
      </div>
    {/if}

    <MoodFilterBar
      currentFilter={selectedMoodFilter}
      on:filter={handleMoodFilterChange}
      on:toggleSearch={handleToggleSearch}
    />
  </div>

  <div 
    class="entries-list-section"
  >
    {#if filteredEntries.length === 0}
      {#if $entriesStore.length === 0}
        <p class="empty-state-message">No chismis yet. Add some, besh!</p>
      {:else}
        <p class="empty-state-message">No chismis matches your filters huhu</p>
      {/if}
    {:else}
      {#each filteredEntries as entry (entry.id)}
      <div
        transition:fly="{{ y: 20, duration: 300, delay: entry.index * 50 || 0, easing: quintOut }}"
      >
        <EntryCard
          {entry}
          on:edit={handleEdit}
          on:delete={handleDelete}
        />
      </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .sticky-filters-header {
    position: sticky;
    /* Adjust top based on your Topbar's height + Navbar's height */
    /* Example: if Topbar is 60px and Navbar is 50px, top = 110px */
    background-color: var(--bg-primary); /* Match page background to avoid content showing through */
    z-index: 900; /* Below Topbar/Navbar but above page content */
    padding-bottom: 0.5rem; /* Space below the filter bar */
    box-shadow: 0 2px 5px var(--shadow-color-transparent, rgba(0,0,0,0.05)); /* Subtle shadow when scrolled */
    margin: 0 -1.5rem; /* Extend to edges if content-area in layout has padding */
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .search-bar-container {
    display: flex;
    align-items: center;
    /* margin-bottom: 0.75rem; /* MoodFilterBar will have its own top margin */
    padding: 0.75rem 0.25rem 0.25rem 0.25rem; /* Padding around search input */
    /* background-color: var(--bg-secondary); /* Not needed if sticky header bg is set */
    /* border-radius: 8px; */
    /* box-shadow: 0 1px 3px var(--shadow-color); */
  }

  .search-input {
    flex-grow: 1;
    padding: 0.75rem 1rem; /* Increased padding for a more "premium" feel */
    border: 1px solid var(--border-primary);
    border-radius: 20px; /* Pill shape */
    font-size: 1rem;
    background-color: var(--bg-secondary); /* Slightly different from page for depth */
    color: var(--text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.8;
  }
  .search-input:focus {
    outline: none;
    border-color: var(--text-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--text-accent) 30%, transparent); /* Outer glow */
  }

  .clear-search-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 0.75rem;
    margin-left: 0.5rem;
    line-height: 1;
  }
  .clear-search-button:hover {
    color: var(--text-primary);
  }

  .entries-list-section {
    padding-top: 48px; /* Space below sticky header before entries start */
    /* margin-top: 1rem; /* Removed, padding-top on this handles space */
  }
  .empty-state-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
    opacity: 0.7;
  }
</style>