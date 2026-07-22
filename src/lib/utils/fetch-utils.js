/**
 * Fetch wrapper for client API requests with error handling
 */
export async function apiFetch(url, options = {}) {
	const res = await fetch(url, options);
	let data;
	try {
		data = await res.json();
	} catch {
		data = null;
	}

	if (!res.ok) {
		const err = new Error(data?.message || data?.error || `HTTP error ${res.status}`);
		err.status = res.status;
		err.data = data;
		throw err;
	}

	return data;
}

export async function apiPost(url, body) {
	const headers = {};
	let payload = body;

	if (!(body instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
		payload = JSON.stringify(body);
	}

	return apiFetch(url, {
		method: 'POST',
		headers,
		body: payload
	});
}

export async function apiGet(url) {
	return apiFetch(url, { method: 'GET' });
}
