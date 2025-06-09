<script>
  export let characterData;    // This is a mood object from moodStore (with .emoji as image path)
  export let userProgressData; // Full userProgress object

  function isMilestoneCompleted(milestone) {
    return userProgressData[`${characterData.value}_${milestone.id}_completed`] || false;
  }
  function getStatValue(statKey) {
    return userProgressData[statKey] || 0;
  }
</script>

<div class="milestone-details-bwp">
  <div class="detail-header-bwp">
    <div class="detail-char-image-container-bwp">
        <img
            src={characterData.emoji} 
            alt={characterData.label}
            class="detail-char-image-actual-bwp"
            class:silhouetted={!userProgressData.unlockedTracks?.[characterData.musicTrackMoodValue]}
        />
    </div>
    <div class="detail-char-info-bwp">
        <h4 class="detail-char-name-bwp">{characterData.label}</h4>
        <p class="detail-char-desc-bwp">{characterData.characterDescription || 'More details to come!'}</p>
    </div>
  </div>

  <h5 class="milestones-title-bwp">Milestones to Unlock Music:</h5>
  {#if characterData.milestones && characterData.milestones.length > 0}
    <ul class="milestone-list-bwp">
      {#each characterData.milestones as milestone (milestone.id)}
        {@const completed = isMilestoneCompleted(milestone)}
        <li class:completed>
          <span class="ms-icon-bwp">{completed ? '✅' : '⏳'}</span>
          <div class="ms-text-bwp">
            <span class="ms-desc-bwp">{milestone.text.replace(/\s*to unlock .*$/i, '')}</span>
            {#if !completed}
            <span class="ms-progress-bwp">
              ({Math.min(getStatValue(milestone.statKey), milestone.target)}/{milestone.target})
            </span>
            {/if}
          </div>
          {#if completed && milestone.unlocksMusic}
            <span class="ms-reward-bwp music">🎵 Track Unlocked!</span>
          {:else if completed && milestone.rewardPreview}
            <span class="ms-reward-bwp text">🎁 {milestone.rewardPreview.text}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-milestones-defined">This mood's music is readily available or unlocked through general progress!</p>
  {/if}
</div>

<style>
  .milestone-details-bwp {
    font-size: 0.9rem;
    color: var(--bw-text-primary);
  }
  .detail-header-bwp {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .detail-char-image-container-bwp {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background-color: var(--bw-bg-tertiary);
    border: 2px solid var(--bw-border-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .detail-char-image-actual-bwp {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: filter 0.3s ease;
  }
  .detail-char-image-actual-bwp.silhouetted {
      filter: brightness(0.2) grayscale(30%) opacity(0.8);
  }
  .detail-char-info-bwp {
    flex-grow: 1;
  }
  .detail-char-name-bwp {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--bw-accent-pink);
    margin: 0;
    margin-bottom: 0.2rem;
  }
  .detail-char-desc-bwp {
    font-size: 0.85rem;
    color: var(--bw-text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  .milestones-title-bwp {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--bw-border-secondary);
  }
  .milestone-list-bwp {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .milestone-list-bwp li {
    padding: 0.6rem 0.75rem;
    background-color: var(--bw-bg-tertiary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--bw-border-secondary);
  }
  .milestone-list-bwp li.completed {
    border-left: 4px solid var(--bw-accent-pink);
    background-color: color-mix(in srgb, var(--bw-accent-pink) 8%, var(--bw-bg-tertiary));
  }
  .ms-icon-bwp {
    font-size: 1.1em;
  }
  .ms-text-bwp {
    flex-grow: 1;
  }
  .ms-desc-bwp {
    display: block;
    font-size: 0.9rem;
  }
  .ms-progress-bwp {
    font-size: 0.75rem;
    color: var(--bw-text-tertiary);
  }
  .ms-reward-bwp {
    font-size: 0.75rem;
    font-style: italic;
    color: var(--bw-text-secondary);
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
  }
  .ms-reward-bwp.music {
    color: var(--bw-accent-pink);
    font-weight: 500;
  }
  .no-milestones-defined {
    font-style: italic;
    color: var(--bw-text-secondary);
    padding: 0.5rem;
    text-align: center;
  }
</style>