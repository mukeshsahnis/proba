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

<span bind:this={containerRef} class="font-mono text-amber-900 tracking-wide text-sm font-semibold inline-block">
	\({math}\)
</span>
