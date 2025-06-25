<script>
  import { fly, fade } from 'svelte/transition';
  import AppLogo from '$lib/icons/AppLogo.svelte';
  import TakeNote from '$lib/icons/TakeNote.svelte';

  export let visible = false;
  export let version = 'v1.3'; 

  let progress = 0;
  let interval;

  $: if (visible) {
    progress = 0;
    startFakeProgress();
  }

  function startFakeProgress() {
    clearInterval(interval);
    interval = setInterval(() => {
      if (progress < 100) {
        progress += Math.random() * 3;
      } else {
        clearInterval(interval);
      }
    }, 5);
  }
</script>

{#if visible}
  <div
    class="loading-screen"
    in:fly={{ x: 300, duration: 300 }}
    out:fade={{ duration: 300 }}
  >
    <div class="bg-overlay"></div>

    <div class="center-content">
      <div class="app-logo">
        <AppLogo />
      </div>
      <h1 class="app-title">Chismis Diary</h1>

      <div class="loading-bar">
        <div class="loading-bar-fill" style="width: {progress}%"></div>
      </div>
    </div>

    <p class="version-label">{version}</p>
  </div>
{/if}

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    background-color: #1B1A11;
    background-image: url('/images/graffitiWall.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: multiply;
    opacity: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 100001;
    padding: 1rem;
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background-color: #1B1A11;
    opacity: 0.6;
    z-index: -1;
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .app-logo {
    transform: scale(1.4);
    margin-bottom: 1rem;
  }

  .app-title {
    font-family: "Graffiti Urban", sans-serif;
    letter-spacing: -0.12rem;
    font-size: 3rem;
    color: var(--main-white);
    margin-bottom: 0.4rem;
    font-weight: bold;
  }

  .loading-bar {
    width: 80%;
    max-width: 300px;
    height: 8px;
    background-color: var(--main-dark-grey);
    border-radius: 4px;
    overflow: hidden;
  }

  .loading-bar-fill {
    height: 100%;
    background-color: var(--main-white);
    width: 0%;
    transition: width 0.2s ease-out;
  }

  .version-label {
    position: absolute;
    bottom: 1rem;
    font-size: 0.75rem;
    color: var(--main-white);
    opacity: 0.6;
    font-family: "Urbanist", sans-serif;
  }
</style>