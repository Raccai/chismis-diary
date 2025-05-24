<script>
  import { entriesStore } from '$lib/stores/entriesStore.js';
  import { moodStore } from '$lib/stores/moodStore.js'; // Import moodStore to get details
  import { get } from 'svelte/store'; // To read moodStore non-reactively
  import { onMount, onDestroy } from 'svelte'; // For click outside listener

  // Import analysis functions
  import {
      calculateMoodCounts, 
      getMoodHistoryData, 
      calculateWeeklyMoodSummaries,
      calculateDailyDominantMood, 
      calculateMoodScoreTrend
   } from '$lib/utils/moodAnalysis.js'; // Assuming calculateMoodScoreTrend exists now

  const moodScoreMapping = {
    love: 3, happy: 2, kilig: 1, anxious: -2,
    sad: -1, angry: -2, betrayed: -3, default: 0
  };
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

  // --- State for Time Range Selection ---
  let selectedTimeRange = '1M';
  const timeRanges = [
      { value: '1W', label: '1 Week' }, { value: '1M', label: '1 Month' },
      { value: '6M', label: '6 Months' }, { value: '1Y', label: '1 Year' },
      { value: 'ALL', label: 'All Time' }
  ];

  // --- State for Score Info Popup ---
  let showScoreInfo = false;
  let scoreInfoPopupElement = null;
  let scoreInfoButtonElement = null;
  let showScoreInfoModal = false;

  // --- Reactive Data Calculations ---
  $: moodCountsData = calculateMoodCounts($entriesStore, $moodStore);
  $: weeklySummaryData = calculateWeeklyMoodSummaries($entriesStore, $moodStore, 7);
  $: dailyMoodData = calculateDailyDominantMood($entriesStore, $moodStore, 63);
  $: trendChartData = calculateMoodScoreTrend($entriesStore, selectedTimeRange);
  $: displayScore = trendChartData?.averageScore ?? trendChartData?.data?.[trendChartData.data.length - 1] ?? null;
  $: totalEntries = $entriesStore.length;
</script>

<div class="data-page-container">
  {#if totalEntries === 0}
    <p class="no-data-message">Add some "chismis" first to see your mood data!</p>
  {:else}
    <WeeklyMoodSummary weeklySummaries={weeklySummaryData} />
    {#if dailyMoodData && dailyMoodData.length > 0}
      <MoodCalendarHeatmap dailyData={dailyMoodData} title="Daily Mood Overview" />
    {/if}

    {#if moodCountsData && moodCountsData.length > 0}
      <DataChart moodStats={moodCountsData} title="Overall Mood Counts" />
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
                ⓘ
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
    <h4>How Scores Work</h4>
    <p>Each mood is assigned a score to help track overall well-being trends. Higher scores generally indicate more positive moods, while lower or negative scores suggest more challenging periods.</p>
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
    <p>The score shown in the chart for a day, week, or month is the average of all mood scores recorded during that period.</p>
  </InfoModal>
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
    background-color: #2d3748; /* Darker background card */
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem auto; /* Center message */
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
     padding: 0 0.25rem;
  }
  .trend-title {
     font-size: 1.1rem;
     font-weight: normal;
     color: #FBF7EC;
     margin: 0 0 0.25rem 0; /* Space below title */
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
      color: #FBF7EC; /* Lighter gray for 'pts' */
      margin-left: 0.25rem;
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
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.1rem 0.2rem;
    line-height: 1;
    border-radius: 50%;
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
</style>