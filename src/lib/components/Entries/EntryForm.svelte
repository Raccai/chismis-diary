<script>
  import { addEntry, updateEntry } from "$lib/utils/entryHelpers.js";
  import { moodStore } from "$lib/stores/moodStore.js";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { toasts } from "$lib/stores/toastStore";
  import { uiStore } from "$lib/stores/uiStore";
  import TiptapEditor from "../TiptapEditor.svelte";
  import Toolbar from "../Toolbar.svelte";
  import Button from "../Button.svelte";

  const dispatch = createEventDispatcher();
  export let selectedEntry = null;

  let title = "";
  let text = "";
  let currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
  let tagInput = "";
  let tags = [];
  let _loadedEntryId = null;

  let editor = null; // This is correctly bound to TiptapEditor
  let showMoodDropdown = false;
  let moodDropdownButtonRef;

  $: currentMoodDetails = $moodStore.find(m => m.value === currentMood) || $moodStore[0] || {};

  let keyboardVisible = false;
  let bottomInset = 0;

  onMount(() => {
    // We can directly focus the editor instance when it's available
    if (editor && !selectedEntry) {
      editor.chain().focus().run();
    }
    document.addEventListener('click', handleClickOutsideDropdown, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateInset);
    }
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutsideDropdown, true);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateInset);
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
    } else if (selectedEntry === null && _loadedEntryId !== null) {
      title = "";
      text = "";
      currentMood = ($moodStore && $moodStore[0]?.value) || "happy";
      tags = [];
      tagInput = "";
      _loadedEntryId = null;
      if (editor) {
        editor.chain().focus().run();
      }
    }
  }

  function updateInset() {
    const viewport = window.visualViewport;
    const diff = window.innerHeight - viewport.height;
    keyboardVisible = diff > 150;
    bottomInset = keyboardVisible ? diff : 0;
  }
  
  function isEmojiImage(emoji) { return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg')); }
  function toggleMoodDropdown() { showMoodDropdown = !showMoodDropdown; }
  function selectMood(moodValue) { currentMood = moodValue; showMoodDropdown = false; }
  function handleClickOutsideDropdown(event) {
    if (showMoodDropdown && moodDropdownButtonRef && !moodDropdownButtonRef.contains(event.target)) {
        const moodDropdownContent = document.querySelector('.mood-dropdown-options');
        if (moodDropdownContent && !moodDropdownContent.contains(event.target)) {
            showMoodDropdown = false;
        }
    }
  }
  function processTags() { tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).map(tag => tag.startsWith('#') ? tag : `#${tag}`); }
  function handleBack() { dispatch('save'); }
  function saveEntry() {
    if (text.trim() || title.trim()) {
      processTags();
      const entryData = { title: title.trim() || `Chismis - ${new Date().toLocaleDateString()}`, text: text, mood: currentMood, tags: tags };
      if (selectedEntry && selectedEntry.id) {
        uiStore.showModal({ title: 'I-update na ba natin ang Chismis?', message: `Sigurado ka bang aayusin mo ang chismis na "<strong>${entryData.title}</strong>"?`, confirmText: 'Oo!', cancelText: 'Wag muna', confirmClass: 'confirm-button', onConfirm: () => { updateEntry(selectedEntry.id, entryData.title, entryData.text, entryData.mood, entryData.tags); dispatch("save"); toasts.success(`"${entryData.title}" updated!`); }, onCancel: () => { toasts.info('Kinansela ang pag-update huhu.'); } });
      } else {
        uiStore.showModal({ title: 'I-save ang Chismis?', message: `Isasave ba natin ang bagong chismis na "<strong>${entryData.title}</strong>"?`, confirmText: 'Oo, go!', cancelText: 'Mamaya na lang', confirmClass: 'confirm-button', onConfirm: () => { addEntry(entryData.title, entryData.text, entryData.mood, entryData.tags); dispatch("save"); toasts.success(`"Nasave na ang ${entryData.title}"!`); }, onCancel: () => { toasts.info('Di nasave ang Chismis.'); } });
      }
    } else {
      toasts.error("Lagyan mo muna ng kwento o title, bes!");
    }
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
    <TiptapEditor bind:value={text} bind:editor={editor} />
    <Toolbar {editor} />
    <div class="meta-controls">
      <div class="mood-selector">
        <button
          type="button"
          class="mood-dropdown-trigger"
          style="background-color: {currentMoodDetails.colorDark}; border-color: {currentMoodDetails.colorDark}; color: {currentMoodDetails.colorLight};"
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
              <li role="option" aria-selected={currentMood === moodOption.value} class:active={currentMood === moodOption.value} on:click={() => selectMood(moodOption.value)} on:keydown={(e) => { if(e.key === 'Enter' || e.key === ' ') selectMood(moodOption.value)}} tabindex="0">
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
        <input type="text" bind:value={tagInput} on:blur={processTags} placeholder="#tags" />
      </div>
    </div>
  </div>

  <div class="form-actions" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom) + {keyboardVisible ? bottomInset + 'px' : '0px'})">
    <Button type="secondary" addBtn={false} ariaLabel="Discard" onClick={handleBack} class="secondary" text="I-Discard"/>
    <Button type="primary" addBtn={false} ariaLabel={selectedEntry ? "I-update ang Kwento" : "I-save ang Chismis"} onClick={saveEntry} class="primary" text={selectedEntry ? "I-Update" : "I-Save"}/>
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
    font-family: 'Urbanist', sans-serif;
  }
  .form-header {
    padding: 1rem 1.25rem 0.4rem 1.25rem;
    border-bottom: 2px solid var(--card-border);
  }
  .form-title-input {
    width: 100%;
    border: none;
    background: transparent;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.8rem;
    color: var(--entry-form-title);
    padding: 0.5rem 0;
    letter-spacing: -0.1rem;
    font-weight: bold;
    outline: none;
    text-align: left;
  }
  .form-title-input::placeholder {
    color: var(--entry-form-placeholder);
    font-weight: normal;
  }
  .form-content-area {
    flex-grow: 1;
    overflow: hidden; /* Prevent double scrollbars */
    display: flex;
    flex-direction: column;
  }
  .meta-controls {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
    padding: 1rem 1.25rem;
    border-top: 2px solid var(--card-border);
  }
  .mood-selector {
    position: relative;
    flex-basis: 60%;
  }
  .mood-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    border-width: 1px;
    border-style: solid;
    border-radius: 20px;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.2s;
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
    bottom: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: var(--dropdown-bg-color);
    border: 1px solid var(--dropdown-text-color);
    color: var(--dropdown-text-color);
    box-shadow: 0 4px 4px var(--bw-shadow-color-medium, rgba(0,0,0,0.4));
    border-radius: 12px;
    z-index: 10;
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
  .mood-dropdown-options li:hover,
  .mood-dropdown-options li.active {
    background-color: var(--dropdown-select-color);
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
    flex-basis: 40%;
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
  .tags-input-field input:focus {
    background-color: var(--dropdown-text-color);
    border: 2px solid var(--dropdown-bg-color);
    color: var(--dropdown-bg-color);
  }
  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 1rem 1.25rem;
    background-color: var(--dropdown-bg-color);
    border-top: 2px solid var(--secondary-btn-border);
    width: 100%;
    box-sizing: border-box;
  }
</style>