<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { moodStore } from '$lib/stores/moodStore.js';
  import MoodChip from '$lib/components/MoodChip.svelte'; // Your existing MoodChip
  import SortModal from './SortModal.svelte'; // Path to your new SortModal

  // Icons for trigger buttons (could be SVGs or text Emojis)
  import SearchIcon from '$lib/icons/SearchIcon.svelte'; // Assuming you have these
  import SortIcon from '$lib/icons/SortIcon.svelte'; // A graffiti-style sort icon

  export let currentMoodFilter = null;
  export let isSearchActive = false; // To style the search trigger button
  export let showSortModal = false;

  const dispatch = createEventDispatcher();

  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }

  function handleMoodChipSelect(moodValue) { // From MoodChip or direct click
    const newFilter = currentMoodFilter === moodValue ? null : moodValue;
    dispatch('filter', newFilter);
  }

  function toggleSearchInterface() {
    showSortModal = false; // Close sort modal if search is toggled
    dispatch('toggleSearch');
  }

  // For the "All Moods" chip text, not strictly needed if UI is clear
  $: allMoodsChipText = "All";
</script>

<div class="filter-bar-graffiti">
  <!-- Horizontally Scrollable Mood Chips -->
  <div class="mood-chips-scroll-graffiti">
    <button
      class="all-moods"
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
    background-color: var(--secondary-btn-bg);
    border: 2px solid var(--secondary-btn-border); /* Thick "marker" border */
    border-radius: 8px; /* Slightly chunky */
    color: var(--secondary-btn-text);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 0px var(--secondary-btn-border); /* Hard shadow */
  }
  .filter-action-button-graffiti:active,
  .filter-action-button-graffiti:focus {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--secondary-btn-border);
  }
  .filter-action-button-graffiti.active {
    background-color: var(--main-yellow-light);
    color: var(--main-black);
    border-color: var(--main-yellow-dark);
    box-shadow: 2px 2px 0px var(--main-yellow-dark);
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
    padding: 0.25rem 1.25rem 0.25rem 1.25rem; /* Padding inside the scroll area */
    margin-left: -1.25rem;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
    border-right: 2px dashed var(--main-grey);
  }
  .mood-chips-scroll-graffiti::-webkit-scrollbar { display: none; }

  .mood-chip-graffiti,
  .all-moods {
    flex-shrink: 0; /* Prevent chips from shrinking */
    padding: 0.2rem 0.6rem;
    border-radius: 8px; /* Pill shape */
    font-family: 'Urbanist', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .all-moods {
    border: 2px solid var(--secondary-btn-border); /* Use dynamic mood color for border */
    background-color: var(--secondary-btn-bg); /* Use dynamic mood color for bg */
    color: var(--secondary-btn-text); /* Text color contrasts with light bg */
    box-shadow: 2px 2px 0px var(--secondary-btn-border);
  }
  .all-moods:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px var(--secondary-btn-border);
  }
  .all-moods.active {
    background-color: var(--secondary-btn-border); /* Active is solid dark mood color */
    color: var(--secondary-btn-bg); /* Text contrasts with dark bg */
    border-color: var(--secondary-btn-border);
    box-shadow: 1px 1px 0px var(--secondary-btn-border);
    transform: translate(1px, 1px);
    font-weight: 700;
  }
  .mood-chip-graffiti {
    border: 2px solid var(--mood-color-dark); 
    background-color: var(--mood-color-light); 
    color: var(--mood-color-dark); 
    box-shadow: 2px 2px 0px color-mix(in srgb, var(--mood-color-dark) 80%, black);
  }
  .mood-chip-graffiti:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px color-mix(in srgb, var(--mood-color-dark) 80%, black);
  }
  .mood-chip-graffiti.active {
    background-color: var(--mood-color-dark); /* Active is solid dark mood color */
    color: var(--mood-color-light); /* Text contrasts with dark bg */
    border-color: var(--mood-color-dark);
    box-shadow: 1px 1px 0px color-mix(in srgb, var(--mood-color-dark) 60%, black);
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