import { json } from '@sveltejs/kit';

export function apiSuccess(data = {}, status = 200) {
	return json({ success: true, ...data }, { status });
}

export function apiError(message = 'Internal error', status = 500, details = null) {
	return json({ success: false, error: message, details }, { status });
}

export function validationError(zodError) {
	const errors = zodError.errors ? zodError.errors.map(e => `${e.path.join('.')}: ${e.message}`) : [zodError.message];
	return apiError('Validation failed', 400, errors);
}
