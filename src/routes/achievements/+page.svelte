<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import CharacterReveal from '$lib/components/Achievements/CharacterReveal.svelte';
</script>

<div class="achievements-page">
  <h1 class="page-title">Mood Crew</h1>
  <p class="page-subtitle">Unlock music gamit ang mga mood mo!</p>

  <div class="divider"></div>

  <div class="character-grid">
    {#each $moodStore as character (character.value)}
      <CharacterReveal moodCharacter={character} />
    {/each}
  </div>
</div>

<style>
  .achievements-page {
    padding: 1rem 1rem calc(var(--navbar-height, 65px) + 1rem) 1rem;
  }
  .page-title {
    font-family: 'Graffiti Urban', sans-serif;
    font-weight: bold;
    letter-spacing: -0.12rem;
    color: var(--card-title-text);
    font-size: 2.2rem;
    text-align: center;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
  }
  .page-subtitle {
    font-family: 'Urbanist', sans-serif;
    color: var(--card-title-text);
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.4rem;
    border-bottom: 2px solid var(--card-border);
    font-size: 0.95rem;
  }
  .character-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    padding: 0 1rem;
    justify-items: center;
  }
</style>