import { readable } from 'svelte/store';

// 16 moods, 16 characters
export const moodStore = readable([
  {
    value: 'happy',
    label: 'Happy',
    emoji: 'src/lib/characters/HappyUnlocked.png',
    colorLight: '#FFF6EB',
    colorMedium: '#FFEDD7',
    colorDark: '#EC9923'
  },
  {
    value: 'sad',
    label: 'Sad',
    emoji: 'src/lib/characters/SadUnlocked.png',
    colorLight: '#E6FAFF',
    colorMedium: '#A3D0D8',
    colorDark: '#242829'
  },
  {
    value: 'chismis',
    label: 'Chismis',
    emoji: 'src/lib/characters/ChismisUnlocked.png',
    colorLight: '#FFE6E6',
    colorMedium: '#FFCCCE',
    colorDark: '#C82C37'
  },
  {
    value: 'love',
    label: 'In Love',
    emoji: 'src/lib/characters/LoveUnlocked.png',
    colorLight: '#FFEBEF',
    colorMedium: '#FFD2DC',
    colorDark: '#D96E82'
  },
  {
    value: 'betrayed',
    label: 'Betrayed',
    emoji: 'src/lib/characters/BetrayedUnlocked.png',
    colorLight: '#FFE1F8',
    colorMedium: '#DD8CCA',
    colorDark: '#3F1C35'
  },
  {
    value: 'gigil',
    label: 'Gigil',
    emoji: 'src/lib/characters/GigilUnlocked.png',
    colorLight: '#FFE9D7',
    colorMedium: '#FFCDC0',
    colorDark: '#C65027'
  },
  {
    value: 'kilig',
    label: 'Kilig',
    emoji: 'src/lib/characters/KiligUnlocked.png',
    colorLight: '#FCFFE8',
    colorMedium: '#F7FFC4',
    colorDark: '#989E38'
  },
  {
    value: 'inis',
    label: 'Inis',
    emoji: 'src/lib/characters/InisUnlocked.png',
    colorLight: '#FFEAE8',
    colorMedium: '#FC9E90',
    colorDark: '#7B2517'
  },
  {
    value: 'tampo',
    label: 'Tampo',
    emoji: 'src/lib/characters/TampoUnlocked.png',
    colorLight: '#F0F9FF',
    colorMedium: '#C0DEF2',
    colorDark: '#5B7C93'
  },
  {
    value: 'loka',
    label: 'Loka-loka',
    emoji: 'src/lib/characters/LokaUnlocked.png',
    colorLight: '#FFF3F7',
    colorMedium: '#FFB6CD',
    colorDark: '#A66D7D'
  },
  {
    value: 'praning',
    label: 'Praning',
    emoji: 'src/lib/characters/PraningUnlocked.png',
    colorLight: '#EBFFE9',
    colorMedium: '#7DBC77',
    colorDark: '#2D4029'
  },
  {
    value: 'bored',
    label: 'Bored',
    emoji: 'src/lib/characters/BoredUnlocked.png',
    colorLight: '#FFFCEE',
    colorMedium: '#C9C0AB',
    colorDark: '#59574B'
  },
  {
    value: 'taray',
    label: 'Taray Mode',
    emoji: 'src/lib/characters/TarayUnlocked.png',
    colorLight: '#FFEBE9',
    colorMedium: '#FFAAA4',
    colorDark: '#C13727'
  },
  {
    value: 'ganda',
    label: 'Ganda Today',
    emoji: 'src/lib/characters/GandaUnlocked.png',
    colorLight: '#FFEAF6',
    colorMedium: '#F7B0D5',
    colorDark: '#872456'
  },
  {
    value: 'sabog',
    label: 'Sabog',
    emoji: 'src/lib/characters/SabogUnlocked.png',
    colorLight: '#FFF3EB',
    colorMedium: '#FFDCC5',
    colorDark: '#ED7523'
  }
]);