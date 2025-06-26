<script>
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/authStore.js';
  import { promptBiometricAuth } from '$lib/services/authService.js';
  import { fade } from 'svelte/transition';

  let view = 'verifying'; // 'verifying', 'pin', 'error'
  let enteredPin = '';
  let errorMessage = '';

  onMount(async () => {
    // If the user has biometrics enabled, try that first.
    if ($authStore.isBiometricsEnabled) {
      const authenticated = await promptBiometricAuth();
      if (authenticated) {
        authStore.unlockApp();
      } else {
        // If biometrics fail or are cancelled, fall back to PIN
        view = 'pin';
      }
    } else {
      // If biometrics are not enabled, go straight to PIN
      view = 'pin';
    }
  });

  function handleKey(key) {
    if (enteredPin.length < 4) {
      enteredPin += key;
    }
  }

  function handleDelete() {
    enteredPin = enteredPin.slice(0, -1);
  }

  async function handleSubmitPin() {
    if (enteredPin.length !== 4) return;

    const isCorrect = authStore.checkPin(enteredPin);
    if (isCorrect) {
      authStore.unlockApp();
    } else {
      errorMessage = 'Incorrect PIN. Please try again.';
      enteredPin = '';
      view = 'error';
      setTimeout(() => {
        view = 'pin'; // Return to PIN view after showing error
      }, 2000);
    }
  }

  // Auto-submit when 4 digits are entered
  $: if (enteredPin.length === 4) {
    handleSubmitPin();
  }
</script>

<div class="lock-screen-overlay" transition:fade>
  <div class="lock-screen-content">
    <h2>App Locked</h2>

    {#if view === 'verifying'}
      <p>Verifying your identity...</p>
      <!-- You could add a spinner here -->
    {/if}

    {#if view === 'pin' || view === 'error'}
      <p>Enter your 4-digit PIN</p>
      <div class="pin-display">
        <!-- Display dots for entered PIN -->
        {#each { length: 4 } as _, i}
          <span class="dot" class:filled={i < enteredPin.length}></span>
        {/each}
      </div>
      {#if view === 'error'}
        <p class="error-message">{errorMessage}</p>
      {/if}
    {/if}

    {#if view === 'pin'}
      <div class="keypad">
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as key}
          <button on:click={() => handleKey(key)}>{key}</button>
        {/each}
        <button class="control" aria-label="Placeholder"></button> <!-- Placeholder only -->
        <button on:click={() => handleKey(0)}>0</button>
        <button on:click={handleDelete} class="control">⌫</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .lock-screen-overlay {
    position: fixed;
    inset: 0;
    background: var(--card-bg); /* Use CSS variables from your theme */
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
  .error-message {
      color: var(--main-red-light);
      min-height: 1.2em;
  }
</style>