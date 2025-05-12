<script>
    import { moodStore } from '$lib/stores/moodStore.js';
    import { get } from 'svelte/store';
    import { onDestroy, onMount } from 'svelte';
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let dailyData = [];
    export let title = "Daily Mood Overview";

    // --- Mood Definitions & Colors ---
    const moodDefinitions = get(moodStore) || [];
    const moodMap = new Map(moodDefinitions.map(m => [m.value, m]));
    const moodBaseColors = {
      happy: '#34d399', sad: '#60a5fa', excited: '#facc15', angry: '#f87171',
      anxious: '#c084fc', okay: '#fb923c', default: '#94a3b8'
    };
    const defaultBgColor = '#2d3748';
    const paddingBgColor = 'transparent';
    const borderColor = '#4a5568';

    // --- State for Active Tooltip ---
    // Now stores data AND position info
    let activeTooltipData = null; // { data: { date, dayName, ... }, position: { top, left, width } } | null
    let tooltipElement = null; // Still useful for click-outside

    // --- Mood Styling Function ---
    function getMoodStyling(moodValue) {
        if (moodValue === 'padding') {
            return { emoji: null, bgColor: paddingBgColor, label: '' };
        }
        const moodDef = moodMap.get(moodValue);
        if (moodDef) {
            const baseColor = moodBaseColors[moodDef.value] || moodBaseColors.default;
            const bgColor = moodValue ? `${baseColor}33` : defaultBgColor;
            return { emoji: moodDef.emoji, bgColor: bgColor, label: moodDef.label };
        } else {
            return { emoji: '➖', bgColor: defaultBgColor, label: 'No Entry' };
        }
    }

    // --- Padding Logic ---
    $: paddedDailyData = (() => {
        if (!dailyData || dailyData.length === 0) return [];
        const firstDate = new Date(dailyData[0].date + 'T00:00:00');
        let dayOfWeek = firstDate.getDay();
        const gridStartDay = 1;
        let paddingNeeded = dayOfWeek - gridStartDay;
        if (paddingNeeded < 0) paddingNeeded += 7;
        const padding = Array.from({ length: paddingNeeded }).map((_, i) => ({
            date: `padding-${i}`, dominantMoodValue: 'padding', entryCount: 0
        }));
        return [...padding, ...dailyData];
    })();

    // --- Helper Functions ---
    function getDayName(dateString) {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    }

    // --- Event Handlers ---
    function handleCellClick(day, event) {
        event.stopPropagation();
        if (day.dominantMoodValue === 'padding') {
            closeTooltip(); return;
        }

        // Get position of the clicked cell relative to viewport
        const rect = event.target.getBoundingClientRect();

        // Toggle or set new tooltip data + position
        if (activeTooltipData && activeTooltipData.data.date === day.date) {
            closeTooltip();
        } else {
            const styling = getMoodStyling(day.dominantMoodValue);
            activeTooltipData = {
                data: {
                    date: day.date,
                    dayName: getDayName(day.date),
                    label: styling.label,
                    emoji: styling.emoji,
                    entryCount: day.entryCount,
                },
                position: {
                    // Calculate position for tooltip (aiming above the cell)
                    top: rect.top, // Position relative to cell top
                    left: rect.left + rect.width / 2, // Center horizontally relative to cell center
                    width: rect.width // Not strictly needed for positioning, but maybe useful
                }
            };
            // console.log('Opening tooltip for:', activeTooltipData);
        }
    }

    function closeTooltip() {
        if (activeTooltipData) {
            activeTooltipData = null;
        }
    }

    // --- Global Click Listener ---
    function handleWindowClick(event) {
        if (tooltipElement && !tooltipElement.contains(event.target)) {
            // Check if the click was on a cell - handleCellClick stops propagation,
            // so if it reaches here and is outside tooltip, we can close.
            closeTooltip();
        } else if (!tooltipElement && activeTooltipData) {
             // Fallback
             closeTooltip();
        }
    }

    onMount(() => { window.addEventListener('click', handleWindowClick); });
    onDestroy(() => { window.removeEventListener('click', handleWindowClick); });

    // --- Calculate number of rows ---
    $: numberOfRows = Math.ceil(paddedDailyData.length / 7) || 1;

</script>

