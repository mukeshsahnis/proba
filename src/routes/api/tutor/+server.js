import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { apiSuccess, apiError, validationError } from '$lib/server/api-response.js';

const requestSchema = z.object({
  topic: z.string(),
  level: z.string(),
  questionText: z.string(),
  userAnswer: z.string().optional(),
  isCorrect: z.boolean().optional(),
  requestType: z.enum(['hint', 'explain', 'encouragement', 'custom']),
  customPrompt: z.string().optional()
});

export async function POST({ request }) {
  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const { topic, level, questionText, userAnswer, isCorrect, requestType, customPrompt } =
      validation.data;

    const apiKey = env.LLM_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return apiError('API key not configured on server', 500);
    }

    let systemPrompt = `You are "Proba", an encouraging, empathetic, and expert high-school Probability AI Tutor. 
Your goal is to guide the student intuitively using clear step-by-step reasoning, relatable real-world metaphors (coins, dice, marbles, cards), and clear LaTeX math notation using standard delimiters like \\(P(A)\\) or \\(\\frac{a}{b}\\).
Keep your tone warm, enthusiastic, concise, and focused on helping them feel standard mastery after every step. Never just give away full answers when giving hints; scaffold their thinking.`;

    let userMessage = `Context:
- Probability Topic: ${topic}
- Difficulty Level: ${level}
- Problem Statement: "${questionText}"
`;

    if (userAnswer !== undefined) {
      userMessage += `- Student's Answer: "${userAnswer}"\n`;
      userMessage += `- Answer Status: ${isCorrect ? 'Correct!' : 'Incorrect'}\n`;
    }

    if (requestType === 'hint') {
      userMessage += `\nRequest: Give a friendly 1-2 sentence hint to help them take the next step without revealing the complete final numerical answer.`;
    } else if (requestType === 'explain') {
      userMessage += `\nRequest: Provide a clear, visual step-by-step breakdown explaining why the answer works. Keep it friendly and concise.`;
    } else if (requestType === 'encouragement') {
      userMessage += `\nRequest: Give a 1-2 sentence high-five/praise for mastering this topic, pointing out why their logical understanding was strong.`;
    } else if (requestType === 'custom' && customPrompt) {
      userMessage += `\nStudent Question: "${customPrompt}"\nRequest: Answer concisely and directly as their tutor.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://probability-tutor.local',
        'X-Title': 'Aleph Probability Tutor',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 450
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return apiError(`OpenRouter API error: ${response.statusText}`, response.status, errText);
    }

    const data = await response.json();
    const message =
      data?.choices?.[0]?.message?.content ||
      'I am here to help you master probability step by step!';

    return apiSuccess({ message });
  } catch (err) {
    return apiError(err?.message || 'Server error', 500);
  }
}
