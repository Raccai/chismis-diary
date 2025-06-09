<script>
  export let characterName;
  export let trackTitle;
  export let characterImageComponent = null;
</script>

<div class="music-popup-bwp">
  {#if characterImageComponent}
    <div class="popup-char-icon">
         <svelte:component this={characterImageComponent} />
    </div>
  {/if}
  <h4>🎵 Music Unlocked! 🎵</h4>
  <p>For <strong>{characterName}</strong>, you've unlocked the track:</p>
  <p class="track-title-popup">"{trackTitle}"</p>
  <p>Listen in the Mood Player!</p>
</div>

<style>
  .music-popup-bwp { 
    text-align: center; 
  }
  .popup-char-icon { 
    width: 60px; 
    height: 60px; 
    margin: 0 auto 0.75rem auto; 
  }
  .popup-char-icon :global(img), 
  .popup-char-icon :global(svg) { 
    width:100%; 
    height:100%; 
    object-fit:contain; 
  }
  .music-popup-bwp h4 { 
    font-size: 1.2rem; 
    color: var(--bw-accent-pink); 
    margin-bottom: 0.5rem; 
  }
  .track-title-popup { 
    font-weight: bold; 
    font-size: 1.1rem; 
    }
</style>