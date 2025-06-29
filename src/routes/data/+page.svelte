<script>
  import { entriesStore } from '$lib/stores/entriesStore.js';
  import { moodStore } from '$lib/stores/moodStore.js'; // Import moodStore to get details
  import { get } from 'svelte/store'; // To read moodStore non-reactively
  import { onMount, onDestroy } from 'svelte'; // For click outside listener
  import { analyzeTagConnections } from '$lib/utils/tagAnalysis.js';
  import { getLocalDateString } from '$lib/utils/dataUtils';
  import InfoIcon from '$lib/icons/InfoIcon.svelte';

  // Import analysis functions
  import {
      calculateMoodCounts, 
      getMoodHistoryData, 
      calculateWeeklyMoodSummaries,
      calculateDailyDominantMood, 
      calculateMoodScoreTrend
   } from '$lib/utils/moodAnalysis.js'; // Assuming calculateMoodScoreTrend exists now

  const moodScoreMapping = {
    love: 3,
    happy: 2,
    kilig: 1,
    chismis: 0,        
    sad: -1,
    inis: -2,
    betrayed: -3,
    tampo: -1,
    gigil: 0,        
    loka: 0,          
    praning: -2,
    bored: -1,
    taray: 1,          
    ganda: 2,          
    sabog: -1, 
    default: 0
  };

  $: dailyData = (() => {
    const entries = $entriesStore;
    if (!entries || entries.length === 0) return [];

    // Step 1: Group all existing entries by their local date for quick lookup.
    // This is much more efficient than searching the whole entries array for every single day.
    const entriesByLocalDate = entries.reduce((acc, entry) => {
        const dateKey = getLocalDateString(entry.date);
        if (!acc[dateKey]) {
            acc[dateKey] = { moods: [], entryCount: 0 };
        }
        acc[dateKey].moods.push(entry.mood);
        acc[dateKey].entryCount++;
        return acc;
    }, {});

    // Step 2: Determine the full date range we need to display.
    // Sort entries chronologically to find the absolute first day.
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstEntryDate = new Date(sortedEntries[0].date);
    const lastDate = new Date(); // Always go up to today.

    // Step 3: Create a complete array for every single day in the range.
    const allDaysData = [];
    // Start the loop from the date of the first entry, ignoring the time.
    let currentDate = new Date(firstEntryDate.getFullYear(), firstEntryDate.getMonth(), firstEntryDate.getDate());

    while (currentDate <= lastDate) {
        const dateKey = getLocalDateString(currentDate.toISOString()); // Get 'YYYY-MM-DD' for the current day in the loop.
        const dayWithEntry = entriesByLocalDate[dateKey];

        if (dayWithEntry) {
            // This day has entries. Calculate the dominant mood.
            const moodCounts = dayWithEntry.moods.reduce((counts, mood) => {
                counts[mood] = (counts[mood] || 0) + 1;
                return counts;
            }, {});
            const dominantMoodValue = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, null);
            
            allDaysData.push({
                date: dateKey,
                entryCount: dayWithEntry.entryCount,
                dominantMoodValue: dominantMoodValue
            });
        } else {
            // This day has NO entries. Push a placeholder object for the heatmap.
            allDaysData.push({
                date: dateKey,
                entryCount: 0,
                dominantMoodValue: null
            });
        }

        // Move to the next day for the next iteration of the loop.
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDaysData;
  })();

  function getMoodScoreDisplay(moodValue) {
    return moodScoreMapping.hasOwnProperty(moodValue) ? moodScoreMapping[moodValue] : moodScoreMapping.default;
  }
  // Get mood details for the legend directly from the store
  const moodDefinitions = get(moodStore) || [];

  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }

  // Import Display Components
  import DataChart from '$lib/components/DataScreen/DataChart.svelte';
  import WeeklyMoodSummary from '$lib/components/DataScreen/WeeklyMoodSummary.svelte';
  import MoodCalendarHeatmap from '$lib/components/DataScreen/MoodCalendarHeatmap.svelte';
  import MoodScoreTrendChart from '$lib/components/DataScreen/MoodScoreTrendChart.svelte';
  import InfoModal from '$lib/components/DataScreen/InfoModal.svelte';
  import TagNetworkGraph from '$lib/components/DataScreen/TagNetworkGraph.svelte';

  // --- State for Time Range Selection ---
  let selectedTimeRange = '1M';
  const timeRanges = [
    { value: '1W', label: '1 Linggo' },
    { value: '1M', label: '1 Buwan' },
    { value: '6M', label: '6 Buwan' },
    { value: '1Y', label: '1 Taon' },
    { value: 'ALL', label: 'Lahat' }
  ];

  // --- State for Score Info Popup ---
  let showScoreInfo = false;
  let scoreInfoPopupElement = null;
  let scoreInfoButtonElement = null;
  let showScoreInfoModal = false;
  let desiredHeight = 400;
  let desiredWidth = 400;

  // --- Reactive Data Calculations ---
  $: moodCountsData = calculateMoodCounts($entriesStore, $moodStore);
  $: weeklySummaryData = calculateWeeklyMoodSummaries($entriesStore, $moodStore, 7);
  $: dailyMoodData = calculateDailyDominantMood($entriesStore, $moodStore, 63);
  $: trendChartData = calculateMoodScoreTrend($entriesStore, selectedTimeRange);
  $: displayScore = trendChartData?.averageScore ?? trendChartData?.data?.[trendChartData.data.length - 1] ?? null;
  $: totalEntries = $entriesStore.length;
  $: tagGraphData = analyzeTagConnections($entriesStore, $moodStore);
