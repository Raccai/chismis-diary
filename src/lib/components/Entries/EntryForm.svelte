<script>
  import { entriesStore } from "$lib/stores/entriesStore.js";
  import { addEntry, updateEntry } from "$lib/utils/entryHelpers.js";
  import { moodStore } from "$lib/stores/moodStore.js";
  import { createEventDispatcher, onMount, onDestroy, tick } from "svelte";
  import { toasts } from "$lib/stores/toastStore";
  import { uiStore } from "$lib/stores/uiStore";
  import Button from "../Button.svelte";

  const dispatch = createEventDispatcher();
  export let selectedEntry = null;

  let title = "";
  let text = "";
  let currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
  let tagInput = "";
  let tags = [];
  let _loadedEntryId = null;
  let keyboardVisible = false;
  let bottomInset = 0;

  let descriptionTextareaRef; // For autofocus on text area

  // --- State for Mood Dropdown ---
  let showMoodDropdown = false;
  let moodDropdownButtonRef; // To help with click outside logic

  // Get current mood details including colors
  $: currentMoodDetails = $moodStore.find(m => m.value === currentMood) || $moodStore[0] || {
    value: 'happy',
    label: 'Happy',
    emoji: '😊',
    colorLight: '#FFE4EC',
    colorMedium: '#FBA6C9',
    colorDark: '#9D2851'
  };

  // Helper function to check if emoji is an image path
  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }

  onMount(async () => {
    // Autofocus logic
    if (!selectedEntry && descriptionTextareaRef) { // Focus description for new entry
      await tick(); // Ensure element is in DOM
      descriptionTextareaRef.focus();
    }
    document.addEventListener('click', handleClickOutsideDropdown, true);
  });

  
  onMount(() => {
    if (window.visualViewport) {
      const updateInset = () => {
        const viewport = window.visualViewport;
        const diff = window.innerHeight - viewport.height;
        keyboardVisible = diff > 150; // heuristically, >150px height reduction = keyboard
        bottomInset = keyboardVisible ? diff : 0;
      };

      updateInset();
      window.visualViewport.addEventListener('resize', updateInset);
      window.visualViewport.addEventListener('scroll', updateInset);

      return () => {
        window.visualViewport.removeEventListener('resize', updateInset);
        window.visualViewport.removeEventListener('scroll', updateInset);
      };
    }
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
    console.log("EntryForm: saveEntry triggered.");
    console.log("EntryForm: current text:", text);
    console.log("EntryForm: current title:", title);
    console.log("EntryForm: selectedEntry at save:", selectedEntry);

    // Ensure text or title has content
    if (text.trim() || title.trim()) {
      processTags(); // Process tags before creating entryData
      const entryData = {
        title: title.trim() || `Chismis - ${new Date().toLocaleDateString()}`, // Default title if empty
        text: text,
        mood: currentMood,
        tags: tags
      };
      console.log("EntryForm: entryData prepared:", entryData);

      if (selectedEntry && selectedEntry.id) {
        // UPDATE PATH: Show modal to confirm update
        uiStore.showModal({
          title: 'I-update na ba natin ang Chismis?',
          message: `Sigurado ka bang aayusin mo ang chismis na "<strong>${entryData.title}</strong>"?`,
          confirmText: 'Oo!',
          cancelText: 'Wag muna',
          confirmClass: 'confirm-button', // Use a general confirm style, not 'danger'
          onConfirm: () => {
            console.log("EntryForm: Modal confirmed for UPDATE.");
            updateEntry(selectedEntry.id, entryData.title, entryData.text, entryData.mood, entryData.tags);
            dispatch("save"); // Close form AFTER successful action
            toasts.success(`"${entryData.title}" updated!`);
          },
          onCancel: () => {
            console.log("EntryForm: Modal cancelled for UPDATE.");
            toasts.info('Kinansela ang pag-update huhu.');
          }
        });
      } else {
        // ADD PATH: Show modal to confirm save
        uiStore.showModal({
          title: 'I-save ang Chismis?',
          message: `Isasave ba natin ang bagong chismis na "<strong>${entryData.title}</strong>"?`,
          confirmText: 'Oo, go!',
          cancelText: 'Mamaya na lang',
          confirmClass: 'confirm-button', // Use a general confirm style
          onConfirm: () => {
            console.log("EntryForm: Modal confirmed for ADD.");
            addEntry(entryData.title, entryData.text, entryData.mood, entryData.tags);
            dispatch("save"); // Close form AFTER successful action
            toasts.success(`"Nasave na ang ${entryData.title}"!`);
          },
          onCancel: () => {
            console.log("EntryForm: Modal cancelled for ADD.");
            toasts.info('Di nasave ang Chismis.');
          }
        });
      }
    } else {
      // Using toast for error message instead of alert
      toasts.error("Lagyan mo muna ng kwento o title, bes!");
      // alert("Chismis needs a title or some text!"); // Old way
    }
  }

  function handleBack() {
      dispatch('save'); // Using 'save' event to trigger close in layout, as it does the same thing
      // Or dispatch a new 'close' event if you want different logic: dispatch('close');
  }
</script>

<div class="entry-form">
  <div class="form-header">
    <input
      type="text"
      class="form-title-input"
      bind:value={title}
      placeholder="Pamagat (optional lang)"
    />
  </div>

  <div class="form-content-area">
    <textarea
      class="description-textarea"
      bind:this={descriptionTextareaRef}
      bind:value={text}
      on:focus={() => {
      setTimeout(() => {
          descriptionTextareaRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }}
      placeholder="Anong latest, besh? Ikwento mo na lahat dito..."
      rows="10"
    ></textarea>

    <div class="meta-controls">
      <div class="mood-selector">
        <button
          type="button"
          class="mood-dropdown-trigger"
          style="
            background-color: {currentMoodDetails.colorDark};
            border-color: {currentMoodDetails.colorDark};
            color: {currentMoodDetails.colorLight};
          "
          on:click={toggleMoodDropdown}
          aria-haspopup="listbox"
          aria-expanded={showMoodDropdown}
          bind:this={moodDropdownButtonRef}
        >
          {#if isEmojiImage(currentMoodDetails.emoji)}
            <img src={currentMoodDetails.emoji} alt={currentMoodDetails.label} class="selected-mood-emoji-img">
          {:else}
            <span class="selected-mood-emoji">{currentMoodDetails.emoji}</span>
          {/if}
          <span class="selected-mood-label">{currentMoodDetails.label}</span>
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
                {#if isEmojiImage(moodOption.emoji)}
                  <img src={moodOption.emoji} alt={moodOption.label} class="option-emoji-img">
                {:else}
                  <span class="option-emoji">{moodOption.emoji}</span>
                {/if}
                {moodOption.label}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="tags-input-field">
        <input
          type="text"
          bind:value={tagInput}
          on:blur={processTags}
          placeholder="#tags"
        />
      </div>
    </div>
  </div>

  <div 
    class="form-actions"
    style="padding-bottom: calc(1rem + env(safe-area-inset-bottom) + {keyboardVisible ? bottomInset + 'px' : '0px'})"
  >
    <Button 
      type="secondary"
      addBtn={false}
      ariaLabel="Discard"
      onClick={() => handleBack()}
      class="secondary"
      text="I-Discard"
    />
    <Button 
      type="primary"
      addBtn={false}
      ariaLabel={selectedEntry ? "I-update ang Kwento" : "I-save ang Chismis"}
      onClick={() => saveEntry()}
      class="primary"
      text={selectedEntry ? "I-Update" : "I-Save"}
    />
  </div>
</div>

<style>
  .entry-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--main-bg);
    color: var(--entry-form-content);
    font-family: 'Urbanist', sans-serif; /* Clean sans-serif */
  }

  .form-header {
    padding: 1rem 1.25rem 0.4rem 1.25rem;
    border-bottom: 2px solid var(--card-border);
  }

  .form-title-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Graffiti Urban', sans-serif; /* Graffiti font for title */
    font-size: 1.8rem; /* Large title */
    color: var(--entry-form-title);
    padding: 0.5rem 0;
    letter-spacing: -0.1rem;
    font-weight: bold;
    outline: none;
    text-align: left; /* Or center */
  }
  .form-title-input::placeholder {
    color: var(--entry-form-placeholder);
    font-weight: normal;
  }

  .form-content-area {
    flex-grow: 1; /* This area takes up most space */
    padding: 0rem 0rem 1rem 0rem;
    overflow-y: auto; /* Scroll only this area if content overflows */
    display: flex;
    flex-direction: column;
  }

  .description-textarea {
    flex-grow: 1; /* Textarea takes up available vertical space */
    width: 100%;
    border: none; /* No border for a cleaner look */
    padding: 1rem 1.25rem 1rem 1.25rem; /* Minimal padding */
    font-size: 1.1rem; /* Larger text for readability */
    line-height: 1.7;
    background-color: transparent;
    color: var(--text-primary);
    border-bottom: 2px solid var(--card-border);
    resize: none; /* Disable manual resize */
    outline: none;
    margin-bottom: 1rem; /* Space before mood/tags */
    font-family: 'Urbanist', sans-serif;
  }
  .description-textarea::placeholder {
    color: var(--entry-form-placeholder);
  }

  .meta-controls {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
    padding: 0 1rem;
  }

  .mood-selector {
    position: relative; /* For dropdown positioning */
    flex-basis: 60%; /* Mood dropdown takes more space */
  }

  .mood-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    /* background-color and border-color set inline via style prop */
    border-width: 1px;
    border-style: solid;
    border-radius: 20px; /* Pill shape */
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    /* color set inline via style prop */
    text-align: left;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .mood-dropdown-trigger:focus-visible {
    opacity: 0.8;
    box-shadow: 0 4px 4px var(--bw-shadow-color-medium, rgba(0,0,0,0.4));
  }
  .mood-dropdown-trigger:hover {
    opacity: 0.9;
  }

  .selected-mood-emoji { 
    font-size: 1.1em; 
    margin-right: 0.4rem; 
  }
  .selected-mood-emoji-img {
    width: 20px;
    height: 20px;
    margin-right: 0.4rem;
  }
  .selected-mood-label { 
    flex-grow: 1; 
  }
  .dropdown-arrow { 
    margin-left: 0.5rem; 
    font-size: 0.7rem; 
  }

  .mood-dropdown-options {
    position: absolute;
    bottom: calc(100% + 4px); /* Position above the trigger */
    left: 0;
    width: 100%;
    background-color: var(--dropdown-bg-color);
    border: 1px solid var(--dropdown-text-color);
    color: var(--dropdown-text-color);
    box-shadow: 0 4px 4px var(--bw-shadow-color-medium, rgba(0,0,0,0.4));
    border-radius: 12px;
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
    background-color: var(--dropdown-select-color);
  }
  .mood-dropdown-options li.active {
    background-color: var(--dropdown-select-color);
    color: var(--dropdown-text-color);
    font-weight: 500;
  }
  .mood-dropdown-options .option-emoji {
    margin-right: 0.6rem;
    font-size: 1.1em;
  }
  .mood-dropdown-options .option-emoji-img {
    width: 20px;
    height: 20px;
    margin-right: 0.6rem;
  }

  .tags-input-field {
    flex-basis: 40%; /* Tag input takes less space */
    font-family: 'Urbanist', sans-serif;
  }
  .tags-input-field input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    background-color: var(--main-bg);
    border: 1px solid var(--secondary-btn-border);
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--secondary-btn-text);
    outline: none;
  }
  .tags-input-field input::placeholder { color: var(--bw-text-tertiary, #8e8e93); }
  .tags-input-field input:focus {
    background-color: var(--dropdown-text-color);
    border: 2px solid var(--dropdown-bg-color);
    color: var(--dropdown-bg-color);
  }

  /* Fixed Bottom Action Bar */
  .form-actions {
    display: flex;
    justify-content: space-between; /* Space out back and save */
    align-items: center;
    gap: 8px;
    padding: 1rem 1.25rem calc(1rem + env(safe-area-inset-bottom)); /* Bottom padding for safe area */
    background-color: var(--dropdown-bg-color); /* Match form bg */
    border-top: 2px solid var(--secondary-btn-border);
    width: 100%; /* Ensure it spans full width of form-slide */
    box-sizing: border-box;
    /* No position:fixed, it's part of the flex column now */
  }
</style>