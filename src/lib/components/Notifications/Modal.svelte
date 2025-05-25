<script>
  import { uiStore } from '$lib/stores/uiStore.js';
  import { scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte'; 
  import Button from '../Button.svelte';

  let modalElement; // For potential focus management

  function handleConfirm() {
    uiStore.confirmModal();
  }

  function handleCancel() {
    uiStore.cancelModal();
  }

  function handleOverlayClick() {
    // Simplest behavior: overlay click always tries to hide the modal.
    // If a specific onCancel is defined for "user explicitly clicked cancel button",
    // uiStore.cancelModal() handles that. This handles generic dismissal.
    uiStore.hideModal();
  }

  function handleKeydown(event) {
    if ($uiStore.isModalVisible && event.key === 'Escape') { // Check if modal is active
      event.preventDefault(); // Prevent other escape actions
      // console.log("Modal: Escape key pressed"); // For debugging
      uiStore.hideModal(); // Consistent close action for Escape
    }
  }

  // Reactive effect to focus when modal becomes visible after initial mount
  $: if ($uiStore.isModalVisible && modalElement && typeof window !== 'undefined') {
      const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable && document.activeElement !== firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 50); // Slight delay for transition
      }
  }

</script>

{#if $uiStore.isModalVisible}
  <div
    class="modal-overlay"
    on:click|self={handleOverlayClick}
    transition:fade="{{ duration: 200 }}"
    role="presentation" aria-hidden="true" tabindex="-1"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-container" on:click|stopPropagation> 
      <div
        class="modal-content"
        bind:this={modalElement}
        transition:scale="{{ duration: 250, delay: 50, opacity: 0.5, start: 0.95, easing: quintOut }}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={$uiStore.modalOptions.contentComponent ? undefined : 'modal-message'}
      >
        <!-- ... rest of your modal content (title, message, actions) ... -->
        <h3 id="modal-title" class="modal-title">{$uiStore.modalOptions.title}</h3>

        {#if $uiStore.modalOptions.contentComponent}
          <div class="modal-custom-content">
            <svelte:component
              this={$uiStore.modalOptions.contentComponent}
              {...$uiStore.modalOptions.componentProps}
            />
          </div>
        {:else if $uiStore.modalOptions.message}
          <p id="modal-message" class="modal-message">{@html $uiStore.modalOptions.message}</p>
        {/if}

        <div class="modal-actions">
          {#if !$uiStore.modalOptions.hideCancelButton}
            <Button 
            type="secondary"
              addBtn={false}
              ariaLabel={$uiStore.modalOptions.cancelText}
              onClick={() => handleCancel()}
              class="secondary"
              text={$uiStore.modalOptions.cancelText}
            />
          {/if}
          <Button 
            type="primary"
            addBtn={false}
            ariaLabel={$uiStore.modalOptions.confirmText}
            onClick={() => handleConfirm()}
            class="primary"
            text={$uiStore.modalOptions.confirmText}
          />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--form-overlay-bg, rgba(0, 0, 0, 0.65));
    z-index: 2000;
    display: flex;         /* Enable flexbox for centering */
    align-items: center;   /* Vertical centering */
    justify-content: center; /* Horizontal centering */
    padding: 1rem; /* Add some padding so modal doesn't touch screen edges on small screens */
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  .modal-container {
    display: flex; /* Optional, if modal-content needs to flex within it */
    flex-direction: column; /* Optional */
    max-width: 100%; /* Ensure it doesn't overflow overlay padding */
    max-height: 100%;
  }

  .modal-content {
    background-color: var(--card-bg); /* Use your BWP variables */
    color: var(--card-title-text);    /* Use your BWP variables */
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px var(--bw-shadow-color-strong, rgba(0,0,0,0.25));
    z-index: 2001; /* Technically not needed if it's inside the container that's above overlay */
    display: flex;
    flex-direction: column;
    width: 90vw;
    max-width: 400px;
    max-height: calc(85vh - 2rem); /* Max height considering overlay padding */
    overflow: hidden; 
  }

  .modal-title {
    margin: 0 0 0.75rem 0;
    color: var(--bw-text-primary, var(--card-title-text)); /* Use BWP variable */
    text-align: center;
    font-size: 1.6rem;
    font-weight: normal; /* Your style had normal, adjust if needed */
    line-height: 1.4;
    padding: 0 0.25rem;
  }

  .modal-message,
  .modal-custom-content {
    margin: 0 0 1.25rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
    font-family: "Urbanist", sans-serif;
    color: var(--bw-text-secondary, var(--card-title-text)); /* Use BWP variable */
    text-align: center;
    overflow-y: auto;
    flex-shrink: 1;
    padding: 0 0.25rem;
  }
  .modal-custom-content {
    flex-grow: 1;
  }

  .modal-actions {
    display: flex;
    justify-content: space-evenly;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bw-border-secondary, #e5e7eb);
  }
</style>