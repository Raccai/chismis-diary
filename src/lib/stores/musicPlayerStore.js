// src/lib/stores/musicPlayerStore.js
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { musicTracks } from '$lib/stores/musicTracks.js';

const initialPlayerState = {
  tracks: musicTracks,
  currentTrackIndex: -1,
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.75,
  isMuted: false,
  // isLooping and playbackMode REMOVED
  isModalOpen: false
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
      console.log("Track ended. Index:", state.currentTrackIndex, "Total tracks:", state.tracks.length);
      if (state.currentTrackIndex < state.tracks.length - 1) {
        methods.playNext(); // Play next track if not the last one
      } else {
        // Last track has finished, stop playback and reset time
        update(s => ({ ...s, isPlaying: false, currentTime: 0 }));
        console.log("Playlist finished.");
      }
    };
  }

  const methods = {
    subscribe,
    set,

    openPlayerModal: () => update(s => ({ ...s, isModalOpen: true, isFormVisible: false, isSideMenuVisible: false })),
    closePlayerModal: () => update(s => ({ ...s, isModalOpen: false })),
    togglePlayerModal: () => update(s => ({ ...s, isModalOpen: !s.isModalOpen, isFormVisible: false, isSideMenuVisible: false })),

    loadTrack: (trackIndex, autoPlay = true) => {
      if (!browser || !audioElement) return;
      const state = get(store);
      if (trackIndex < 0 || trackIndex >= state.tracks.length) return;

      const trackToLoad = state.tracks[trackIndex];
      audioElement.src = trackToLoad.src;
      audioElement.load();
      update(s => ({
        ...s,
        currentTrack: trackToLoad,
        currentTrackIndex: trackIndex,
        isPlaying: false,
        currentTime: 0,
        duration: 0
      }));

      if (autoPlay) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Error autoplaying track:", error);
                update(s => ({ ...s, isPlaying: false }));
            });
        }
      }
    },

    play: () => {
      if (!browser || !audioElement || !get(store).currentTrack) {
        if (get(store).tracks.length > 0) methods.loadTrack(0, true);
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
      if (!state.currentTrack && state.tracks.length > 0) {
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
      if (state.tracks.length === 0) return;
      let nextIndex = state.currentTrackIndex + 1;
      if (nextIndex >= state.tracks.length) {
        nextIndex = 0; // Loop back to the first track
      }
      methods.loadTrack(nextIndex, true);
    },
    playPrevious: () => {
      const state = get(store);
      if (state.tracks.length === 0) return;
      let prevIndex = state.currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.tracks.length - 1; // Loop to end
      }
      methods.loadTrack(prevIndex, true);
    },
    playTrackByMood: (moodValue) => {
      const state = get(store);
      const trackIndex = state.tracks.findIndex(t => t.moodValue === moodValue);
      if (trackIndex !== -1) {
        methods.loadTrack(trackIndex, true);
      } else {
        console.warn(`No track found for mood: ${moodValue}`);
      }
    }
  };
  return methods;
}

export const musicPlayer = createMusicPlayerStore();