import { readable } from 'svelte/store';

// 16 moods, 16 characters
export const moodStore = readable([
  {
    value: 'happy',
    label: 'Happy',
    emoji: '😊',
    colorLight: '#FFE4EC',
    colorMedium: '#FBA6C9',
    colorDark: '#9D2851'
  },
  {
    value: 'sad',
    label: 'Sad',
    emoji: '😢',
    colorLight: '#E0EAFB',
    colorMedium: '#A5C6F1',
    colorDark: '#2C4B84'
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
    emoji: '😍',
    colorLight: '#FFE1EC',
    colorMedium: '#F7A8C3',
    colorDark: '#851C46'
  },
  {
    value: 'betrayed',
    label: 'Betrayed',
    emoji: '🔪',
    colorLight: '#ECE4FF',
    colorMedium: '#BFA8F7',
    colorDark: '#3E1C82'
  },
  {
    value: 'gigil',
    label: 'Gigil',
    emoji: '😤',
    colorLight: '#FFE7D3',
    colorMedium: '#FFB97C',
    colorDark: '#7A4312'
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
    emoji: '😔',
    colorLight: '#E9EDF7',
    colorMedium: '#A9B7D8',
    colorDark: '#364663'
  },
  {
    value: 'loka',
    label: 'Loka-loka',
    emoji: '🤪',
    colorLight: '#FDE9F3',
    colorMedium: '#F6A9D4',
    colorDark: '#812C5F'
  },
  {
    value: 'praning',
    label: 'Praning',
    emoji: '😬',
    colorLight: '#FFF7D8',
    colorMedium: '#FCE399',
    colorDark: '#6F5814'
  },
  {
    value: 'bored',
    label: 'Bored',
    emoji: '🥱',
    colorLight: '#F1F1F1',
    colorMedium: '#C7C7C7',
    colorDark: '#3C3C3C'
  },
  {
    value: 'taray',
    label: 'Taray Mode',
    emoji: '😏',
    colorLight: '#F8EBFF',
    colorMedium: '#D8B6F7',
    colorDark: '#663789'
  },
  {
    value: 'ganda',
    label: 'Ganda Today',
    emoji: '💅',
    colorLight: '#FFEAF6',
    colorMedium: '#F7B0D5',
    colorDark: '#872456'
  },
  {
    value: 'sabog',
    label: 'Sabog',
    emoji: 'src/lib/characters/SabogUnlocked.png',
    colorLight: '#FFF2E8',
    colorMedium: '#FFECDB',
    colorDark: '#E57425'
  }
]);