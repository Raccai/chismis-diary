<script>
  import { userProgress } from '$lib/stores/userProgressStore.js';
  import { uiStore } from '$lib/stores/uiStore.js';
  import MilestoneDetailView from './MilestoneDetailView.svelte';

  export let moodCharacter;

  let completedMilestoneCount = 0;
  let totalMilestones = 0;
  let progressPercent = 0;
  let isMusicUnlockedForThisMood = false;

  const musicIcon = '🎵';
  const graphIcon = '📊';

  $: if (moodCharacter && $userProgress) {
    totalMilestones = moodCharacter.milestones ? moodCharacter.milestones.length : 0;
    let currentCompleted = 0;
    if (moodCharacter.milestones) {
      moodCharacter.milestones.forEach(ms => {
        if ($userProgress[`${moodCharacter.value}_${ms.id}_completed`]) {
          currentCompleted++;
        }
      });
    }
    completedMilestoneCount = currentCompleted;
    isMusicUnlockedForThisMood = $userProgress.unlockedTracks?.[moodCharacter.musicTrackMoodValue] || false;

    if (isMusicUnlockedForThisMood) {
      progressPercent = 100;
    } else {
      progressPercent = totalMilestones > 0 ? (completedMilestoneCount / totalMilestones) * 100 : 0;
    }
  } else if (moodCharacter && (!moodCharacter.milestones || moodCharacter.milestones.length === 0)) {
      totalMilestones = 0;
      completedMilestoneCount = 0;
      isMusicUnlockedForThisMood = $userProgress.unlockedTracks?.[moodCharacter.musicTrackMoodValue] || false;
      progressPercent = isMusicUnlockedForThisMood ? 100 : 0;
  }

  function showMilestoneDetails() {
    if (!moodCharacter.milestones || moodCharacter.milestones.length === 0) {
        uiStore.showModalOnly({
            title: moodCharacter.label,
            message: `${moodCharacter.characterDescription || 'A mysterious mood...'} <br/><br/> Its theme music might be unlocked through special means or is already available!`,
            confirmText: 'Okay',
            hideCancelButton: true
        });
        return;
    }
    uiStore.showModalOnly({
      title: `${moodCharacter.label} Milestones`,
      contentComponent: MilestoneDetailView,
      componentProps: { characterData: moodCharacter, userProgressData: $userProgress },
      hideCancelButton: true,
      confirmText: 'Got it'
    });
  }
</script>

<div
  class="character-reveal-card-bwp"
  class:unlocked={isMusicUnlockedForThisMood}
  on:click={showMilestoneDetails}
  role="button" tabindex="0"
  on:keydown={(e) => {if(e.key==='Enter'||e.key===' ') showMilestoneDetails()}}
  aria-label={`View milestones for ${moodCharacter.label}`}
>
  <div class="image-container-bwp">
    <img
      src={moodCharacter.emoji}
      alt={moodCharacter.label}
      class="base-char-image-bwp"
      class:is-silhouette={progressPercent < 100}
    />
    <div
      class="color-reveal-veil-bwp"
      style="height: {100 - progressPercent}%;"
    ></div>
  </div>
  <div class="info-bwp">
    <p class="name-bwp">{moodCharacter.label}</p>
    {#if totalMilestones > 0 && !isMusicUnlockedForThisMood}
      <div class="progress-bar-bwp">
        <div class="progress-fill-bwp" style="width: {progressPercent}%;"></div>
      </div>
      <p class="milestone-count-bwp">{completedMilestoneCount} / {totalMilestones}</p>
    {:else if isMusicUnlockedForThisMood}
      <p class="status-bwp unlocked">✨ Music Unlocked</p>
    {:else}
       <p class="milestone-count-bwp no-milestones-text">Always Vibing</p>
    {/if}
    <div class="reward-icons-bwp">
      {#if moodCharacter.musicTrackMoodValue}
        <span class="reward-icon" class:unlocked={isMusicUnlockedForThisMood} title="Unlocks Music">{musicIcon}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .character-reveal-card-bwp {
    background-color: var(--bw-bg-secondary);
    border: 1px solid var(--bw-border-primary);
    border-radius: 16px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 140px;
    box-shadow: var(--bw-shadow-color-soft) 0px 2px 4px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-family: 'Urbanist', sans-serif;
  }
  .character-reveal-card-bwp:hover {
    transform: translateY(-3px);
    box-shadow: var(--bw-shadow-color-medium) 0px 4px 8px;
  }
  .character-reveal-card-bwp.unlocked {
    border-color: var(--bw-accent-pink);
  }
  .image-container-bwp {
    width: 90px;
    height: 120px;
    position: relative;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bw-bg-tertiary);
  }
  .base-char-image-bwp {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 3%;
    box-sizing: border-box;
    transition: filter 0.6s ease-in-out;
    z-index: 1;
  }
  .base-char-image-bwp.is-silhouette {
    filter: brightness(0%) opacity(60%);
  }
  .color-reveal-veil-bwp {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--bw-bg-contrast, #000000);
    opacity: 0.60;
    z-index: 2;
    transition: height 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
  }
  .info-bwp {
    text-align: center;
    width: 100%;
  }
  .name-bwp {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--bw-text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress-bar-bwp {
    height: 5px;
    background-color: var(--bw-bg-tertiary);
    border-radius: 2.5px;
    overflow: hidden;
    margin: 0.25rem auto;
    width: 80%;
  }
  .progress-fill-bwp {
    height: 100%;
    background-color: var(--bw-accent-pink);
    border-radius: 2.5px;
    transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .milestone-count-bwp, .status-bwp {
    font-size: 0.65rem;
    color: var(--bw-text-secondary);
    min-height: 0.8em;
  }
  .no-milestones-text {
    font-style: italic;
    opacity: 0.7;
  }
  .status-bwp.unlocked {
    color: var(--bw-accent-pink);
    font-weight: bold;
  }
  .reward-icons-bwp {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    min-height: 1em;
  }
  .reward-icon {
    opacity: 0.5;
  }
  .reward-icon.unlocked {
    opacity: 1;
    color: var(--bw-accent-pink);
  }
</style>