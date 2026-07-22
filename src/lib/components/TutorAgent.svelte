<script>
  import { onMount, tick } from 'svelte';
  import { marked } from 'marked';
  import { askTutor } from '$lib/js/tutor.js';

  let { topic = '', level = '', questionText = '', userAnswer = '', isCorrect = null } = $props();

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
      window.MathJax.typesetClear?.([chatBoxRef]);
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

<div
  class="flex h-full flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-white/80 p-4 shadow-xl shadow-amber-900/5 backdrop-blur-md"
>
  <div class="mb-2.5 flex shrink-0 items-center gap-3 border-b border-amber-900/10 pb-2.5">
    <div
      class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-sm font-extrabold text-white shadow-sm shadow-amber-500/20"
    >
      P
    </div>
    <div>
      <h3 class="text-xs font-bold tracking-wide text-slate-900">PROBA AI TUTOR</h3>
      <p class="font-mono text-[10px] font-medium text-amber-700">Personalized Guidance Agent</p>
    </div>
  </div>

  <div bind:this={chatBoxRef} class="flex-1 space-y-3 overflow-y-auto pr-1">
    {#each messages as msg}
      <div class={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          class={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
            msg.sender === 'user'
              ? 'bg-amber-500 font-medium text-slate-950 shadow-sm'
              : 'prose prose-xs prose-p:my-1 prose-headings:my-1 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-amber-900 max-w-none border border-amber-200/70 bg-amber-50/80 text-slate-800'
          }`}
        >
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
        <div
          class="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900"
        >
          <span class="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500"></span>
          <span>Aleph is thinking...</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="mt-auto shrink-0 space-y-2 border-t border-amber-900/10 pt-2.5">
    <div class="flex items-center gap-2">
      <button
        onclick={getHint}
        disabled={loading}
        class="flex-1 cursor-pointer rounded-xl border border-amber-300/60 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition-all hover:bg-amber-200/80 disabled:opacity-50"
      >
        💡 Get Hint
      </button>
      <button
        onclick={getExplanation}
        disabled={loading}
        class="flex-1 cursor-pointer rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-2xs transition-all hover:bg-teal-100 disabled:opacity-50"
      >
        📖 Explain Step
      </button>
    </div>

    <form
      onsubmit={(e) => {
        e.preventDefault();
        sendCustom();
      }}
      class="flex gap-2"
    >
      <input
        type="text"
        bind:value={customInput}
        placeholder="Ask Aleph anything about probability..."
        class="flex-1 rounded-xl border border-amber-900/15 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-inner transition-colors focus:border-amber-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading || !customInput.trim()}
        class="cursor-pointer rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-xs transition-all hover:bg-amber-400 disabled:opacity-40"
      >
        Send
      </button>
    </form>
  </div>
</div>
