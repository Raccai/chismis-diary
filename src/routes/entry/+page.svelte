<script>
  import { entriesStore } from "$lib/stores/entriesStore.js";
  import { deleteEntry } from "$lib/utils/entryHelpers";
  import EntryCard from "$lib/components/Entries/EntryCard.svelte";
  import { uiStore } from '$lib/stores/uiStore.js';
  import { quintOut } from "svelte/easing";
  import { fly, slide } from "svelte/transition";
  import MoodFilterBar from "$lib/components/Entries/MoodFilterBar.svelte"; // Adjust path if needed
  import { tick } from 'svelte';

  let selectedMoodFilter = null;
  let searchTerm = "";
  let showSearchBar = false;
  let searchInputEl;

  // --- State for Sorting ---
  let currentSortKey = 'date_desc'; // Default sort order

  // --- Event handler for sort changes from MoodFilterBar ---
  // This function is called when MoodFilterBar dispatches the 'sort' event
  function handleSortChange(event) {
    currentSortKey = event.detail;
    console.log("Page: Sort key changed to:", currentSortKey);
  }

  // --- Reactive Filtered AND Sorted Entries ---
  $: filteredAndSortedEntries = (() => {
      console.log("Recalculating filteredAndSortedEntries. Current sort:", currentSortKey, "Mood filter:", selectedMoodFilter, "Search:", searchTerm);
      // Start with a shallow copy to avoid mutating the original store's array during sort
      let processedEntries = [...$entriesStore];

      // Apply filtering
      processedEntries = processedEntries.filter(entry => {
          const moodMatch = !selectedMoodFilter || entry.mood === selectedMoodFilter;
          const term = searchTerm.trim().toLowerCase();
          const searchMatch = !term ||
                              (entry.title && entry.title.toLowerCase().includes(term)) ||
                              (entry.text && entry.text.toLowerCase().includes(term));
          return moodMatch && searchMatch;
      });

      // Apply sorting
      if (currentSortKey === 'date_desc') {
          processedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (currentSortKey === 'date_asc') {
          processedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (currentSortKey === 'none') {
          // 'none' means no specific sort, so it keeps the order after filtering.
      }

      console.log("Page: Processed entries count:", processedEntries.length);
      return processedEntries; // <<<--- THIS RETURN WAS CRITICAL AND MISSING IN THE PASTED VERSION
  })();


  // --- Filtering Handlers ---
  function handleMoodFilterChange(e) {
    selectedMoodFilter = e.detail;
  }

  async function handleToggleSearch() {
    showSearchBar = !showSearchBar;
    if (!showSearchBar) {
      searchTerm = "";
    } else {
      await tick();
      if (searchInputEl) {
          searchInputEl.focus();
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

  // --- Entry Actions ---
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
      if(searchInputEl) searchInputEl.value = "";
  }
</script>

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
      currentSort={currentSortKey} 
      isSearchActive={showSearchBar}
      on:filter={handleMoodFilterChange}
      on:toggleSearch={handleToggleSearch}
      on:sort={handleSortChange} 
    />
  </div>

  <div class="entries-list-section">
    <!-- Check if filteredAndSortedEntries is defined before accessing length -->
    {#if filteredAndSortedEntries && filteredAndSortedEntries.length === 0}
      {#if $entriesStore.length === 0}
        <p class="empty-state-message">No chismis yet. Add some, besh!</p>
      {:else}
        <p class="empty-state-message">No chismis matches your filters huhu</p>
      {/if}
    {:else if filteredAndSortedEntries} <!-- Also check if it's defined before #each -->
      {#each filteredAndSortedEntries as entry, i (entry.id)} <!-- Added index i -->
      <div
        transition:fly="{{ y: 20, duration: 300, delay: i * 40, easing: quintOut }}" 
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

<!-- Styles remain the same as your previous full version -->
<style>
  .sticky-filters-header {
    position: fixed;
    top: var(--topbar-height); /* Define --topbar-height globally or in +layout */
    background-color: var(--main-bg);
    z-index: 900;
    width: 100%;
    padding: 0 20px;
  }

  .search-bar-container {
    display: flex;
    align-items: center;
    padding: 0.75rem 0.25rem 0.25rem 0.25rem;
  }
  
  .search-input {
    border: 2px solid var(--card-border);
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border-radius: 20px;
    font-size: 1rem;
    background-color: var(--bw-bg-secondary);
    color: var(--bw-text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder {
    color: var(--bw-text-secondary);
    opacity: 0.8;
  }
  .search-input:focus {
    outline: none;
    border-color: var(--bw-accent-pink); /* Use BWP accent */
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bw-accent-pink) 30%, transparent);
  }

  .clear-search-button {
    background: none;
    border: none;
    color: var(--bw-text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 0.75rem;
    margin-left: 0.5rem;
    line-height: 1;
  }
  .clear-search-button:hover {
    color: var(--bw-text-primary);
  }

  .entries-list-section {
    padding: 60px 20px 80px 20px;
  }
  .empty-state-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--bw-text-secondary);
    font-size: 1.1rem;
    opacity: 0.7;
  }
</style>