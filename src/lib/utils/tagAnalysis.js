import { get } from 'svelte/store';
import { entriesStore } from '$lib/stores/entriesStore.js'; // Assuming this is where entries are stored
import { moodStore } from '$lib/stores/moodStore.js';   // To potentially color tags by dominant mood

/**
 * Analyzes entries to find tag co-occurrences and prepare data for a network graph.
 * @param {Array<object>} allEntries - Array of entry objects, each with a `tags` array property (e.g., ['#work', '#stress']).
 * @param {Array<object>} moodDefinitions - Array of mood objects for color mapping.
 * @returns {object|null} An object { nodes: [...], links: [...] } or null if no tags.
 *                        Nodes: [{ id: 'tagWithout#', label: '#tag', value: frequency, color: 'moodColor' }]
 *                        Links: [{ source: 'tag1Id', target: 'tag2Id', value: coOccurrenceCount }]
 */
export function analyzeTagConnections(allEntries, moodDefinitions) {
  if (!allEntries || allEntries.length === 0) {
    return null;
  }

  const tagFrequencies = new Map(); // To count overall frequency of each tag
  const tagCoOccurrences = new Map(); // To count pairs: 'tagA|tagB' -> count
  const tagDominantMoods = new Map(); // To store dominant mood for each tag: 'tag' -> { moodValue: count, ... }

  allEntries.forEach(entry => {
    const entryTags = entry.tags && Array.isArray(entry.tags) ? entry.tags : [];
    if (entryTags.length === 0) return;

    // Count individual tag frequencies and update dominant mood for each tag
    entryTags.forEach(tag => {
      const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
      tagFrequencies.set(cleanTag, (tagFrequencies.get(cleanTag) || 0) + 1);

      // Track mood associated with this tag in this entry
      if (entry.mood) {
        const moodsForTag = tagDominantMoods.get(cleanTag) || {};
        moodsForTag[entry.mood] = (moodsForTag[entry.mood] || 0) + 1;
        tagDominantMoods.set(cleanTag, moodsForTag);
      }

    });

    // Generate and count co-occurring pairs
    // Ensure tags are sorted alphabetically within a pair to count ('A|B' same as 'B|A')
    const sortedUniqueEntryTags = [...new Set(entryTags.map(t => t.startsWith('#') ? t.substring(1) : t))].sort();

    for (let i = 0; i < sortedUniqueEntryTags.length; i++) {
      for (let j = i + 1; j < sortedUniqueEntryTags.length; j++) {
        const tag1 = sortedUniqueEntryTags[i];
        const tag2 = sortedUniqueEntryTags[j];
        const pairKey = `${tag1}|${tag2}`; // Consistent key for pairs
        tagCoOccurrences.set(pairKey, (tagCoOccurrences.get(pairKey) || 0) + 1);
      }
    }
  });

  if (tagFrequencies.size === 0) {
    return null; // No tags found at all
  }

  // --- Helper to get mood color ---
  // You might already have this in moodAnalysis.js or a central color utility
  const moodBaseColors = {
      happy: '#34d399', sad: '#60a5fa', excited: '#facc15', angry: '#f87171',
      anxious: '#c084fc', okay: '#fb923c', default: '#94a3b8'
  };
  const getMoodColor = (moodValue) => moodBaseColors[moodValue] || moodBaseColors.default;
  // --- End Helper ---


  // Create nodes array
  const nodes = Array.from(tagFrequencies.entries()).map(([tagId, count]) => {
    let dominantMoodColor = getMoodColor('default'); // Default color
    const moods = tagDominantMoods.get(tagId);
    if (moods) {
        let maxMoodCount = 0;
        let dominantMood = null;
        for (const moodValue in moods) {
            if (moods[moodValue] > maxMoodCount) {
                maxMoodCount = moods[moodValue];
                dominantMood = moodValue;
            }
        }
        if (dominantMood) {
            dominantMoodColor = getMoodColor(dominantMood);
        }
    }
    return {
      id: tagId, // e.g., 'work' (used for linking)
      label: `#${tagId}`, // e.g., '#work' (for display)
      value: count, // Frequency, can be used for node size
      color: dominantMoodColor // Color based on most frequent mood associated with this tag
    };
  });

  // Create links array
  const links = Array.from(tagCoOccurrences.entries()).map(([pairKey, count]) => {
    const [sourceId, targetId] = pairKey.split('|');
    return {
      source: sourceId, // ID of source node
      target: targetId, // ID of target node
      value: count      // Co-occurrence count, can be used for link thickness/strength
    };
  });

  // Filter out nodes with very few occurrences if desired (e.g., count < 2) to simplify graph
  // const MIN_NODE_VALUE = 2;
  // const popularNodes = nodes.filter(node => node.value >= MIN_NODE_VALUE);
  // const popularNodeIds = new Set(popularNodes.map(n => n.id));
  // const popularLinks = links.filter(link => popularNodeIds.has(link.source) && popularNodeIds.has(link.target));

  // For now, return all:
  return { nodes, links };
  // return { nodes: popularNodes, links: popularLinks }; // If using filtering
}