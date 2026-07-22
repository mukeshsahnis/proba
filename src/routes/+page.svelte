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
  let currentQuestion = $derived(
    questionsList[currentQuestionIndex] || LESSON_LEVELS[currentLevelIndex].questions[0]
  );

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

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
  <!-- Top Navigation Header (Warm Light Theme) -->
  <header
    class="w-full shrink-0 border-b border-amber-900/10 bg-white/80 px-6 py-3 shadow-xs backdrop-blur-md"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h1
          class="font-display bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
        >
          PROBA
        </h1>
        <span
          class="hidden border-l border-amber-900/15 pl-3 font-mono text-xs text-slate-500 sm:inline-block"
        >
          Progressive High School Probability Tutor
        </span>
      </div>

      <!-- Level Stepper Navigation -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        {#each LESSON_LEVELS as lvl, idx}
          <button
            onclick={() => selectLevel(idx)}
            class={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              currentLevelIndex === idx
                ? 'bg-amber-500 font-bold text-slate-950 shadow-sm'
                : 'border border-amber-200/80 bg-amber-50/80 text-slate-700 hover:bg-amber-100/70'
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
  <main
    class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 overflow-hidden p-4 lg:grid-cols-12 lg:p-6"
  >
    <!-- Left Workbench (7 Cols) -->
    <section class="flex h-full flex-col justify-between space-y-3 overflow-hidden lg:col-span-7">
      <!-- Level & Question Stepper Bar -->
      <div class="flex shrink-0 items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">{currentLevel.icon}</span>
          <h2 class="text-sm font-bold text-slate-800">{currentLevel.name}</h2>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="rounded-md border border-amber-300/60 bg-amber-100/80 px-2 py-0.5 font-mono text-xs font-medium text-amber-900"
          >
            Question {currentQuestionIndex + 1}
          </span>
          <button
            onclick={loadNextOrGenerate}
            disabled={isGenerating}
            class="flex cursor-pointer items-center gap-1 rounded-md border border-amber-200 bg-white px-2.5 py-0.5 font-mono text-xs text-slate-700 shadow-xs hover:bg-amber-50 disabled:opacity-50"
          >
            <span>✨ AI Generate</span>
          </button>
        </div>
      </div>

      {#if isGenerating}
        <div
          class="flex flex-1 flex-col items-center justify-center space-y-2 rounded-2xl border border-amber-900/10 bg-white p-6 text-center shadow-sm"
        >
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
          ></div>
          <div class="text-xs font-semibold text-amber-900">Generating customized problem...</div>
        </div>
      {:else}
        <!-- Problem Statement & Formula -->
        <div
          class="shrink-0 space-y-2.5 rounded-2xl border border-amber-900/10 bg-white p-4.5 shadow-sm"
        >
          <h3 class="text-sm leading-snug font-semibold text-slate-900 md:text-base">
            {currentQuestion.prompt}
          </h3>
          <div
            class="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/70 px-3.5 py-2"
          >
            <span class="font-mono text-[11px] font-medium text-amber-900">Formula:</span>
            <MathView math={currentQuestion.formulaLatex} />
          </div>
        </div>

        <!-- D3 Interactive Simulation -->
        <div class="flex max-h-[200px] min-h-[140px] flex-1 flex-col justify-center">
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
                class={`cursor-pointer rounded-xl border p-3 text-left text-xs font-bold transition-all ${
                  selectedOption === idx
                    ? isAnswerSubmitted
                      ? idx === currentQuestion.correctIndex
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                        : 'border-rose-500 bg-rose-100 text-rose-900'
                      : 'border-amber-500 bg-amber-100 text-amber-950 shadow-xs'
                    : 'border-amber-900/10 bg-white text-slate-800 shadow-xs hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <span class="mr-1.5 font-mono text-[10px] opacity-60"
                  >[{String.fromCharCode(65 + idx)}]</span
                >
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
              class="w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40"
            >
              Check Answer
            </button>
          {:else}
            <div class="space-y-2">
              <div
                class={`rounded-xl border p-3 text-[11px] leading-relaxed ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                <span class="mr-1 font-bold">{isCorrect ? '🎉 Correct!' : 'Not quite!'}</span>
                {currentQuestion.explanation}
              </div>
              <button
                onclick={loadNextOrGenerate}
                class="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:bg-slate-800"
              >
                Next Challenge →
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </section>

    <!-- Right Column: AI Agent Assistant Sidebar (5 Cols, Fixed Height Fit) -->
    <section class="h-full overflow-hidden lg:col-span-5">
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
