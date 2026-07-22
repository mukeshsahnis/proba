import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { apiSuccess, apiError, validationError } from '$lib/server/api-response.js';

const generateSchema = z.object({
  levelId: z.string(),
  levelName: z.string(),
  badge: z.string()
});

export async function POST({ request }) {
  try {
    const body = await request.json();
    const validation = generateSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error);
    }

    const { levelId, levelName, badge } = validation.data;

    const apiKey = env.LLM_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return apiError('API key not configured on server', 500);
    }

    const systemPrompt = `You are a high-school Probability question generator. 
Output ONLY valid JSON matching this exact schema:
{
  "prompt": "string statement of the question",
  "type": "coin" | "coin_multi" | "dice" | "bag" | "bag_dependent" | "cards",
  "formulaLatex": "LaTeX string showing formula e.g. P(\\\\text{Event}) = \\\\frac{a}{b}",
  "totalOutcomes": number,
  "favorableOutcomes": number,
  "options": ["string", "string", "string", "string"],
  "correctIndex": number (0-3),
  "explanation": "concise 2-sentence explanation"
}
Ensure choices are clear fractions or percentages (e.g. "1/4", "1/2", "3/8"). Do not wrap output in backticks or markdown, just raw JSON.`;

    const userPrompt = `Generate a fresh high-school probability question for level: "${levelName}" (${badge}). 
Make it engaging, relatable, and clear.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://probability-tutor.local',
        'X-Title': 'Aleph Question Generator',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return apiError(`OpenRouter API error: ${response.statusText}`, response.status, errText);
    }

    const data = await response.json();
    let rawText = data?.choices?.[0]?.message?.content || '';

    // Strip markdown code fences if present
    rawText = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsedQuestion;
    try {
      parsedQuestion = JSON.parse(rawText);
    } catch {
      return apiError('Failed to parse AI question output format', 500, rawText);
    }

    return apiSuccess({ question: parsedQuestion });
  } catch (err) {
    return apiError(err?.message || 'Server error', 500);
  }
}
