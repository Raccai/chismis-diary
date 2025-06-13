import { readable } from 'svelte/store';

// Helper to generate milestones
const createMilestones = (moodValue, musicTrackTitle = "I-unlock ang theme song nila!", otherMilestones = []) => {
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
    characterDescription: 'Laging may good vibes sa paligid niya.',
    milestones: createMilestones('happy', 'Panaginip Lang Ba', [
      { text: 'Mag-log ng 1 Masayang entry', target: 1 },
      { text: 'Mag-log ng 5 Masayang entry', target: 5, rewardPreview: { text: 'Good vibes!' } },
    ]),
    musicTrackMoodValue: 'happy'
  },
  {
    value: 'sad',
    label: 'Sad',
    emoji: 'src/lib/characters/SadUnlocked.png', // YOUR ORIGINAL PATH
    colorLight: '#E6FAFF', colorMedium: '#A3D0D8', colorDark: '#242829',
    characterDescription: 'Tahimik lang, pero damang-dama mo.',
    milestones: createMilestones('sad', 'Mga Taon Ko', [
      { text: 'I-log ang kalungkutan kahit 1 beses', target: 1 }
    ]),
    musicTrackMoodValue: 'sad'
  },
  {
    value: 'chismis',
    label: 'Chismis',
    emoji: 'src/lib/characters/ChismisUnlocked.png', // YOUR ORIGINAL PATH
    colorLight: '#FFE6E6', colorMedium: '#FFCCCE', colorDark: '#C82C37',
    characterDescription: 'Siya ang source. Periodt.',
    milestones: createMilestones('chismis', 'Chismis Lang Yan', [
      { text: 'Mag-chika ng unang beses', target: 1, rewardPreview: { text: 'Mainit-init pa!' } }
    ]),
    musicTrackMoodValue: 'chismis'
  },
  {
    value: 'love',
    label: 'In Love',
    emoji: 'src/lib/characters/LoveUnlocked.png',
    colorLight: '#FFEBEF', colorMedium: '#FFD2DC', colorDark: '#D96E82',
    characterDescription: 'Lutang, may hearts sa mata.',
    milestones: createMilestones('love', 'Yong 20 Pa Tayo', [
      { text: 'Feel the love (1 entry)', target: 1 },
      { text: 'Sobrang in love ka na (5 entries)', target: 5 }
    ]),
    musicTrackMoodValue: 'love'
  },
  {
    value: 'betrayed',
    label: 'Betrayed',
    emoji: 'src/lib/characters/BetrayedUnlocked.png',
    colorLight: '#FFE1F8', colorMedium: '#DD8CCA', colorDark: '#3F1C35',
    characterDescription: 'Hindi makalimot. Nasaktan eh.',
    milestones: createMilestones('betrayed', 'Dito Na Lang Ako', [
      { text: 'Log ng isang pagtataksil', target: 1 }
    ]),
    musicTrackMoodValue: 'betrayed'
  },
  {
    value: 'gigil',
    label: 'Gigil',
    emoji: 'src/lib/characters/GigilUnlocked.png',
    characterDescription: 'Grabe na to! Napasigaw ka sa inis o tuwa!',
    colorLight: '#FFE9D7', colorMedium: '#FFCDC0', colorDark: '#C65027',
    milestones: createMilestones('gigil', 'Oras Na', [
      { text: 'Nagka-gigil ka (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'gigil'
  },
  {
    value: 'kilig',
    label: 'Kilig',
    emoji: 'src/lib/characters/KiligUnlocked.png',
    colorLight: '#FCFFE8', colorMedium: '#F7FFC4', colorDark: '#989E38',
    characterDescription: 'Pulang-pula na ang pisngi. Hindi makahinga.',
    milestones: createMilestones('kilig', 'Paruparo Sa Puso Ko', [
      { text: 'Na-kilig! (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'kilig'
  },
  {
    value: 'inis',
    label: 'Inis',
    emoji: 'src/lib/characters/InisUnlocked.png',
    colorLight: '#FFEAE8', colorMedium: '#FC9E90', colorDark: '#7B2517',
    characterDescription: 'Galit pero cute pa rin.',
    milestones: createMilestones('inis', 'Huwag Mo Ako', [
      { text: 'Inis log activated', target: 1 }
    ]),
    musicTrackMoodValue: 'inis'
  },
  {
    value: 'tampo',
    label: 'Tampo',
    emoji: 'src/lib/characters/TampoUnlocked.png',
    colorLight: '#F0F9FF', colorMedium: '#C0DEF2', colorDark: '#5B7C93',
    characterDescription: 'Hindi mo na siya kinausap. Galit ka? Hindi ah.',
    milestones: createMilestones('tampo', 'Di Naman Mali Yon', [
      { text: 'Tampo time!', target: 1 }
    ]),
    musicTrackMoodValue: 'tampo'
  },
  {
    value: 'loka',
    label: 'Loka-loka',
    emoji: 'src/lib/characters/LokaUnlocked.png',
    colorLight: '#FFF3F7', colorMedium: '#FFB6CD', colorDark: '#A66D7D',
    characterDescription: 'Walang preno. Bahala na!',
    milestones: createMilestones('loka', 'Tikusera', [
      { text: 'Sira ulo ka ba? (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'loka'
  },
  {
    value: 'praning',
    label: 'Praning',
    emoji: 'src/lib/characters/PraningUnlocked.png',
    colorLight: '#EBFFE9', colorMedium: '#7DBC77', colorDark: '#2D4029',
    characterDescription: 'Lahat na lang may ibig sabihin...',
    milestones: createMilestones('praning', 'Andami!', [
      { text: 'Nag-overthink nanaman', target: 1 }
    ]),
    musicTrackMoodValue: 'praning'
  },
  {
    value: 'bored',
    label: 'Bored',
    emoji: 'src/lib/characters/BoredUnlocked.png',
    colorLight: '#FFFCEE', colorMedium: '#C9C0AB', colorDark: '#59574B',
    characterDescription: 'Walang ganap. Tingin lang sa kisame.',
    milestones: createMilestones('bored', 'Sa Sarili Kong Mundo', [
      { text: 'Walang magawa (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'bored'
  },
  {
    value: 'taray',
    label: 'Taray Mode',
    emoji: 'src/lib/characters/TarayUnlocked.png',
    colorLight: '#FFEBE9', colorMedium: '#FFAAA4', colorDark: '#C13727',
    characterDescription: 'Taray mo teh. Lakad queen!',
    milestones: createMilestones('taray', 'Mata Kahel', [
      { text: 'Nag-taray ka na (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'taray'
  },
  {
    value: 'ganda',
    label: 'Ganda Today',
    emoji: 'src/lib/characters/GandaUnlocked.png',
    colorLight: '#FFEAF6', colorMedium: '#F7B0D5', colorDark: '#872456',
    characterDescription: 'Pak na pak ang itsura. Selfie time!',
    milestones: createMilestones('ganda', 'Puso Sa Salamin', [
      { text: 'Ganda day! (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'ganda'
  },
  {
    value: 'sabog',
    label: 'Sabog',
    emoji: 'src/lib/characters/SabogUnlocked.png',
    colorLight: '#FFF3EB', colorMedium: '#FFDCC5', colorDark: '#ED7523',
    characterDescription: 'Hindi alam kung saan magsisimula. Sabaw moments.',
    milestones: createMilestones('sabog', 'Kabalintunaan Gyud', [
      { text: 'Sabog day! (1 entry)', target: 1 }
    ]),
    musicTrackMoodValue: 'sabog'
  }
]);