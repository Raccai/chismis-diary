import { get } from 'svelte/store';
import { moodStore } from '$lib/stores/moodStore.js'; 

// For MoodScoreTrendChart.svelte
const moodScores = {
    happy: 2,
    excited: 2,
    okay: 1,
    anxious: -1,
    sad: -1,
    angry: -2,
    // Add scores for any other moods you have
    default: 0 // Score for moods not explicitly listed or for averaging days with mixed unknown moods
};

function getMoodScore(moodValue) {
    return moodScores.hasOwnProperty(moodValue) ? moodScores[moodValue] : moodScores.default;
}

export function calculateMoodScoreTrend(entries, timeRange = '1M') {
    if (!entries || entries.length === 0) {
        return null;
    }

    const now = new Date();
    let startDate = new Date();
    let groupByFormat = 'day'; // 'day', 'week', 'month'

    // Determine start date and grouping based on timeRange
    switch (timeRange) {
        case '1W':
            startDate.setDate(now.getDate() - 7);
            groupByFormat = 'day';
            break;
        case '1M':
            startDate.setMonth(now.getMonth() - 1);
            groupByFormat = 'day';
            break;
        case '6M':
            startDate.setMonth(now.getMonth() - 6);
            groupByFormat = 'week'; // Group by week for longer ranges
            break;
        case '1Y':
            startDate.setFullYear(now.getFullYear() - 1);
            groupByFormat = 'week';
            break;
        case 'ALL':
        default:
            // Find earliest entry date
            if (entries.length > 0) {
                 const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
                 startDate = new Date(sortedEntries[0].date);
                 // Determine grouping based on total duration
                 const durationDays = (now - startDate) / (1000 * 60 * 60 * 24);
                 if (durationDays > 365 * 1.5) groupByFormat = 'month';
                 else if (durationDays > 90) groupByFormat = 'week';
                 else groupByFormat = 'day';
            } else {
                 startDate.setDate(now.getDate() - 30); // Default to last 30 days if no entries somehow
                 groupByFormat = 'day';
            }
            timeRange = 'ALL'; // Ensure 'ALL' is used if defaulted
            break;
    }

    startDate.setHours(0, 0, 0, 0);

    // Filter relevant entries
    const filteredEntries = entries.filter(entry => {
        try { return new Date(entry.date) >= startDate; } catch(e) { return false; }
    });

    if (filteredEntries.length === 0) return null;

    // Group entries and calculate average score for each group
    const scoresByGroup = {}; // { 'groupKey': { totalScore: X, count: Y }, ... }

    filteredEntries.forEach(entry => {
        try {
            const entryDate = new Date(entry.date);
            let groupKey = '';

            if (groupByFormat === 'day') {
                groupKey = entryDate.toISOString().slice(0, 10); // YYYY-MM-DD
            } else if (groupByFormat === 'week') {
                const weekStart = getStartOfWeek(entryDate, 1); // Get Monday
                groupKey = weekStart.toISOString().slice(0, 10); // Key by week start date
            } else { // month
                groupKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            }

            if (!scoresByGroup[groupKey]) {
                scoresByGroup[groupKey] = { totalScore: 0, count: 0 };
            }
            scoresByGroup[groupKey].totalScore += getMoodScore(entry.mood);
            scoresByGroup[groupKey].count++;

        } catch (e) { /* Skip invalid date entries */ }
    });

    // Prepare chart data
    const sortedGroupKeys = Object.keys(scoresByGroup).sort();

    const labels = [];
    const data = [];
    let totalOverallScore = 0;
    let totalOverallCount = 0;

    sortedGroupKeys.forEach(key => {
        const group = scoresByGroup[key];
        const averageScore = group.count > 0 ? (group.totalScore / group.count) : null; // Use null for days with 0 entries but key exists (shouldn't happen often with this logic)

        if (averageScore !== null) {
            let label = key;
             // Format label nicely for display
             if (groupByFormat === 'day') label = new Date(key + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
             else if (groupByFormat === 'week') label = `Wk of ${new Date(key + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
             else if (groupByFormat === 'month') label = new Date(key + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

            labels.push(label);
            // Round average score for cleaner display?
            data.push(parseFloat(averageScore.toFixed(2)));
            totalOverallScore += group.totalScore; // Sum up for overall average
            totalOverallCount += group.count;
        }
    });

    const overallAverageScore = totalOverallCount > 0 ? parseFloat((totalOverallScore / totalOverallCount).toFixed(2)) : null;

    return {
        labels: labels,
        data: data,
        averageScore: overallAverageScore // Overall average for the selected period
    };
}

// --------------------------------------

// For MoodCalendarHeatmap.svelte
export function calculateDailyDominantMood(entries, moodDefinitions, numDays = 91) { // Default to ~13 weeks
    if (!entries || !moodDefinitions || moodDefinitions.length === 0) {
        return [];
    }

    const dailySummaries = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start from beginning of today

    const moodValueMap = new Map(moodDefinitions.map(m => [m.value, m])); // For quick lookup

    // Pre-filter entries roughly to the relevant date range for efficiency
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numDays + 1); // Go back numDays - 1 days
    startDate.setHours(0, 0, 0, 0);

    const relevantEntries = entries.filter(entry => {
        try {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0,0,0,0); // Compare date part only
            return entryDate >= startDate && entryDate <= today;
        } catch(e) { return false; }
    });

    // Group entries by date string 'YYYY-MM-DD'
    const entriesByDate = {};
    relevantEntries.forEach(entry => {
        try {
            const dateStr = new Date(entry.date).toISOString().slice(0, 10);
            if (!entriesByDate[dateStr]) {
                entriesByDate[dateStr] = [];
            }
            entriesByDate[dateStr].push(entry);
        } catch(e) { /* Ignore invalid dates */ }
    });


    // Iterate through the date range
    for (let i = 0; i < numDays; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i); // Go back i days from today
        const dateStr = targetDate.toISOString().slice(0, 10);

        const entriesToday = entriesByDate[dateStr] || [];
        let dominantMoodValue = null;
        let entryCount = entriesToday.length;

        if (entryCount > 0) {
            const counts = new Map();
            let maxCount = 0;

            // Count moods for this day
            entriesToday.forEach(entry => {
                if (moodValueMap.has(entry.mood)) { // Only count known moods
                    const currentCount = (counts.get(entry.mood) || 0) + 1;
                    counts.set(entry.mood, currentCount);
                    if (currentCount > maxCount) {
                        maxCount = currentCount;
                        dominantMoodValue = entry.mood; // Update dominant mood
                    }
                    // Simple tie-breaking: first mood to reach maxCount wins
                }
            });
            // If maxCount remained 0 (only unknown moods), dominantMoodValue will stay null
        }

        dailySummaries.push({
            date: dateStr,
            dominantMoodValue: dominantMoodValue, // This will be null if no entries or only unknown moods
            entryCount: entryCount
        });
    }

    // Return sorted oldest to newest for easier rendering in calendar format
    return dailySummaries.reverse();
}

// --------------------------------------

// For WeeklyMoodSummary.svelte
function getStartOfWeek(date, startDay = 1 /* 1 for Monday, 0 for Sunday */) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 && startDay === 1 ? -6 : startDay); // Adjust difference depending on start day
  return new Date(d.setDate(diff));
}

function getEndOfWeek(date, startDay = 1) {
    const start = getStartOfWeek(date, startDay);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
}

function formatDateRange(startDate, endDate) {
    const startMonth = startDate.toLocaleString(undefined, { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleString(undefined, { month: 'short' });
    const endDay = endDate.getDate();
    const year = startDate.getFullYear(); // Assume start and end are usually in the same year for a week

    if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
}

export function calculateWeeklyMoodSummaries(entries, moodDefinitions, numberOfWeeks = 7) {
    if (!entries || entries.length === 0 || !moodDefinitions || moodDefinitions.length === 0) {
        return [];
    }

    const weeklySummaries = [];
    const today = new Date();

    for (let i = 0; i < numberOfWeeks; i++) {
        // Calculate start/end dates for the target week (i weeks ago)
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (i * 7)); // Go back i weeks

        const weekStart = getStartOfWeek(targetDate, 1); // Monday start
        const weekEnd = getEndOfWeek(targetDate, 1);    // Sunday end

        // Set time to start/end of day for accurate filtering
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);

        // Filter entries for this specific week
        const entriesThisWeek = entries.filter(entry => {
            try {
                const entryDate = new Date(entry.date);
                return entryDate >= weekStart && entryDate <= weekEnd;
            } catch (e) { return false; } // Skip if date is invalid
        });

        if (entriesThisWeek.length > 0) {
            const moodCounts = new Map();
            moodDefinitions.forEach(m => moodCounts.set(m.value, 0)); // Initialize all moods

            entriesThisWeek.forEach(entry => {
                if (moodCounts.has(entry.mood)) {
                    moodCounts.set(entry.mood, moodCounts.get(entry.mood) + 1);
                }
            });

            let dominantMoodValue = null;
            let maxCount = 0;

            // Find the dominant mood (handle ties by picking first encountered)
            moodDefinitions.forEach(mood => {
                const count = moodCounts.get(mood.value);
                if (count > maxCount) {
                    maxCount = count;
                    dominantMoodValue = mood.value;
                }
            });

            if (dominantMoodValue) {
                 const dominantMoodDetails = moodDefinitions.find(m => m.value === dominantMoodValue);
                 weeklySummaries.push({
                    weekStartDate: weekStart,
                    weekEndDate: weekEnd,
                    dateRangeString: formatDateRange(weekStart, weekEnd),
                    dominantMood: dominantMoodDetails || { value: dominantMoodValue, label: dominantMoodValue, emoji: '❓'}, // Fallback
                    dominantMoodCount: maxCount,
                    totalEntriesInWeek: entriesThisWeek.length
                 });
            } else {
              // Maybe for week with no dominant mood
            }

        } else {
          // Maybe for weeks with zero entries
        }
    }

    return weeklySummaries;
}

// --------------------------------------

// For DataChart.svelte
export function calculateMoodCounts(entries, moodDefinitions) {
  if (!entries || entries.length === 0 || !moodDefinitions) {
    return [];
  }

  const counts = new Map();
  moodDefinitions.forEach(mood => {
    counts.set(mood.value, 0);
  });

  entries.forEach(entry => {
    if (counts.has(entry.mood)) {
      counts.set(entry.mood, counts.get(entry.mood) + 1);
    }
  });

  const results = moodDefinitions.map(mood => ({
    ...mood, 
    count: counts.get(mood.value) || 0 
  }));

  results.sort((a, b) => b.count - a.count);

  return results;
}

export function getMoodHistoryData(entries) {
  if (!entries || entries.length === 0) {
    return null; 
  }

  const moodDefinitions = get(moodStore); 
  const dailyMoodCounts = {}; 

  const moodColors = {
      happy: '#4ade80', 
      sad: '#60a5fa',   
      excited: '#facc15', 
      angry: '#f87171', 
      anxious: '#c084fc',
      okay: '#fb923c', 
      default: '#9ca3af' 
  };
  const getMoodColor = (moodValue) => moodColors[moodValue] || moodColors.default;

  entries.forEach(entry => {
    try {
      const entryDate = new Date(entry.date).toISOString().slice(0, 10);

      if (!dailyMoodCounts[entryDate]) {
        dailyMoodCounts[entryDate] = {};
          moodDefinitions.forEach(mood => {
            dailyMoodCounts[entryDate][mood.value] = 0;
          });
      }

      // Increment count for the specific mood on that day
      if (dailyMoodCounts[entryDate][entry.mood] !== undefined) {
        dailyMoodCounts[entryDate][entry.mood]++;
      } else {
      }
    } catch (e) {
      console.error(`Error processing date for entry: ${entry.id}, date: ${entry.date}`, e);
      // Skip this entry if date is invalid
    }
  });

  // Get sorted list of unique dates (labels for the chart)
  const labels = Object.keys(dailyMoodCounts).sort();

  if (labels.length === 0) {
    return null; // No valid dates processed
  }

  // Prepare datasets for Chart.js
  const datasets = moodDefinitions.map(mood => {
    // For each mood, create a data array matching the sorted date labels
    const data = labels.map(dateLabel => {
      return dailyMoodCounts[dateLabel]?.[mood.value] || 0; // Get count for this mood on this date, default 0
    });

    return {
      label: mood.label, // Use mood label for dataset legend
      data: data,
      backgroundColor: getMoodColor(mood.value),
      // Optional: add other Chart.js dataset properties like borderColor, borderWidth, etc.
      // stack: 'moods', // If you want a stacked bar chart
    };
  });

  return {
    labels: labels,
    datasets: datasets
  };
}