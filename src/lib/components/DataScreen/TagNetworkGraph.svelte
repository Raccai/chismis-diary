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

  // For slider background fill
  let rangeFill = '';

  function getMoodById(moodId) {
    return moodDefinitions.find(m => m.value === moodId);
  }

  function deriveMoodId(node) {
    if (node.moodId) return node.moodId;
    if (node.color) {
      const match = moodDefinitions.find(m => m.colorMedium.toLowerCase() === node.color.toLowerCase());
      if (match) return match.value;
    }
    return null;
  }

  // Recompute slider background whenever value or max changes
  $: {
    const pct = maxPossibleCooccurrence
      ? (minCooccurrence / maxPossibleCooccurrence) * 100
      : 0;
    rangeFill = `linear-gradient(to right, #60a5fa ${pct}%, #394766 ${pct}%)`;
  }

  function applyFilters() {
    if (!graphData || !graphData.nodes || !graphData.links) {
      currentNodes = [];
      currentLinks = [];
      updateStats();
      clearGraph();
      return;
    }

    let filteredNodes = [...originalNodes];
    let filteredLinks = [...originalLinks];

    // 1) Derive moodId and baseColor
    filteredNodes = filteredNodes.map(node => {
      const derivedMoodId = deriveMoodId(node);
      const mood = derivedMoodId ? getMoodById(derivedMoodId) : null;
      return {
        ...node,
        moodId: derivedMoodId,
        baseColor: mood ? mood.colorMedium : null
      };
    });

    // 2) Connection strength filter
    if (minCooccurrence > 0) {
      filteredLinks = filteredLinks.filter(link => link.value >= minCooccurrence);
      const connectedNodeIds = new Set();
      filteredLinks.forEach(link => {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        connectedNodeIds.add(src);
        connectedNodeIds.add(tgt);
      });
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }

    // 3) Mood filter (then re‐filter links)
    if (selectedMoodId !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.moodId === selectedMoodId);
      const nodeIdsAfterMood = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        return nodeIdsAfterMood.has(src) && nodeIdsAfterMood.has(tgt);
      });
    }

    // 4) Search filter (then re‐filter links)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredNodes = filteredNodes.filter(node => node.label.toLowerCase().includes(term));
      const idsAfterSearch = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => {
        const src = typeof link.source === 'object' ? link.source.id : link.source;
        const tgt = typeof link.target === 'object' ? link.target.id : link.target;
        return idsAfterSearch.has(src) && idsAfterSearch.has(tgt);
      });
    }

    // 5) Enrich nodes for rendering
    currentNodes = filteredNodes.map(node => ({
      ...node,
      color: node.baseColor || 'var(--bw-text-secondary, #ccc)'
    }));

    // 6) Keep re‐filtered links
    currentLinks = filteredLinks.map(link => ({ ...link }));

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
      gMain.selectAll('*').remove();
    }
  }

  function drawGraph() {
    if (!svgElement) return;

    const RENDER_NODES = currentNodes || [];
    const RENDER_LINKS = currentLinks || [];
    const svg = d3.select(svgElement);

    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;

    // Initialize zoom & main group once
    if (!gMain) {
      gMain = svg.append('g').attr('class', 'main-graph-group');

      const zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 5])
        .filter(event => event.type !== 'click')
        .on('zoom', (event) => {
          gMain.attr('transform', event.transform);
        });

      svg.call(zoomBehavior)
         .on('dblclick.zoom', null)
         .on('click.zoom', null);
    }

    gMain.selectAll('*').remove();

    if (RENDER_NODES.length === 0) {
      const emptyGroup = gMain.append('g').attr('class', 'empty-state');
      emptyGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .style('font-size', '16px')
        .style('fill', 'var(--dataviz-card-subtle-text, #a0aec0)')
        .text('No tags match your filters');
      emptyGroup.attr('transform', `translate(${width / 2}, ${height / 2})`);
      return;
    }

    const linkGroup = gMain.append('g').attr('class', 'links');
    const nodeGroupContainer = gMain.append('g').attr('class', 'nodes');

    if (simulation) simulation.stop();

    nodeScale.domain([0, d3.max(RENDER_NODES, d => d.value) || 1]);

    simulation = d3.forceSimulation(RENDER_NODES)
      .force('link', d3.forceLink(RENDER_LINKS)
        .id(d => d.id)
        .distance(d => Math.max(30, 80 - Math.sqrt(d.value) * 5))
        .strength(d => Math.min(0.8, Math.sqrt(d.value) * 0.1 + 0.1))
      )
      .force('charge', d3.forceManyBody().strength(d => -50 - d.value * 2))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => nodeScale(d.value) + 5))
      .alphaTarget(0.05)
      .alphaDecay(0.03);

    const linksD3 = linkGroup
      .selectAll('line')
      .data(RENDER_LINKS, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
      .join('line')
      .attr('stroke', '#bbb')
      .attr('stroke-opacity', d => Math.min(1, 0.4 + d.value * 0.15))
      .attr('stroke-width', d => Math.max(2, Math.min(7, Math.sqrt(d.value) * 1.5)));

    const gNodeGroup = nodeGroupContainer
      .selectAll('g.node-element')
      .data(RENDER_NODES, d => d.id)
      .join(
        enter => {
          const g = enter.append('g').attr('class', 'node-element');
          g.each(function(d) {
            const selection = d3.select(this);
            const radius = nodeScale(d.value);
            selection.append('circle')
              .attr('r', radius)
              .attr('fill', d.color)
              .attr('stroke', 'var(--dataviz-card-bg, #1a202c)')
              .attr('stroke-width', 2);
          });
          g.append('title')
            .text(d => `${d.label}\nUsed ${d.value} times\nClick and drag to move`);
          g.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => nodeScale(d.value) + 14)
            .attr('text-anchor', 'middle')
            .text(d => d.label.length > 12 ? d.label.substring(0, 10) + '…' : d.label)
            .style('pointer-events', 'none')
            .style('opacity', showLabels ? 1 : 0);
          return g;
        }
      )
      .call(drag(simulation))
      .style('cursor', 'grab');

    gNodeGroup.select('text.node-label')
      .style('opacity', showLabels ? 1 : 0);

    simulation.on('tick', () => {
      linksD3
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      gNodeGroup
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    if (RENDER_NODES.length > 0) {
      setTimeout(() => {
        fitGraphToView(width, height);
      }, 800);
    }
  }

  function fitGraphToView(width, height) {
    if (!svgElement || !gMain.node()) return;
    try {
      const bounds = gMain.node().getBBox();
      if (bounds.width === 0 || bounds.height === 0) return;
      const padding = 40;
      const scaleX = (width - padding) / bounds.width;
      const scaleY = (height - padding) / bounds.height;
      const scale = Math.min(scaleX, scaleY, 1.2);
      const translateX = width / 2 - scale * (bounds.x + bounds.width / 2);
      const translateY = height / 2 - scale * (bounds.y + bounds.height / 2);
      d3.select(svgElement)
        .transition()
        .duration(750)
        .call(d3.zoom().transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    } catch (e) {
      console.warn('Could not fit graph to view:', e);
    }
  }

  function drag(sim) {
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(this).raise().style('cursor', 'grabbing');
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0.05);
      d.fx = null;
      d.fy = null;
      d3.select(this).style('cursor', 'grab');
    }
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  function resetGraph() {
    minCooccurrence = 0;
    selectedMoodId = 'all';
    searchTerm = '';
    showLabels = true;
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
    uiStore.showModalOnly({
      title: 'Gabay sa Chismis Connections',
      message: `
        <div style="text-align: left; line-height: 1.6;">
          <p><strong>Ano ’to?</strong><br>
          Ipinapakita ng graph na ’to kung paano konektado ang mga tags mo. Kapag ginamit mo ang ilang tags sa isang entry, nagkakaroon sila ng "connection" — parang magkakachika!</p>

          <p><strong>Paano basahin:</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>Bilogs:</strong> Bawat isa ay tag. Mas malaki = mas madalas ginagamit</li>
            <li><strong>Lines:</strong> Ipinapakita kung aling tags ang ginamit nang magkasama. Mas makapal = mas madalas silang nakasabay</li>
            <li><strong>Colors:</strong> Galing sa mood (o modo) na ka-link ng tag</li>
          </ul>

          <p><strong>Mga Pwede Mong Gawin:</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li><strong>Search:</strong> Hanapin ang specific na tag</li>
            <li><strong>Min Connections:</strong> Itago ’yung mga mahihinang connection (o 'yung wala talagang line o connection)</li>
            <li><strong>Focus Mood:</strong> Ipakita lang ’yung tags sa isang mood</li>
            <li><strong>Drag:</strong> Pwede mong ilipat-lipat ang mga bilog</li>
            <li><strong>Zoom/Pan:</strong> Scroll at i-drag lang ang background</li>
          </ul>

          <p><em>Tip: I-adjust muna ang "Min Connections" para makita agad ’yung pinaka-close na tags mo!</em></p>
        </div>
      `,
      confirmText: 'Gets na!',
      hideCancelButton: true
    });
  }

  function clearSearch() {
    searchTerm = '';
  }

  // Reactive: capture graphData into originals, then filter
  $: if (graphData) {
    originalNodes = graphData.nodes.map(node => ({ ...node }));
    originalLinks = graphData.links.map(link => ({ ...link }));
    if (originalLinks.length > 0) {
      maxPossibleCooccurrence = Math.max(...originalLinks.map(l => l.value));
    }
    applyFilters();
  }

  // Reactive: run applyFilters when filters change
  $: if (minCooccurrence !== undefined || selectedMoodId !== undefined || searchTerm !== undefined) {
    applyFilters();
  }

  // Reactive: toggle label visibility
  $: if (showLabels !== undefined && gMain) {
    gMain.selectAll('g.node-element text.node-label')
      .transition()
      .duration(300)
      .style('opacity', showLabels ? 1 : 0);
  }

  onMount(() => {
    if (graphData) {
      originalNodes = graphData.nodes.map(node => ({ ...node }));
      originalLinks = graphData.links.map(link => ({ ...link }));
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
      <h3 class="card-title">Chismis Connections</h3>
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
        <label for="mood-select">Focus Mood</label>
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
        <label class="range-container" for="connections-range">
          🔗 Min Connections: <strong>{minCooccurrence}</strong>
          <input
            type="range"
            id="connections-range"
            min="0"
            max={maxPossibleCooccurrence}
            step="1"
            bind:value={minCooccurrence}
            style="background: {rangeFill}"
          />
        </label>
      </div>

      <div class="filter-group">
        <label class="toggle-container">
          <input type="checkbox" bind:checked={showLabels} />
          <span class="toggle-switch"></span>
          <span class="toggle-text">Show Labels</span>
        </label>
      </div>
    </div>
  </div>

  <div class="graph-container">
    <svg bind:this={svgElement} preserveAspectRatio="xMidYMid meet"></svg>
  </div>

  <div class="mood-legend">
    <div class="legend-title">Mood Colors:</div>
    <div class="legend-items">
      {#each moodDefinitions as mood (mood.value)}
        <button
          class="legend-item"
          class:active={selectedMoodId === mood.value}
          style="border-left-color: {mood.colorMedium};"
          on:click={() => selectedMoodId = (selectedMoodId === mood.value ? 'all' : mood.value)}
          title="Click to focus on {mood.label} mood"
        >
          <!-- {#if typeof mood.emoji === 'string' && (
            mood.emoji.endsWith('.png') ||
            mood.emoji.endsWith('.svg') ||
            mood.emoji.endsWith('.jpg') ||
            mood.emoji.endsWith('.jpeg') ||
            mood.emoji.endsWith('.gif')
          )}
            <img src={mood.emoji} alt={mood.label} class="legend-emoji-img" />
          {:else}
            <span class="legend-emoji">{mood.emoji}</span>
          {/if} -->
          <span class="legend-text">{mood.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .tag-network-card {
    background: #172031;
    color: var(--main-white);
    padding: 1.5rem;
    border-radius: 16px;
    border: 2px solid #3a4f74;
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
    color: var(--main-white);
    margin: 0 0 0.5rem 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--main-white);
    font-family: "Urbanist", sans-serif;
  }

  .stat-item {
    background: #020d20;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 500;
  }

  .header-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    background: #334e7e;
    color: var(--main-white);
    border: 1px solid #507ac3;
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

  .filters-section {
    background: #0c1421;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid #202f49;
  }

  .filter-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 0.75rem;
  }

  .filter-row:last-child {
    margin-bottom: 0;
    flex-direction: column;
    align-items: flex-start;
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
    color: var(--main-white);
    font-family: "Urbanist", sans-serif;
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-container input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: #0c1421;
    border: 2px solid #202f49;
    border-radius: 8px;
    color: #e2e8f0;
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
    color: #e2e8f0;
  }

  select {
    padding: 0.5rem 0.75rem;
    background: #0c1421;
    border: 2px solid #202f49;
    border-radius: 8px;
    color: var(--dataviz-card-text, #e2e8f0);
    font-size: 0.9rem;
    cursor: pointer;
    appearance: none;
    background-image: none;
  }

  select:focus {
    outline: none;
    border-color: #4299e1;
  }

  .range-group {
    flex: 2;
  }

  /* ── CUSTOM RANGE SLIDER ───────────────────────────────────────── */
  .range-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #e2e8f0;
    font-family: "Urbanist", sans-serif;
  }

  .range-container input[type="range"] {
    -webkit-appearance: none;
    width: 120px;
    height: 4px;
    background: #394766;
    border-radius: 2px;
    outline: none;
    margin-left: 0.5rem;
    transition: background 0.3s ease;
    cursor: pointer;
  }

  .range-container input[type="range"]:hover,
  .range-container input[type="range"]:focus {
    background: #516dc2;
  }

  .range-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    border: 2px solid #2458ad;
    transition: background 0.3s ease, transform 0.2s ease;
    /* margin-top: 0px; */
  }

  .range-container input[type="range"]::-webkit-slider-thumb:hover {
    background: #ffffff;
    transform: scale(1.1);
  }

  .range-container input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    border: 2px solid #334a6e;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .range-container input[type="range"]::-moz-range-thumb:hover {
    background: #ffffff;
    transform: scale(1.1);
  }

  .range-container input[type="range"]::-ms-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    border: 2px solid #334a6e;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .range-container input[type="range"]::-ms-thumb:hover {
    background: #ffffff;
    transform: scale(1.1);
  }

  /* ── CUSTOM TOGGLE SWITCH ───────────────────────────────────────── */
  .toggle-container {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    font-size: 0.9rem;
    color: #e2e8f0;
    font-family: "Urbanist", sans-serif;
  }

  .toggle-container input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-container .toggle-switch {
    position: relative;
    width: 40px;
    height: 20px;
    border-radius: 12px;
    background: #394766;
    transition: background 0.3s ease;
    flex-shrink: 0;
  }

  .toggle-container .toggle-switch::before {
    content: "";
    position: absolute;
    left: 2px;
    top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    transition: transform 0.3s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .toggle-container input:checked + .toggle-switch {
    background: #60a5fa;
  }

  .toggle-container input:checked + .toggle-switch::before {
    transform: translateX(20px);
  }

  .toggle-container .toggle-text {
    margin-left: 0.25rem;
  }

  .filters-section .toggle-group {
    display: flex;
    justify-content: flex-start;
  }

  /* ── GRAPH CONTAINER ─────────────────────────────────────────────── */
  .graph-container {
    flex: 1;
    background: #0c1421;
    border: 2px solid #202f49;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    display: flex;
  }

  .graph-container svg {
    width: 100%;
    height: 200px;
    display: block;
    cursor: grab;
    font-family: "Urbanist", sans-serif;
  }

  .graph-container svg:active {
    cursor: grabbing;
  }

  :global(.graph-container svg .node-label) {
    font-family: "Urbanist", sans-serif;
    font-size: 10px;
    fill: var(--main-white);
    paint-order: stroke;
    stroke-width: 3px;
    stroke-linejoin: round;
    pointer-events: none;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }

  .mood-legend {
    border-top: 2px solid #202f49;
    padding-top: 1rem;
    font-family: "Urbanist", sans-serif;
  }

  .legend-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--main-white);
    margin-bottom: 0.75rem;
  }

  .legend-items {
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding: 0.25rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--main-white) transparent;
  }

  .legend-items::-webkit-scrollbar {
    height: 6px;
  }

  .legend-items::-webkit-scrollbar-track {
    background: transparent;
  }

  .legend-items::-webkit-scrollbar-thumb {
    background-color: var(--main-white);
    border-radius: 3px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: #0c1421;
    border: 1px solid transparent;
    border-left-width: 4px;
    border-left-style: solid;
    border-radius: 8px;
    font-size: 0.8rem;
    color: var(--main-white);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .legend-item.active {
    background: #1e2a46;
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
