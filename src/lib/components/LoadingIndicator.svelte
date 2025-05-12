<script>
  import { fade } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  export let isLoading = false; // Prop from layout
  const MIN_VISIBLE_DURATION_MS = 500; // Or your fixed 2000ms if you prefer

  let actuallyShow = false;
  let hideTimer = null;
  let showTimestamp = 0; // When it was *actually* made visible

  // This reactive block responds to changes in the `isLoading` prop
  $: {
    // console.log(`Indicator: Prop isLoading changed to: ${isLoading}, actuallyShow is: ${actuallyShow}`);
    clearTimeout(hideTimer); // Always clear pending hide timer when isLoading changes

    if (isLoading) { // Layout says: "Navigation has started"
      if (!actuallyShow) { // If not already visible, mark show time and make visible
        showTimestamp = Date.now();
        actuallyShow = true;
        // console.log(`Indicator: Made visible at ${showTimestamp}`);
      }
      // If already 'actuallyShow' is true, do nothing, let existing logic play out or just keep it visible.
    } else { // Layout says: "Navigation has ended"
      if (actuallyShow) { // Only if it was showing
        const timeAlreadyShown = Date.now() - showTimestamp;
        const delayNeededToHide = Math.max(0, MIN_VISIBLE_DURATION_MS - timeAlreadyShown);
        // console.log(`Indicator: isLoading is false. Was shown for ${timeAlreadyShown}ms. Delaying hide by ${delayNeededToHide}ms.`);

        hideTimer = setTimeout(() => {
          actuallyShow = false;
          // console.log("Indicator: Timer fired, hiding now.");
        }, delayNeededToHide);
      } else {
        // isLoading is false, and it wasn't showing anyway (e.g., very fast flicker)
        actuallyShow = false;
      }
    }
  }

  onDestroy(() => {
    clearTimeout(hideTimer);
  });
</script>

{#if actuallyShow}
  <div class="loading-overlay" transition:fade={{ duration: 150 }}>
    <div class="spinner">Loading...</div>
  </div>
{/if}


<style>
  .loading-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(26, 32, 44, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
  }
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-left-color: #ffffff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    font-size: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>