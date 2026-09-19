import { apiFetch } from './client';
import type { Challenge } from '../types';

// La liste des défis est publique et ne change pas pendant une session : un seul appel partagé.
let cache: Promise<Challenge[]> | undefined;

export function loadChallenges(): Promise<Challenge[]> {
  cache ??= apiFetch('/api/challenges/list')
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => {
      cache = undefined;
      return [];
    });
  return cache;
}
