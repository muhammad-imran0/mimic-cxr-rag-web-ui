// Empty string = use Vite dev proxy (same origin). Set VITE_API_URL for production.
export const API_BASE = import.meta.env.VITE_API_URL ?? '';
