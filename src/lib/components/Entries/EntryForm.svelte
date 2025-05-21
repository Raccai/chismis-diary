<script>
  import { entriesStore } from "$lib/stores/entriesStore.js";
  import { addEntry, updateEntry } from "$lib/utils/entryHelpers.js";
  import { moodStore } from "$lib/stores/moodStore.js";
  import { createEventDispatcher, onMount, onDestroy, tick } from "svelte";

  const dispatch = createEventDispatcher();
  export let selectedEntry = null;

  let title = "";
  let text = "";
  let currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
  let tagInput = "";
  let tags = [];
  let _loadedEntryId = null;

  let descriptionTextareaRef; // For autofocus on text area

  // --- State for Mood Dropdown ---
  let showMoodDropdown = false;
  let moodDropdownButtonRef; // To help with click outside logic

  onMount(async () => {
    // Autofocus logic
    if (!selectedEntry && descriptionTextareaRef) { // Focus description for new entry
      await tick(); // Ensure element is in DOM
      descriptionTextareaRef.focus();
    }
    document.addEventListener('click', handleClickOutsideDropdown, true);
  });

  onDestroy(() => {
      document.removeEventListener('click', handleClickOutsideDropdown, true);
  });


  $: {
    if (selectedEntry && selectedEntry.id !== _loadedEntryId) {
      title = selectedEntry.title || "";
      text = selectedEntry.text || "";
      currentMood = selectedEntry.mood || (($moodStore && $moodStore[0]?.value) || "happy");
      tags = selectedEntry.tags ? [...selectedEntry.tags] : [];
      tagInput = tags.map(t => t.startsWith('#') ? t.substring(1) : t).join(', ');
      _loadedEntryId = selectedEntry.id;
    } else if (selectedEntry === null && _loadedEntryId !== null) { // Resetting for new entry
      title = "";
      text = "";
      currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
      tags = [];
      tagInput = "";
      _loadedEntryId = null;
      if (descriptionTextareaRef) { // Autofocus for new after editing
        setTimeout(() => descriptionTextareaRef.focus(), 0);
      }
    }
  }

  function toggleMoodDropdown() {
    showMoodDropdown = !showMoodDropdown;
  }

  function selectMood(moodValue) {
    currentMood = moodValue;
    showMoodDropdown = false; // Close dropdown after selection
  }

  function handleClickOutsideDropdown(event) {
    if (showMoodDropdown && moodDropdownButtonRef && !moodDropdownButtonRef.contains(event.target)) {
        // Check if click is also outside the dropdown content itself
        const moodDropdownContent = document.querySelector('.mood-dropdown-options');
        if (moodDropdownContent && !moodDropdownContent.contains(event.target)) {
            showMoodDropdown = false;
        }
    }
  }

  function processTags() {
    tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  }

    function saveEntry() {
        if(text.trim() || title.trim()) {
        processTags();
        const entryData = { title, text, mood: currentMood, tags };
            if (selectedEntry && selectedEntry.id) {
                updateEntry(selectedEntry.id, entryData.title, entryData.text, entryData.mood, entryData.tags);
            } else {
                addEntry(entryData.title, entryData.text, entryData.mood, entryData.tags);
            }
            dispatch("save");
        } else {
            alert("Chismis needs a title or some text!");
        }
    }

  function handleBack() {
      dispatch('save'); // Using 'save' event to trigger close in layout, as it does the same thing
      // Or dispatch a new 'close' event if you want different logic: dispatch('close');
  }
</script>

