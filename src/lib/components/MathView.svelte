<script>
  import { onMount } from 'svelte';

  let { math = '' } = $props();
  let containerRef = $state(null);

  function renderMath() {
    if (typeof window !== 'undefined' && window.MathJax && containerRef) {
      window.MathJax.typesetPromise?.([containerRef]).catch((err) => console.error(err));
    }
  }

  $effect(() => {
    if (math && containerRef) {
      renderMath();
    }
  });

  onMount(() => {
    renderMath();
  });
</script>

<span
  bind:this={containerRef}
  class="inline-block font-mono text-sm font-semibold tracking-wide text-amber-900"
>
  \({math}\)
</span>
