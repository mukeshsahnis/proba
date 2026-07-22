<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {
    type = 'coin',
    total = 2,
    favorable = 1,
    colorCategories = null,
    isFlipping = false,
    selectedIndex = null
  } = $props();

  let svgRef = $state(null);

  function renderSimulation() {
    if (!svgRef) return;

    const svg = d3.select(svgRef);
    svg.selectAll('*').remove();

    // Cap total displayed elements to avoid overflow in D3 SVG bounds
    const safeTotal = Math.min(total || 2, 16);
    const safeFavorable = Math.min(favorable || 1, safeTotal);

    const width = 360;
    const height = 140;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    if (type === 'coin' || type === 'coin_multi') {
      const numCoins = type === 'coin_multi' ? 2 : 1;
      const radius = 32;
      const startX = width / 2 - (numCoins - 1) * 50;

      for (let i = 0; i < numCoins; i++) {
        const cx = startX + i * 100;
        const cy = height / 2;

        const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`);

        g.append('circle')
          .attr('r', radius)
          .attr('fill', 'url(#gold-gradient-light)')
          .attr('stroke', '#d97706')
          .attr('stroke-width', 3)
          .attr('class', isFlipping ? 'animate-bounce' : 'transition-all duration-300');

        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#78350f')
          .attr('font-size', '18px')
          .attr('font-weight', 'bold')
          .text(isFlipping ? '?' : 'H');
      }
    } else if (type === 'dice') {
      const diceSize = 56;
      const x = (width - diceSize) / 2;
      const y = (height - diceSize) / 2;

      const g = svg.append('g').attr('transform', `translate(${x}, ${y})`);

      g.append('rect')
        .attr('width', diceSize)
        .attr('height', diceSize)
        .attr('rx', 12)
        .attr('fill', '#0d9488')
        .attr('stroke', '#0f766e')
        .attr('stroke-width', 3);

      g.append('text')
        .attr('x', diceSize / 2)
        .attr('y', diceSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#ffffff')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .text('4');
    } else if (type === 'cards') {
      const cardW = 48;
      const cardH = 70;
      const x = (width - cardW) / 2;
      const y = (height - cardH) / 2;

      const g = svg.append('g').attr('transform', `translate(${x}, ${y})`);

      g.append('rect')
        .attr('width', cardW)
        .attr('height', cardH)
        .attr('rx', 6)
        .attr('fill', '#ffffff')
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', cardW / 2)
        .attr('y', cardH / 2 - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#dc2626')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .text('K');

      g.append('text')
        .attr('x', cardW / 2)
        .attr('y', cardH / 2 + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#dc2626')
        .attr('font-size', '16px')
        .text('👑');
    } else if (type === 'tree') {
      // Tree Diagram Branches for Conditional/Bayes Problems
      const startX = 50;
      const startY = height / 2;

      // Root to 2 main branches
      const branch1Y = 35;
      const branch2Y = height - 35;
      const midX = 170;
      const endX = 300;

      // Branch 1 Lines
      svg
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', midX)
        .attr('y2', branch1Y)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);
      svg
        .append('line')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', midX)
        .attr('y2', branch2Y)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2);

      // Sub-branches from Branch 1
      svg
        .append('line')
        .attr('x1', midX)
        .attr('y1', branch1Y)
        .attr('x2', endX)
        .attr('y2', branch1Y - 18)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5);
      svg
        .append('line')
        .attr('x1', midX)
        .attr('y1', branch1Y)
        .attr('x2', endX)
        .attr('y2', branch1Y + 18)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5);

      // Sub-branches from Branch 2
      svg
        .append('line')
        .attr('x1', midX)
        .attr('y1', branch2Y)
        .attr('x2', endX)
        .attr('y2', branch2Y - 18)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5);
      svg
        .append('line')
        .attr('x1', midX)
        .attr('y1', branch2Y)
        .attr('x2', endX)
        .attr('y2', branch2Y + 18)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5);

      // Nodes
      svg
        .append('circle')
        .attr('cx', startX)
        .attr('cy', startY)
        .attr('r', 6)
        .attr('fill', '#d97706');
      svg
        .append('circle')
        .attr('cx', midX)
        .attr('cy', branch1Y)
        .attr('r', 10)
        .attr('fill', '#f59e0b');
      svg
        .append('circle')
        .attr('cx', midX)
        .attr('cy', branch2Y)
        .attr('r', 10)
        .attr('fill', '#3b82f6');

      // Labels
      svg
        .append('text')
        .attr('x', midX)
        .attr('y', branch1Y - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .text('Pizza (60%)');
      svg
        .append('text')
        .attr('x', midX)
        .attr('y', branch2Y + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e3a8a')
        .text('Burger (40%)');

      svg
        .append('text')
        .attr('x', endX + 25)
        .attr('y', branch1Y - 14)
        .attr('text-anchor', 'start')
        .attr('font-size', '10px')
        .attr('fill', '#065f46')
        .text('Soda (70%)');
      svg
        .append('text')
        .attr('x', endX + 25)
        .attr('y', branch2Y - 14)
        .attr('text-anchor', 'start')
        .attr('font-size', '10px')
        .attr('fill', '#065f46')
        .text('Soda (50%)');
    } else if (type === 'venn') {
      // Venn Diagram for Overlapping Survey Sets
      const r = 45;
      const cy = height / 2;
      const c1x = width / 2 - 25;
      const c2x = width / 2 + 25;

      svg
        .append('circle')
        .attr('cx', c1x)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', '#f59e0b')
        .attr('fill-opacity', '0.45')
        .attr('stroke', '#d97706')
        .attr('stroke-width', 2);
      svg
        .append('circle')
        .attr('cx', c2x)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', '#3b82f6')
        .attr('fill-opacity', '0.45')
        .attr('stroke', '#1d4ed8')
        .attr('stroke-width', 2);

      svg
        .append('text')
        .attr('x', c1x - 20)
        .attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#78350f')
        .text('Pizza');
      svg
        .append('text')
        .attr('x', c2x + 20)
        .attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1e3a8a')
        .text('Soda');
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', cy + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#0f172a')
        .text('Both');
    } else {
      // Fallback for bag / bag_dependent / custom outcomes
      const itemsPerRow = safeTotal > 10 ? 6 : 5;
      const rows = Math.ceil(safeTotal / itemsPerRow);

      const marbleRadius = safeTotal > 10 ? 9.5 : 11;
      const spacingX = safeTotal > 10 ? 27 : 32;
      const spacingY = safeTotal > 10 ? 26 : 32;

      const bagWidth = Math.max(180, Math.min(safeTotal, itemsPerRow) * spacingX + 34);
      const bagHeight = Math.max(80, rows * spacingY + 24);

      const startX = (width - bagWidth) / 2;
      const startY = (height - bagHeight) / 2;

      svg
        .append('rect')
        .attr('x', startX)
        .attr('y', startY)
        .attr('width', bagWidth)
        .attr('height', bagHeight)
        .attr('rx', 16)
        .attr('fill', '#fef3c7')
        .attr('stroke', '#d97706')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4');

      // Multi-color category list builder if available
      let marbleColors = [];
      if (Array.isArray(colorCategories) && colorCategories.length > 0) {
        colorCategories.forEach((cat) => {
          const hex =
            cat.hexColor ||
            (cat.colorName === 'red'
              ? '#ef4444'
              : cat.colorName === 'green'
                ? '#10b981'
                : cat.colorName === 'blue'
                  ? '#3b82f6'
                  : '#f59e0b');
          for (let c = 0; c < (cat.count || 0); c++) {
            marbleColors.push({ fill: hex, isTarget: cat.isTarget });
          }
        });
      }

      for (let i = 0; i < safeTotal; i++) {
        const item = marbleColors[i] || {
          fill: i < safeFavorable ? '#f59e0b' : '#3b82f6',
          isTarget: i < safeFavorable
        };
        const col = i % itemsPerRow;
        const row = Math.floor(i / itemsPerRow);

        const cx = startX + 30 + col * spacingX;
        const cy = startY + 25 + row * spacingY;

        svg
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', marbleRadius)
          .attr('fill', item.fill)
          .attr('stroke', item.isTarget ? '#78350f' : '#1e3a8a')
          .attr('stroke-width', item.isTarget ? 2.5 : 1.5);
      }
    }
  }

  $effect(() => {
    type;
    total;
    favorable;
    isFlipping;
    renderSimulation();
  });

  onMount(() => {
    renderSimulation();
  });
</script>

<div
  class="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border border-amber-900/10 bg-gradient-to-b from-amber-50/60 to-orange-50/40 p-2 shadow-xs backdrop-blur-sm"
>
  <svg bind:this={svgRef} class="h-36 w-full max-w-xs">
    <defs>
      <radialGradient id="gold-gradient-light" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fde047" />
        <stop offset="100%" stop-color="#f59e0b" />
      </radialGradient>
    </defs>
  </svg>
  <div class="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-amber-800">
    <span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
    <span>Interactive D3 Outcome Simulation</span>
  </div>
</div>
