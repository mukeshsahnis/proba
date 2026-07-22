<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let {
    type = 'coin',
    total = 2,
    favorable = 1,
    isFlipping = false,
    selectedIndex = null
  } = $props();

  let svgRef = $state(null);

  function renderSimulation() {
    if (!svgRef) return;

    const svg = d3.select(svgRef);
    svg.selectAll('*').remove();

    // Cap total displayed elements to avoid overflow in D3 SVG bounds
    const safeTotal = Math.min(total || 2, 10);
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
    } else if (type === 'bag' || type === 'bag_dependent') {
      const itemsPerRow = 5;
      const rows = Math.ceil(safeTotal / itemsPerRow);

      const marbleRadius = 11;
      const spacingX = 32;
      const spacingY = 32;

      const bagWidth = Math.max(180, Math.min(safeTotal, itemsPerRow) * spacingX + 40);
      const bagHeight = Math.max(80, rows * spacingY + 30);

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

      for (let i = 0; i < safeTotal; i++) {
        const isFav = i < safeFavorable;
        const col = i % itemsPerRow;
        const row = Math.floor(i / itemsPerRow);

        const cx = startX + 30 + col * spacingX;
        const cy = startY + 25 + row * spacingY;

        svg
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', marbleRadius)
          .attr('fill', isFav ? '#f59e0b' : '#3b82f6')
          .attr('stroke', isFav ? '#b45309' : '#1d4ed8')
          .attr('stroke-width', 2);
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
