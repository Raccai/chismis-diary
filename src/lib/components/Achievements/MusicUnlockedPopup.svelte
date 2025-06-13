<script>
  export let characterName;
  export let trackTitle;
  export let characterImageComponent = null;
</script>

<div class="music-popup">
  {#if characterImageComponent}
    <div class="popup-char-icon">
      <svelte:component this={characterImageComponent} />
    </div>
  {/if}
  <h4>🎵 May Na-unlock Kang Music! 🎵</h4>
  <p>Para kay <strong>{characterName}</strong>, na-unlock mo ang track na:</p>
  <p class="track-title-popup">"{trackTitle}"</p>
  <p>Pakinggan na sa Modo Player!</p>
</div>

<style>
  .music-popup { 
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
  .music-popup h4 { 
    font-size: 1.2rem; 
    color: var(--card-title-text); 
    margin-bottom: 0.5rem; 
  }
  .track-title-popup { 
    font-weight: bold; 
    font-size: 1.1rem; 
    }
</style>