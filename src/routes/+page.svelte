<script>
	import { LESSON_LEVELS } from '$lib/data/lessons.js';
	import { generateAIQuestion } from '$lib/js/question-gen.js';
	import D3Sim from '$lib/components/D3Sim.svelte';
	import MathView from '$lib/components/MathView.svelte';
	import TutorAgent from '$lib/components/TutorAgent.svelte';

	let currentLevelIndex = $state(0);
	let questionsList = $state([...LESSON_LEVELS[0].questions]);
	let currentQuestionIndex = $state(0);

	let selectedOption = $state(null);
	let isAnswerSubmitted = $state(false);
	let isCorrect = $state(false);
	let isGenerating = $state(false);

	let currentLevel = $derived(LESSON_LEVELS[currentLevelIndex]);
	let currentQuestion = $derived(questionsList[currentQuestionIndex] || LESSON_LEVELS[currentLevelIndex].questions[0]);

	let isFlipping = $state(false);

	function selectLevel(idx) {
		currentLevelIndex = idx;
		questionsList = [...LESSON_LEVELS[idx].questions];
		currentQuestionIndex = 0;
		selectedOption = null;
		isAnswerSubmitted = false;
		isCorrect = false;
	}

	function handleSelectOption(index) {
		if (isAnswerSubmitted) return;
		selectedOption = index;
	}

	function checkAnswer() {
		if (selectedOption === null) return;
		isAnswerSubmitted = true;
		isCorrect = selectedOption === currentQuestion.correctIndex;
	}

	function triggerSimAction() {
		isFlipping = true;
		setTimeout(() => {
			isFlipping = false;
		}, 1200);
	}

	async function loadNextOrGenerate() {
		selectedOption = null;
		isAnswerSubmitted = false;
		isCorrect = false;

		if (currentQuestionIndex + 1 < questionsList.length) {
			currentQuestionIndex++;
		} else {
			isGenerating = true;
			const newQ = await generateAIQuestion({
				levelId: currentLevel.id,
				levelName: currentLevel.name,
				badge: currentLevel.badge
			});
			isGenerating = false;

			if (newQ) {
				questionsList = [...questionsList, newQ];
				currentQuestionIndex++;
			} else if (currentLevelIndex + 1 < LESSON_LEVELS.length) {
				selectLevel(currentLevelIndex + 1);
			}
		}
	}
</script>

