<script>
  import { createEventDispatcher } from 'svelte';
  import { authStore } from '$lib/stores/authStore.js';
  import { toasts } from '$lib/stores/toastStore.js';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let step = 'enter'; // 'enter', 'confirm', 'mismatch'
  let firstPin = '';
  let secondPin = '';
  let errorMessage = '';

  function handleKey(key) {
    if (step === 'enter' && firstPin.length < 4) {
      firstPin += key;
    } else if (step === 'confirm' && secondPin.length < 4) {
      secondPin += key;
    }
  }

  function handleDelete() {
    if (step === 'enter') {
      firstPin = firstPin.slice(0, -1);
    } else if (step === 'confirm') {
      secondPin = secondPin.slice(0, -1);
    }
  }

  function reset() {
    firstPin = '';
    secondPin = '';
    step = 'enter';
    errorMessage = "PINs didn't match. Please try again.";
    setTimeout(() => errorMessage = '', 2500); // Clear error message
  }

  // Reactive logic to move between steps and finalize
  $: if (firstPin.length === 4 && step === 'enter') {
    step = 'confirm';
  }

  $: if (secondPin.length === 4 && step === 'confirm') {
    if (firstPin === secondPin) {
      authStore.setPin(firstPin);
      toasts.success('PIN successfully set!');
      dispatch('close');
    } else {
      reset();
    }
  }
</script>

<div class="pin-setup-overlay" transition:fade>
  <div class="pin-setup-content">
    {#if step === 'enter'}
      <h2>Set a New PIN</h2>
      <p>Enter a 4-digit PIN.</p>
    {:else if step === 'confirm'}
      <h2>Confirm Your PIN</h2>
      <p>Enter the same PIN again.</p>
    {/if}
    
    <div class="pin-display">
      {#each { length: 4 } as _, i}
        <span 
          class="dot" 
          class:filled={ (step === 'enter' && i < firstPin.length) || (step === 'confirm' && i < secondPin.length) }
        ></span>
      {/each}
    </div>

    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}

    <div class="keypad">
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as key}
        <button on:click={() => handleKey(key)}>{key}</button>
      {/each}
      <button on:click={() => dispatch('close')} class="control text-btn">Cancel</button>
      <button on:click={() => handleKey(0)}>0</button>
      <button on:click={handleDelete} class="control">⌫</button>
    </div>

  </div>
</div>

<style>
  /* Styles are similar to LockScreen for consistency */
  .pin-setup-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    z-index: 2100; display: flex; justify-content: center; align-items: center;
  }
  .pin-setup-content {
    background: var(--card-bg); color: var(--text-color);
    padding: 2rem; border-radius: 12px; text-align: center;
    width: clamp(300px, 90vw, 350px);
  }
  h2 { margin: 0 0 0.5rem 0; }
  p { margin: 0 0 1rem 0; opacity: 0.8; }
  .error-message { color: var(--danger-color, red); min-height: 1.2em; }
  .pin-display { display: flex; justify-content: center; gap: 15px; margin: 20px 0; }
  .dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--primary-color, #333); }
  .dot.filled { background: var(--primary-color, #333); }
  .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 1.5rem; }
  .keypad button {
    width: 65px; height: 65px; border-radius: 50%; border: none; font-size: 1.8rem;
    background: var(--keypad-bg, #f0f0f0); color: var(--text-color, #000); cursor: pointer;
  }
  .keypad button.control { background: transparent; font-size: 1.2rem; }
  .keypad button.text-btn { font-size: 1rem; }
</style>