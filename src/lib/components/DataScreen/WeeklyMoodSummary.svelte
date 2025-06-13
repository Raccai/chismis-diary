<script>
  export let weeklySummaries = [];

  function isEmojiImage(emoji) {
    return emoji && (emoji.includes('.png') || emoji.includes('.jpg') || emoji.includes('.jpeg') || emoji.includes('.gif') || emoji.includes('.svg'));
  }
</script>

<div class="weekly-summary-card">
  <div class="card-header">
     <h2 class="card-title">Weekly Modo</h2>
     <!-- Optional: Add dropdown/controls, maybe in the future for future ideas -->
     <!-- <button class="view-all-button">See All</button> -->
  </div>

  {#if weeklySummaries.length === 0}
    <p class="no-summary-message">
      Wala pa masyadong chika para sa weekly summary. G lang, keep writing!
    </p>
  {:else}
  <ul class="summary-list">
      {#each weeklySummaries as summary (summary.dateRangeString)}
        {@const moodMainColor = summary.dominantMood.colorDark || 'var(--dataviz-default-dark, #94a3b8)'}
        {@const iconAreaBg = summary.dominantMood.colorLight || 'var(--dataviz-default-light-bg, #4a5568)'}
        {@const iconTextColor = summary.dominantMood.colorDark || 'var(--dataviz-default-dark, #e2e8f0)'}
        <li class="summary-item">
          <div class="item-icon-area" style="background-color: {moodMainColor};">
            {#if isEmojiImage(summary.dominantMood.emoji)}
              <img src={summary.dominantMood.emoji} alt={summary.dominantMood.label} class="selected-mood-emoji-img">
            {:else}
              <span class="mood-emoji">{summary.dominantMood.emoji}</span>
            {/if}
          </div>
          <div class="item-content-area">
            <span class="item-primary-text">{summary.dominantMood.label || 'Unknown Mood'}</span>
            <span class="item-secondary-text">{summary.dateRangeString}</span>
          </div>
          <div class="item-tag-area">
            <span class="item-tag" style="background-color: {moodMainColor};">
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
    background-color: var(--card-bg); /* Dark background */
    color: #e2e8f0; /* Light text */
    padding: 1rem 0.75rem 1.25rem 0.75rem; /* Less horizontal padding */
    border-radius: 16px;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0 0.5rem; /* Match list item horizontal padding */
  }

  .card-title {
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--card-title-text);
    margin: 0;
  }

  .no-summary-message {
    text-align: center;
    color: var(--card-title-text);
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
    background-color: var(--card-mini-bg); /* Darker item background */
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid var(--card-mini-border);
    transition: background-color 0.2s;
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

  .mood-emoji {
    font-size: 1.6rem;
  }

  .selected-mood-emoji-img {
    height: 40px;
    width: 40px;
  }

  .item-content-area {
    flex-grow: 1; /* Takes up available space */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent text overflow */
  }

  .item-primary-text {
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--card-title-text); /* Lighter text */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-secondary-text {
    font-family: "Urbanist", sans-serif;
    font-weight: 200;
    font-size: 0.7rem;
    color: var(--card-title-text);
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
    color: var(--main-white); 
    font-family: "Urbanist", sans-serif;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 0.2rem 0.6rem;
    border-radius: 10px; /* Pill shape */
    white-space: nowrap;
  }
</style>