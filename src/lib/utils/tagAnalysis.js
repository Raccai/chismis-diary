import { get } from 'svelte/store';
import { moodStore } from '$lib/stores/moodStore.js';

export function analyzeTagConnections(allEntries, moodDefinitions) {
  if (!allEntries || allEntries.length === 0) {
    return null;
  }

  const tagFrequencies = new Map();       // tag -> total count
  const tagCoOccurrences = new Map();     // "tagA|tagB" -> count
  const tagDominantMoods = new Map();     // tag -> { moodValue: count, ... }

  // 1) Count frequencies and build a map of which moods occurred with each tag:
  allEntries.forEach(entry => {
    const entryTags = Array.isArray(entry.tags) ? entry.tags : [];
    if (entryTags.length === 0) return;

    // (a) Count each tag's frequency and tally its mood
    entryTags.forEach(rawTag => {
      const cleanTag = rawTag.startsWith('#') ? rawTag.slice(1) : rawTag;
      tagFrequencies.set(cleanTag, (tagFrequencies.get(cleanTag) || 0) + 1);

      if (entry.mood) {
        const moodsForTag = tagDominantMoods.get(cleanTag) || {};
        moodsForTag[entry.mood] = (moodsForTag[entry.mood] || 0) + 1;
        tagDominantMoods.set(cleanTag, moodsForTag);
      }
    });

    // (b) Build co-occurrence pairs (sorted alphabetically so "a|b" === "b|a")
    const uniqueSortedTags = [...new Set(entryTags.map(t => t.startsWith('#') ? t.slice(1) : t))].sort();
    for (let i = 0; i < uniqueSortedTags.length; i++) {
      for (let j = i + 1; j < uniqueSortedTags.length; j++) {
        const key = `${uniqueSortedTags[i]}|${uniqueSortedTags[j]}`;
        tagCoOccurrences.set(key, (tagCoOccurrences.get(key) || 0) + 1);
      }
    }
  });

  if (tagFrequencies.size === 0) {
    return null;
  }

  const getMoodObj = moodValue => moodDefinitions.find(m => m.value === moodValue);

  const nodes = Array.from(tagFrequencies.entries()).map(([tagId, freq]) => {
    let dominantMood = null;
    const moodsForThisTag = tagDominantMoods.get(tagId) || {};

    // find the moodValue with highest count
    let highestCount = 0;
    for (const [moodValue, count] of Object.entries(moodsForThisTag)) {
      if (count > highestCount) {
        highestCount = count;
        dominantMood = moodValue;
      }
    }

    let baseColor = null;
    if (dominantMood) {
      const m = getMoodObj(dominantMood);
      if (m) baseColor = m.colorMedium;
    }

    // if no dominantMood or no match, baseColor stays null
    return {
      id: tagId,
      label: `#${tagId}`,
      value: freq,
      moodId: dominantMood,   
      baseColor             
    };
  });

  // 4) Build the links array in the shape { source, target, value }
  const links = Array.from(tagCoOccurrences.entries()).map(([pairKey, count]) => {
    const [src, tgt] = pairKey.split('|');
    return { source: src, target: tgt, value: count };
  });

  return { nodes, links };
}
