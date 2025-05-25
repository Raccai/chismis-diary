import { writable } from 'svelte/store';

const initialFilterSortState = {
  currentSortKey: 'date_desc', // Default sort
  // You could add currentMoodFilter here too if you want it globally managed
};

function createFilterSortStore() {
  const { subscribe, update, set } = writable(initialFilterSortState);

  return {
    subscribe,
    setSortKey: (newKey) => {
      update(state => ({ ...state, currentSortKey: newKey }));
      console.log('filterSortStore: SortKey set to', newKey);
    },
    // Add methods for mood filter if you move it here
  };
}

export const filterSortStore = createFilterSortStore();