import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { musicTracks } from '$lib/stores/musicTracks.js';
import { userProgress } from '$lib/stores/userProgressStore.js';
import { App } from '@capacitor/app';

const initialPlayerState = {
  allTracks: musicTracks,
  playableTracks: [],
  currentTrackIndexInPlayable: -1,
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.75,
  isMuted: false,
  isModalOpen: false,
  wasPlayingBeforeBackground: false
};

function createMusicPlayerStore() {
  const store = writable(initialPlayerState);
  const { subscribe, update, set } = store;
  let audioElement = null;

  if (browser) {
    audioElement = new Audio();

    audioElement.onloadedmetadata = () => update(s => ({ ...s, duration: audioElement.duration }));
    audioElement.ontimeupdate = () => update(s => ({ ...s, currentTime: audioElement.currentTime }));
    audioElement.onvolumechange = () => update(s => ({ ...s, volume: audioElement.volume, isMuted: audioElement.muted }));
    audioElement.onplay = () => update(s => ({ ...s, isPlaying: true }));
    audioElement.onpause = () => update(s => ({ ...s, isPlaying: false }));

    audioElement.onended = () => {
      const state = get(store);
      if (state.currentTrackIndexInPlayable < state.playableTracks.length - 1) {
        methods.playNext();
      } else {
        update(s => ({ ...s, isPlaying: false, currentTime: 0 }));
      }
    };

    // --- Capacitor App State Listener ---
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      const currentStoreState = get(store);

      if (!isActive) { // App is going to background or becoming inactive
        if (currentStoreState.isPlaying) {
          update(s => ({ ...s, _wasPlayingBeforeBackground: true })); // Remember it was playing
          audioElement.pause(); // Pause the audio
          console.log('Music paused due to app backgrounding.');
        } else {
          update(s => ({ ...s, _wasPlayingBeforeBackground: false }));
        }
      } else { // App is returning to foreground / becoming active
        if (currentStoreState._wasPlayingBeforeBackground) {
          // Only resume if it was playing before, and user hasn't manually paused/stopped in meantime
          // And if there's a current track
          if (currentStoreState.currentTrack && !currentStoreState.isPlaying) {
             audioElement.play().catch(e => console.error("Error resuming audio:", e));
             console.log('Music resumed due to app foregrounding.');
          }
        }
        update(s => ({ ...s, _wasPlayingBeforeBackground: false })); // Reset flag
      }
    });
  }

  

  const methods = {
    subscribe,
    set,

    openPlayerModal: () => update(s => ({ ...s, isModalOpen: true, isFormVisible: false, isSideMenuVisible: false })),
    closePlayerModal: () => update(s => ({ ...s, isModalOpen: false })),
    togglePlayerModal: () => update(s => ({ ...s, isModalOpen: !s.isModalOpen, isFormVisible: false, isSideMenuVisible: false })),

    _updatePlayableTracks: (unlockedTrackMoods) => {
      update(s => {
        const newPlayableTracks = s.allTracks.filter(track => unlockedTrackMoods[track.moodValue]);
        let newCurrentTrackIndexInPlayable = -1;
        let newCurrentTrack = null;

        if (s.currentTrack) {
          newCurrentTrackIndexInPlayable = newPlayableTracks.findIndex(t => t.src === s.currentTrack.src);
          if (newCurrentTrackIndexInPlayable !== -1) {
            newCurrentTrack = s.currentTrack;
          }
        }
        if (newPlayableTracks.length === 0) {
            if (audioElement && s.isPlaying) audioElement.pause();
            newCurrentTrack = null;
            newCurrentTrackIndexInPlayable = -1;
        }
        return {
          ...s,
          playableTracks: newPlayableTracks,
          currentTrack: newCurrentTrack,
          currentTrackIndexInPlayable: newCurrentTrackIndexInPlayable,
          isPlaying: newCurrentTrack ? s.isPlaying : false,
        };
      });
    },

    loadTrack: (indexInPlayableList, autoPlay = true) => {
      if (!browser || !audioElement) return;
      const state = get(store);
      if (indexInPlayableList < 0 || indexInPlayableList >= state.playableTracks.length) return;

      const trackToLoad = state.playableTracks[indexInPlayableList];
      audioElement.src = trackToLoad.src;
      audioElement.load();
      update(s => ({
        ...s,
        currentTrack: trackToLoad,
        currentTrackIndexInPlayable: indexInPlayableList,
        isPlaying: false,
        currentTime: 0,
        duration: 0
      }));

      if (autoPlay) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => update(s => ({ ...s, isPlaying: false })));
        }
      }
    },

    play: () => {
      const state = get(store);
      if (!browser || !audioElement || !state.currentTrack) {
        if (state.playableTracks.length > 0) methods.loadTrack(0, true);
        return;
      }
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Error playing audio:", e));
      }
    },
    pause: () => {
      if (!browser || !audioElement) return;
      audioElement.pause();
    },
    togglePlay: () => {
      const state = get(store);
      if (!state.currentTrack && state.playableTracks.length > 0) {
        methods.loadTrack(0, true);
      } else if (state.isPlaying) {
        methods.pause();
      } else {
        methods.play();
      }
    },
    seek: (time) => {
      if (!browser || !audioElement || isNaN(time)) return;
      audioElement.currentTime = Math.max(0, Math.min(time, audioElement.duration || 0));
    },
    setVolume: (vol) => {
      if (!browser || !audioElement || isNaN(vol)) return;
      const newVolume = Math.max(0, Math.min(vol, 1));
      audioElement.volume = newVolume;
      if (audioElement.muted && newVolume > 0) audioElement.muted = false;
    },
    toggleMute: () => {
      if (!browser || !audioElement) return;
      audioElement.muted = !audioElement.muted;
    },
    playNext: () => {
      const state = get(store);
      if (state.playableTracks.length === 0) return;
      let nextIndex = state.currentTrackIndexInPlayable + 1;
      if (nextIndex >= state.playableTracks.length) {
        nextIndex = 0; // Loop to start of playable playlist
      }
      methods.loadTrack(nextIndex, true);
    },
    playPrevious: () => {
      const state = get(store);
      if (state.playableTracks.length === 0) return;
      let prevIndex = state.currentTrackIndexInPlayable - 1;
      if (prevIndex < 0) {
        prevIndex = state.playableTracks.length - 1; // Loop to end
      }
      methods.loadTrack(prevIndex, true);
    },
    playTrackByMood: (moodValue) => {
      const state = get(store);
      const trackIndexInPlayable = state.playableTracks.findIndex(t => t.moodValue === moodValue);
      if (trackIndexInPlayable !== -1) {
        methods.loadTrack(trackIndexInPlayable, true);
      } else {
        console.warn(`Track for mood '${moodValue}' is not currently unlocked or available.`);
      }
    }
  };

  if (browser) {
    userProgress.subscribe(progress => {
      if (progress && progress.unlockedTracks) {
        methods._updatePlayableTracks(progress.unlockedTracks);
      }
    });
    const initialUserProgress = get(userProgress);
    if (initialUserProgress && initialUserProgress.unlockedTracks) {
        methods._updatePlayableTracks(initialUserProgress.unlockedTracks);
    }
  }
  return methods;
}
export const musicPlayer = createMusicPlayerStore();