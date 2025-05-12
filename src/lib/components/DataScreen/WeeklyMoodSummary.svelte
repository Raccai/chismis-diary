<script>export let weeklySummaries = [];

    const moodBaseColors = {
      happy: '#34d399', 
      sad: '#60a5fa', 
      excited: '#facc15', 
      angry: '#f87171',
      anxious: '#c084fc', 
      okay: '#fb923c', 
      default: '#94a3b8'
    };
    const getMoodColor = (moodValue) => moodBaseColors[moodValue] || moodBaseColors.default;
</script>

<div class="weekly-summary-card">
  <div class="card-header">
     <h2 class="card-title">Weekly Mood</h2>
     <!-- Optional: Add dropdown/controls, maybe in the future for future ideas -->
     <!-- <button class="view-all-button">See All</button> -->
  </div>

  {#if weeklySummaries.length === 0}
    <p class="no-summary-message">Not enough data for weekly summaries yet.</p>
  {:else}
    <ul class="summary-list">
      {#each weeklySummaries as summary (summary.dateRangeString)}
        {@const moodColor = getMoodColor(summary.dominantMood.value)}
        <li class="summary-item">
          <div class="item-icon-area" style="background-color: {moodColor}20;">
            <span class="item-icon">{summary.dominantMood.emoji || '❓'}</span>
          </div>
          <div class="item-content-area">
            <span class="item-primary-text">{summary.dominantMood.label || 'Unknown Mood'}</span>
            <span class="item-secondary-text">{summary.dateRangeString}</span>
          </div>
          <div class="item-tag-area">
            <span class="item-tag" style="background-color: {moodColor};">
              {summary.dominantMoodCount} {summary.dominantMoodCount === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

</div>

<style>
  .weekly-summary-card {
    background-color: #1a202c; /* Dark background */
    color: #e2e8f0; /* Light text */
    padding: 1rem 0.75rem 1.25rem 0.75rem; /* Less horizontal padding */
    border-radius: 16px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    border: 1px solid #2d3748;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0 0.5rem; /* Match list item horizontal padding */
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #cbd5e1;
    margin: 0;
  }

  .no-summary-message {
    text-align: center;
    color: #a0aec0; /* Lighter gray */
    padding: 1rem 0;
    font-style: italic;
  }

  .summary-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Space between items */
  }

  .summary-item {
    background-color: #2d3748; /* Darker item background */
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid #4a5568;
    transition: background-color 0.2s;
  }
  .summary-item:hover {
     background-color: #4a5568; /* Lighter on hover */
     cursor: pointer; /* Indicate clickability if planned */
  }

  .item-icon-area {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 10px; /* Slightly less rounded than image */
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color set inline */
  }

  .item-icon {
    font-size: 1.6rem;
  }

  .item-content-area {
    flex-grow: 1; /* Takes up available space */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent text overflow */
  }

  .item-primary-text {
    font-size: 1rem;
    font-weight: 500;
    color: #e2e8f0; /* Lighter text */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-secondary-text {
    font-size: 0.8rem;
    color: #a0aec0; /* Lighter gray */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-tag-area {
    flex-shrink: 0;
    margin-left: auto; /* Pushes tag towards the right before arrow */
    padding-left: 0.5rem; /* Space before tag */
  }

  .item-tag {
    /* background-color set inline */
    color: #ffffff; /* White text on colored tag */
    font-size: 0.7rem;
    font-weight: bold;
    padding: 0.2rem 0.6rem;
    border-radius: 10px; /* Pill shape */
    white-space: nowrap;
  }

  .item-action-area {
    flex-shrink: 0;
    color: #718096; /* Medium gray arrow */
  }

  .item-arrow {
      font-size: 1.2rem;
      font-weight: bold;
  }
</style>