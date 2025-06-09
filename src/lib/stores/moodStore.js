// src/lib/stores/moodStore.js
import { readable } from 'svelte/store';

// Helper to generate milestones
const createMilestones = (moodValue, musicTrackTitle = "Unlock their theme song!", otherMilestones = []) => {
  const baseMilestones = otherMilestones.map((ms, index) => ({
    id: `ms${index + 1}`,
    text: ms.text,
    target: ms.target,
    statKey: ms.statKey || `moodCount_${moodValue}`,
    rewardPreview: ms.rewardPreview || { type: 'text', text: 'Progress!' }
  }));
  baseMilestones.push({
    id: `ms_music_unlock`,
    text: `Master this mood to unlock "${musicTrackTitle}"`,
    target: (baseMilestones.length > 0 ? baseMilestones[baseMilestones.length - 1].target : 0) + 3, // Example target logic
    statKey: `moodCount_${moodValue}`,
    unlocksMusic: true,
    rewardPreview: { type: 'music', trackTitle: musicTrackTitle }
  });
  return baseMilestones;
};

export const moodStore = readable([
  {
    value: 'happy',
    label: 'Happy',
    emoji: 'src/lib/characters/HappyUnlocked.png', // YOUR ORIGINAL PATH
    colorLight: '#FFF6EB', colorMedium: '#FFEDD7', colorDark: '#EC9923',
    characterDescription: 'Spreads joy with every upbeat entry.',
    milestones: createMilestones('happy', 'Panaginip Lang Ba', [
      { text: 'Log 1 Happy entry', target: 1 },
      { text: 'Log 5 Happy entries', target: 5, rewardPreview: { text: 'Feeling good!' } },
    ]),
    musicTrackMoodValue: 'happy'
  },
  {
    value: 'sad',
    label: 'Sad',
    emoji: 'src/lib/characters/SadUnlocked.png', // YOUR ORIGINAL PATH
    colorLight: '#E6FAFF', colorMedium: '#A3D0D8', colorDark: '#242829',
    characterDescription: 'Understands the depths of reflective moments.',
    milestones: createMilestones('sad', 'Mga Taon Ko', [{ text: 'Acknowledge sadness 1 time', target: 1 }]),
    musicTrackMoodValue: 'sad'
  },
  {
    value: 'chismis',
    label: 'Chismis',
    emoji: 'src/lib/characters/ChismisUnlocked.png', // YOUR ORIGINAL PATH
    colorLight: '#FFE6E6', colorMedium: '#FFCCCE', colorDark: '#C82C37',
    characterDescription: 'The original source of all juicy details.',
    milestones: createMilestones('chismis', 'Chismis Lang Yan', [{ text: 'Spill your first "Chismis" entry', target: 1, rewardPreview: { text: 'The tea is brewing...' } }]),
    musicTrackMoodValue: 'chismis'
  },
  {
    value: 'love',
    label: 'In Love',
    emoji: 'src/lib/characters/LoveUnlocked.png',
    colorLight: '#FFEBEF', colorMedium: '#FFD2DC', colorDark: '#D96E82',
    milestones: createMilestones('love', 'Yong 20 Pa tayo', [{ text: 'Feel the love (1 entry)', target: 1 }, { text: 'Deep in love (5 entries)', target: 5 }]),
    musicTrackMoodValue: 'love'
  },
  {
    value: 'betrayed',
    label: 'Betrayed',
    emoji: 'src/lib/characters/BetrayedUnlocked.png',
    colorLight: '#FFE1F8', colorMedium: '#DD8CCA', colorDark: '#3F1C35',
    milestones: createMilestones('betrayed', 'Dito Na Lang Ako', [{ text: 'Document a betrayal', target: 1 }]),
    musicTrackMoodValue: 'betrayed'
  },
  {
    value: 'gigil',
    label: 'Gigil',
    emoji: 'src/lib/characters/GigilUnlocked.png',
    colorLight: '#FFE9D7', colorMedium: '#FFCDC0', colorDark: '#C65027',
    milestones: createMilestones('gigil', 'Oras Na', [{ text: 'Feel that "Gigil" surge', target: 1 }]),
    musicTrackMoodValue: 'gigil'
  },
  {
    value: 'kilig',
    label: 'Kilig',
    emoji: 'src/lib/characters/KiligUnlocked.png',
    colorLight: '#FCFFE8', colorMedium: '#F7FFC4', colorDark: '#989E38',
    milestones: createMilestones('kilig', 'Paruparo Sa Puso Ko', [{ text: 'Butterflies!', target: 1 }]),
    musicTrackMoodValue: 'kilig'
  },
  {
    value: 'inis',
    label: 'Inis',
    emoji: 'src/lib/characters/InisUnlocked.png',
    colorLight: '#FFEAE8', colorMedium: '#FC9E90', colorDark: '#7B2517',
    milestones: createMilestones('inis', 'Huwag Mo Ako', [{ text: 'Vent your "Inis"', target: 1 }]),
    musicTrackMoodValue: 'inis'
  },
  {
    value: 'tampo',
    label: 'Tampo',
    emoji: 'src/lib/characters/TampoUnlocked.png',
    colorLight: '#F0F9FF', colorMedium: '#C0DEF2', colorDark: '#5B7C93',
    milestones: createMilestones('tampo', 'Di Naman Mali Yon', [{ text: 'A moment of "Tampo"', target: 1 }]),
    musicTrackMoodValue: 'tampo'
  },
  {
    value: 'loka',
    label: 'Loka-loka',
    emoji: 'src/lib/characters/LokaUnlocked.png',
    colorLight: '#FFF3F7', colorMedium: '#FFB6CD', colorDark: '#A66D7D',
    milestones: createMilestones('loka', 'Tikusera', [{ text: 'Embrace the "Loka"', target: 1 }]),
    musicTrackMoodValue: 'loka'
  },
  {
    value: 'praning',
    label: 'Praning',
    emoji: 'src/lib/characters/PraningUnlocked.png',
    colorLight: '#EBFFE9', colorMedium: '#7DBC77', colorDark: '#2D4029',
    milestones: createMilestones('praning', 'Andami!', [{ text: 'A "Praning" thought', target: 1 }]),
    musicTrackMoodValue: 'praning'
  },
  {
    value: 'bored',
    label: 'Bored',
    emoji: 'src/lib/characters/BoredUnlocked.png',
    colorLight: '#FFFCEE', colorMedium: '#C9C0AB', colorDark: '#59574B',
    milestones: createMilestones('bored', 'Sa Sarili Kong Mundo', [{ text: 'Acknowledge boredom', target: 1 }]),
    musicTrackMoodValue: 'bored'
  },
  {
    value: 'taray',
    label: 'Taray Mode',
    emoji: 'src/lib/characters/TarayUnlocked.png',
    colorLight: '#FFEBE9', colorMedium: '#FFAAA4', colorDark: '#C13727',
    milestones: createMilestones('taray', 'Mata Kahel', [{ text: 'Unleash "Taray Mode"', target: 1 }]),
    musicTrackMoodValue: 'taray'
  },
  {
    value: 'ganda',
    label: 'Ganda Today',
    emoji: 'src/lib/characters/GandaUnlocked.png',
    colorLight: '#FFEAF6', colorMedium: '#F7B0D5', colorDark: '#872456',
    milestones: createMilestones('ganda', 'Puso Sa Salamin', [{ text: 'Feeling "Ganda"', target: 1 }]),
    musicTrackMoodValue: 'ganda'
  },
  {
    value: 'sabog',
    label: 'Sabog',
    emoji: 'src/lib/characters/SabogUnlocked.png',
    colorLight: '#FFF3EB', colorMedium: '#FFDCC5', colorDark: '#ED7523',
    milestones: createMilestones('sabog', 'Kabalintunaan Gyud', [{ text: 'A "Sabog" moment', target: 1 }]),
    musicTrackMoodValue: 'sabog'
  }
]);