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
    const defaultBgColor = '#23262B';
    const paddingBgColor = 'transparent';
    const borderColor = '#4a5568';

    // --- State for Active Tooltip ---
    // Now stores data AND position info
    let activeTooltipData = null; // { data: { date, dayName, ... }, position: { top, left, width } } | null
    let tooltipElement = null; // Still useful for click-outside

    function isEmojiImage(emoji) {
      return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
    }

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
            return { emoji: ' ', bgColor: defaultBgColor, label: 'No Entry' };
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
            {@const isPadding = day.dominantMoodValue === 'padding'}
            {@const styling = getMoodStyling(day.dominantMoodValue)}
            {@const moodObj = day.dominantMoodValue && day.dominantMoodValue !== 'padding' 
                ? moodMap.get(day.dominantMoodValue) 
                : null
            }
            {@const cellBg = isPadding 
                ? 'transparent' 
                : moodObj 
                    ? moodObj.colorDark
                    : styling.bgColor || defaultBgColor
            }
            {@const tooltipText = `${day.date}${styling.label !== 'No Entry' ? ': ' + styling.label : ': No entries'}${day.entryCount > 0 ? ' ('+day.entryCount+' entr'+(day.entryCount===1?'y':'ies')+')' : ''}`}
            
            <div
                class:padding={isPadding}
                class:no-entry={!day.dominantMoodValue && !isPadding}
                class="heatmap-cell"
                title={tooltipText}
                aria-label={tooltipText}
                on:click={(e) => handleCellClick(day, e)}
                role="button"
                tabindex={isPadding ? -1 : 0}
                style="background-color: {cellBg};"
                on:keydown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleCellClick(day, e); }}
            >
                {#if isEmojiImage(styling.emoji)}
                  <img src={styling.emoji} alt={styling.label} class="mood-emoji-img">
                {:else}
                  <span class="mood-emoji">{styling.emoji}</span>
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
            {#if activeTooltipData.data.emoji !== ' '}
                {#if isEmojiImage(activeTooltipData.data.emoji)}
                  <img src={activeTooltipData.data.emoji} alt={activeTooltipData.data.label} class="mood-emoji-img-tooltip">
                {:else}
                  <span class="mood-emoji-tooltip">{activeTooltipData.data.emoji}</span>
                {/if}
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
    background-color: var(--card-bg);
    color: vaR(--card-title-text);
    padding: 1rem 1.25rem 1.25rem 1.25rem;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
  }

  .card-header {
    margin-bottom: 0.75rem;
  }

  .card-title {
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--card-title-text);
    margin: 0;
  }

  .no-data-message {
    text-align: center;
    color: var(--card-title-text);
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
    border: 1px solid var(--card-border);
  }
  .heatmap-cell:not(.padding):hover,
  .heatmap-cell:not(.padding):focus {
     border-color: var(--card-border);
     outline: none;
  }
  .heatmap-cell.padding {
     border: none;
     cursor: default;
  }
  .mood-emoji {
    line-height: 1;
    opacity: 0.9;
    pointer-events: none;
  }
  .mood-emoji-img {
    width: 25px;
    height: 25px;
  }

  /* --- Tooltip Styles --- */
  .heatmap-tooltip {
    position: fixed;
    transform: translateX(-50%) translateY(-100%) translateY(-8px); /* Center horizontally, move above point, add 8px gap */
    transform-origin: bottom center; /* For scale transition */

    background-color: var(--card-bg); /* Dark background */
    color: var(--card-title-text); /* Light text */
    font-family: "Urbanist", sans-serif;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: var(--card-shadow);
    z-index: 1100; /* High z-index */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    border: 1px solid var(--card-border);
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

  .mood-emoji-tooltip {
    line-height: 1;
    font-size: 1.4rem;
    opacity: 0.9;
    pointer-events: none;
  }
  .mood-emoji-img-tooltip {
    width: 40px;
    height: 40px;
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