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
        <button class="close-button" on:click={closeModal} aria-label="Close modal">✌️</button>
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
    inset: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1500;
    padding: 1rem;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    position: relative;
    background-color: var(--card-bg);
    color: var(--card-title-text);
    padding: 2rem 1.5rem;
    border-radius: 12px;
    border: 4px solid var(--accent-color);
    box-shadow:
      0 0 0 2px var(--card-border),
      0 8px 24px rgba(0, 0, 0, 0.4);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* subtle spray-paint texture */
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 40%);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-family: "Urbanist", sans-serif;
    font-size: 1.6rem;
    margin: 0;
    /* graffiti-style text shadow layering */
    text-shadow:
      2px 2px 0 var(--accent-color),
    -2px -2px 0 var(--highlight-color),
      2px -2px 0 var(--card-border),
    -2px 2px 0 var(--card-border);
  }

  .close-button {
    background: var(--accent-color);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--card-bg);
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .close-button:hover {
    background: var(--highlight-color);
    transform: rotate(90deg);
  }

  .modal-body {
    width: 100%;
    font-family: "Urbanist", sans-serif;
    font-size: 0.95rem;
    line-height: 1.6;
  }
</style>