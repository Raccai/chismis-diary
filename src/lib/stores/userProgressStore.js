import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { moodStore as moodDefinitionsReadableStore } from '$lib/stores/moodStore.js';
import { musicTracks } from '$lib/stores/musicTracks.js';
import { uiStore } from '$lib/stores/uiStore.js';
import { toasts } from '$lib/stores/toastStore.js';

// Import custom popup content components (ensure paths are correct)
import MilestoneUnlockedPopup from '$lib/components/Achievements/MilestoneUnlockedPopup.svelte';
import MusicUnlockedPopup from '$lib/components/Achievements/MusicUnlockedPopup.svelte';

function getDefaultProgress() {
  const progress = {};
  const moodDefinitions = get(moodDefinitionsReadableStore); // Initial read

  progress.totalEntries = 0;
  // Initialize other global stats if your milestones use them
  // progress.uniqueMoodsUsed = new Set(); // Example for tracking unique moods

  moodDefinitions.forEach(mood => {
    progress[`moodCount_${mood.value}`] = 0;
    if (mood.milestones) {
      mood.milestones.forEach(ms => {
        progress[`${mood.value}_${ms.id}_completed`] = false;
      });
    }
  });

  progress.unlockedTracks = {};
  musicTracks.forEach(track => {
    progress.unlockedTracks[track.moodValue] = (track.moodValue === 'chismis'); // "Chismis" track initially unlocked
  });

  return progress;
}

let initialProgressState = getDefaultProgress(); // Define initial state structure first

if (browser) {
  const storedProgress = localStorage.getItem('userChismisProgress');
  if (storedProgress) {
    try {
      const parsedStored = JSON.parse(storedProgress);
      // Merge stored data with a fresh default structure to handle new/missing keys
      initialProgressState = { ...getDefaultProgress(), ...parsedStored };

      // Ensure crucial nested objects exist if they were missing in stored data
      if (typeof initialProgressState.unlockedTracks !== 'object' || initialProgressState.unlockedTracks === null) {
        initialProgressState.unlockedTracks = getDefaultProgress().unlockedTracks;
      }
      const moodDefsForMerge = get(moodDefinitionsReadableStore);
      moodDefsForMerge.forEach(mood => {
        if (typeof initialProgressState[`moodCount_${mood.value}`] === 'undefined') {
          initialProgressState[`moodCount_${mood.value}`] = 0;
        }
        if (mood.milestones) {
          mood.milestones.forEach(ms => {
            if (typeof initialProgressState[`${mood.value}_${ms.id}_completed`] === 'undefined') {
              initialProgressState[`${mood.value}_${ms.id}_completed`] = false;
            }
          });
        }
      });
    } catch (e) {
      console.error("Error parsing user progress from localStorage, resetting:", e);
      initialProgressState = getDefaultProgress(); // Fallback to default if parsing fails
    }
  }
}

const store = writable(initialProgressState);
const { subscribe, update, set: setStoreValue } = store; // Use setStoreValue for clarity on direct set

if (browser) {
  store.subscribe(value => {
    localStorage.setItem('userChismisProgress', JSON.stringify(value));
  });
}

