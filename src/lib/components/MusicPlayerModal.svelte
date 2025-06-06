<script>
  import { musicPlayer } from '$lib/stores/musicPlayerStore.js';
  import { scale, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte';
  import Button from './Button.svelte'; // Your custom Button component

  // --- Import your Svelte SVG Icon Components ---
  import PlaySvelteIcon from '$lib/icons/PlayIcon.svelte';
  import PauseSvelteIcon from '$lib/icons/PauseIcon.svelte';
  import NextSvelteIcon from '$lib/icons/NextIcon.svelte';
  import PrevSvelteIcon from '$lib/icons/PrevIcon.svelte';
  // Repeat/Loop icons are removed
  import VolumeHighSvelteIcon from '$lib/icons/VolumeHighIcon.svelte';
  import VolumeMidSvelteIcon from '$lib/icons/VolumeMidIcon.svelte';
  import VolumeLowSvelteIcon from '$lib/icons/VolumeLowIcon.svelte';
  import VolumeMuteSvelteIcon from '$lib/icons/VolumeMuteIcon.svelte';
  // CloseSvelteIcon not used for the text button

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

  // Reactive Icon Components
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
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
              <p class="track-title">No track selected</p>
              <p class="track-artist">Select a mood to play its theme</p>
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
            />
            <div class="time-display">
              <span>{formatTime($musicPlayer.currentTime)}</span>
              <span>{formatTime($musicPlayer.duration)}</span>
            </div>
          </div>

          <div class="controls-main">
            <button class="control-button" on:click={musicPlayer.playPrevious} aria-label="Previous track">
              <svelte:component this={PrevSvelteIcon} />
            </button>
            <button class="control-button play-pause" on:click={musicPlayer.togglePlay} aria-label={$musicPlayer.isPlaying ? 'Pause' : 'Play'}>
              <svelte:component this={playPauseIconComponent} />
            </button>
            <button class="control-button" on:click={musicPlayer.playNext} aria-label="Next track">
              <svelte:component this={NextSvelteIcon} />
            </button>
          </div>

          <div class="controls-extra">
            <!-- Removed Repeat Button and its placeholder -->
            <div class="volume-control full-width">
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
            <ul class="track-list">
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                {#each $musicPlayer.tracks as track, index (track.src)}
                    <li on:click={() => musicPlayer.loadTrack(index, true)} class:active={index === $musicPlayer.currentTrackIndex}>
                        <span class="track-list-title">{track.title}</span>
                        <span class="track-list-mood">({track.moodValue})</span>
                    </li>
                {/each}
            </ul>
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
    width: 90%;
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
    width: 100%;
    max-width: 380px;
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
    font-weight: normal;
    text-align: center;
    color: var(--card-title-text);
    margin: 0;
    margin-bottom: 0.8rem;
    flex-shrink: 0;
  }

  .modal-scrollable-body {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    scrollbar-width: thin;
    scrollbar-color: var(--card-title-text) var(--bw-bg-tertiary, #2c2c2c);
  }
  .modal-scrollable-body::-webkit-scrollbar {
    width: 8px;
  }
  .modal-scrollable-body::-webkit-scrollbar-track {
    background: var(--bw-bg-tertiary, #2c2c2c);
    border-radius: 4px;
  }
  .modal-scrollable-body::-webkit-scrollbar-thumb {
    background-color: var(--card-title-text);
    border-radius: 4px;
    border: 2px solid var(--bw-bg-tertiary, #2c2c2c);
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
    color: var(--card-title-text);
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
    justify-content: flex-end; /* Align volume to the right */
    align-items: center;
    flex-shrink: 0;
  }
  .control-button.small-button {
    width: 40px;
    height: 40px;
    color: var(--card-title-text);
  }
  .control-button.small-button :global(svg) {
     width: 20px;
     height: 20px;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
  }
  input[type="range"].volume-slider {
    height: 6px;
    width: 100%; /* Give it a fixed or max-width */
    /* flex-grow: 1; /* Remove if you want it to be fixed width */
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
  .track-list-container::-webkit-scrollbar-thumb { background-color: var(--card-title-text); border-radius: 3px; border: 1px solid var(--bw-bg-tertiary, #2c2c2c);}

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

  .player-ctrl-button-bwp :global(svg) {
      width: 60%;
      height: 60%;
      fill: currentColor;
  }
  .player-ctrl-button-bwp.play-pause :global(svg) {
      fill: var(--card-bg);
      width: 50%;
      height: 50%;
  }

  :global(.player-close-button-override) {
    flex-grow: 0 !important;
    min-width: 100px !important;
    max-width: 180px !important;
  }
  :global(.player-close-button-override .button-icon svg),
  :global(.player-close-button-override > svg) {
      width: 18px;
      height: 18px;
      fill: currentColor;
  }
</style>