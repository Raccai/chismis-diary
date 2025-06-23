<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import DOMPurify from 'dompurify';

  export let entry;
  const dispatch = createEventDispatcher();

  // Added default color constants
  const DEFAULT_COLOR_LIGHT = '#F1F1F1';
  const DEFAULT_COLOR_MEDIUM = '#C7C7C7';
  const DEFAULT_COLOR_DARK = '#3C3C3C';

  // Function to safely sanitize the HTML from the entry due to rich text editing
  function sanitize(html) {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    return html; 
  }

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

  // Helper function to check if emoji is an image path
  $: isEmojiImage = moodDetails.emoji && (moodDetails.emoji.includes('.png') || moodDetails.emoji.includes('.jpg') || moodDetails.emoji.includes('.jpeg') || moodDetails.emoji.includes('.gif') || moodDetails.emoji.includes('.svg'));

  function formatDate(dateInput) {
    if (!dateInput) return 'No date';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  $: displayTags = entry.tags && Array.isArray(entry.tags) ? entry.tags.slice(0, 3) : [];

  function handleEdit() {
    dispatch("edit", entry);
  }

  function formatFullTimestamp(isoString) {
    if (!isoString) return '';
    const dateObj = new Date(isoString);
    return dateObj.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Add this line
    });
  }

  function formatShortTime(isoString) {
    if (!isoString) return '';
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  // Determine if the entry has been edited
  // (assuming lastEdited is only present if edited AFTER the feature was added)
  $: wasEdited = !!entry.lastEdited;
  $: displayDate = new Date(entry.date); // Main date for formatting
  $: editedDate = entry.lastEdited ? new Date(entry.lastEdited) : null;

  // Check if created and edited on the same day (for simpler display)
  $: sameDayEdit = wasEdited &&
                   displayDate.getFullYear() === editedDate.getFullYear() &&
                   displayDate.getMonth() === editedDate.getMonth() &&
                   displayDate.getDate() === editedDate.getDate();
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

  <!-- Timestamp Info -->
  <div class="timestamp-info">
    <time class="date-main" datetime={entry.date}>
      {formatFullTimestamp(entry.date)}
    </time>
    {#if wasEdited}
      <span class="edited-pill" title="Last edited: {formatFullTimestamp(entry.lastEdited)}">
        edited {formatFullTimestamp(entry.lastEdited)}
      </span>
    {/if}
  </div>

  <div class="mood-display" style="background-color: {moodDetails.colorDark}; border-color: {moodDetails.colorDark};">
    <!-- Conditional rendering for emoji vs image -->
    {#if isEmojiImage}
      <img src={moodDetails.emoji} alt={moodDetails.label} class="mood-emoji">
    {:else}
      <span class="mood-emoji-text" aria-label={moodDetails.label}>{moodDetails.emoji}</span>
    {/if}
    
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
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: all 0.2s ease-out;
    background-color: var(--card-bg);
    cursor: pointer;
    position: relative;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
  }
  
  .entry-card:active,
  .entry-card:focus {
    transform: translateY(-4px) rotate(-0.5deg);
    box-shadow: var(--card-shadow);
  }
  
  .entry-title {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.8rem;
    font-weight: bold;
    letter-spacing: -0.1rem;
    color: var(--card-title-text);
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* .date-main {
    font-size: 0.84rem;
    color: var(--card-date-text);
    font-family: 'Urbanist', sans-serif;
    font-weight: 500;
  } */

  .timestamp-info {
    display: flex;
    align-items: center; 
    gap: 0.5rem; 
    font-size: 0.84rem; 
    color: var(--card-date-text, var(--bw-text-tertiary, #8e8e93)); 
    font-family: 'Urbanist', sans-serif;
    margin-top: -0.25rem; 
  }
  .date-main { /* Class for the main date part */
    font-weight: 500;
  }
  .edited-pill {
    background-color: var(--card-title-text); /* Subtle background for the pill */
    color: var(--card-bg); /* Text color for the pill */
    padding: 0.4rem 0.8rem;
    border-radius: 10px; /* Pill shape */
    font-size: 0.6rem; /* Very small */
    font-style: italic;
    line-height: 1;
    white-space: nowrap;
    font-size: 0.7rem; 
  }

  .mood-display {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    border-width: 2px;
    border-style: solid;
    border-radius: 20px;
    position: relative;
    z-index: 1;
    align-self: flex-start;
    margin-top: 0.25rem;
    color: var(--card-border);
    font-family: 'Graffiti Urban', sans-serif;
    font-weight: lighter;
    letter-spacing: -0.1rem;
    transform: rotate(-2deg);
  }

  .drip-container {
    position: absolute;
    bottom: 0px;
    left: 0;
    width: 100%;
    height: 25px;
    pointer-events: none;
    z-index: 0;
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
    width: 50px;
    height: 50px;
  }
  
  .mood-emoji-text {
    font-size: 24px;
    line-height: 1;
    display: inline-block;
  }
  
  .mood-label {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1rem;
    letter-spacing: -0.02rem;
    font-weight: normal;
  }

  .tag-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .tag-chip {
    display: inline-block;
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'Urbanist', sans-serif;
    line-height: 1.2;
  }
</style>