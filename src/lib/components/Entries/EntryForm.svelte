<script>
	import { entriesStore } from "$lib/stores/entriesStore.js";
    import { addEntry, updateEntry } from "$lib/utils/entryHelpers.js";
    import { moodStore } from "$lib/stores/moodStore";
    import { createEventDispatcher, onMount } from "svelte"; // onMount for potential autofocus
    import MoodChip from '../MoodChip.svelte';

    const dispatch = createEventDispatcher();
    export let selectedEntry = null;

    let title = "";
    let text = "";
    let currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
    let tagInput = "";
    let tags = [];
    let _loadedEntryId = null;

    // Autofocus the title field when the form opens for a new entry
    let titleInputRef;
    onMount(() => {
        if (!selectedEntry && titleInputRef) {
            titleInputRef.focus();
        }
    });

    $: {
        if (selectedEntry && selectedEntry.id !== _loadedEntryId) {
            title = selectedEntry.title || "";
            text = selectedEntry.text || "";
            currentMood = selectedEntry.mood || (($moodStore && $moodStore[0]?.value) || "happy");
            tags = selectedEntry.tags ? [...selectedEntry.tags] : [];
            tagInput = tags.map(t => t.startsWith('#') ? t.substring(1) : t).join(', ');
            _loadedEntryId = selectedEntry.id;
        }
        else if (selectedEntry === null && _loadedEntryId !== null) {
            title = "";
            text = "";
            currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
            tags = [];
            tagInput = "";
            _loadedEntryId = null;
            if (titleInputRef) { // Autofocus when creating new after editing
                setTimeout(() => titleInputRef.focus(), 0); // Timeout for DOM update
            }
        }
    }

    function handleMoodSelect(event) {
        currentMood = event.detail;
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
</script>

<div class="entry-form-container">
  <form on:submit|preventDefault={saveEntry}>
    <div class="scrollable-form-content"> 
      <h2 class="form-title">{selectedEntry ? "Edit Chismis" : "Spill the Tea!"}</h2>

      <div class="form-field">
          <label for="title">Headline</label>
          <input type="text" id="title" bind:this={titleInputRef} bind:value={title} placeholder="What's the juicy title?" />
      </div>

      <div class="form-field">
          <label for="description">The Deets</label>
          <textarea id="description" bind:value={text} placeholder="Tell me everything, besh..." rows="5"></textarea>
      </div>

      <div class="form-section mood-section">
          <h3 class="section-title">How's the Vibe?</h3>
          <div class="mood-chips-container">
              {#each $moodStore as moodOption (moodOption.value)}
                  <MoodChip {moodOption} isSelected={moodOption.value === currentMood} on:select={handleMoodSelect} />
              {/each}
          </div>
      </div>

      <div class="form-field">
          <label for="tags">Tag It (comma-separated)</label>
          <input type="text" id="tags" bind:value={tagInput} on:blur={processTags} placeholder="e.g., #Scandal, #Funny, #OMG" />
      </div>
    </div> <!-- END OF .scrollable-form-content -->

    <div class="save-btn-cont"> <!-- Now part of the form, will be at the bottom of .scrollable-form-content -->
        <button type="submit" class="save-button">
            <span class="button-icon"> 😂 </span>
            {selectedEntry ? "Update Story" : "Save Chismis"}
        </button>
    </div>
  </form>
</div>

<style>
    .entry-form-container {
        display: flex; 
        flex-direction: column;
        height: 100%; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .entry-form-container form {
        display: flex;
        flex-direction: column;
        flex-grow: 1; /* Make form take available space */
        height: 100%; /* Ensure form itself also tries to fill height */
    }

    .scrollable-form-content {
        flex-grow: 1; /* This part will take up space and scroll */
        overflow-y: auto;
        padding: 1.5rem; /* Your original form padding */
        padding-bottom: 8rem; /* Reduce bottom padding as button is separate */
    }

    .form-title {
        text-align: center;
        color: #fd79a8; 
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
        font-weight: bold;
    }

    .form-field {
        margin-bottom: 1.25rem;
    }

    .form-field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: #57606f;
    }

    .form-field input[type="text"],
    .form-field textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #dcdde1;
        border-radius: 8px;
        box-sizing: border-box;
        font-size: 1rem;
        background-color: #f5f6fa; 
        color: #2f3542;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-field input[type="text"]:focus,
    .form-field textarea:focus {
        outline: none;
        border-color: #fd79a8; 
        box-shadow: 0 0 0 3px rgba(253, 121, 168, 0.2);
    }
    .form-field textarea {
        min-height: 120px;
        resize: vertical;
    }

    .form-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #fff0f5; 
        border-radius: 8px;
    }
    .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #c23616;
        margin-top: 0;
        margin-bottom: 0.75rem;
    }

    .mood-chips-container {
        display: flex;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        margin-left: -1rem;
        margin-right: -1rem;
    }
    .mood-chips-container::before,
    .mood-chips-container::after {
        content: '';
        display: inline-block;
        min-width: 1rem;
    }
    .mood-chips-container::-webkit-scrollbar { display: none; }
    .mood-chips-container { -ms-overflow-style: none; scrollbar-width: none; }

    :global(.entry-form-container .mood-chip) { 
        padding: 0.3rem 0.7rem;
        font-size: 0.85rem;
    }
    :global(.entry-form-container .mood-chip .emoji) {
        font-size: 1em;
    }

    .save-btn-cont {
        background: white;
        padding: 1.5rem;
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        box-shadow: 0 -4px -4px rgba(0, 0, 0, 0.4);
        border-top: 1px solid #ff7eb3;
    }
    .save-button {
        display: flex; /* For icon and text alignment */
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 0.8rem 1.5rem;
        background-image: linear-gradient(to right, #ff758c 0%, #ff7eb3 100%);
        color: white;
        border: none;
        border-radius: 25px; /* Pill shape */
        cursor: pointer;
        font-weight: bold;
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 10px rgba(255, 121, 168, 0.4);
        transition: all 0.3s ease;
    }
    .save-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(255, 121, 168, 0.5);
    }
    .save-button .button-icon {
        margin-right: 0.5rem;
        font-family: 'Material Symbols Outlined'; 
        font-size: 1.3em;
    }

    .entry-form-container form {
        display: flex;
        flex-direction: column;
        flex-grow: 1; 
    }
</style>