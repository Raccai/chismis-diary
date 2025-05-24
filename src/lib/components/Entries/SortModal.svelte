<script>
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let show = false;
  export let currentSortKey = 'date_desc';

  const dispatch = createEventDispatcher();

  const sortOptions = [
    { label: 'Newest First', value: 'date_desc', icon: '📅⬇️' },
    { label: 'Oldest First', value: 'date_asc', icon: '📅⬆️' },
    { label: 'Title (A-Z)', value: 'title_asc', icon: '🏷️🅰️' },
    { label: 'Title (Z-A)', value: 'title_desc', icon: '🏷️🇿' },
    { label: 'Default Order', value: 'none', icon: '🔄' }
  ];

  let internalSortKey = currentSortKey;
  let modalContentElement;
  let firstRadioInputElement; // This will hold the DOM element

  $: if (show) {
    internalSortKey = currentSortKey;
  }

  function applySort() {
    if (internalSortKey !== currentSortKey) {
        dispatch('sortChange', internalSortKey);
    }
    closeModal();
  }

  function closeModal() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (show && event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  $: if (show && firstRadioInputElement && typeof window !== 'undefined') {
    setTimeout(() => {
        if (document.activeElement !== firstRadioInputElement) {
            firstRadioInputElement.focus();
        }
    }, 260);
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="sort-modal-overlay-bwp" on:click|self={closeModal} transition:fade="{{duration: 200}}">
    <div class="sort-modal-content-bwp" bind:this={modalContentElement}
         transition:scale="{{duration:250, start:0.95, opacity:0.7, easing:quintOut}}"
         role="dialog" aria-modal="true" aria-labelledby="sort-modal-title-bwp"
         on:click|stopPropagation >
      <h3 id="sort-modal-title-bwp" class="modal-title-graffiti-bwp">Sort Chismis By</h3>

      <div class="options-list-graffiti-bwp">
        {#each sortOptions as option, i (option.value)}
          <label class="radio-option-graffiti-bwp">
            {#if i === 0}
              <input
                bind:this={firstRadioInputElement} 
                type="radio"
                name="sort-option-bwp"
                value={option.value}
                bind:group={internalSortKey}
                aria-labelledby={`label-bwp-${option.value}`}
                id={`radio-bwp-${option.value}`}
              />
            {:else}
              <input
                type="radio"
                name="sort-option-bwp"
                value={option.value}
                bind:group={internalSortKey}
                aria-labelledby={`label-bwp-${option.value}`}
                id={`radio-bwp-${option.value}`}
              />
            {/if}
            <span class="radio-custom-graffiti-bwp" aria-hidden="true">
            </span>
            <span class="radio-icon-bwp">{option.icon}</span>
            <span id={`label-bwp-${option.value}`} class="radio-label-graffiti-bwp">{option.label}</span>
          </label>
        {/each}
      </div>

      <div class="modal-actions-graffiti-bwp">
        <button type="button" class="modal-button-graffiti-bwp cancel" on:click={closeModal}>Cancel</button>
        <button type="button" class="modal-button-graffiti-bwp apply" on:click={applySort}>Apply Sort</button>
      </div>
    </div>
  </div>
{/if}

<!-- Styles remain the same as your previous full version -->
<style>
  /* ... PASTE YOUR FULL CSS FROM THE PREVIOUS RESPONSE HERE ... */
  .sort-modal-overlay-bwp {
    position: fixed;
    inset: 0;
    background-color: var(--form-overlay-bg, rgba(0,0,0,0.6));
    z-index: 1080;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .sort-modal-content-bwp {
    background-color: var(--bw-bg-secondary, #2d2d2d);
    color: var(--bw-text-primary, #e4e6eb);
    border-radius: 18px;
    padding: 1.5rem 1.75rem;
    box-shadow: 0 0 0 3px var(--bw-accent-pink, #ff69b4), 0px 5px 25px rgba(0,0,0,0.5);
    z-index: 1081;
    width: 90vw;
    max-width: 360px;
    border: 2px solid var(--bw-bg-contrast, #000000);
  }

  .modal-title-graffiti-bwp {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.8rem;
    text-align: center;
    color: var(--bw-accent-pink, #ff69b4);
    margin-bottom: 1.25rem;
    text-shadow: 1px 1px 0px var(--bw-bg-contrast, #000000), -1px -1px 0px var(--bw-bg-contrast, #000000);
  }

  .options-list-graffiti-bwp {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .radio-option-graffiti-bwp {
    display: flex;
    align-items: center;
    padding: 0.8rem 0.6rem;
    background-color: var(--bw-bg-tertiary, #3a3b3c);
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 0.2s, border-color 0.2s;
    position: relative;
  }
  .radio-option-graffiti-bwp:hover {
    background-color: color-mix(in srgb, var(--bw-accent-pink, #ff69b4) 8%, var(--bw-bg-tertiary));
  }

  .radio-option-graffiti-bwp input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .radio-custom-graffiti-bwp {
    width: 20px;
    height: 20px;
    border: 2px solid var(--bw-text-secondary, #b0b3b8);
    border-radius: 50%;
    margin-right: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, background-color 0.2s;
    flex-shrink: 0;
  }

  .radio-option-graffiti-bwp input[type="radio"]:checked + .radio-custom-graffiti-bwp {
    border-color: var(--bw-accent-pink, #ff69b4);
    background-color: var(--bw-accent-pink, #ff69b4);
  }
  .radio-option-graffiti-bwp input[type="radio"]:checked + .radio-custom-graffiti-bwp::before {
    content: '';
    width: 8px;
    height: 8px;
    background-color: var(--bw-bg-secondary, #2d2d2d);
    border-radius: 50%;
    display: block;
  }
  .radio-option-graffiti-bwp input[type="radio"]:focus-visible ~ .radio-custom-graffiti-bwp {
      outline: 2px solid var(--bw-accent-pink, #ff69b4);
      outline-offset: 1px;
  }

  .radio-icon-bwp {
    font-size: 0.9rem;
    margin-right: 0.5rem;
    color: var(--bw-text-primary, #e4e6eb);
    line-height: 1;
  }
  .radio-label-graffiti-bwp {
    font-family: 'Urbanist', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--bw-text-primary, #e4e6eb);
    flex-grow: 1;
  }

  .radio-option-graffiti-bwp input[type="radio"]:checked ~ .radio-label-graffiti-bwp,
  .radio-option-graffiti-bwp input[type="radio"]:checked ~ .radio-icon-bwp {
    color: var(--bw-accent-pink, #ff69b4);
    font-weight: 600;
  }

  .modal-actions-graffiti-bwp {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .modal-button-graffiti-bwp {
    flex-grow: 1;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1rem;
    letter-spacing: 0.05rem;
    border: 2px solid var(--bw-bg-contrast, #000000);
    transition: background-color 0.2s, color 0.2s, transform 0.1s;
  }
  .modal-button-graffiti-bwp.cancel {
    background-color: var(--bw-bg-tertiary, #3a3b3c);
    color: var(--bw-text-secondary, #b0b3b8);
    border-color: var(--bw-text-secondary, #b0b3b8);
  }
  .modal-button-graffiti-bwp.cancel:hover {
    background-color: #4f4f4f;
    border-color: #4f4f4f;
  }
  .modal-button-graffiti-bwp.apply {
    background-color: var(--bw-accent-pink, #ff69b4);
    color: var(--bw-text-on-contrast, #ffffff);
    border-color: var(--bw-accent-pink, #ff69b4);
  }
  .modal-button-graffiti-bwp.apply:hover {
    background-color: var(--bw-accent-pink-dark, #f953a4);
    border-color: var(--bw-accent-pink-dark, #f953a4);
  }
  .modal-button-graffiti-bwp:active {
      transform: scale(0.96);
  }
</style>