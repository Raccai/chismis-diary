<script>
  import { userProgress } from '$lib/stores/userProgressStore.js';
  import { uiStore } from '$lib/stores/uiStore.js';
  import MilestoneDetailView from './MilestoneDetailView.svelte';
  import SparklesIcon from '$lib/icons/SparklesIcon.svelte';
  import MusicIcon from '$lib/icons/MusicIcon.svelte';
  import DataInactive from '$lib/icons/Data-Inactive.svelte';

  export let moodCharacter;

  let completedMilestoneCount = 0;
  let totalMilestones = 0;
  let progressPercent = 0;
  let isMusicUnlockedForThisMood = false;

  const musicIcon = MusicIcon;
  const graphIcon = DataInactive;

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
  class="character-reveal-card"
  class:unlocked={isMusicUnlockedForThisMood}
  on:click={showMilestoneDetails}
  role="button" tabindex="0"
  on:keydown={(e) => {if(e.key==='Enter'||e.key===' ') showMilestoneDetails()}}
  aria-label={`View milestones for ${moodCharacter.label}`}
>
  <div class="image-container">
    <img
      src={moodCharacter.emoji}
      alt={moodCharacter.label}
      class="base-char-image"
      class:is-silhouette={progressPercent < 100}
    />
    <div
      class="color-reveal-veil"
      style="height: {100 - progressPercent}%;"
    ></div>
  </div>
  <div class="info">
    <p class="name">{moodCharacter.label}</p>
    {#if totalMilestones > 0 && !isMusicUnlockedForThisMood}
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercent}%;"></div>
      </div>
      <p class="milestone-count">{completedMilestoneCount} / {totalMilestones}</p>
    {:else if isMusicUnlockedForThisMood}
      <p class="status unlocked">
        <SparklesIcon className="unlocked-icon" /> 
        Music Unlocked
      </p>
    {:else}
       <p class="milestone-count no-milestones-text">Always Vibing</p>
    {/if}
    <div class="reward-icons">
      {#if moodCharacter.musicTrackMoodValue}
        <span class="reward-icon" class:unlocked={isMusicUnlockedForThisMood} title="Unlocks Music">
          <svelte:component this={musicIcon} class="reward-icon" title="Unlocks Music" />
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .character-reveal-card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 140px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-family: 'Urbanist', sans-serif;
  }
  .character-reveal-card:hover {
    transform: translateY(-3px);
  }
  .character-reveal-card.unlocked {
    border-color: var(--card-border);
  }
  .image-container {
    width: 90px;
    height: 120px;
    position: relative;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--card-bg);
  }
  .base-char-image {
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
  .base-char-image.is-silhouette {
    filter: brightness(0%) opacity(60%);
  }
  .color-reveal-veil {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--card-bg);
    opacity: 0.60;
    z-index: 2;
    transition: height 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
  }
  .info {
    text-align: center;
    width: 100%;
  }
  .name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--card-title-text);
    margin: 0;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress-bar {
    height: 2px;
    background-color: var(--card-border);
    border-radius: 2.5px;
    overflow: hidden;
    margin: 0.4rem auto;
    width: 80%;
  }
  .progress-fill {
    height: 100%;
    background-color: var(--card-title-text);
    border-radius: 2.5px;
    transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .milestone-count, .status {
    font-size: 0.7rem;
    color: var(--card-title-text);
    min-height: 0.8em;
  }
  .no-milestones-text {
    font-style: italic;
    opacity: 0.7;
  }
  .status.unlocked {
    color: var(--card-title-text);
    font-family: "Urbanist", sans-serif;
    font-weight: normal;

  }
  .reward-icons {
    margin: -0.4rem 0 -0.8rem 0;
    display: flex;
    justify-content: center;
    transform: scale(0.5);
    gap: 0.4rem;
  }
  .reward-icon {
    opacity: 0.5;
  }
  .reward-icon.unlocked {
    opacity: 1;
    color: var(--card-title-text);
  }
</style>