<div class="heatmap-card">
  <div class="card-header">
    <h2 class="card-title">{title}</h2>
  </div>

  {#if !paddedDailyData || paddedDailyData.length === 0}
    <p class="no-data-message">Not enough data for heatmap.</p>
  {:else}
    <div class="heatmap-grid-container">
       <div class="heatmap-grid" style="--grid-rows: {numberOfRows};">
         {#each paddedDailyData as day (day.date)}
            {@const styling = getMoodStyling(day.dominantMoodValue)}
            {@const tooltipText = `${day.date}${styling.label !== 'No Entry' ? ': ' + styling.label : ': No entries'}${day.entryCount > 0 ? ' ('+day.entryCount+' entr'+(day.entryCount===1?'y':'ies')+')' : ''}`}
            <div
               class:padding={day.dominantMoodValue === 'padding'}
               class:no-entry={!day.dominantMoodValue && day.dominantMoodValue !== 'padding'}
               class="heatmap-cell"
               style="background-color: {styling.bgColor}; border-color: {borderColor};"
               title={tooltipText}
               aria-label={tooltipText}
               on:click={(e) => handleCellClick(day, e)}
               role="button"
               tabindex={day.dominantMoodValue === 'padding' ? -1 : 0}
               on:keydown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleCellClick(day, e); }}
            >
               {#if styling.emoji}
                 <span class="emoji">{styling.emoji}</span>
               {/if}
            </div>
         {/each}
       </div>
    </div>
    <!-- Legend removed as requested -->
  {/if}

  <!-- TOOLTIP: Positioned using fixed positioning and inline styles -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if activeTooltipData}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="heatmap-tooltip"
        bind:this={tooltipElement}
        transition:scale={{ duration: 150, easing: quintOut, start: 0.9 }}
        on:click|stopPropagation
        style="top: {activeTooltipData.position.top}px;
               left: {activeTooltipData.position.left}px;"
    >
        <span class="tooltip-day">{activeTooltipData.data.dayName}</span>
        <span class="tooltip-date">{activeTooltipData.data.date}</span>
        <div class="tooltip-mood">
            {#if activeTooltipData.data.emoji !== '➖'}
                <span class="tooltip-emoji">{activeTooltipData.data.emoji}</span>
                <span class="tooltip-label">{activeTooltipData.data.label}</span>
            {:else}
                 <span class="tooltip-label">{activeTooltipData.data.label}</span>
            {/if}
        </div>
        {#if activeTooltipData.data.entryCount > 0}
           <span class="tooltip-count">{activeTooltipData.data.entryCount} entr{activeTooltipData.data.entryCount === 1 ? 'y' : 'ies'}</span>
        {/if}
    </div>
  {/if}

</div>

<style>
  .heatmap-card {
    background-color: #1a202c;
    color: #e2e8f0;
    padding: 1rem 1.25rem 1.25rem 1.25rem;
    border-radius: 16px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    border: 1px solid #2d3748;
  }

  .card-header {
    margin-bottom: 0.75rem;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #cbd5e1;
    margin: 0;
  }

  .no-data-message {
    text-align: center;
    color: #a0aec0;
    padding: 1rem 0;
    font-style: italic;
  }

  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(16px, 1fr);
    gap: 2px;
    aspect-ratio: 7 / var(--grid-rows);
    max-width: 250px;
    margin: 0 auto 1rem auto;
  }

  .heatmap-cell {
    border: 1px solid;
    border-radius: 3px;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s, border-color 0.1s;
    overflow: hidden;
    cursor: pointer;
  }
  .heatmap-cell:not(.padding):hover,
  .heatmap-cell:not(.padding):focus {
     border-color: #e2e8f0;
     outline: none;
  }
  .heatmap-cell.padding {
     background-color: transparent;
     border: none;
     cursor: default;
  }
  .heatmap-cell .emoji {
      font-size: 0.8em;
      line-height: 1;
      filter: grayscale(30%);
      opacity: 0.9;
      pointer-events: none;
  }


  /* --- Tooltip Styles --- */
  .heatmap-tooltip {
    position: fixed;
    transform: translateX(-50%) translateY(-100%) translateY(-8px); /* Center horizontally, move above point, add 8px gap */
    transform-origin: bottom center; /* For scale transition */

    background-color: #2d3748; /* Dark background */
    color: #e2e8f0; /* Light text */
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    z-index: 1100; /* High z-index */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    border: 1px solid #4a5568;
    min-width: 150px;
    pointer-events: none; /* Prevent tooltip from interfering with clicks, window listener handles closing */
    white-space: nowrap; /* Prevent wrapping */
  }

  .tooltip-day {
    font-size: 0.8rem;
    color: #a0aec0; /* Lighter gray */
    font-weight: 500;
  }

  .tooltip-date {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
  }

  .tooltip-mood {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.25rem;
  }

  .tooltip-emoji {
    font-size: 1.2rem;
    line-height: 1;
  }

  .tooltip-label {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .tooltip-count {
    font-size: 0.75rem;
    color: #718096; /* Medium gray */
    margin-top: 0.2rem;
  }
</style>