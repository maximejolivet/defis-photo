import { API_BASE_URL } from '../config'

function getToken() {
    try {
        return JSON.parse(localStorage.getItem('user'))?.token ?? null
    } catch {
        return null
    }
}

// Wraps fetch: prepends the API base URL and attaches the JWT (if the user
// is logged in) as a Bearer token. Protected routes derive the user from
// this token server-side instead of trusting a client-supplied user_id.
export function apiFetch(path, options = {}) {
    const token = getToken()
    const headers = new Headers(options.headers || {})
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}
