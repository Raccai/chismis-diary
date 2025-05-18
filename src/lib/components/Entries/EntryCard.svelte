<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  // SVGs for icons
  const EditIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.7574 2.99668L14.7574 4.99668L18.9997 9.23906L21.0004 7.23971C21.391 6.84918 21.391 6.21602 21.0004 5.82549L18.1742 2.99926C17.7837 2.60873 17.1505 2.60873 16.7574 2.99668ZM13.2426 6.51145L3 16.754V20.9965H7.24264L17.4859 10.7532L13.2426 6.51145Z"></path></svg>`;
  const DeleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>`;

  export let entry;
  const dispatch = createEventDispatcher();

  function deriveMoodDetails(currentMoodValue, storeData) {
    if (!currentMoodValue || !storeData) {
      return { label: currentMoodValue || 'Unknown', emoji: '😐' };
    }
    const item = storeData.find(m => m.value === currentMoodValue);
    return {
      label: item ? item.label : (currentMoodValue || 'Unknown'),
      emoji: item ? item.emoji : '😐'
    };
  }

  $: moodDetails = deriveMoodDetails(entry.mood, get(moodStore));

  function formatDate(dateInput) {
    if (!dateInput) return 'No date';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // More concise date format
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  $: displayTags = entry.tags && Array.isArray(entry.tags) ? entry.tags.slice(0, 3) : [];


  // --- Sparkle Animation State for Buttons ---
  let showEditSparkles = false;
  let showDeleteSparkles = false;

  function triggerSparkles(buttonType) {
    if (buttonType === 'edit') {
      showEditSparkles = true;
      setTimeout(() => { showEditSparkles = false; }, 700);
    } else if (buttonType === 'delete') {
      showDeleteSparkles = true;
      setTimeout(() => { showDeleteSparkles = false; }, 700);
    }
  }

  // --- Button Click Handlers ---
  function handleDelete() {
    if (confirm('Burahin ang tsismis na ito?')) {
      triggerSparkles('delete');
      dispatch("delete", entry.id);
    }
  }

  function handleEdit() {
    triggerSparkles('edit');
    dispatch("edit", entry);
  }
</script>

<article class="entry-card-vibe">
  <h2 class="entry-title-vibe">{entry.title || "Chismis Update"}</h2>

  <div class="date-display-vibe">{formatDate(entry.date)}</div>

  <div class="mood-display-vibe">
    <span class="mood-emoji-vibe">{moodDetails.emoji}</span>
    <span class="mood-label-vibe">{moodDetails.label}</span>
  </div>

  {#if displayTags.length > 0}
    <div class="tag-chips-container-vibe">
      {#each displayTags as tag (tag)}
        <span class="tag-chip-vibe">{tag}</span>
      {/each}
    </div>
  {/if}
</article>

<style>
  .entry-card-vibe {
    background: var(--card-bg);
    padding: 1.25rem 1.5rem;
    margin: 1rem 0;
    border-radius: 10px; /* Softer roundness */
    box-shadow: 0 5px 15px var(--card-shadow, rgba(0,0,0,0.08));
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Reduced spacing */
    border: 1px solid var(--card-outline);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  }
  .entry-card-vibe:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px var(--card-shadow, rgba(0,0,0,0.1));
  }

  .entry-title-vibe {
    font-size: 1.1rem; /* Reduced Title Size */
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: sans-serif;  /* Change font to something simpler */
  }

  .date-display-vibe {
    font-size: 0.8rem; /* Reduced date size */
    color: var(--text-tertiary);   /* Dark gray */
  }

  .mood-display-vibe {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem; /* Smaller padding */
    background-color: var(--tertiary); /* Example pinkish fallback */
    border-radius: 8px;
  }
  .mood-emoji-vibe {
    font-size: 1.4em;   /* Reduced emoji size */
    line-height: 1.2;
  }
  .mood-label-vibe {
    font-size: 0.8rem; /* Reduced label */
    font-weight: 500;
    color: var(--text-primary, #1c1c1e);
  }

  .tag-chips-container-vibe {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem; /* Reduced spacing between tags */
    margin-top: 0.25rem;
  }

  .tag-chip-vibe {
    display: inline-block;
    background-color: #FCE4EC; /* Secondary */
    color: #E91E63;           /* Primary (pink) */
    padding: 0.4rem 0.8rem; /* Adjusted Padding */
    border-radius: 4px;   /* From the image! */
    font-size: 0.8rem;    /* Further Reduced Size */
    font-weight: 500;
    border: none;            /* Remove Border */
  }
</style>