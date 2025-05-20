<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { createEventDispatcher, onMount, tick } from 'svelte'; // onMount, tick might not be used in this final version unless for future additions

  export let entry;
  const dispatch = createEventDispatcher();

  // Default colors if not provided by moodStore item
  const DEFAULT_COLOR_LIGHT = 'var(--bw-text-on-accent, #ffffff)'; // For text on dark mood bg
  const DEFAULT_COLOR_MEDIUM = 'var(--bw-bg-tertiary, #eff1f3)';  // For tag background
  const DEFAULT_COLOR_DARK = 'var(--bw-text-secondary, #5f6368)'; // Default mood bg, tag text/border

  function deriveMoodDetails(currentMoodValue, storeData) {
    if (!currentMoodValue || !storeData) {
      return {
        label: currentMoodValue || 'Unknown',
        emoji: '😐',
        colorLight: DEFAULT_COLOR_LIGHT,
        colorMedium: DEFAULT_COLOR_MEDIUM,
        colorDark: DEFAULT_COLOR_DARK
      };
    }
    const item = storeData.find(m => m.value === currentMoodValue);
    return {
      label: item ? item.label : (currentMoodValue || 'Unknown'),
      emoji: item ? item.emoji : '😐',
      colorLight: item?.colorLight || DEFAULT_COLOR_LIGHT,
      colorMedium: item?.colorMedium || DEFAULT_COLOR_MEDIUM,
      colorDark: item?.colorDark || DEFAULT_COLOR_DARK
    };
  }

  $: moodDetails = deriveMoodDetails(entry.mood, get(moodStore));

  function formatDate(dateInput) {
    if (!dateInput) return 'No date';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  $: displayTags = entry.tags && Array.isArray(entry.tags) ? entry.tags.slice(0, 3) : [];

  function handleEdit() {
    dispatch("edit", entry);
  }

</script>

<!-- Entire card is clickable for editing -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
  class="entry-card graffiti-card"
  on:click={handleEdit}
  on:keydown={(e) => {if(e.key === 'Enter' || e.key === ' ') handleEdit()}}
  tabindex="0"
  role="button"
  aria-label="View or edit chismis titled {entry.title || 'Chismis Update'}"
>
  <h2 class="entry-title">{entry.title || "Chismis Update"}</h2>

  <div class="date-display">{formatDate(entry.date)}</div>

  <div class="mood-display" style="background-color: {moodDetails.colorDark}; border-color: {moodDetails.colorDark};">
    <span class="mood-emoji">{moodDetails.emoji}</span>
    <span class="mood-label" style="color: {moodDetails.colorLight};">
      {moodDetails.label}
    </span>
    <div class="drip-container"> 
      <svg class="drip-svg drip-1" width="65" height="53" viewBox="0 0 65 53" xmlns="http://www.w3.org/2000/svg">
        <path d="M64.7305 0.725586C59.2732 2.63174 48.3584 8.96226 48.3584 19.0352C49.5046 30.099 47.9167 52.2266 32.3945 52.2266C16.8724 52.2266 15.2845 30.099 16.4307 19.0352C16.4307 8.96226 5.51586 2.63174 0.0585938 0.725586H64.7305Z" fill={moodDetails.colorDark}/>
      </svg>
      <svg class="drip-svg drip-2" width="65" height="53" viewBox="0 0 65 53" xmlns="http://www.w3.org/2000/svg">
        <path d="M64.7305 0.725586C59.2732 2.63174 48.3584 8.96226 48.3584 19.0352C49.5046 30.099 47.9167 52.2266 32.3945 52.2266C16.8724 52.2266 15.2845 30.099 16.4307 19.0352C16.4307 8.96226 5.51586 2.63174 0.0585938 0.725586H64.7305Z" fill={moodDetails.colorDark}/>
      </svg>
      <svg class="drip-svg drip-3" width="65" height="53" viewBox="0 0 65 53" xmlns="http://www.w3.org/2000/svg">
        <path d="M64.7305 0.725586C59.2732 2.63174 48.3584 8.96226 48.3584 19.0352C49.5046 30.099 47.9167 52.2266 32.3945 52.2266C16.8724 52.2266 15.2845 30.099 16.4307 19.0352C16.4307 8.96226 5.51586 2.63174 0.0585938 0.725586H64.7305Z" fill={moodDetails.colorDark}/>
      </svg>
    </div>
  </div>

  {#if displayTags.length > 0}
    <div class="tag-chips-container">
      {#each displayTags as tag (tag)}
        <span
          class="tag-chip"
          style="
            background-color: {moodDetails.colorMedium};
            color: {moodDetails.colorDark};
            border: 1px solid {moodDetails.colorDark};
          "
        >
          {tag}
        </span>
      {/each}
    </div>
  {/if}
</article>

<style>
  .entry-card {
    padding: 1rem 1.25rem;
    margin: 0.8rem 0;
    border-radius: 18px;
    border: 2px solid var(--card-border, #e0e0e0); /* Using CSS variable for border */
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    background-color: var(--card-bg, #ffffff); /* Using CSS variable */
    cursor: pointer;
    position: relative;
    box-shadow: 0 4px 10px var(--card-shadow, rgba(0,0,0,0.07)); /* Softer default shadow */
  }
  .entry-card:hover {
    transform: translateY(-4px) rotate(-0.5deg);
    box-shadow: 0 10px 22px var(--card-shadow, rgba(0,0,0,0.12));
  }
  .entry-card:focus-visible {
    outline: 2px solid var(--bw-accent-pink, #ff69b4); /* Using BWP variable */
    outline-offset: 2px;
  }
  .entry-title {
    font-family: 'Graffiti Urban', sans-serif; /* Ensure this font is loaded */
    font-size: 1.8rem;
    letter-spacing: 0.08rem;
    color: var(--text-primary, #1c1c1e); /* Using CSS variable */
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .date-display {
    font-size: 0.75rem;
    color: var(--text-tertiary, #8e8e93); /* Using CSS variable */
    font-family: 'Urbanist', sans-serif; /* Ensure this font is loaded */
    font-weight: 500;
  }

  .mood-display {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-width: 2px;
    border-style: solid;
    border-radius: 20px; /* Pill shape */
    position: relative; /* For drips */
    z-index: 1; /* For stacking context with drips */
    align-self: flex-start;
    margin-top: 0.25rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    color: var(--main-bg, #ffffff); /* Default text color for mood display if not overridden by .mood-label */
    font-family: 'Graffiti Urban', sans-serif; /* Ensure this font is loaded */
    font-weight: lighter;
    letter-spacing: 0.08rem;
    transform: rotate(-2deg);
  }

  .drip-container { /* Renamed from .drip-fill for clarity */
    position: absolute;
    bottom: 0px; /* Align with the very bottom of .mood-display */
    left: 0;
    width: 100%;
    height: 25px; /* Max visual height of drips from bottom of mood-display */
    pointer-events: none;
    z-index: 0; /* Behind mood-display text/emoji, but part of its visual block */
  }

  .drip-svg {
    position: absolute;
  }

  .drip-1 {
    bottom: -17px; 
    left: 8%;
    width: 22px; 
    height: auto; 
  }
  .drip-2 {
    bottom: -12px; 
    left: 26%;
    width: 14px;
    height: auto;
  }
  .drip-3 {
    bottom: -12px;
    left: 72%;
    width: 16px;
    height: auto;
  }

  .mood-emoji {
    font-size: 1.3em;
    line-height: 1;
  }
  .mood-label {
    /* color set inline via style prop based on moodDetails.colorLight */
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1rem;
    letter-spacing: 0.08rem;
  }

  .tag-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .tag-chip {
    display: inline-block;
    /* background-color and color set inline via style prop */
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    /* border set inline */
    font-family: 'Urbanist', sans-serif;
    line-height: 1.2;
  }
</style>