<script>
  import { authStore } from '$lib/stores/authStore.js';
  import { promptBiometricAuth } from '$lib/services/authService.js';
  import { fade } from 'svelte/transition';

  let enteredPin = '';
  let errorMessage = '';
  let isCheckingPin = false;

  function handleKey(key) {
    if (enteredPin.length < 4) {
      enteredPin += key;
    }
  }

  function handleDelete() {
    enteredPin = enteredPin.slice(0, -1);
  }

  async function handleSubmitPin() {
    if (enteredPin.length !== 4 || isCheckingPin) return;
    isCheckingPin = true;
    const isCorrect = authStore.checkPin(enteredPin);
    if (isCorrect) {
      authStore.unlockApp();
    } else {
      errorMessage = 'Incorrect PIN. Please try again.';
      enteredPin = '';
    }
    isCheckingPin = false;
  }
  
  // This button gives the user a second chance to use biometrics.
  async function handleBiometricsButton() {
    const authenticated = await promptBiometricAuth();
    if (authenticated) {
      authStore.unlockApp();
    }
  }

  $: if (enteredPin.length === 4) {
    handleSubmitPin();
  }

  $: if (enteredPin.length > 0 && errorMessage) {
    errorMessage = '';
  }
</script>

<div class="lock-screen-overlay" transition:fade>
  <div class="lock-screen-content">
    <h2>App Locked</h2>
    <p>Enter your 4-digit PIN</p>

    <div class="pin-display">
      {#each { length: 4 } as _, i}
        <span class="dot" class:filled={i < enteredPin.length}></span>
      {/each}
    </div>

    <!-- The error message now has a placeholder to prevent layout shifts -->
    <p class="error-message">{errorMessage || ' '}</p>

    <!-- The keypad is now always visible with the PIN entry -->
    <div class="keypad" class:disabled={isCheckingPin}>
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as key}
        <button on:click={() => handleKey(key)} disabled={isCheckingPin}>{key}</button>
      {/each}
      
      <button 
        on:click={handleBiometricsButton} 
        class="control" 
        aria-label="Use Biometrics" 
        disabled={!$authStore.isBiometricsEnabled}
      >
        {#if $authStore.isBiometricsEnabled}
          <!-- Fingerprint Icon SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        {/if}
      </button>

      <button on:click={() => handleKey(0)} disabled={isCheckingPin}>0</button>
      <button on:click={handleDelete} class="control" disabled={isCheckingPin}>⌫</button>
    </div>
  </div>
</div>

<style>
  .lock-screen-overlay {
    position: fixed;
    inset: 0;
    background: var(--card-bg);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--card-title-text);
  }
  .lock-screen-content {
    text-align: center;
  }
  .pin-display {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin: 20px 0;
  }
  .dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--card-title-text);
  }
  .dot.filled {
    background: var(--card-title-text);
  }
  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 30px;
  }
  .keypad button {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: none;
    font-size: 2rem;
    background: var(--card-title-text);
    color: var(--card-bg);
    cursor: pointer;
  }
  .keypad button.control {
    background: transparent;
  }
  .keypad.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  .error-message {
    color: var(--main-red-light);
    min-height: 1.2em;
  }
</style>