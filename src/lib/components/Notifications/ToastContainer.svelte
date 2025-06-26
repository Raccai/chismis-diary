<script>
  import { toasts } from '$lib/stores/toastStore.js';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import InfoToastIcon from '$lib/icons/InfoToastIcon.svelte';
  import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
  import FailIcon from '$lib/icons/FailIcon.svelte';
  import WarningIcon from '$lib/icons/WarningIcon.svelte';

  // Emojis for now, will make icons later
  const icons = {
    info: InfoToastIcon,
    success: SuccessIcon,
    error: FailIcon,
    warning: WarningIcon
  };
</script>

{#if $toasts.length > 0}
  <div class="toast-container">
    {#each $toasts as toast (toast.id)}
      <div
        class="toast toast-{toast.type}"
        in:fly="{{ y: -30, duration: 300, easing: quintOut }}"
        out:fade="{{ duration: 200 }}"
        role="alert"
        aria-live="assertive"
      >
        <span class="toast-icon">
          <svelte:component this={icons[toast.type] || InfoToastIcon} />
        </span>
        <p class="toast-message">{toast.message}</p>
        <button class="toast-close-button" on:click={() => toasts.remove(toast.id)} aria-label="Dismiss notification">
          ×
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: calc(var(--topbar-height, 60px) + 1rem); /* Below topbar */
    right: 1rem;
    z-index: 99998; /* Highest z-index */
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: auto; /* Let toasts define width, up to a max */
    max-width: 350px;
  }

  .toast {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--bw-shadow-color-medium, rgba(0,0,0,0.15));
    color: var(--card-title-text); /* Default text color for toasts */
    font-size: 0.9rem;
    min-width: 280px;
  }

  .toast-icon {
    width: 36px;
    height: 36px;
    transform: scale(0.4);
    margin-right: 0.4rem;
    margin-top: -0.4rem;
  }

  .toast-message {
    flex-grow: 1;
    margin: 0;
    line-height: 1.2rem;
    font-family: "Urbanist", sans-serif;
    color: var(--card-title-text);
  }

  .toast-close-button {
    background: none;
    border: none;
    color: inherit; /* Inherits from .toast */
    opacity: 0.7;
    font-size: 1.2rem;
    margin-left: 0.75rem;
    padding: 0.25rem;
    line-height: 1;
    cursor: pointer;
  }
  .toast-close-button:hover {
    opacity: 1;
  }

  /* Toast Types - Using BWP theme accents */
  .toast-info {
    background-color: var(--toast-bg);
    border-top: 2px solid var(--main-blue-light); 
    color: var(--toast-text);
  }
  .toast-success {
    background-color: var(--toast-bg);
    border-top: 2px solid var(--main-green-light); 
    color: var(--toast-text);
  }
  .toast-error {
    background-color: var(--toast-bg);
    border-top: 2px solid var(--main-red-light); 
    color: var(--toast-text);
  }
  .toast-warning {
    background-color: var(--toast-bg);
    border-top: 2px solid var(--main-yellow-light); 
    color: var(--toast-text);
  }

  /* Adjust text color for specific toast types if needed for contrast */
  .toast-success, .toast-warning {
    color: var(--bw-bg-contrast, #000000); /* Darker text on lighter success/warning backgrounds */
  }
  .toast-success .toast-close-button,
  .toast-warning .toast-close-button {
    color: inherit;
  }

</style>