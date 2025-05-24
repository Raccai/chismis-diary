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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="sort-modal-overlay" on:click|self={closeModal} transition:fade="{{duration: 200}}">
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
      class="sort-modal-content"
      transition:scale="{{duration:250, start:0.95, opacity:0.7, easing:quintOut}}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sort-modal-title"
      on:click|stopPropagation
    >
      <h3 id="sort-modal-title" class="modal-title-graffiti">Sort Chismis By</h3>

      <div class="options-list-graffiti">
        {#each sortOptions as option (option.value)}
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <label
            class="radio-option-graffiti"
            class:checked={internalSortKey === option.value}
            on:click={() => (internalSortKey = option.value)}
          >
            <input
              type="radio"
              name="sort-option"
              value={option.value}
              bind:group={internalSortKey}
              hidden
            />
            <span class="radio-custom-graffiti" aria-hidden="true"></span>
            <span class="radio-icon">{option.icon}</span>
            <span class="radio-label-graffiti">{option.label}</span>
          </label>
        {/each}
      </div>

      <div class="modal-actions-graffiti">
        <button type="button" class="modal-button-graffiti cancel" on:click={closeModal}>
          Cancel
        </button>
        <button type="button" class="modal-button-graffiti apply" on:click={applySort}>
          Apply Sort
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Overlay & container */
  .sort-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .sort-modal-content {
    background-color: var(--card-bg);
    color: var(--card-title-text);
    border-radius: 18px;
    padding: 1.5rem 1.75rem;
    box-shadow: var(--card-shadow);
    width: 90vw;
    max-width: 360px;
    border: 2px solid var(--card-border);
  }

  /* Title & buttons */
  .modal-title-graffiti {
    font-family: 'Graffiti Urban', sans-serif;
    font-weight: normal;
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.25rem;
  }
  .modal-actions-graffiti {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .modal-button-graffiti {
    flex: 1;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1rem;
    border: 2px solid currentColor;
    transition: transform 0.1s;
  }
  .modal-button-graffiti:active {
    transform: scale(0.96);
  }
  .modal-button-graffiti.cancel {
    background-color: var(--secondary-btn-bg);
    color: var(--secondary-btn-text);
    border-color: var(--secondary-btn-border);
  }
  .modal-button-graffiti.apply {
    background-color: var(--primary-btn-bg);
    color: var(--primary-btn-text);
  }

  /* Options list */
  .options-list-graffiti {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }
  .radio-option-graffiti {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.8rem;
    border: 2px dashed var(--card-border);
    border-radius: 10px;
    background: var(--card-mini-bg);
    color: var(--card-title-text);
    cursor: pointer;
    transition: 
      background 0.2s, 
      color 0.2s, 
      transform 0.15s ease-out,
      border-color 0.2s,
      opacity 0.2s;
  }
  .radio-option-graffiti:hover,
  .radio-option-graffiti:active,
  .radio-option-graffiti.checked {
    transform: scale(1.03) rotate(-1deg);
    opacity: 1;
  }

  /* Spray splatter */
  .radio-option-graffiti::before {
    content: '';
    position: absolute;
    top: -20%;
    left: -20%;
    width: 140%;
    height: 140%;
    background-image: url('/assets/spray-splatter.svg'); /* Will add soon */
    background-size: 200px 200px;
    background-repeat: no-repeat;
    opacity: 0.08;
    pointer-events: none;
    transform: rotate(var(--splatter-rot, 0deg));
    transition: transform 0.3s, opacity 0.2s;
  }
  .radio-option-graffiti:hover {
    --splatter-rot: 6deg;
  }

  /* Custom radio “circle” */
  .radio-custom-graffiti {
    width: 20px;
    height: 20px;
    border: 2px dashed currentColor;
    border-radius: 50%;
    margin-right: 0.75rem;
    position: relative;
    transition: background 0.2s, border-color 0.2s;
  }
  /* Drip under dot when checked */
  .radio-custom-graffiti::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 3px;
    height: 6px;
    background: currentColor;
    border-radius: 1px;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* Icon & label */
  .radio-icon {
    font-size: 0.9rem;
    margin-right: 0.5rem;
    line-height: 1;
  }
  .radio-label-graffiti {
    font-family: 'Urbanist', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    flex-grow: 1;
  }

  /* Checked state */
  .radio-option-graffiti.checked {
    background: var(--card-title-text);
    color: var(--card-bg);
    border-color: var(--card-title-text);
  }
  .radio-option-graffiti.checked .radio-custom-graffiti {
    background: var(--card-bg);
    border-color: var(--card-bg);
  }
  .radio-option-graffiti.checked .radio-custom-graffiti::after {
    opacity: 1;
  }
  .radio-option-graffiti.checked .radio-icon,
  .radio-option-graffiti.checked .radio-label-graffiti {
    color: var(--card-bg);
    font-weight: 700;
  }
</style>
