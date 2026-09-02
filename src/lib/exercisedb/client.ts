export type ExerciseDbRaw = {
  exerciseId?: string;
  id?: string;
  name?: string;
  gifUrl?: string;
  gifUrls?: Record<string, string>;
  bodyPart?: string;
  bodyParts?: string[];
  target?: string;
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  equipments?: string[];
  instructions?: string[];
  difficulty?: string;
  exerciseTypes?: string[];
  category?: string;
};

export type ExerciseDbPage = {
  success?: boolean;
  meta?: {
    total?: number;
    hasNextPage?: boolean;
    nextCursor?: string | null;
  };
  data?: ExerciseDbRaw[] | ExerciseDbRaw;
};

function baseUrl() {
  return (process.env.EXERCISEDB_BASE_URL || "https://oss.exercisedb.dev/api/v1").replace(
    /\/$/,
    ""
  );
}

function headers(): Record<string, string> {
  const key = process.env.EXERCISEDB_API_KEY;
  if (!key) return {};
  return {
    "X-API-Key": key,
    "X-RapidAPI-Key": key,
  };
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const maxRetries = 6;
  let attempt = 0;

  while (true) {
    const res = await fetch(url, { headers: headers() });
    if (res.ok) return (await res.json()) as T;

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = res.headers.get("retry-after");
      const waitMs = retryAfter ? Number(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);
      attempt += 1;
      console.warn(`[exercisedb] 429, retry ${attempt}/${maxRetries} in ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    throw new Error(`ExerciseDB request failed (${res.status}) ${url.pathname}`);
  }
}

export async function fetchExercisePage(input?: { after?: string; limit?: number }) {
  const limit = String(Math.min(Math.max(input?.limit ?? 25, 1), 25));
  const json = await getJson<ExerciseDbPage>("/exercises", {
    limit,
    after: input?.after ?? "",
  });
  const rows = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
  return {
    items: rows,
    total: json.meta?.total ?? rows.length,
    hasNextPage: Boolean(json.meta?.hasNextPage),
    nextCursor: json.meta?.nextCursor ?? null,
  };
}
