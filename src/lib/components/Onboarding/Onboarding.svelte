<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { uiStore } from '$lib/stores/uiStore.js';

  export let visible = false; 
  let currentSlide = 0;

  const slides = [
    {
      title: 'Lihim Mong Pader.',
      tagline: 'Pwede kang maglabas ng sama ng loob o kwento — walang judgement, pramis.',
      showcaseImage: '/images/onboarding/pic1.png',
      stickers: ['🔒', '💌', '👀']
    },
    {
      title: 'May mood? May tag din.',
      tagline: 'Ilagay kung anong nararamdaman mo, i-tag, i-sort, at balikan anytime.',
      showcaseImage: '/images/onboarding/pic2.png',
      stickers: ['🤬', '😭', '🤪']
    },
    {
      title: 'Walang tsismosa rito, besh.',
      tagline: 'Private lahat ng entries mo. Di ito social media, besh.',
      showcaseImage: '/images/onboarding/pic3.png',
      stickers: ['🔐', '🙈', '🚫']
    },
    {
      title: 'May tugtugan habang nagsusulat.',
      tagline: 'May vibes habang nagsusulat — iyakan, tawanan, o drama mode.',
      showcaseImage: '/images/onboarding/pic4.png',
      stickers: ['🎶', '🔊', '💿']
    },
    {
      title: 'May kwento ang mood mo.',
      tagline: 'Makikita mo kung paano ka nag-evolve. Character development, ganern.',
      showcaseImage: '/images/onboarding/pic5.png',
      stickers: ['📈', '🎭', '🫠']
    }
  ];

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
    } else {
      localStorage.setItem('chismis_onboarded', 'true'); 
      uiStore.hideOnboardingModal();
    }
  }

  function skipOnboarding() {
    localStorage.setItem('chismis_onboarded', 'true'); 
    uiStore.hideOnboardingModal();
  }

  onMount(() => {
    if (!visible && browser && !localStorage.getItem('chismis_onboarded')) {
      uiStore.showOnboardingModal();
    }
  });
</script>

{#if visible}
  <div class="onboarding-wrapper" in:fade out:fade>
    <div class="onboarding-slide">
      <div class="overlay"></div>
      <div class="slide-content">
        <img src={slides[currentSlide].showcaseImage} alt="Slide Visual" class="showcase-image">
        <h1 class="graffiti-title">{slides[currentSlide].title}</h1>
        <p class="tagline">{slides[currentSlide].tagline}</p>
        <div class="stickers">
          {#each slides[currentSlide].stickers as sticker}
            <span>{sticker}</span>
          {/each}
        </div>
        <button class="next-btn" on:click={nextSlide}>
          {currentSlide === slides.length - 1 ? 'Tara, Chismis Na!' : 'Ano Pa?'}
        </button>
        <button class="skip-btn" on:click={skipOnboarding}>Lakdawan</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .onboarding-wrapper {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1B1A11;
    background-image: url('/images/graffitiWall.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-blend-mode: multiply;
    opacity: 1;
  }

  .onboarding-slide {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
  }
  
  .overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    opacity: 0.6;
    z-index: 0;
  }

  .slide-content {
    position: relative;
    z-index: 1;
    color: var(--card-bg);
    text-align: center;
    max-width: 500px;
    margin: auto;
  }

  .showcase-image {
    max-width: 80%;
    height: auto;
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  .graffiti-title {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 2rem;
    margin-bottom: 0.4rem;
    font-weight: normal;
  }

  .tagline {
    font-size: 1rem;
    font-family: 'Urbanist', sans-serif;
    margin-bottom: 1rem;
  }

  .stickers span {
    margin: 0 0.3rem;
    font-size: 1.5rem;
  }

  .next-btn,
  .skip-btn {
    margin-top: 1rem;
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    font-family: 'Urbanist', sans-serif;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .next-btn {
    background-color: white;
    color: black;
    margin-bottom: 0.5rem;
  }

  .skip-btn {
    background: transparent;
    color: #ccc;
    text-decoration: underline;
  }
</style>