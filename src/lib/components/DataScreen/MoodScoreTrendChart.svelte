<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import {
      Chart, LineController, LineElement, PointElement, CategoryScale,
      LinearScale, Tooltip, Filler
  } from 'chart.js';
  import { theme } from '$lib/stores/themeStore.js'; 
  import InfoIcon from '$lib/icons/InfoIcon.svelte';

  Chart.register(
      LineController, LineElement, PointElement, CategoryScale,
      LinearScale, Tooltip, Filler
  );

  // Props: Expects { labels: string[], data: number[] } | null
  export let chartData = null;

  let canvasElement;
  let chartInstance = null;
  let chartStatusMessage = 'Initializing chart...'; // Initial message

  // Helper to get resolved CSS variable value from document.body
  function getResolvedCssVar(variableName, fallbackColor = '#000000') {
    if (typeof window !== 'undefined' && document.body) {
      const value = getComputedStyle(document.body).getPropertyValue(variableName).trim();
      if (value && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))) {
        return value;
      }
    }
    return fallbackColor;
  }

  // Helper to convert hex to an object {r, g, b}
  function hexToRgbComponents(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
      console.warn("Invalid hex color for RGB conversion:", hex, "Using fallback black.");
      return { r: 0, g: 0, b: 0 };
    }
    hex = hex.replace(/^#/, '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex[0] + hex[1], 16);
        g = parseInt(hex[2] + hex[3], 16);
        b = parseInt(hex[4] + hex[5], 16);
    } else {
        console.warn("Invalid hex length for RGB conversion:", hex, "Using fallback black.");
        return { r: 0, g: 0, b: 0 };
    }
    return { r, g, b };
  }

  // Function to create the chart configuration dynamically
  function createChartConfig(currentChartData) {
    // console.log("createChartConfig called. Current chartData:", currentChartData); // For debugging

    // For the gradient, resolve colors at the time of config creation
    const resolvedGradientBaseHex = getResolvedCssVar('--dataviz-gradient-start', '#ff85c4'); // Your main pink
    const {r, g, b} = hexToRgbComponents(resolvedGradientBaseHex);

    const gradientStartRgba = `rgba(${r}, ${g}, ${b}, 0.4)`; // Adjusted alpha
    const gradientEndRgba = `rgba(${r}, ${g}, ${b}, 0.05)`;

    return {
      type: 'line',
      data: {
        labels: currentChartData?.labels || [],
        datasets: [{
          label: 'Mood Score Trend',
          data: currentChartData?.data || [],
          borderColor: '#ffffff',
          borderWidth: 2.5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              // Check if chartArea is defined and has height to prevent errors during init/destroy
              if (!ctx || !chartArea || chartArea.bottom <= chartArea.top) {
                   return gradientEndRgba; // Fallback or transparent
              }
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, gradientEndRgba);
              gradient.addColorStop(1, gradientStartRgba);
              return gradient;
            },
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#900C3F',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            bodyFont: { weight: '500' },
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: function(tooltipItem) {
                let label = tooltipItem.dataset.label || '';
                if (label) label += ': ';
                if (tooltipItem.parsed.y !== null) label += tooltipItem.parsed.y.toFixed(2) + ' pts';
                return label;
              }
            }
          },
          filler: { propagate: false }
        },
        scales: {
          y: {
            // beginAtZero: false, // Consider your score range
            grid: {
              color: '#5b0023',
              borderColor: '#FBF7EC',
              drawBorder: false,
            },
            ticks: {
              color: '#FBF7EC',
              padding: 8
            }
          },
          x: {
            grid: {
               display: false,
               borderColor: '#FBF7EC',
            },
            ticks: {
               color: '#FBF7EC',
               maxRotation: 0,
               minRotation: 0,
               autoSkipPadding: 20,
               padding: 8
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
      }
    };
  }

  // Central function to initialize or update the chart
  function buildOrUpdateChart(dataForChart) {
    // console.log("buildOrUpdateChart called with data:", dataForChart); // For debugging
    if (!canvasElement) {
      chartStatusMessage = "Canvas element not yet available for chart.";
      console.error("buildOrUpdateChart: canvasElement is not defined.");
      return;
    }

    const newConfig = createChartConfig(dataForChart);

    // Determine if there's valid data to display
    const hasValidData = dataForChart && dataForChart.labels && dataForChart.labels.length > 0 && dataForChart.data && dataForChart.data.length > 0;

    if (hasValidData) {
      newConfig.data.labels = dataForChart.labels;
      newConfig.data.datasets[0].data = dataForChart.data;
      chartStatusMessage = ''; // Clear status message as we have data
    } else {
      newConfig.data.labels = [];
      newConfig.data.datasets[0].data = [];
      chartStatusMessage = 'No data available for this period.';
    }

    if (!chartInstance) {
      // console.log("Creating new chart instance."); // For debugging
      chartInstance = new Chart(canvasElement, newConfig);
    } else {
      // console.log("Updating existing chart."); // For debugging
      // Update data first
      chartInstance.data.labels = newConfig.data.labels;
      chartInstance.data.datasets = newConfig.data.datasets; // Replace whole datasets array for theme changes

      // Then update options, which also forces re-evaluation of styles
      chartInstance.options = newConfig.options;

      chartInstance.update('none');
    }
  }

  // --- Reactive Effects ---
  let mounted = false;

  // 1. React to chartData prop changes
  $: if (mounted && canvasElement) {
    // console.log("Reactive: chartData prop changed:", chartData); // For debugging
    buildOrUpdateChart(chartData);
  }

  // 2. React to theme changes
  let unsubscribeTheme;

  onMount(async () => {
    await tick(); // Ensure canvasElement is available in the DOM
    mounted = true;

    if (!canvasElement) {
      chartStatusMessage = "Chart canvas element not found onMount.";
      console.error("onMount: canvasElement is null after tick.");
      return;
    }
    // console.log("Component Mounted. Initial chartData:", chartData); // For debugging
    buildOrUpdateChart(chartData); // Initial draw with whatever chartData is (might be null)

    unsubscribeTheme = theme.subscribe(currentThemeValue => {
      if (mounted && chartInstance) { // Only update if chart exists and component is fully mounted
        console.log("Theme changed to:", currentThemeValue, ". Triggering chart update for theme.");
        tick().then(() => { // Wait for CSS vars on body to potentially update
            buildOrUpdateChart(chartData); // Rebuild/update with current data and new theme config
        });
      } else if (mounted && !chartInstance && canvasElement) {
        // If theme changes before first data arrives but after mount and canvas is ready
        console.log("Theme changed before initial data, ensuring empty chart uses new theme config.");
        buildOrUpdateChart(null); // Build an empty chart with the new theme config
      }
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
        // console.log("Chart destroyed on unmount"); // For debugging
      }
      if (unsubscribeTheme) {
        unsubscribeTheme();
      }
      mounted = false;
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
  canvas { /* Style canvas tag directly */
    display: block;
    height: 100% !important;
    width: 100% !important;
  }
  .status-message {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     color: var(--dataviz-card-subtle-text, #a0aec0); /* Use CSS var */
     font-style: italic;
     font-size: 0.9rem;
     z-index: 5; /* Ensure it's visible if chart is transparent initially */
     text-align: center;
  }
</style>