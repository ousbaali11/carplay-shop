// Limitation du nombre de tentatives (connexion, mot de passe oublié,
// inscription, contact). Compteurs en mémoire, par clé (adresse IP et/ou
// email) et par fenêtre glissante.
//
// Limites : la mémoire est propre à chaque instance serveur. Sur un hébergement
// serverless (Vercel), chaque instance chaude a ses propres compteurs, qui
// repartent de zéro à chaque démarrage. C'est un premier rempart efficace
// contre les scripts de force brute simples ; pour une garantie globale
// multi-instances, il faudrait stocker les compteurs en base (table dédiée)
// ou dans un cache partagé (Redis / Upstash).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function cleanup(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

// Consomme une tentative pour `key`. Autorise au plus `limit` tentatives par
// fenêtre de `windowMs` millisecondes.
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanup(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

// Adresse IP du client, derrière un proxy/CDN (Vercel pose x-forwarded-for).
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const v = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v;
  };
  const forwarded = get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return get("x-real-ip")?.trim() || "unknown";
}

// Réponse standard "trop de tentatives" (HTTP 429 + en-tête Retry-After).
export function tooManyRequests(retryAfterSec: number, message = "Trop de tentatives. Réessaie dans quelques minutes.") {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSec) },
  });
}

// Fenêtres usuelles
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
