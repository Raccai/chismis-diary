<script>
  import { onDestroy, onMount } from 'svelte';

  // Props: Expects array: [{ value: 'happy', label: 'Happy', emoji: '😄', count: 15 }, ...]
  export let moodStats = [];
  export let title = "Mood Stats"; // Allow customizing title

  // Reactive calculation for max count to scale bars
  $: maxCount = moodStats.length > 0 ? Math.max(...moodStats.map(m => m.count), 1) : 1; // Use 1 as min to avoid division by zero

  // DOM element references for scrolling
  let scrollContainer = null;
  let scrollLeftButton = null;
  let scrollRightButton = null;

  // Helper function for mood colors (customize as needed)
  const moodBaseColors = {
    happy: '#34d399',   // Emerald 400
    sad: '#60a5fa',     // Blue 400
    excited: '#facc15', // Yellow 400 (Amber 400)
    angry: '#f87171',   // Red 400
    anxious: '#c084fc', // Purple 400
    okay: '#fb923c',    // Orange 400
    default: '#94a3b8'  // Slate 400
  };

  // Function to get the primary color for a mood
  function getMoodColor(moodValue) {
    return moodBaseColors[moodValue] || moodBaseColors.default;
  }

  function getLighterMoodColor(moodValue) {
     const colors = {
        happy: '#a7f3d0',   // Emerald 200
        sad: '#bfdbfe',     // Blue 200
        excited: '#fde68a', // Amber 200
        angry: '#fecaca',   // Red 200
        anxious: '#e9d5ff', // Purple 200
        okay: '#fed7aa',    // Orange 200
        default: '#cbd5e1'  // Slate 300
     };
     return colors[moodValue] || colors.default;
  }

  // Scrolling functions
  function scrollContent(direction) {
    if (!scrollContainer) return;

    // Calculate scroll amount - scroll by roughly the width of one item + gap
    const itemWidth = scrollContainer.querySelector('.mood-bar-item')?.offsetWidth || 150; // Estimate width
    const gap = 16; // Matches the gap in .bars-wrapper style (1rem)
    const scrollAmount = (itemWidth + gap) * direction; // direction is 1 or -1

    scrollContainer.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  // Function to update arrow visibility/disabled state (optional but good UX)
  function updateArrowStates() {
    if (!scrollContainer || !scrollLeftButton || !scrollRightButton) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    scrollLeftButton.disabled = scrollLeft <= 0;
    // Need a small tolerance for floating point inaccuracies
    scrollRightButton.disabled = scrollLeft >= (scrollWidth - clientWidth - 1);
  }

  onMount(() => {
    if (scrollContainer) {
      // Initial check
      updateArrowStates();

      // Add event listener to update on scroll
      scrollContainer.addEventListener('scroll', updateArrowStates, { passive: true });
    }
  });

  onDestroy(() => {
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', updateArrowStates);
    }
  });

  // Update arrows when data changes causing scroll width potentially changing
  $: if (moodStats && scrollContainer) {
    // Wait a tick for DOM to potentially update before checking scroll state
    setTimeout(updateArrowStates, 0);
  }

</script>

