<script>
  import { onMount, onDestroy, tick } from 'svelte';
  // Import specific Chart.js components to enable tree-shaking
  import {
      Chart,
      LineController,
      LineElement,
      PointElement,
      CategoryScale, // Use CategoryScale for simpler labels like 'Oct 26', 'Wk of Oct 23'
      // TimeScale, // Use TimeScale if using a date adapter and want precise time axes
      LinearScale,
      Tooltip,
      Filler // Needed for gradient fill below line
  } from 'chart.js';
  // Optional: Import date adapter if needed
  // import { AdapterDateFns } from 'chartjs-adapter-date-fns';
  // import 'chartjs-adapter-date-fns'; // Register it

  // Register the components
  Chart.register(
      LineController, LineElement, PointElement, CategoryScale, /* TimeScale, */
      LinearScale, Tooltip, Filler
  );
  // Optional: Register date adapter
  // Chart.register(AdapterDateFns);


  // Props: Expects { labels: [...], data: [...] } from calculateMoodScoreTrend
  export let chartData = null;

  let canvasElement;
  let chartInstance = null;
  let chartStatusMessage = 'Loading chart...'; // Message for user

  // Chart Configuration
  const chartConfig = {
    type: 'line',
    data: {
      labels: [], // Populated by chartData
      datasets: [{
        label: 'Mood Score Trend',
        data: [], // Populated by chartData
        borderColor: 'rgba(96, 165, 250, 1)', // Blue-400
        borderWidth: 3,
        pointBackgroundColor: 'rgba(96, 165, 250, 1)',
        pointBorderColor: '#1a202c', // Match dark background
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3, // Smoothes the line
        fill: true, // Enable filling below the line
        backgroundColor: (context) => { // Gradient fill
            const ctx = context.chart.ctx;
            if (!ctx) return 'rgba(96, 165, 250, 0.1)'; // Fallback needed during init
            const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
            gradient.addColorStop(0, 'rgba(96, 165, 250, 0.5)'); // Start color (more opaque)
            gradient.addColorStop(1, 'rgba(96, 165, 250, 0.05)'); // End color (more transparent)
            return gradient;
          },
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container height
      plugins: {
        legend: { display: false }, // Hide default legend
        tooltip: {
          enabled: true,
          backgroundColor: '#2d3748', // Dark tooltip
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          padding: 10,
          cornerRadius: 6,
          // Custom tooltip title/label if needed
        },
        filler: {
           propagate: false, // Important for gradient fill
        }
      },
      scales: {
        y: {
          beginAtZero: false, // Allow negative scores if moods are scored that way
          grid: {
            color: '#2d3748', // Dark grid lines (gray-800)
            borderColor: '#4a5568', // Axis line color (gray-600)
          },
          ticks: {
            color: '#a0aec0' // Light tick labels (gray-400)
          }
        },
        x: {
          grid: {
             display: false, // Hide vertical grid lines for cleaner look
             borderColor: '#4a5568', // Axis line color
          },
          ticks: {
             color: '#a0aec0' // Light tick labels
          }
        }
      },
      interaction: { // How chart reacts to hover/click
          mode: 'index', // Show tooltip for all datasets at that index
          intersect: false, // Tooltip triggers even if not directly hovering point
      },
      // Custom elements like the data point labels require plugins or more complex drawing
    }
  };

  // Update chart when data changes
  $: if (chartInstance && chartData && chartData.labels && chartData.data) {
      chartInstance.data.labels = chartData.labels;
      chartInstance.data.datasets[0].data = chartData.data;
      chartInstance.update('none'); // 'none' prevents animation on update
      chartStatusMessage = ''; // Clear loading message
      // console.log("Chart updated with new data");
  } else if (chartInstance && !chartData) {
      // Handle case where data becomes null (e.g., no entries)
      chartInstance.data.labels = [];
      chartInstance.data.datasets[0].data = [];
      chartInstance.update('none');
      chartStatusMessage = 'No data available for this period.';
      // console.log("Chart cleared, no data");
  }

  onMount(() => {
    if (!canvasElement) return;
    chartInstance = new Chart(canvasElement, chartConfig);

    // Initial data load check
    if (!chartData || !chartData.labels || !chartData.data) {
        chartStatusMessage = 'No data available for this period.';
    }

    return () => {
       // Cleanup on component destroy
       if (chartInstance) {
         chartInstance.destroy();
         chartInstance = null;
         // console.log("Chart destroyed");
       }
    };
  });

</script>

<div class="chart-container">
  {#if chartStatusMessage}
     <div class="status-message">{chartStatusMessage}</div>
  {/if}
  <canvas bind:this={canvasElement}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    height: 300px; /* Or adjust as needed */
    width: 100%;
  }
  canvas {
    display: block; /* Prevent extra space below canvas */
    height: 100% !important; /* Override potential inline style from Chart.js */
    width: 100% !important;
  }
  .status-message {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     color: #a0aec0; /* Light gray text */
     font-style: italic;
     z-index: 5; /* Above canvas if needed */
  }
</style>