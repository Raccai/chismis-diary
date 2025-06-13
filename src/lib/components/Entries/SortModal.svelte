<script>
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Button from '../Button.svelte';
  import AZ from '$lib/icons/A-Z.svelte';
  import ZA from '$lib/icons/Z-A.svelte';
  import OldestFirst from '$lib/icons/OldestFirst.svelte';
  import NewestFirst from '$lib/icons/NewestFirst.svelte';
  import DefaultOrder from '$lib/icons/DefaultOrder.svelte';

  export let show = false;
  export let currentSortKey = 'date_desc';

  const dispatch = createEventDispatcher();

  const sortOptions = [
    { label: 'Pinakabago Muna', value: 'date_desc', iconComponent: NewestFirst },
    { label: 'Pinakaluma Muna', value: 'date_asc', iconComponent: OldestFirst },
    { label: 'Pamagat (A-Z)', value: 'title_asc', iconComponent: AZ },
    { label: 'Pamagat (Z-A)', value: 'title_desc', iconComponent: ZA },
    { label: 'Default na Ayos', value: 'none', iconComponent: DefaultOrder }
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
      <h3 id="sort-modal-title" class="modal-title-graffiti">Paano mo gustong ayusin ’to?</h3>

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
            <svelte:component this={option.iconComponent} />
            <span class="radio-label-graffiti">{option.label}</span>
          </label>
        {/each}
      </div>

      <div class="modal-actions-graffiti">
        <Button 
          type="secondary"
          addBtn={false}
          ariaLabel="Cancel"
          onClick={() => closeModal()}
          class="secondary"
          text="Bawi Muna"
        />
        <Button 
          type="primary"
          addBtn={false}
          ariaLabel="Apply Sort"
          onClick={() => applySort()}
          class="primary"
          text="Sige, Ayusin"
        />
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
    gap: 8px;
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

  /* Label */
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
  .radio-option-graffiti.checked .radio-label-graffiti {
    color: var(--card-bg);
    font-weight: 700;
  }
</style>
