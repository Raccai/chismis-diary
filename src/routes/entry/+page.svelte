<script>
    import { entriesStore } from "$lib/stores/entriesStore.js";
    import { deleteEntry } from "$lib/utils/entryHelpers.js";
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
    let currentSortKey = 'date_desc'; // Default sort order

    function handleSortFromBar(event) {
      currentSortKey = event.detail;
    }

    function handleMoodFilterChange(event) {
      selectedMoodFilter = event.detail;
    }

    async function handleToggleSearchFromBar() {
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
    function handleSearchInput(event) {
      clearTimeout(debounceTimer);
      const value = event.target.value;
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
        if(searchInputEl) searchInputEl.value = "";
    }

    $: filteredAndSortedEntries = (() => {
        let processedEntries = [...$entriesStore];

        processedEntries = processedEntries.filter(entry => {
            const moodMatch = !selectedMoodFilter || entry.mood === selectedMoodFilter;
            const term = searchTerm.trim().toLowerCase();
            const searchMatch = !term ||
                                (entry.title && entry.title.toLowerCase().includes(term)) ||
                                (entry.text && entry.text.toLowerCase().includes(term));
            return moodMatch && searchMatch;
        });

        if (currentSortKey === 'date_desc') {
            processedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentSortKey === 'date_asc') {
            processedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentSortKey === 'title_asc') {
            processedEntries.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (currentSortKey === 'title_desc') {
            processedEntries.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }
        // 'none' or other unhandled sort keys will result in the filtered order
        return processedEntries;
    })();
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
      currentMoodFilter={selectedMoodFilter}
      currentSortKey={currentSortKey}
      isSearchActive={showSearchBar}
      on:filter={handleMoodFilterChange}
      on:sort={handleSortFromBar}
      on:toggleSearch={handleToggleSearchFromBar}
    />
  </div>

  <div class="entries-list-section">
    {#if filteredAndSortedEntries && filteredAndSortedEntries.length === 0}
      {#if $entriesStore.length === 0}
        <p class="empty-state-message">No chismis yet. Add some, besh!</p>
      {:else}
        <p class="empty-state-message">No chismis matches your filters huhu</p>
      {/if}
    {:else if filteredAndSortedEntries}
      {#each filteredAndSortedEntries as entry, i (entry.id)}
      <div
        transition:fly="{{ y: 20, duration: 300, delay: i * 30, easing: quintOut }}"
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
  .filters-and-content-wrapper {
    max-height: calc(100vh - var(--topbar-height));
    overflow: auto;
  }

  .sticky-filters-header {
    position: sticky;
    top: 0;               
    z-index: 10;          
    background-color: var(--main-bg);
    padding: 10px 20px 0 20px;
  }

  .entries-list-section {
    padding-left: var(--content-area-side-padding, 1rem); /* Match overall page padding */
    padding-right: var(--content-area-side-padding, 1rem);
    padding-bottom: calc(var(--navbar-height, 65px) + 1rem); /* Ensure space for bottom navbar */
  }

  .search-bar-container {
    display: flex;
    align-items: center;
  }

  .search-input {
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--bw-border-primary);
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
    border-color: var(--bw-accent-pink);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bw-accent-pink) 20%, transparent);
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

  .empty-state-message {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--bw-text-secondary);
    font-size: 1.1rem;
    opacity: 0.7;
  }
</style>