<div class="mood-stats-card">
  <div class="card-header">
    <h2 class="card-title">{title}</h2>
    <div class="nav-arrows">
      <button bind:this={scrollLeftButton} class="arrow-button left" on:click={() => scrollContent(-1)} aria-label="Scroll left" disabled>⬅️</button>
      <button bind:this={scrollRightButton} class="arrow-button right" on:click={() => scrollContent(1)} aria-label="Scroll right" disabled>➡️</button>
    </div>
  </div>

  <div class="scroll-container" bind:this={scrollContainer}>
    <div class="bars-wrapper">
      {#each moodStats as mood (mood.value)}
        {@const barHeightPercent = Math.max(0, Math.min(100, (mood.count / maxCount) * 100))}
        {@const barColor = getMoodColor(mood.value)}
        {@const labelBgColor = getLighterMoodColor(mood.value)}

        <div class="mood-bar-item" style="background-color: #2d3748;"> 
          <div class="count-display">{mood.count}</div>
          <div class="bar-visual-container">
             <div
               class="bar"
               style="height: {barHeightPercent}%; background-color: {barColor};"
               title="{mood.label}: {mood.count}"
             ></div>
          </div>
          <div class="label-container" style="background-color: {labelBgColor};">
            <span class="icon">{mood.emoji || '❓'}</span>
            <span class="label">{mood.label}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .mood-stats-card {
    background-color: #1a202c; /* Dark background (Tailwind gray-900) */
    color: #e2e8f0; /* Light text (Tailwind slate-200) */
    padding: 1.25rem;
    border-radius: 16px; /* More rounded */
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    border: 1px solid #2d3748; /* Darker border (Tailwind gray-800) */
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem; /* More space below header */
    padding: 0 0.25rem; /* Slight padding horizontal */
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #cbd5e1; /* Lighter gray title (Tailwind slate-300) */
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
   /* Optional: Add an icon to the title like in the image */
  .card-title::before {
     content: '📊'; /* Placeholder icon */
     font-size: 1.2em;
     /* Or use an SVG icon */
  }

  .nav-arrows {
    display: flex;
    gap: 0.5rem;
  }

  .arrow-button {
    background-color: #2d3748; /* Dark buttons (gray-800) */
    border: 1px solid #4a5568; /* Medium dark border (gray-600) */
    color: #a0aec0; /* Medium light text (gray-400) */
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex; justify-content: center; align-items: center;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    line-height: 1;
  }

  .arrow-button:hover:not(:disabled) {
    background-color: #4a5568;
    color: #e2e8f0;
  }
  .arrow-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .scroll-container {
    overflow-x: auto;
    scrollbar-width: none; /* Only needed for testing */
    -ms-overflow-style: none; 
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    padding: 0 1.5rem;
  }
  .scroll-container::-webkit-scrollbar { display: none; }

  .bars-wrapper {
    display: flex;
    gap: 1rem; /* Space between mood bars */
    padding: 0.25rem 0.5rem 0.5rem 0.5rem; /* Top/Bottom/Horizontal padding for items */
    width: max-content;
  }

  .mood-bar-item {
    width: 120px; /* Slightly wider */
    height: 240px; /* Taller */
    background-color: #2d3748; /* Default dark card background (gray-800) */
    border-radius: 12px; /* Match card rounding */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem; /* More vertical padding */
    box-sizing: border-box;
    border: 1px solid #4a5568; /* Subtle border */
    position: relative;
    text-align: center;
    overflow: hidden; /* Ensure content clips to rounded corners */
  }

  .count-display {
    font-size: 2.5rem; /* Larger count */
    font-weight: 700; /* Bolder */
    color: #ffffff; /* White count */
    line-height: 1.1;
    margin-bottom: 0.75rem; /* More space below count */
    z-index: 2; /* Above bar container */
    position: relative;
  }

  .bar-visual-container {
    position: absolute;
    bottom: 60px; /* Height of the label container + padding */
    left: 0;
    right: 0;
    height: calc(100% - 60px - 4.5rem); /* Adjust height: 100% - label height - approx count height/margin */
    display: flex;
    align-items: flex-end; /* Bar grows from bottom */
    justify-content: center;
    padding: 0 15%; /* Keep bar from edges */
    box-sizing: border-box;
    z-index: 1;
  }

  .bar {
    width: 100%;
    border-radius: 6px 6px 0 0;
    transition: height 0.4s ease-out;
  }

  .label-container {
    position: absolute; /* Position at the bottom */
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px; /* Fixed height for label area */
    border-radius: 0 0 10px 10px; /* Round bottom corners only */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Center content vertically */
    gap: 0.1rem;
    padding: 0.25rem;
    box-sizing: border-box;
    z-index: 2;
  }

  .label-container .icon {
    font-size: 1.6rem; /* Larger icon */
    line-height: 1;
    color: #1a202c; /* Darker color for icon on light background */
  }

  .label-container .label {
    font-size: 0.8rem;
    font-weight: 600; /* Bolder label */
    color: #2d3748; /* Darker color for label text */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 90%; /* Prevent text touching edges */
  }
</style>