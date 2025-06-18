<script>
  import { musicPlayer } from '$lib/stores/musicPlayerStore.js';
  import { scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte';
  import Button from './Button.svelte';

  import PlaySvelteIcon from '$lib/icons/PlayIcon.svelte';
  import PauseSvelteIcon from '$lib/icons/PauseIcon.svelte';
  import NextSvelteIcon from '$lib/icons/NextIcon.svelte';
  import PrevSvelteIcon from '$lib/icons/PrevIcon.svelte';
  import VolumeHighSvelteIcon from '$lib/icons/VolumeHighIcon.svelte';
  import VolumeMidSvelteIcon from '$lib/icons/VolumeMidIcon.svelte';
  import VolumeLowSvelteIcon from '$lib/icons/VolumeLowIcon.svelte';
  import VolumeMuteSvelteIcon from '$lib/icons/VolumeMuteIcon.svelte';

  let modalElement;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function handleProgressChange(e) {
    musicPlayer.seek(parseFloat(e.target.value));
  }

  function handleVolumeChange(e) {
    musicPlayer.setVolume(parseFloat(e.target.value));
  }

  function handleKeyDown(event) {
    if ($musicPlayer.isModalOpen && event.key === 'Escape') {
      event.preventDefault();
      musicPlayer.closePlayerModal();
    }
  }

  $: if ($musicPlayer.isModalOpen && modalElement && typeof window !== 'undefined') {
      const firstFocusable = modalElement.querySelector('button, input[type="range"], [tabindex]:not([tabindex="-1"])');
      if (firstFocusable && document.activeElement !== firstFocusable) {
          setTimeout(() => {
            if(firstFocusable && typeof firstFocusable.focus === 'function') {
                firstFocusable.focus();
            }
          }, 260);
      }
  }

  $: playPauseIconComponent = $musicPlayer.isPlaying ? PauseSvelteIcon : PlaySvelteIcon;

  $: volumeIconComponent =
      $musicPlayer.isMuted ? VolumeMuteSvelteIcon :
      $musicPlayer.volume === 0 ? VolumeMuteSvelteIcon :
      $musicPlayer.volume > 0.66 ? VolumeHighSvelteIcon :
      $musicPlayer.volume > 0.33 ? VolumeMidSvelteIcon :
      VolumeLowSvelteIcon;

</script>

{#if $musicPlayer.isModalOpen}
  <div
    class="music-player-overlay"
    on:click|self={musicPlayer.closePlayerModal}
    transition:fade="{{ duration: 200 }}"
    role="presentation"
    aria-hidden="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="music-player-modal-container" on:click|stopPropagation>
      <div
        class="music-player-modal"
        bind:this={modalElement}
        transition:scale="{{ duration: 250, start: 0.95, opacity: 0.7, easing: quintOut }}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-player-title"
      >
        <h3 id="music-player-title" class="player-title">Mood Player</h3>

        <div class="modal-scrollable-body">
          {#if $musicPlayer.currentTrack}
            <div class="track-info">
              <p class="track-title">{$musicPlayer.currentTrack.title}</p>
              <p class="track-artist">{$musicPlayer.currentTrack.artist}</p>
            </div>
          {:else}
            <div class="track-info placeholder">
              <p class="track-title">No Track Selected</p>
              {#if $musicPlayer.playableTracks.length > 0}
                <p class="track-artist">Tap a song below to start</p>
              {:else}
                <p class="track-artist">Unlock mood music via achievements!</p>
              {/if}
            </div>
          {/if}

          <div class="progress-bar-container">
            <input
              type="range"
              class="progress-bar"
              min="0"
              max={$musicPlayer.duration || 0}
              bind:value={$musicPlayer.currentTime}
              on:input={handleProgressChange}
              aria-label="Track progress"
              disabled={!$musicPlayer.currentTrack}
            />
            <div class="time-display">
              <span>{formatTime($musicPlayer.currentTime)}</span>
              <span>{formatTime($musicPlayer.duration)}</span>
            </div>
          </div>

          <div class="controls-main">
            <button class="control-button" on:click={musicPlayer.playPrevious} aria-label="Previous track" disabled={$musicPlayer.playableTracks.length < 2}>
              <svelte:component this={PrevSvelteIcon} />
            </button>
            <button class="control-button play-pause" on:click={musicPlayer.togglePlay} aria-label={$musicPlayer.isPlaying ? 'Pause' : 'Play'} disabled={!$musicPlayer.currentTrack && $musicPlayer.playableTracks.length === 0}>
              <svelte:component this={playPauseIconComponent} />
            </button>
            <button class="control-button" on:click={musicPlayer.playNext} aria-label="Next track" disabled={$musicPlayer.playableTracks.length < 2}>
              <svelte:component this={NextSvelteIcon} />
            </button>
          </div>

          <div class="controls-extra">
            <div class="playback-mode-placeholder"></div>
            <div class="volume-control">
              <button class="control-button small-button" on:click={musicPlayer.toggleMute} aria-label="Toggle mute">
                <svelte:component this={volumeIconComponent} />
              </button>
              <input
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.01"
                bind:value={$musicPlayer.volume}
                on:input={handleVolumeChange}
                aria-label="Volume control"
                disabled={$musicPlayer.isMuted}
              />
            </div>
          </div>

          <div class="track-list-container">
            {#if $musicPlayer.playableTracks.length > 0}
              <ul class="track-list">
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  {#each $musicPlayer.playableTracks as track, index (track.src)}
                      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                      <li on:click={() => musicPlayer.loadTrack(index, true)} class:active={index === $musicPlayer.currentTrackIndexInPlayable && $musicPlayer.currentTrack?.src === track.src}>
                          <span class="track-list-title">{track.title}</span>
                          <span class="track-list-mood">({track.moodValue})</span>
                      </li>
                  {/each}
              </ul>
            {:else}
              <p class="no-tracks-message">No music tracks unlocked yet!</p>
            {/if}
          </div>
        </div>

        <div class="modal-actions-player-bwp">
            <Button
                type="secondary"
                text="Close"
                onClick={musicPlayer.closePlayerModal}
                ariaLabel="Close music player"
                class="player-close-button-override"
                icon={null}
            />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .music-player-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--form-overlay-bg, rgba(0,0,0,0.75));
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }
  .music-player-modal-container {
    display: flex;
    flex-direction: column;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
  .music-player-modal {
    background-color: var(--card-bg);
    color: var(--card-title-text);
    border-radius: 16px;
    padding: 1.25rem;
    border: 2px solid var(--card-border);
    width: 100vw;
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    font-family: 'Urbanist', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .player-title {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: -0.12rem;
    text-align: center;
    color: var(--card-title-text);
    margin: 0;
    margin-bottom: 0.8rem;
    flex-shrink: 0;
  }
  .track-info {
    text-align: center;
    min-height: 3em;
    flex-shrink: 0;
  }
  .track-info.placeholder .track-title {
    color: var(--card-title-text);
    opacity: 0.7;
    font-style: italic;
  }
  .track-title {
    font-size: 1rem;
    font-weight: 700;
    margin:0;
    color: var(--card-title-text);
  }
  .track-artist {
    font-size: 0.8rem;
    color: var(--card-title-text);
    opacity: 0.8;
    margin:0;
  }
  .progress-bar-container {
    flex-shrink: 0;
  }
  input[type="range"].progress-bar,
  input[type="range"].volume-slider {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--card-mini-bg);
    border-radius: 4px;
    cursor: pointer;
    outline: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--card-title-text);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--card-bg);
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
  }
  input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: var(--card-title-text);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--card-bg);
  }
  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--card-mood-border);
    padding: 0.2rem 0;
    flex-shrink: 0;
  }
  .controls-main {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-shrink: 0;
  }
  .control-button {
    background: none;
    border: none;
    color: var(--card-mini-bg);
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, color 0.2s, transform 0.1s ease-out;
  }
  .control-button:hover {
    background-color: var(--card-mini-bg);
    color: var(--card-bg);
  }
   .control-button:active {
    transform: scale(0.9);
  }
  .control-button.play-pause {
    width: 60px;
    height: 60px;
    background-color: var(--card-title-text);
    color: var(--card-bg);
  }
  .control-button.play-pause :global(svg) {
    fill: var(--card-bg);
  }
  .control-button.play-pause:hover {
    background-color: var(--card-date-text);
  }
  .controls-extra {
    display: flex;
    justify-content: flex-end; /* Align volume to right */
    align-items: center;
    flex-shrink: 0;
  }
  .playback-mode-placeholder {
    /* This can be removed if you don't need it to balance layout */
     width: 40px; /* Ensure it takes up some space if kept */
     height: 40px;
     flex-shrink: 0;
  }
  .control-button.small-button {
    width: 40px;
    height: 40px;
    color: var(--card-title-text);
  }
  /* Removed .active class for loop button as it's gone */
  .control-button.small-button :global(svg) {
     width: 20px;
     height: 20px;
  }
  .volume-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 0; /* Don't let it grow if placeholder removed */
    margin-left: 0; /* Remove if placeholder is gone */
  }
  input[type="range"].volume-slider {
    height: 6px;
    width: 100px;
  }
  input[type="range"].volume-slider::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
  }
  input[type="range"].volume-slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
  }
  .track-list-container {
      margin-top: 0.5rem;
      max-height: 150px;
      overflow-y: auto;
      border-top: 1px solid var(--card-mini-bg);
      padding-top: 0.5rem;
      flex-shrink: 0;
      scrollbar-width: thin;
      scrollbar-color: var(--card-title-text) var(--bw-bg-tertiary, #2c2c2c);
  }
  .track-list-container::-webkit-scrollbar { width: 6px; }
  .track-list-container::-webkit-scrollbar-track { background: var(--bw-bg-tertiary, #2c2c2c); border-radius: 3px;}
  .track-list-container::-webkit-scrollbar-thumb { background-color: var(--bw-accent-pink, #ff69b4); border-radius: 3px; border: 1px solid var(--bw-bg-tertiary, #2c2c2c);}
  .track-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .track-list li {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s;
      display: flex;
      justify-content: space-between;
      color: var(--card-title-text);
  }
  .track-list li:hover {
    background-color: var(--card-mini-bg);
  }
  .track-list li.active {
      background-color: var(--card-mini-bg);
      color: var(--bw-accent-pink, var(--card-title-text));
      font-weight: 500;
  }
  .track-list-mood {
    font-size: 0.75rem;
    color: var(--card-title-text);
    opacity: 0.7;
    margin-left: 0.5rem;
  }
  .no-tracks-message { /* Style for when no tracks are unlocked */
    text-align: center;
    padding: 1rem;
    font-style: italic;
    color: var(--bw-text-secondary);
    font-size: 0.9rem;
  }
  .modal-actions-player-bwp {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--bw-border-primary, #3a3a3a);
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  /* .player-ctrl-button-bwp :global(svg) {
    width: 60%;
    height: 60%;
    fill: currentColor;
  }
  .player-ctrl-button-bwp.play-pause :global(svg) {
    fill: var(--card-bg); 
    width: 50%;
    height: 50%;
  } */
  :global(.player-close-button-override) {
    flex-grow: 0 !important;
    min-width: 100px !important;
    max-width: 180px !important;
  }
</style>