<script>
  // import { createEventDispatcher } from 'svelte'; // No longer need to dispatch 'close' for this binding
  import { fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let showModal = false; // Prop to control visibility (two-way bound)
  export let title = "Information";

  // const dispatch = createEventDispatcher(); // Not needed if parent controls via bind:showModal

  function closeModal() {
    showModal = false; // Directly change the bound prop
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    class="modal-overlay"
    on:click={closeModal}
    transition:fade={{ duration: 150 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    on:keydown={handleKeydown}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="modal-content"
      role="document"
      on:click|stopPropagation
      transition:fade={{ duration: 200, delay: 50, easing: quintOut }}
    >
      <header class="modal-header">
        <h3 id="modal-title" class="modal-title">{title}</h3>
        <button class="close-button" on:click={closeModal} aria-label="Close modal">×</button>
      </header>
      <div class="modal-body">
        <slot></slot> <!-- Content of the modal goes here -->
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0; /* Cover the whole screen */
    background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent black overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1500; /* Very high z-index */
    padding: 1rem; /* Ensure modal content doesn't touch screen edges */
  }

  .modal-content {
    background-color: #2d3748; /* Dark background for modal content (Tailwind gray-800) */
    color: #e2e8f0; /* Light text */
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    border: 1px solid #4a5568; /* Medium dark border (gray-600) */
    max-width: 500px; /* Max width of the modal */
    width: 90%; /* Responsive width */
    max-height: 80vh; /* Max height, allow scrolling for content */
    overflow-y: auto; /* Enable scrolling for modal body if content is long */
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #4a5568; /* Separator line */
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #cbd5e1; /* Lighter gray title (Tailwind slate-300) */
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: #a0aec0; /* Medium light text (gray-400) */
    font-size: 1.8rem; /* Larger close button */
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.2s;
  }
  .close-button:hover {
    color: #e2e8f0; /* Lighter on hover */
  }

  .modal-body {
    font-size: 0.9rem;
    line-height: 1.6;
    /* Styles for content inside slot will come from where it's used or global styles */
  }
  /* Example styles for content placed in slot */
  :global(.modal-body h4) { /* Targeting elements passed into the slot */
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
  }
  :global(.modal-body p) {
     margin: 0 0 0.75rem 0;
     color: #a0aec0;
  }
  :global(.modal-body ul) {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }
  :global(.modal-body li) {
      margin-bottom: 0.3rem;
      color: #cbd5e1;
      display: flex; /* Align emoji and text nicely */
      align-items: center;
      gap: 0.5rem;
   }
  :global(.modal-body li strong) {
      color: #ffffff;
   }
  :global(.modal-body li .mood-emoji-in-modal) { /* Specific class for emoji in modal list */
      font-size: 1.1em;
      width: 20px; /* Align emojis */
      text-align: center;
  }
</style>