</script>

<div class="data-page-container">
  {#if totalEntries === 0}
    <p class="no-data-message">Mag-log ka muna ng chismis para may mood data tayo!</p>
  {:else}
    <WeeklyMoodSummary weeklySummaries={weeklySummaryData} />
    {#if dailyMoodData && dailyMoodData.length > 0}
      <MoodCalendarHeatmap dailyData={dailyData} title="Daily Mood" />
    {/if}

    {#if moodCountsData && moodCountsData.length > 0}
      <DataChart moodStats={moodCountsData} title="Overall Mood Count" />
    {/if}

    <section class="trend-chart-card">
       <div class="trend-header">
          <div class="title-with-info">
             <h2 class="trend-title">Mood Score Trend</h2>
             <button
                class="info-button"
                title="How scores are calculated"
                aria-label="Show score calculation info"
                on:click={() => showScoreInfoModal = true}
              >
                <div class="info-icon">
                  <InfoIcon />
                </div>
              </button>
          </div>
          {#if displayScore !== null}
             <div class="trend-score">{displayScore.toFixed(2)} <span class="pts">pts</span></div>
          {/if}
       </div>
       <MoodScoreTrendChart chartData={trendChartData} />
       <div class="time-range-selector">
          {#each timeRanges as range (range.value)}
             <button
                class:active={selectedTimeRange === range.value}
                on:click={() => selectedTimeRange = range.value}
             >
                {range.label}
             </button>
          {/each}
       </div>
    </section>
  {/if}

  <!-- Score Info Modal -->
  <InfoModal bind:showModal={showScoreInfoModal} title="Mood Scoring Explained">
    <!-- Content for the modal goes into the slot -->
    <h4>Scores? Paano yun?</h4>
    <p>
      May score ang bawat mood para makita kung paangat o pababa ang vibes mo. 
      Mas mataas na score = mas masaya. Mas mababa = baka medyo mahirap yung araw mo huhu, kaya mo yarn. 
    </p>
    <ul>
      {#each moodDefinitions as mood}
         <li style="background-color: {mood.colorDark};">
          {#if isEmojiImage(mood.emoji)}
            <img src={mood.emoji} alt={mood.label} class="mood-emoji-in-modal-img">
          {:else}
            <span class="mood-emoji-in-modal">{mood.emoji}</span>
          {/if}
          {mood.label}: 
          <strong> {getMoodScoreDisplay(mood.value)} pts</strong>
        </li>
      {/each}
    </ul>
    <p>
      Ang score sa chart ay average ng mga mood na na-log mo sa araw, linggo, o buwan na 'yon.
    </p>
  </InfoModal>

  <!-- Target Network -->
  {#if tagGraphData && tagGraphData.nodes.length > 0}
    <TagNetworkGraph graphData={tagGraphData} width={desiredWidth} height={desiredHeight} />
  {:else}
    <div class="stats-section-card">
      <!-- <h2>Chismis Connections</h2>
      <p>Kulang pa ang tags para may koneksyon na lumabas. Magchismisan na tayo, pls!</p> -->
    </div>
  {/if}
</div>

<style>
  .data-page-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* Adjust spacing between components */
    padding: 20px 20px 100px 20px;
  }

  .no-data-message {
    text-align: center;
    font-style: italic;
    color: var(--card-title-text); /* Lighter text on dark theme */
    background-color: var(--card-bg); /* Darker background card */
    border: 1px solid var(--card-border);
    padding: 2rem;
    border-radius: 12px;
    margin: 1rem auto; /* Center message */
    max-width: 500px;
  }

  /* Specific Card for Trend Chart */
  .trend-chart-card {
    background-color: #310013;
    color: #FBF7EC;
    padding: 1.25rem;
    border-radius: 16px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    border: 2px solid #400019;
    display: flex;
    flex-direction: column;
  }
  
  .trend-header {
    margin-bottom: 0.5rem;
  }
  .trend-title {
    font-size: 1.1rem;
    font-weight: bold;
    letter-spacing: -0.05rem;
    color: #FBF7EC;
  }
  .trend-score {
    font-size: 2.5rem;
    font-weight: normal;
    color: #FBF7EC;
    line-height: 1.1;
  }
  .trend-score .pts {
    font-size: 1rem;
    font-weight: normal;
    color: #FBF7EC;
    margin-left: -0.5rem;
  }

  .time-range-selector {
    display: flex;
    /* Allow buttons to wrap onto the next line */
    flex-wrap: wrap;
    /* Center the buttons horizontally */
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    background-color: #1b000a;
    padding: 0.5rem;
    border-radius: 8px;
    /* Remove max-width or adjust if needed, centering handles alignment */
    /* max-width: max-content; */
    margin-left: auto; /* Keep centering the container itself if desired */
    margin-right: auto;
    width: fit-content; /* Let container shrink/grow, wrap will handle overflow */
    max-width: 100%; /* Prevent container exceeding parent */
  }

  .time-range-selector button {
    background-color: transparent;
    border: none;
    color: #FBF7EC;
    /* Slightly reduce padding if still tight */
    padding: 0.4rem 0.7rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: "Urbanist", sans-serif;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap; /* Keep button text on one line */
  }

  .time-range-selector button.active {
    background-color: #FBF7EC; /* Active background */
    color: var(--main-black); /* Active text */
    font-weight: 700;
  }

  .info-button {
    background: none;
    border: none;
    color: #FBF7EC;
    font-weight: bold;
    cursor: pointer;
    margin-top: -6px;
    margin-bottom: -4px;
  }
  .info-button:hover {
    color: #a0aec0;
  }

  ul {
    list-style: none;
    margin: 1rem 0;
    padding: 0;
    display: grid;
    gap: 0.6rem;
  }

  li {
    display: flex;
    align-items: center;
    background-color: var(--card-border);      /* subtle card-border bg */
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border-left: 4px solid var(--accent-color);
    color: var(--main-white);
  }

  .mood-emoji-in-modal,
  .mood-emoji-in-modal-img {
    margin-right: 0.4rem;
  }

  .mood-emoji-in-modal-img {
    width: 40px;
    height: 40px;
  }

  .info-icon {
    border: 2px solid #8b1a45;
    background-color: #610e2e;
    padding: 0.5rem;
    border-radius: 8px;
    margin: 0.25rem 0 0.5rem 0;
    transform: scale(0.8);
  }

  .title-with-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between; 
  }

  .trend-title {
    font-size: 1.5rem;
  }
</style>