<div class="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
	<!-- Top Navigation Header (Warm Light Theme) -->
	<header class="w-full shrink-0 border-b border-amber-900/10 bg-white/80 backdrop-blur-md px-6 py-3 shadow-xs">
		<div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600">
					PROBA
				</h1>
				<span class="hidden sm:inline-block text-xs text-slate-500 font-mono border-l border-amber-900/15 pl-3">
					Adaptive High School Probability Tutor
				</span>
			</div>

			<!-- Level Stepper Navigation -->
			<div class="flex items-center gap-1.5 overflow-x-auto">
				{#each LESSON_LEVELS as lvl, idx}
					<button 
						onclick={() => selectLevel(idx)}
						class={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
							currentLevelIndex === idx 
								? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
								: 'bg-amber-50/80 text-slate-700 border border-amber-200/80 hover:bg-amber-100/70'
						}`}
					>
						<span>{lvl.icon}</span>
						<span>L{idx + 1}: {lvl.badge}</span>
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Main Single-Viewport Layout (No Scrollbar Required) -->
	<main class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
		<!-- Left Workbench (7 Cols) -->
		<section class="lg:col-span-7 flex flex-col justify-between h-full overflow-hidden space-y-3">
			<!-- Level & Question Stepper Bar -->
			<div class="flex items-center justify-between shrink-0">
				<div class="flex items-center gap-2">
					<span class="text-base">{currentLevel.icon}</span>
					<h2 class="text-sm font-bold text-slate-800">{currentLevel.name}</h2>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs font-mono text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60 font-medium">
						Question {currentQuestionIndex + 1}
					</span>
					<button 
						onclick={loadNextOrGenerate}
						disabled={isGenerating}
						class="text-xs font-mono bg-white hover:bg-amber-50 text-slate-700 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
					>
						<span>✨ AI Generate</span>
					</button>
				</div>
			</div>

			{#if isGenerating}
				<div class="flex-1 rounded-2xl bg-white border border-amber-900/10 flex flex-col items-center justify-center space-y-2 text-center p-6 shadow-sm">
					<div class="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
					<div class="text-xs font-semibold text-amber-900">Generating customized problem...</div>
				</div>
			{:else}
				<!-- Problem Statement & Formula -->
				<div class="shrink-0 p-4.5 rounded-2xl bg-white border border-amber-900/10 space-y-2.5 shadow-sm">
					<h3 class="text-sm md:text-base font-semibold text-slate-900 leading-snug">
						{currentQuestion.prompt}
					</h3>
					<div class="px-3.5 py-2 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between">
						<span class="text-[11px] text-amber-900 font-mono font-medium">Formula:</span>
						<MathView math={currentQuestion.formulaLatex} />
					</div>
				</div>

				<!-- D3 Interactive Simulation -->
				<div class="flex-1 flex flex-col justify-center min-h-[140px] max-h-[200px]">
					<D3Sim 
						type={currentQuestion.type || 'coin'} 
						total={currentQuestion.totalOutcomes || 2} 
						favorable={currentQuestion.favorableOutcomes || 1}
						{isFlipping}
					/>
				</div>

				<!-- Multiple Choice Options -->
				<div class="shrink-0 space-y-2">
					<div class="grid grid-cols-2 gap-2.5">
						{#each currentQuestion.options as opt, idx}
							<button 
								onclick={() => handleSelectOption(idx)}
								disabled={isAnswerSubmitted}
								class={`p-3 rounded-xl text-left font-bold text-xs transition-all border cursor-pointer ${
									selectedOption === idx 
										? (isAnswerSubmitted 
											? (idx === currentQuestion.correctIndex ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'bg-rose-100 border-rose-500 text-rose-900')
											: 'bg-amber-100 border-amber-500 text-amber-950 shadow-xs')
										: 'bg-white border-amber-900/10 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-xs'
								}`}
							>
								<span class="font-mono text-[10px] opacity-60 mr-1.5">[{String.fromCharCode(65 + idx)}]</span>
								{opt}
							</button>
						{/each}
					</div>
				</div>

				<!-- Bottom Action Footer -->
				<div class="shrink-0 pt-1">
					{#if !isAnswerSubmitted}
						<button 
							onclick={checkAnswer}
							disabled={selectedOption === null}
							class="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all disabled:opacity-40 shadow-md shadow-amber-500/20 cursor-pointer"
						>
							Check Answer
						</button>
					{:else}
						<div class="space-y-2">
							<div class={`p-3 rounded-xl text-[11px] leading-relaxed border ${
								isCorrect 
									? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
									: 'bg-rose-50 border-rose-300 text-rose-900'
							}`}>
								<span class="font-bold mr-1">{isCorrect ? '🎉 Correct!' : 'Not quite!'}</span>
								{currentQuestion.explanation}
							</div>
							<button 
								onclick={loadNextOrGenerate}
								class="w-full py-3 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-md"
							>
								Next Challenge →
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Right Column: AI Agent Assistant Sidebar (5 Cols, Fixed Height Fit) -->
		<section class="lg:col-span-5 h-full overflow-hidden">
			<TutorAgent 
				topic={currentLevel.name}
				level={currentLevel.badge}
				questionText={currentQuestion.prompt}
				userAnswer={selectedOption !== null ? currentQuestion.options?.[selectedOption] : ''}
				{isCorrect}
			/>
		</section>
	</main>
</div>