// Helper function to check and apply milestones for a specific mood character.
// IMPORTANT: This function MUTATES the progressObject it receives. Call within store.update().
function checkAndApplyMilestonesForMood(moodValueToCheck, progressObject) {
  const moodDefinitions = get(moodDefinitionsReadableStore);
  const targetMoodCharacter = moodDefinitions.find(m => m.value === moodValueToCheck);

  if (!targetMoodCharacter || !targetMoodCharacter.milestones) {
    return; // No milestones for this mood or mood not found
  }

  targetMoodCharacter.milestones.forEach(ms => {
    const milestoneCompletionKey = `${targetMoodCharacter.value}_${ms.id}_completed`;
    const currentStatValue = progressObject[ms.statKey] || 0;

    if (!progressObject[milestoneCompletionKey] && currentStatValue >= ms.target) {
      progressObject[milestoneCompletionKey] = true;
      const milestoneTextDisplay = ms.text.split(' to unlock ')[0];

      if (ms.unlocksMusic) {
        const trackToUnlock = musicTracks.find(t => t.moodValue === targetMoodCharacter.musicTrackMoodValue);
        if (trackToUnlock && !progressObject.unlockedTracks[trackToUnlock.moodValue]) {
          progressObject.unlockedTracks[trackToUnlock.moodValue] = true;
          setTimeout(() => { // Decouple UI side-effect
            uiStore.showModalOnly({
              contentComponent: MusicUnlockedPopup,
              componentProps: {
                characterName: targetMoodCharacter.label,
                trackTitle: trackToUnlock.title,
                characterImageComponent: targetMoodCharacter.iconComponent // From moodStore
              },
              confirmText: 'Sweet!',
              hideCancelButton: true
            });
          }, 0);
        }
      } else if (ms.rewardPreview && ms.rewardPreview.text) {
        setTimeout(() => { // Decouple UI side-effect
            uiStore.showModalOnly({
                contentComponent: MilestoneUnlockedPopup,
                componentProps: {
                    milestoneText: milestoneTextDisplay,
                    characterName: targetMoodCharacter.label,
                    rewardText: ms.rewardPreview.text,
                    characterImageComponent: targetMoodCharacter.iconComponent // From moodStore
                },
                confirmText: 'Nice!',
                hideCancelButton: true
            });
        }, 0);
      } else { // Generic milestone toast
          setTimeout(() => toasts.info(`Milestone: "${milestoneTextDisplay}"!`), 0);
      }
    }
  });
}

export const userProgress = {
  subscribe,
  set: setStoreValue, // For data import

  logMoodEntry: (entry) => {
    if (!entry || !entry.mood) {
      return;
    }
    const moodValue = entry.mood;
    const moodStatKey = `moodCount_${moodValue}`;

    update(currentProgress => {
      const newProgress = { ...currentProgress }; // Ensure new object for reactivity

      newProgress[moodStatKey] = (newProgress[moodStatKey] || 0) + 1;
      newProgress.totalEntries = (newProgress.totalEntries || 0) + 1;

      // Example: update other stats based on entry
      // if (entry.tags && entry.tags.length > (newProgress.maxTagsInEntryCount || 0)) {
      //   newProgress.maxTagsInEntryCount = entry.tags.length;
      // }

      // Check milestones for the mood of this entry
      checkAndApplyMilestonesForMood(moodValue, newProgress);

      // Check milestones for ALL characters that depend on global stats that just changed (e.g., totalEntries)
      const moodDefinitions = get(moodDefinitionsReadableStore);
      moodDefinitions.forEach(char => {
        if (char.value !== moodValue) { // Avoid re-checking primary mood if its milestones are only mood-specific
          if (char.milestones && char.milestones.some(ms => ms.statKey === 'totalEntries' /* add other global statKeys here */)) {
            checkAndApplyMilestonesForMood(char.value, newProgress);
          }
        }
      });
      return newProgress;
    });
  },

  processExistingEntries: (allEntries) => {
    if (!allEntries || allEntries.length === 0) {
      return;
    }
    let tempProgress = getDefaultProgress();

    allEntries.forEach(entry => {
      tempProgress.totalEntries = (tempProgress.totalEntries || 0) + 1;
      if (entry && entry.mood) {
        const moodStatKey = `moodCount_${entry.mood}`;
        tempProgress[moodStatKey] = (tempProgress[moodStatKey] || 0) + 1;
      }
      // if (entry && entry.tags && entry.tags.length > 0) {
      //   tempProgress.maxTagsInEntryCount = Math.max(tempProgress.maxTagsInEntryCount || 0, entry.tags.length);
      // }
    });

    const moodDefinitions = get(moodDefinitionsReadableStore);
    moodDefinitions.forEach(moodChar => {
      if (moodChar.milestones) {
        moodChar.milestones.forEach(ms => {
          const milestoneCompletionKey = `${moodChar.value}_${ms.id}_completed`;
          const currentStatValue = tempProgress[ms.statKey] || 0;
          if (currentStatValue >= ms.target) {
            tempProgress[milestoneCompletionKey] = true;
            if (ms.unlocksMusic) {
              tempProgress.unlockedTracks[moodChar.musicTrackMoodValue] = true;
            }
          }
        });
      }
    });
    setStoreValue(tempProgress); // Use the aliased set
    toasts.info("Achievements re-calculated!");
  },

  resetProgress: () => {
    setStoreValue(getDefaultProgress()); // Use the aliased set
    toasts.info("Achievements progress has been reset.");
  }
};