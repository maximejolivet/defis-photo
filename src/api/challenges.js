import { apiFetch } from './client';

// La liste des défis est publique et ne change pas pendant une session : un seul appel partagé.
let cache;

export function loadChallenges() {
  cache ??= apiFetch('/api/challenges/list')
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => {
      cache = undefined;
      return [];
    });
  return cache;
}
