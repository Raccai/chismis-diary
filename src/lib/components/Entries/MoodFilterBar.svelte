<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { moodStore } from '$lib/stores/moodStore.js';
  import MoodChip from '$lib/components/MoodChip.svelte'; // Your existing MoodChip
  import SortModal from './SortModal.svelte'; // Path to your new SortModal

  // Icons for trigger buttons (could be SVGs or text Emojis)
  import SearchIcon from '$lib/icons/SearchIcon.svelte'; // Assuming you have these
  import SortIcon from '$lib/icons/SortIcon.svelte'; // A graffiti-style sort icon

  export let currentMoodFilter = null;
  export let currentSortKey = 'date_desc';
  export let isSearchActive = false; // To style the search trigger button

  const dispatch = createEventDispatcher();

  let showSortModal = false;

  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }

  function handleMoodChipSelect(moodValue) { // From MoodChip or direct click
    const newFilter = currentMoodFilter === moodValue ? null : moodValue;
    dispatch('filter', newFilter);
  }

  function toggleSortModal() {
    // If search is active AND we are about to open the sort modal, tell parent to close search
    if (isSearchActive && !showSortModal) {
        dispatch('toggleSearch');
    }
    showSortModal = !showSortModal;
  }

  function handleSortSelectedFromModal(event) {
    dispatch('sort', event.detail); // event.detail IS the value ('date_desc', etc.)
    showSortModal = false;
  }

  function toggleSearchInterface() {
    showSortModal = false; // Close sort modal if search is toggled
    dispatch('toggleSearch');
  }

  // For the "All Moods" chip text, not strictly needed if UI is clear
  $: allMoodsChipText = "All";
</script>

<div class="filter-bar-graffiti">
  <!-- Sort Button -->
  <button
    class="filter-action-button-graffiti sort-button-graffiti"
    class:active={showSortModal || (currentSortKey !== 'date_desc' && currentSortKey !== 'none')}
    on:click={toggleSortModal}
    aria-expanded={showSortModal}
    aria-haspopup="dialog"
  >
    <span class="btn-icon"><SortIcon /></span>
    <!-- Optional: Text could show current sort e.g. $currentSortKey === 'date_asc' ? 'Oldest' : 'Newest' -->
  </button>

  <!-- Horizontally Scrollable Mood Chips -->
  <div class="mood-chips-scroll-graffiti">
    <button
      class="mood-chip-graffiti all-moods"
      class:active={currentMoodFilter === null}
      on:click={() => handleMoodChipSelect(null)}
    >
      {allMoodsChipText}
    </button>
    {#each $moodStore as moodOption (moodOption.value)}
      <button
        class="mood-chip-graffiti"
        class:active={currentMoodFilter === moodOption.value}
        on:click={() => handleMoodChipSelect(moodOption.value)}
        style="--mood-color-dark: {moodOption.colorDark || 'var(--bw-text-secondary)'};
               --mood-color-light: {moodOption.colorLight || 'var(--bw-bg-tertiary)'};"
      >
        {#if isEmojiImage(moodOption.emoji)}
          <img src={moodOption.emoji} alt={moodOption.label} class="option-emoji-img">
        {:else}
          <span class="option-emoji">{moodOption.emoji}</span>
        {/if}
        <!-- <span class="chip-label">{moodOption.label}</span> Optional label -->
      </button>
    {/each}
  </div>

  <!-- Search Toggle Button -->
  <button
    class="filter-action-button-graffiti search-button-graffiti"
    class:active={isSearchActive}
    on:click={toggleSearchInterface}
    aria-expanded={isSearchActive}
    aria-label="Toggle Search"
  >
    <span class="btn-icon"><SearchIcon /></span>
  </button>
</div>

{#if showSortModal}
  <SortModal
    bind:show={showSortModal}
    currentSortKey={currentSortKey}
    on:sortChange={handleSortSelectedFromModal}
    on:close={() => showSortModal = false}
  />
{/if}

<style>
  .filter-bar-graffiti {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0 0.5rem 0;
    border-bottom: 2px dashed var(--main-grey); 
  }

  .filter-action-button-graffiti {
    flex-shrink: 0; /* Prevent buttons from shrinking */
    padding: 0.6rem;
    background-color: var(--bw-bg-tertiary, #eff1f3);
    border: 2px solid var(--bw-bg-contrast, #000000); /* Thick "marker" border */
    border-radius: 10px; /* Slightly chunky */
    color: var(--bw-text-primary, #1c1c1e);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 0px var(--bw-bg-contrast, #000000); /* Hard shadow */
  }
  .filter-action-button-graffiti:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px var(--bw-bg-contrast, #000000);
  }
  .filter-action-button-graffiti:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--bw-bg-contrast, #000000);
  }
  .filter-action-button-graffiti.active {
    background-color: var(--bw-accent-pink, #ff69b4);
    color: var(--bw-text-on-accent, #ffffff);
    border-color: var(--bw-accent-pink-dark, #f953a4);
    box-shadow: 2px 2px 0px var(--bw-accent-pink-dark, #f953a4);
  }
  .filter-action-button-graffiti.active .btn-icon :global(svg path) {
      fill: var(--bw-text-on-accent, #ffffff);
  }


  .btn-icon {
    width: 22px; /* Adjust based on your SVG icon size */
    height: 22px;
    display: inline-flex;
  }
  .btn-icon :global(svg) {
      width: 100%; height: 100%; fill: currentColor;
  }


  .mood-chips-scroll-graffiti {
    flex-grow: 1;
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem; /* Padding inside the scroll area */
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .mood-chips-scroll-graffiti::-webkit-scrollbar { display: none; }

  .mood-chip-graffiti {
    flex-shrink: 0; /* Prevent chips from shrinking */
    padding: 0.5rem 0.8rem;
    border: 2px solid var(--mood-color-dark, var(--bw-bg-contrast)); /* Use dynamic mood color for border */
    background-color: var(--mood-color-light, var(--bw-bg-tertiary)); /* Use dynamic mood color for bg */
    color: var(--mood-color-dark, var(--bw-text-primary)); /* Text color contrasts with light bg */
    border-radius: 16px; /* Pill shape */
    font-family: 'Urbanist', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    box-shadow: 2px 2px 0px color-mix(in srgb, var(--mood-color-dark, var(--bw-bg-contrast)) 80%, black);
  }
  .mood-chip-graffiti:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px color-mix(in srgb, var(--mood-color-dark, var(--bw-bg-contrast)) 80%, black);
  }
  .mood-chip-graffiti.active {
    background-color: var(--mood-color-dark, var(--bw-accent-pink)); /* Active is solid dark mood color */
    color: var(--mood-color-light, var(--bw-text-on-accent)); /* Text contrasts with dark bg */
    border-color: var(--mood-color-dark, var(--bw-accent-pink));
    box-shadow: 1px 1px 0px color-mix(in srgb, var(--mood-color-dark, var(--bw-bg-contrast)) 60%, black);
    transform: translate(1px, 1px);
  }
  .option-emoji {
    font-size: 1.1em;
  }
  .option-emoji-img {
    width: 30px;
    height: 30px;
  }

</style>