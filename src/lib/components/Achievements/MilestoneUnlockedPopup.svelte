<script>
  export let milestoneText; 
  export let characterName;
  export let rewardText;   
  export let characterImageComponent = null; 
</script>

<div class="milestone-popup">
  {#if characterImageComponent}
    <div class="popup-char-icon">
        <svelte:component this={characterImageComponent} />
    </div>
  {/if}
  <h4>Milestone Reached!</h4>
  <p>For <strong>{characterName}</strong>, you completed:</p>
  <p class="ms-text">"{milestoneText}"</p>
  {#if rewardText}
    <p class="reward-text">Reward: <strong>{rewardText}</strong></p>
  {/if}
</div>

<style>
  .milestone-popup { 
    text-align: center; 
  }
  .popup-char-icon { 
    width: 50px; 
    height: 50px; 
    margin: 0 auto 0.5rem auto;
  }
  .popup-char-icon :global(img), 
  .popup-char-icon :global(svg) { 
    width:100%; 
    height:100%; 
    object-fit:contain; 
  }
  .milestone-popup h4 { 
    font-size: 1.1rem; 
    color: var(--card-title-text); 
    margin-bottom: 0.5rem; 
  }
  .ms-text { 
    font-weight: 500; 
    margin-bottom: 0.3rem; 
  }
  .reward-text { 
    font-size: 0.9rem; 
    margin-top: 0.5rem; 
  }
</style>