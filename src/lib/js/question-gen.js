import { apiPost } from '$lib/utils/fetch-utils.js';

export async function generateAIQuestion({ levelId, levelName, badge }) {
  try {
    const res = await apiPost('/api/generate-question', {
      levelId,
      levelName,
      badge
    });
    return res.question;
  } catch (err) {
    console.error('Failed to generate AI question:', err);
    return null;
  }
}
