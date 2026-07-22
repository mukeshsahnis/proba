<script>
	import { onMount, tick } from 'svelte';
	import { marked } from 'marked';
	import { askTutor } from '$lib/js/tutor.js';

	let {
		topic = '',
		level = '',
		questionText = '',
		userAnswer = '',
		isCorrect = null
	} = $props();

	let messages = $state([
		{
			sender: 'aleph',
			text: 'Hi there! I am Proba, your Probability AI Tutor. Feel free to ask me for hints, explanations, or step-by-step guidance anytime!'
		}
	]);

	let customInput = $state('');
	let loading = $state(false);
	let chatBoxRef = $state(null);

	// Reset messages when question context changes
	$effect(() => {
		questionText;
		messages = [
			{
				sender: 'aleph',
				text: `I'm ready to help with this question! Ask me for a hint or explanation anytime.`
			}
		];
	});

	function formatMarkdown(text) {
		if (!text) return '';
		return marked.parse(text);
	}

	async function scrollToBottom() {
		await tick();
		if (chatBoxRef) {
			chatBoxRef.scrollTop = chatBoxRef.scrollHeight;
		}
	}

	function typesetMathInChat() {
		if (typeof window !== 'undefined' && window.MathJax && chatBoxRef) {
			window.MathJax.typesetPromise?.([chatBoxRef]).catch((err) => console.error(err));
		}
	}

	$effect(() => {
		messages.length;
		scrollToBottom();
		setTimeout(typesetMathInChat, 100);
	});

	async function getHint() {
		loading = true;
		messages = [...messages, { sender: 'user', text: 'Can I get a hint?' }];
		const reply = await askTutor({
			topic,
			level,
			questionText,
			userAnswer,
			isCorrect,
			requestType: 'hint'
		});
		messages = [...messages, { sender: 'aleph', text: reply }];
		loading = false;
	}

	async function getExplanation() {
		loading = true;
		messages = [...messages, { sender: 'user', text: 'Please explain this problem.' }];
		const reply = await askTutor({
			topic,
			level,
			questionText,
			userAnswer,
			isCorrect,
			requestType: 'explain'
		});
		messages = [...messages, { sender: 'aleph', text: reply }];
		loading = false;
	}

	async function sendCustom() {
		if (!customInput.trim() || loading) return;
		const query = customInput;
		customInput = '';
		loading = true;
		messages = [...messages, { sender: 'user', text: query }];
		const reply = await askTutor({
			topic,
			level,
			questionText,
			userAnswer,
			isCorrect,
			requestType: 'custom',
			customPrompt: query
		});
		messages = [...messages, { sender: 'aleph', text: reply }];
		loading = false;
	}
</script>

<div class="flex flex-col h-full bg-white/80 rounded-2xl border border-amber-900/10 p-4 shadow-xl shadow-amber-900/5 backdrop-blur-md overflow-hidden">
	<div class="flex items-center gap-3 pb-2.5 mb-2.5 border-b border-amber-900/10 shrink-0">
		<div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-extrabold text-white text-sm shadow-sm shadow-amber-500/20">
			P
		</div>
		<div>
			<h3 class="font-bold text-slate-900 text-xs tracking-wide">PROBA AI TUTOR</h3>
			<p class="text-[10px] text-amber-700 font-mono font-medium">Personalized Guidance Agent</p>
		</div>
	</div>

	<div bind:this={chatBoxRef} class="flex-1 overflow-y-auto space-y-3 pr-1">
		{#each messages as msg}
			<div class={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
				<div class={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
					msg.sender === 'user' 
						? 'bg-amber-500 text-slate-950 font-medium shadow-sm' 
						: 'bg-amber-50/80 text-slate-800 border border-amber-200/70 prose prose-xs max-w-none prose-p:my-1 prose-headings:my-1 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-amber-900'
				}`}>
					{#if msg.sender === 'user'}
						{msg.text}
					{:else}
						{@html formatMarkdown(msg.text)}
					{/if}
				</div>
			</div>
		{/each}
		{#if loading}
			<div class="flex justify-start">
				<div class="bg-amber-50 text-amber-900 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2 border border-amber-200">
					<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
					<span>Aleph is thinking...</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="pt-2.5 mt-auto border-t border-amber-900/10 space-y-2 shrink-0">
		<div class="flex items-center gap-2">
			<button 
				onclick={getHint} 
				disabled={loading}
				class="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60 hover:bg-amber-200/80 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
			>
				💡 Get Hint
			</button>
			<button 
				onclick={getExplanation} 
				disabled={loading}
				class="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
			>
				📖 Explain Step
			</button>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); sendCustom(); }} class="flex gap-2">
			<input 
				type="text" 
				bind:value={customInput} 
				placeholder="Ask Aleph anything about probability..." 
				class="flex-1 bg-white border border-amber-900/15 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
			/>
			<button 
				type="submit" 
				disabled={loading || !customInput.trim()}
				class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all disabled:opacity-40 shadow-xs cursor-pointer"
			>
				Send
			</button>
		</form>
	</div>
</div>
