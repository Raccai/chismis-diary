<script>
  export let characterData;
  export let userProgressData;

  import HourglassIcon from '$lib/icons/HourglassIcon.svelte';
  import PresentIcon from '$lib/icons/PresentIcon.svelte';
  import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
  import MusicIcon from '$lib/icons/MusicIcon.svelte';

  function isMilestoneCompleted(milestone) {
    return userProgressData[`${characterData.value}_${milestone.id}_completed`] || false;
  }

  function getStatValue(statKey) {
    return userProgressData[statKey] || 0;
  }
</script>

<div class="milestone-details">
  <div class="detail-header">
    <div class="detail-char-image-container">
      <img
        src={characterData.emoji}
        alt={characterData.label}
        class="detail-char-image-actual"
        class:silhouetted={!userProgressData.unlockedTracks?.[characterData.musicTrackMoodValue]}
      />
    </div>
    <div class="detail-char-info">
      <h4 class="detail-char-name">{characterData.label}</h4>
      <p class="detail-char-desc">{characterData.characterDescription || 'More details to come!'}</p>
    </div>
  </div>

  <h5 class="milestones-title">Mga Milestone para Ma-unlock ang Music:</h5>
  {#if characterData.milestones && characterData.milestones.length > 0}
    <ul class="milestone-list">
      {#each characterData.milestones as milestone (milestone.id)}
        {@const completed = isMilestoneCompleted(milestone)}
        <li class:completed>
          <span class="ms-icon">
            {#if completed}
              <SuccessIcon class="icon-size" />
            {:else}
              <HourglassIcon class="icon-size" />
            {/if}
          </span>

          <div class="ms-text">
            <span class="ms-desc">{milestone.text.replace(/\s*to unlock .*$/i, '')}</span>
            {#if !completed}
              <span class="ms-progress">
                ({Math.min(getStatValue(milestone.statKey), milestone.target)}/{milestone.target})
              </span>
            {/if}
          </div>

          {#if completed && milestone.unlocksMusic}
            <div class="ms-reward music">
              <div class="music-icon">
                <MusicIcon class="icon-size reward-icon" /> 
              </div>
              <p>
                Sayo na!
              </p>
            </div>
          {:else if completed && milestone.rewardPreview}
            <div class="ms-reward text">
              <div class="present-icon">
                <PresentIcon class="icon-size reward-icon" /> 
              </div>
              <p>
                {milestone.rewardPreview.text}
              </p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-milestones-defined">
      Available na agad ang music na ’to — o baka na-unlock mo na sa iba mong progress!
    </p>
  {/if}
</div>

<style>
  .milestone-details {
    font-size: 0.9rem;
    color: var(--card-title-text);
  }

  .detail-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .detail-char-image-container {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background-color: var(--card-bg);
    border: 2px solid var(--card-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .detail-char-image-actual {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: filter 0.3s ease;
  }

  .detail-char-image-actual.silhouetted {
    filter: brightness(0.2) grayscale(30%) opacity(0.8);
  }

  .detail-char-info {
    flex-grow: 1;
  }

  .detail-char-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.2rem 0;
  }

  .detail-char-desc {
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.4;
  }

  .milestones-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--card-border);
  }

  .milestone-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .milestone-list li {
    padding: 0.6rem 0.75rem;
    background-color: var(--card-bg);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--card-border);
  }

  .milestone-list li.completed {
    border-left: 4px solid var(--card-border);
    background-color: var(--card-bg);
  }

  .ms-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: -0.3rem;
    transform: scale(0.6);
  }

  .ms-text {
    flex-grow: 1;
  }

  .ms-desc {
    display: block;
    font-size: 0.9rem;
  }

  .ms-progress {
    font-size: 0.75rem;
    color: var(--card-title-text);
  }

  .ms-reward {
    font-size: 0.75rem;
    font-style: italic;
    color: var(--card-title-text);
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .ms-reward.music {
    font-weight: 500;
  }

  .no-milestones-defined {
    font-style: italic;
    color: var(--card-title-text);
    padding: 0.5rem;
    text-align: center;
  }

  .music-icon {
    transform: scale(0.6);
  }

  .present-icon {
    transform: scale(0.6);
  }
</style>