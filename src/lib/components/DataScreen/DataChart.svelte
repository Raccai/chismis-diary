<script>
  import { onDestroy, onMount } from 'svelte';
  // import { moodStore } from '$lib/stores/moodStore.js'; // Not needed if colors come via moodStats prop

  // Props: Expects array:
  // [{ value: 'happy', label: 'Happy', emoji: '😄', count: 15, colorLight: '#...', colorMedium: '#...', colorDark: '#...' }, ...]
  export let moodStats = [];
  export let title = "Mood Stats";

  $: maxCount = moodStats.length > 0 ? Math.max(...moodStats.map(m => m.count), 1) : 1;

  let scrollContainer = null;
  let scrollLeftButton = null;
  let scrollRightButton = null;

  function scrollContent(direction) {
    if (!scrollContainer) return;
    const itemWidth = scrollContainer.querySelector('.mood-bar-item')?.offsetWidth || 150;
    const gap = 16;
    const scrollAmount = (itemWidth + gap) * direction;
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  function updateArrowStates() {
     if (!scrollContainer || !scrollLeftButton || !scrollRightButton) return;
     const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
     scrollLeftButton.disabled = scrollLeft <= 0;
     scrollRightButton.disabled = scrollLeft >= (scrollWidth - clientWidth - 1);
  }

  onMount(() => {
    if (scrollContainer) {
       updateArrowStates();
       scrollContainer.addEventListener('scroll', updateArrowStates, { passive: true });
    }
  });

  onDestroy(() => {
     if (scrollContainer) {
       scrollContainer.removeEventListener('scroll', updateArrowStates);
     }
  });

  $: if (moodStats && scrollContainer) {
      setTimeout(updateArrowStates, 0);
  }

</script>

<div class="mood-stats-card-dynamic">
  <div class="card-header-dynamic">
    <h2 class="card-title-dynamic">{title}</h2>
    <div class="nav-arrows-dynamic">
      <button bind:this={scrollLeftButton} class="arrow-button-dynamic left" on:click={() => scrollContent(-1)} aria-label="Scroll left" disabled>⬅️</button>
      <button bind:this={scrollRightButton} class="arrow-button-dynamic right" on:click={() => scrollContent(1)} aria-label="Scroll right" disabled>➡️</button>
    </div>
  </div>

  <div class="scroll-container-dynamic" bind:this={scrollContainer}>
    <div class="bars-wrapper-dynamic">
      {#each moodStats as mood (mood.value)}
        {@const barHeightPercent = Math.max(0, Math.min(100, (mood.count / maxCount) * 100))}
        <!-- Use colors directly from the mood object -->
        {@const barColor = mood.colorDark || '#94a3b8)'}
        {@const labelBgColor = mood.colorLight || '#cbd5e1)'}
        {@const labelTextColor = mood.colorDark || '#2d3748)'}


        <div class="mood-bar-item-dynamic">
          <div class="count-display-dynamic">{mood.count}</div>
          <div class="bar-visual-container-dynamic">
             <div
               class="bar-dynamic"
               style="height: {barHeightPercent}%; background-color: {barColor};"
               title="{mood.label}: {mood.count}"
             ></div>
          </div>
          <div class="label-container-dynamic" style="background-color: {labelBgColor};">
            <span class="icon-dynamic">{mood.emoji || '❓'}</span>
            <span class="label-dynamic" style="color: {labelTextColor};">{mood.label}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* --- Styles for DataChart with dynamic colors --- */
  /* These styles assume your BWP theme variables are set for fallback and general card look */

  .mood-stats-card-dynamic {
    background-color: var(--card-bg); /* From your dark theme for dataviz */
    color: var(--card-title-text);
    padding: 1.25rem;
    border-radius: 16px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    border: 1px solid var(--card-border);
    overflow: hidden;
  }

  .card-header-dynamic {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding: 0 0.25rem;
  }

  .card-title-dynamic {
    font-family: "Urbanist", sans-serif; /* Match EntryCard */
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--card-title-text); /* From your dataviz theme */
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-arrows-dynamic {
    display: flex;
    gap: 0.5rem;
  }

  .arrow-button-dynamic {
    background-color: var(--card-title-text); /* Match dataviz theme */
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    line-height: 1;
  }
  .arrow-button-dynamic:hover:not(:disabled) {
    background-color: #4a5568; 
  }
  .arrow-button-dynamic:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .scroll-container-dynamic {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-left: -1.25rem; /* Counteract card padding */
    margin-right: -1.25rem;
    padding-left: 1.25rem; /* Restore padding inside scroll */
    padding-right: 1.25rem;
  }
  .scroll-container-dynamic::-webkit-scrollbar {
    display: none;
  }

  .bars-wrapper-dynamic {
    display: flex;
    gap: 1rem;
    padding: 0.25rem 0.1rem 0.5rem 0.1rem; /* Minimal padding for items within scroll */
    width: max-content;
  }

  .mood-bar-item-dynamic {
    width: 100px; /* Slightly narrower to fit more */
    height: 220px; /* Slightly shorter */
    background-color: var(--card-mini-bg); /* Background for individual item */
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    box-sizing: border-box;
    /* border: 1px solid #4a5568; /* Optional inner border */
    position: relative;
    text-align: center;
    overflow: hidden;
  }

  .count-display-dynamic {
    font-size: 2.2rem; /* Adjusted */
    font-weight: 600; /* Adjusted */
    color: var(--card-title-text);
    line-height: 1.1;
    margin-bottom: 0.5rem;
    z-index: 2;
    position: relative;
  }

  .bar-visual-container-dynamic {
    position: absolute;
    bottom: 55px; /* Adjusted for label container height */
    left: 0;
    right: 0;
    height: calc(100% - 55px - 3.8rem); /* Adjust calculation */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 20%; /* Bar width within container */
    box-sizing: border-box;
    z-index: 1;
  }

  .bar-dynamic {
    width: 100%;
    /* height & background-color set by inline style */
    border-radius: 5px 5px 0 0; /* Adjusted */
    transition: height 0.4s ease-out;
  }

  .label-container-dynamic {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 55px; /* Adjusted */
    /* background-color set inline via style prop using mood.colorLight */
    border-radius: 0 0 8px 8px; /* Adjusted */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.1rem;
    padding: 0.2rem;
    box-sizing: border-box;
    z-index: 2;
  }

  .label-container-dynamic .icon-dynamic {
    font-size: 1.5rem; /* Adjusted */
    line-height: 1;
    /* color determined by labelTextColor (mood.colorDark) in the span style */
  }

  .label-container-dynamic .label-dynamic {
    font-size: 0.75rem; /* Adjusted */
    font-weight: 500;  /* Adjusted */
    /* color set inline via style prop using mood.colorDark */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 90%;
    font-family: 'Urbanist', sans-serif;
  }
</style>