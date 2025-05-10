import { readable } from 'svelte/store';

export const moodStore = readable([
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'shookt', label: 'Shookt', emoji: '😳' },
  { value: 'tea', label: 'Spill the Tea', emoji: '🍵' },
  { value: 'love', label: 'In Love', emoji: '😍' },
  { value: 'betrayed', label: 'Betrayed', emoji: '🔪' },
  { value: 'gigil', label: 'Gigil', emoji: '😤' },
]);