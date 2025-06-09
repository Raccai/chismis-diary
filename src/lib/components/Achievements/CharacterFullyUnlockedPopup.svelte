<script>
  export let character; 
</script>
<div class="char-unlocked-popup-bwp">
  <div class="popup-char-full-image"> <!-- Larger image here -->
      <svelte:component this={character.iconComponent} /> <!-- Using iconComponent from moodStore -->
  </div>
  <h4>🌟 {character.characterName || character.label} Unlocked! 🌟</h4>
  <p>{character.unlockQuote || "You've gained a new confidante!"}</p>
  {#if character.finalUnlockReward}
    <p class="final-reward-desc"><strong>New Feature:</strong> {character.finalUnlockReward.name}</p>
  {/if}
</div>
<style>
  /* Styles for a grander popup */
  .char-unlocked-popup-bwp { 
    text-align: center; 
  }
  .popup-char-full-image { 
    width: 100px; 
    height: 100px; 
    margin: 0 auto 1rem auto;
  }
  .popup-char-full-image :global(img), 
  .popup-char-full-image :global(svg) { 
    width:100%; 
    height:100%; 
    object-fit:contain; 
  }
  .char-unlocked-popup-bwp h4 { 
    font-size: 1.4rem; 
    color: var(--bw-accent-pink); 
    margin-bottom: 0.5rem; 
  }
  .final-reward-desc { 
    margin-top: 0.75rem; 
    font-size: 0.95rem; 
    font-weight: 500; 
  }
</style>