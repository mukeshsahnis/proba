import { apiPost } from '$lib/utils/fetch-utils.js';

export async function askTutor({ topic, level, questionText, userAnswer, isCorrect, requestType, customPrompt }) {
	try {
		const res = await apiPost('/api/tutor', {
			topic,
			level,
			questionText,
			userAnswer,
			isCorrect,
			requestType,
			customPrompt
		});
		return res.message;
	} catch (err) {
		console.error('Tutor API call failed:', err);
		return 'Keep going! Think about how many total outcomes are possible vs how many outcomes favor our event.';
	}
}
