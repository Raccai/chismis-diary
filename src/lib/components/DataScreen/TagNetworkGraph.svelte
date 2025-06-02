<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { moodStore } from '$lib/stores/moodStore.js';
  import { get } from 'svelte/store';
  import { uiStore } from '$lib/stores/uiStore.js';
  import InfoIcon from '$lib/icons/InfoIcon.svelte';

  export let graphData = null;

  let svgElement;
  let simulation;
  let gMain;

  // Filter states
  let minCooccurrence = 0;
  let maxPossibleCooccurrence = 10;
  let selectedMoodId = 'all';
  let showLabels = true;
  let searchTerm = '';

  const moodDefinitions = get(moodStore) || [];
  
  let currentNodes = [];
  let currentLinks = [];
  let originalNodes = [];
  let originalLinks = [];
  let nodeScale = d3.scaleSqrt().domain([0, 1]).range([16, 42]);

  // Stats for display
  let stats = {
    totalNodes: 0,
    visibleNodes: 0,
    totalConnections: 0,
    visibleConnections: 0
  };

  function isEmojiImage(emojiUrl) {
    return typeof emojiUrl === 'string' && (
      emojiUrl.includes('.png') || 
      emojiUrl.includes('.svg') || 
      emojiUrl.includes('.jpg') || 
      emojiUrl.includes('.jpeg') || 
      emojiUrl.includes('.gif')
    );
  }

  function getMoodById(moodId) {
    return moodDefinitions.find(m => m.value === moodId);
  }

  function getNodeMoodId(node) {
    // Find mood that matches the node's color
    const mood = moodDefinitions.find(m => 
      (m.colorDark || 'var(--dataviz-default-dark)') === node.color
    );
    return mood ? mood.value : null;
  }

  function applyFilters() {
    if (!graphData || !graphData.nodes || !graphData.links) {
      currentNodes = [];
      currentLinks = [];
      updateStats();
      clearGraph();
      return;
    }

    // Start with all data
    let filteredNodes = [...graphData.nodes];
    let filteredLinks = [...graphData.links];

    // Apply connection strength filter
    if (minCooccurrence > 0) {
      filteredLinks = filteredLinks.filter(link => link.value >= minCooccurrence);
      
      // Only show nodes that have connections after filtering
      const connectedNodeIds = new Set();
      filteredLinks.forEach(link => {
        connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
        connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
      });
      
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }

    // Apply mood filter
    if (selectedMoodId !== 'all') {
      const selectedMood = getMoodById(selectedMoodId);
      if (selectedMood) {
        const targetColor = selectedMood.colorDark || selectedMood.color || 'var(--dataviz-default-dark)';
        filteredNodes = filteredNodes.filter(node => {
          // Try exact match first
          if (node.color === targetColor) return true;
          // Also try finding mood by matching node color to any mood color
          const nodeMood = moodDefinitions.find(m => 
            node.color === (m.colorDark || m.color)
          );
          return nodeMood?.value === selectedMoodId;
        });
      }
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(node => 
        node.label.toLowerCase().includes(term)
      );
      
      // Filter links again after search
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      });
    }

    currentNodes = filteredNodes;
    currentLinks = filteredLinks;
    
    updateStats();
    drawGraph();
  }

  function updateStats() {
    stats = {
      totalNodes: originalNodes.length,
      visibleNodes: currentNodes.length,
      totalConnections: originalLinks.length,
      visibleConnections: currentLinks.length
    };
  }

  function clearGraph() {
    if (svgElement && gMain) {
      gMain.selectAll("*").remove();
    }
  }

  function drawGraph() {
    if (!svgElement) return;

    const RENDER_NODES = currentNodes || [];
    const RENDER_LINKS = currentLinks || [];

    const svg = d3.select(svgElement);

    // Initialize main group for zoom/pan
    if (!gMain) {
      gMain = svg.append("g").attr("class", "main-graph-group");
      const zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
          gMain.attr("transform", event.transform);
        });
      svg.call(zoomBehavior).on("dblclick.zoom", null);
    }

    // Clear existing content
    gMain.selectAll("*").remove();

    if (RENDER_NODES.length === 0) {
      // Show empty state
      const emptyGroup = gMain.append("g").attr("class", "empty-state");
      emptyGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .style("font-size", "16px")
        .style("fill", "var(--dataviz-card-subtle-text, #a0aec0)")
        .text("No tags match your filters");
      
      // Center the empty state
      const svgRect = svgElement.getBoundingClientRect();
      emptyGroup.attr("transform", `translate(${svgRect.width/2}, ${svgRect.height/2})`);
      return;
    }

    const linkGroup = gMain.append("g").attr("class", "links");
    const nodeGroupContainer = gMain.append("g").attr("class", "nodes");

    // Stop existing simulation
    if (simulation) simulation.stop();

    // Create new simulation
    simulation = d3.forceSimulation(RENDER_NODES)
      .force("link", d3.forceLink(RENDER_LINKS)
        .id(d => d.id)
        .distance(d => Math.max(60, 120 - Math.sqrt(d.value) * 10))
        .strength(d => Math.min(0.8, Math.sqrt(d.value) * 0.1 + 0.1))
      )
      .force("charge", d3.forceManyBody().strength(d => -300 - d.value * 5))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius(d => nodeScale(d.value) + 5))
      .alphaTarget(0.02)
      .alphaDecay(0.02);

    // Draw links
    const linksD3 = linkGroup
      .selectAll("line")
      .data(RENDER_LINKS, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
      .join("line")
      .attr("stroke", "var(--bw-text-tertiary, #555)")
      .attr("stroke-opacity", d => Math.min(0.8, 0.2 + d.value * 0.1))
      .attr("stroke-width", d => Math.max(1, Math.min(6, Math.sqrt(d.value) * 1.5)));

    // Node scaling
    nodeScale.domain([0, d3.max(RENDER_NODES, d => d.value) || 1]);

    // Draw nodes
    const gNodeGroup = nodeGroupContainer
      .selectAll("g.node-element")
      .data(RENDER_NODES, d => d.id)
      .join(
        enter => {
          const g = enter.append("g").attr("class", "node-element");
          
          g.each(function(d) {
            const selection = d3.select(this);
            const radius = nodeScale(d.value);
            
            if (d.emojiUrl && isEmojiImage(d.emojiUrl)) {
              selection.append("circle")
                .attr("class", "node-image-bg")
                .attr("r", radius)
                .attr("fill", d.color || 'var(--bw-text-secondary, #ccc)')
                .attr("stroke", "var(--dataviz-card-bg, #1a202c)")
                .attr("stroke-width", 2);
              
              selection.append("image")
                .attr("xlink:href", d.emojiUrl)
                .attr("x", -radius * 0.7)
                .attr("y", -radius * 0.7)
                .attr("height", radius * 1.4)
                .attr("width", radius * 1.4)
                .style("border-radius", "50%");
            } else {
              selection.append("circle")
                .attr("r", radius)
                .attr("fill", d.color || 'var(--bw-text-secondary, #ccc)')
                .attr("stroke", "var(--dataviz-card-bg, #1a202c)")
                .attr("stroke-width", 2);
            }
          });

          g.append("title")
            .text(d => `${d.label}\nUsed ${d.value} times\nClick and drag to move`);

          g.append("text")
            .attr("class", "node-label")
            .attr("dy", d => nodeScale(d.value) + 14)
            .attr("text-anchor", "middle")
            .text(d => d.label.length > 12 ? d.label.substring(0, 10) + '…' : d.label)
            .style("pointer-events", "none")
            .style("opacity", showLabels ? 1 : 0);
          
          return g;
        }
      )
      .call(drag(simulation))
      .style("cursor", "grab");

    // Update label visibility
    gNodeGroup.select("text.node-label")
      .style("opacity", showLabels ? 1 : 0);

    // Animation tick
    simulation.on("tick", () => {
      linksD3
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      gNodeGroup
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Auto-fit after simulation settles
    if (RENDER_NODES.length > 0) {
      setTimeout(() => {
        fitGraphToView();
      }, 1000);
    }
  }

  function fitGraphToView() {
    if (!svgElement || !gMain.node()) return;
    
    try {
      const bounds = gMain.node().getBBox();
      const parent = svgElement.parentElement;
      if (!parent || bounds.width === 0 || bounds.height === 0) return;

      const { width: availableWidth, height: availableHeight } = parent.getBoundingClientRect();
      const padding = 40;
      
      const scaleX = (availableWidth - padding) / bounds.width;
      const scaleY = (availableHeight - padding) / bounds.height;
      const scale = Math.min(scaleX, scaleY, 1.5); // Cap max scale

      const translateX = availableWidth / 2 - scale * (bounds.x + bounds.width / 2);
      const translateY = availableHeight / 2 - scale * (bounds.y + bounds.height / 2);

      d3.select(svgElement)
        .transition()
        .duration(750)
        .call(d3.zoom().transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    } catch (e) {
      console.warn('Could not fit graph to view:', e);
    }
  }

  function drag(sim) {
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(this).raise().style("cursor", "grabbing");
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0.02);
      d.fx = null;
      d.fy = null;
      d3.select(this).style("cursor", "grab");
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  function resetGraph() {
    // Reset all filters
    minCooccurrence = 0;
    selectedMoodId = 'all';
    searchTerm = '';
    showLabels = true;
    
    // Reset zoom and layout
    if (simulation && currentNodes) {
      currentNodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      simulation.alpha(1).restart();
    }
    
    if (svgElement) {
      d3.select(svgElement)
        .transition()
        .duration(750)
        .call(d3.zoom().transform, d3.zoomIdentity);
    }
  }

  function showGraphInfo() {
    uiStore.showModal({
      title: '🕸️ Chismis Connections Guide',
      message: `
        <div style="text-align: left; line-height: 1.6;">
          <p><strong>What is this?</strong><br>
          This network shows how your tags connect to each other. When you use multiple tags in the same entry, they become "connected".</p>
          
          <p><strong>Reading the Graph:</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>Circles/Images:</strong> Each represents a tag. Bigger = used more often</li>
            <li><strong>Lines:</strong> Show tags used together. Thicker = used together more often</li>
            <li><strong>Colors:</strong> Based on the mood most associated with each tag</li>
          </ul>
          
          <p><strong>Controls:</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>Search:</strong> Find specific tags</li>
            <li><strong>Min Connections:</strong> Hide weak connections</li>
            <li><strong>Focus Mood:</strong> Show only tags from one mood</li>
            <li><strong>Drag nodes:</strong> Rearrange the layout</li>
            <li><strong>Zoom/Pan:</strong> Use mouse wheel and drag background</li>
          </ul>
          
          <p><em>Tip: Start with "Min Connections" to see your strongest tag relationships!</em></p>
        </div>
      `,
      confirmText: 'Got it!',
      hideCancelButton: true
    });
  }

  function clearSearch() {
    searchTerm = '';
  }

  // Reactive statements
  $: if (graphData) {
    originalNodes = graphData.nodes || [];
    originalLinks = graphData.links || [];
    
    if (originalLinks.length > 0) {
      maxPossibleCooccurrence = Math.max(...originalLinks.map(l => l.value));
    }
    
    applyFilters();
  }

  $: if (minCooccurrence !== undefined || selectedMoodId !== undefined || searchTerm !== undefined) {
    applyFilters();
  }

  $: if (showLabels !== undefined && gMain) {
    gMain.selectAll("g.node-element text.node-label")
      .transition()
      .duration(300)
      .style("opacity", showLabels ? 1 : 0);
  }

  onMount(() => {
    if (graphData) {
      originalNodes = graphData.nodes || [];
      originalLinks = graphData.links || [];
      applyFilters();
    }
  });

  onDestroy(() => {
    if (simulation) simulation.stop();
  });
</script>

<div class="tag-network-card">
  <div class="card-header">
    <div class="title-section">
      <h3 class="card-title">🕸️ Chismis Connections</h3>
      <div class="stats">
        <span class="stat-item">
          {stats.visibleNodes}/{stats.totalNodes} tags
        </span>
        <span class="stat-item">
          {stats.visibleConnections} connections
        </span>
      </div>
    </div>
    
    <div class="header-controls">
      <button class="control-btn info-btn" on:click={showGraphInfo} title="How to use this graph">
        <InfoIcon />
      </button>
      <button class="control-btn" on:click={resetGraph} title="Reset all filters and layout">
        🔄
      </button>
    </div>
  </div>

  <div class="filters-section">
    <div class="filter-row">
      <div class="filter-group">
        <label for="search-input">🔍 Search Tags</label>
        <div class="search-container">
          <input
            type="text"
            id="search-input"
            placeholder="Type to find tags..."
            bind:value={searchTerm}
          />
          {#if searchTerm}
            <button class="clear-search" on:click={clearSearch}>×</button>
          {/if}
        </div>
      </div>
      
      <div class="filter-group">
        <label for="mood-select">🎭 Focus Mood</label>
        <select id="mood-select" bind:value={selectedMoodId}>
          <option value="all">All Moods</option>
          {#each moodDefinitions as mood (mood.value)}
            <option value={mood.value}>{mood.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="filter-row">
      <div class="filter-group range-group">
        <label for="connections-range">
          🔗 Min Connections: <strong>{minCooccurrence}</strong>
        </label>
        <input
          type="range"
          id="connections-range"
          min="0"
          max={maxPossibleCooccurrence}
          step="1"
          bind:value={minCooccurrence}
        />
      </div>
      
      <div class="filter-group toggle-group">
        <label class="toggle-label">
          <input type="checkbox" bind:checked={showLabels} />
          <span class="toggle-text">🏷️ Show Labels</span>
        </label>
      </div>
    </div>
  </div>

  <div class="graph-container">
    <svg bind:this={svgElement} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="node-clip-circle">
          <circle cx="0" cy="0" r="1"></circle>
        </clipPath>
      </defs>
    </svg>
  </div>

  <div class="mood-legend">
    <div class="legend-title">Mood Colors:</div>
    <div class="legend-items">
      {#each moodDefinitions as mood (mood.value)}
        <button 
          class="legend-item" 
          class:active={selectedMoodId === mood.value}
          style="border-left-color: {mood.colorDark || 'var(--dataviz-default-dark)'};"
          on:click={() => selectedMoodId = selectedMoodId === mood.value ? 'all' : mood.value}
          title="Click to focus on {mood.label} mood"
        >
          {#if isEmojiImage(mood.emoji)}
            <img src={mood.emoji} alt={mood.label} class="legend-emoji-img"/>
          {:else}
            <span class="legend-emoji">{mood.emoji}</span>
          {/if}
          <span class="legend-text">{mood.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .tag-network-card {
    background: var(--dataviz-card-bg, #1a202c);
    color: var(--dataviz-card-text, #e2e8f0);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    border: 1px solid var(--dataviz-card-border, #2d3748);
    display: flex;
    flex-direction: column;
    min-height: 600px;
    gap: 1rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .title-section {
    flex: 1;
  }

  .card-title {
    font-family: 'Graffiti Urban', sans-serif;
    font-size: 1.5rem;
    font-weight: normal;
    color: var(--dataviz-card-header-text, #cbd5e1);
    margin: 0 0 0.5rem 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--dataviz-card-subtle-text, #a0aec0);
  }

  .stat-item {
    background: rgba(0,0,0,0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 500;
  }

  .header-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    background: var(--dataviz-card-border, #2d3748);
    color: var(--dataviz-card-subtle-text, #a0aec0);
    border: 1px solid var(--dataviz-card-border, #4a5568);
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }

  .control-btn:hover {
    background: var(--dataviz-card-border, #4a5568);
    color: var(--dataviz-card-text, #e2e8f0);
  }

  .filters-section {
    background: rgba(0,0,0,0.2);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid var(--dataviz-card-border, #2d3748);
  }

  .filter-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 0.75rem;
  }

  .filter-row:last-child {
    margin-bottom: 0;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  .filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--dataviz-card-text, #e2e8f0);
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-container input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--dataviz-card-bg, #1a202c);
    border: 2px solid var(--dataviz-card-border, #4a5568);
    border-radius: 8px;
    color: var(--dataviz-card-text, #e2e8f0);
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  .search-container input:focus {
    outline: none;
    border-color: #4299e1;
  }

  .clear-search {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    color: var(--dataviz-card-subtle-text, #a0aec0);
    cursor: pointer;
    font-size: 1.2rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-search:hover {
    color: var(--dataviz-card-text, #e2e8f0);
  }

  select {
    padding: 0.5rem 0.75rem;
    background: var(--dataviz-card-bg, #1a202c);
    border: 2px solid var(--dataviz-card-border, #4a5568);
    border-radius: 8px;
    color: var(--dataviz-card-text, #e2e8f0);
    font-size: 0.9rem;
    cursor: pointer;
  }

  select:focus {
    outline: none;
    border-color: #4299e1;
  }

  .range-group {
    flex: 2;
  }

  .range-group input[type="range"] {
    width: 100%;
    height: 6px;
    background: var(--dataviz-card-border, #2d3748);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .toggle-group {
    flex: 0 0 auto;
    align-self: center;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem !important;
    font-weight: normal !important;
  }

  .toggle-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .graph-container {
    flex: 1;
    min-height: 100%;
    border: 2px solid var(--dataviz-card-border, #2d3748);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.05));
    position: relative;
    overflow: hidden;
  }

  .graph-container svg {
    width: 100%;
    height: 100%;
    cursor: grab;
    font-family: "Urbanist", sans-serif;
  }

  .graph-container svg:active {
    cursor: grabbing;
  }

  :global(.graph-container svg .node-label) {
    font-family: "Urbanist", sans-serif;
    font-size: 10px;
    fill: var(--dataviz-card-text, #e2e8f0);
    paint-order: stroke;
    stroke: var(--dataviz-card-bg, #1a202c);
    stroke-width: 3px;
    stroke-linejoin: round;
    pointer-events: none;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }

  .mood-legend {
    border-top: 1px solid var(--dataviz-card-border, #2d3748);
    padding-top: 1rem;
  }

  .legend-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--dataviz-card-text, #e2e8f0);
    margin-bottom: 0.75rem;
  }

  .legend-items {
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding: 0.25rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--dataviz-card-subtle-text, #a0aec0) transparent;
  }

  .legend-items::-webkit-scrollbar {
    height: 6px;
  }

  .legend-items::-webkit-scrollbar-track {
    background: transparent;
  }

  .legend-items::-webkit-scrollbar-thumb {
    background-color: var(--dataviz-card-subtle-text, #a0aec0);
    border-radius: 3px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: var(--dataviz-card-border, #2d3748);
    border: 1px solid transparent;
    border-left-width: 4px;
    border-left-style: solid;
    border-radius: 8px;
    font-size: 0.8rem;
    color: var(--dataviz-card-subtle-text, #a0aec0);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .legend-emoji-img {
      width: 16px;
      height: 16px;
      object-fit: contain;
  }
  .legend-emoji {
    font-size: 0.9em;
  }
  .legend-text {
    font-family: "Urbanist", sans-serif;
    font-weight: 500;
    font-size: 0.8rem;
  }
</style>