<div class="entry-form-bwp">
  <div class="form-header-bwp">
    <input
      type="text"
      class="form-title-input-bwp"
      bind:value={title}
      placeholder="Catchy Headline (Optional)"
    />
    <!-- Maybe a subtle separator line here -->
  </div>

  <div class="form-content-area-bwp">
    <textarea
      class="description-textarea-bwp"
      bind:this={descriptionTextareaRef}
      bind:value={text}
      placeholder="What's the latest chismis, besh? Spill it all here..."
      rows="10"
    ></textarea>

    <div class="meta-controls-bwp">
      <div class="mood-selector-bwp">
        <button
          type="button"
          class="mood-dropdown-trigger"
          on:click={toggleMoodDropdown}
          aria-haspopup="listbox"
          aria-expanded={showMoodDropdown}
          bind:this={moodDropdownButtonRef}
        >
          <span class="selected-mood-emoji">{$moodStore.find(m => m.value === currentMood)?.emoji || '😐'}</span>
          <span class="selected-mood-label">{$moodStore.find(m => m.value === currentMood)?.label || 'Mood'}</span>
          <span class="dropdown-arrow">{showMoodDropdown ? '▲' : '▼'}</span>
        </button>
        {#if showMoodDropdown}
          <ul class="mood-dropdown-options" role="listbox">
            {#each $moodStore as moodOption (moodOption.value)}
              <li
                role="option"
                aria-selected={currentMood === moodOption.value}
                class:active={currentMood === moodOption.value}
                on:click={() => selectMood(moodOption.value)}
                on:keydown={(e) => { if(e.key === 'Enter' || e.key === ' ') selectMood(moodOption.value)}}
                tabindex="0"
              >
                <span class="option-emoji">{moodOption.emoji}</span>
                {moodOption.label}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="tags-input-field-bwp">
        <input
          type="text"
          bind:value={tagInput}
          on:blur={processTags}
          placeholder="#tags"
        />
      </div>
    </div>
  </div>

  <div class="form-actions-bwp">
    <button type="button" class="action-button-bwp back-button" on:click={handleBack}>
      Discard <!-- Or "Back" or an Icon -->
    </button>
    <button type="submit" class="action-button-bwp save-button" on:click={saveEntry}>
      {selectedEntry ? "Update Story" : "Save Chismis"}
    </button>
  </div>
</div>

<style>
  .entry-form-bwp {
    display: flex;
    flex-direction: column;
    height: 100%; /* Fill the .form-slide from layout */
    background-color: var(--bw-bg-primary, #ffffff);
    color: var(--bw-text-primary, #1c1c1e);
    font-family: 'Urbanist', sans-serif; /* Clean sans-serif */
  }

  .form-header-bwp {
    padding: 1rem 1.25rem 0.75rem 1.25rem;
    /* border-bottom: 1px solid var(--bw-border-secondary, #e5e7eb); */
  }

  .form-title-input-bwp {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Graffiti Urban', sans-serif; /* Graffiti font for title */
    font-size: 1.8rem; /* Large title */
    font-weight: bold;
    color: var(--bw-text-primary, #1c1c1e);
    padding: 0.5rem 0;
    outline: none;
    text-align: left; /* Or center */
  }
  .form-title-input-bwp::placeholder {
    color: var(--bw-text-tertiary, #8e8e93);
    font-weight: normal;
  }

  .form-content-area-bwp {
    flex-grow: 1; /* This area takes up most space */
    padding: 0 1.25rem 1.25rem 1.25rem;
    overflow-y: auto; /* Scroll only this area if content overflows */
    display: flex;
    flex-direction: column;
  }

  .description-textarea-bwp {
    flex-grow: 1; /* Textarea takes up available vertical space */
    width: 100%;
    border: none; /* No border for a cleaner look */
    padding: 0.5rem 0; /* Minimal padding */
    font-size: 1.1rem; /* Larger text for readability */
    line-height: 1.7;
    background-color: transparent;
    color: var(--bw-text-primary, #1c1c1e);
    resize: none; /* Disable manual resize */
    outline: none;
    margin-bottom: 1rem; /* Space before mood/tags */
  }
  .description-textarea-bwp::placeholder {
    color: var(--bw-text-tertiary, #8e8e93);
  }

  .meta-controls-bwp {
    display: flex;
    gap: 0.75rem;
    align-items: stretch; /* Make items same height */
    margin-bottom: 1rem; /* Space before potential bottom bar */
  }

  .mood-selector-bwp {
    position: relative; /* For dropdown positioning */
    flex-basis: 60%; /* Mood dropdown takes more space */
  }

  .mood-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    background-color: var(--bw-bg-tertiary, #eff1f3);
    border: 1px solid var(--bw-border-primary, #d1d5db);
    border-radius: 20px; /* Pill shape */
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    color: var(--bw-text-secondary, #5f6368);
    text-align: left;
    cursor: pointer;
  }
  .mood-dropdown-trigger:focus-visible {
      border-color: var(--bw-accent-pink);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bw-accent-pink) 20%, transparent);
  }
  .selected-mood-emoji { font-size: 1.1em; margin-right: 0.4rem; }
  .selected-mood-label { flex-grow: 1; }
  .dropdown-arrow { margin-left: 0.5rem; font-size: 0.7rem; }

  .mood-dropdown-options {
    position: absolute;
    bottom: calc(100% + 4px); /* Position above the trigger */
    left: 0;
    width: 100%;
    background-color: var(--bw-bg-primary, #ffffff);
    border: 1px solid var(--bw-border-primary, #d1d5db);
    border-radius: 12px;
    box-shadow: 0 -4px 15px var(--bw-shadow-color-medium, rgba(0,0,0,0.1));
    z-index: 10; /* Above other form content */
    padding: 0.5rem 0;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
  }
  .mood-dropdown-options li {
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .mood-dropdown-options li:hover {
    background-color: var(--bw-bg-tertiary, #eff1f3);
  }
  .mood-dropdown-options li.active {
    color: var(--bw-accent-pink, #ff69b4);
    font-weight: 500;
  }
  .mood-dropdown-options .option-emoji {
    margin-right: 0.6rem;
    font-size: 1.1em;
  }


  .tags-input-field-bwp {
    flex-basis: 40%; /* Tag input takes less space */
  }
  .tags-input-field-bwp input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    background-color: var(--bw-bg-tertiary, #eff1f3);
    border: 1px solid var(--bw-border-primary, #d1d5db);
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--bw-text-primary, #1c1c1e);
    outline: none;
  }
  .tags-input-field-bwp input::placeholder { color: var(--bw-text-tertiary, #8e8e93); }
  .tags-input-field-bwp input:focus {
      border-color: var(--bw-accent-pink);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--bw-accent-pink) 20%, transparent);
  }

  /* Fixed Bottom Action Bar */
  .form-actions-bwp {
    display: flex;
    justify-content: space-between; /* Space out back and save */
    align-items: center;
    padding: 1rem 1.25rem calc(1rem + env(safe-area-inset-bottom)); /* Bottom padding for safe area */
    background-color: var(--bw-bg-primary, #ffffff); /* Match form bg */
    border-top: 1px solid var(--bw-border-secondary, #e5e7eb);
    width: 100%; /* Ensure it spans full width of form-slide */
    box-sizing: border-box;
    /* No position:fixed, it's part of the flex column now */
  }

  .action-button-bwp {
    padding: 0.75rem 1.25rem;
    border-radius: 20px; /* Pill shape */
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.15s;
    flex-grow: 1; /* Let buttons share space */
    margin: 0 0.5rem; /* Add some margin between buttons */
  }
  .action-button-bwp:first-child { margin-left: 0; }
  .action-button-bwp:last-child { margin-right: 0; }


  .back-button {
    background-color: var(--bw-bg-tertiary, #eff1f3);
    color: var(--bw-text-secondary, #5f6368);
    border: 1px solid var(--bw-border-primary, #d1d5db);
  }
  .back-button:hover {
    background-color: #e0e0e0; /* Darker tertiary */
  }

  .save-button {
    background-color: var(--bw-accent-pink, #ff69b4);
    color: var(--bw-text-on-accent, #ffffff);
    border: 1px solid var(--bw-accent-pink, #ff69b4);
  }
  .save-button:hover {
    background-color: var(--bw-accent-pink-dark, #f953a4);
    border-color: var(--bw-accent-pink-dark, #f953a4);
  }
  .action-button-bwp:active {
      transform: scale(0.97);
  }
</style>