import type { EventParams } from './send-fynch-event';

const TIER2_WINDOW_MS = 2000;
const MAX_LEAD_IDS = 500;
const MAX_FORM_KEYS = 100;
const SEP = '\x00';

const seenLeadIds = new Set<string>();
const recentFormFires = new Map<string, number>();

function norm(value: string | undefined): string {
  return value ?? '';
}

function tier1Key(params: EventParams): string | null {
  const provider = norm(params.service_provider);
  const leadId = norm(params.lead_id);
  if (!provider || !leadId) return null;
  return `${provider}${SEP}${leadId}`;
}

function tier2Key(params: EventParams): string {
  return [norm(params.service_provider), norm(params.form_id), norm(params.form_name)].join(SEP);
}

function evictOldestFromSet(set: Set<string>, max: number): void {
  while (set.size > max) {
    const first = set.values().next().value;
    if (first === undefined) return;
    set.delete(first);
  }
}

function pruneFormFires(now: number): void {
  const expiry = TIER2_WINDOW_MS * 2;
  for (const [key, ts] of recentFormFires) {
    if (now - ts > expiry) {
      recentFormFires.delete(key);
    }
  }
  while (recentFormFires.size > MAX_FORM_KEYS) {
    const first = recentFormFires.keys().next().value;
    if (first === undefined) return;
    recentFormFires.delete(first);
  }
}

export function isFormDuplicate(params: EventParams): boolean {
  const t1 = tier1Key(params);
  if (t1 !== null) {
    if (seenLeadIds.has(t1)) return true;
    seenLeadIds.add(t1);
    evictOldestFromSet(seenLeadIds, MAX_LEAD_IDS);
    return false;
  }

  const t2 = tier2Key(params);
  const now = Date.now();
  const last = recentFormFires.get(t2);
  if (last !== undefined && now - last < TIER2_WINDOW_MS) {
    return true;
  }
  recentFormFires.set(t2, now);
  pruneFormFires(now);
  return false;
}

interface TestingHelpers {
  reset(): void;
  sizes(): { leadIds: number; formKeys: number };
}

export const __testing: TestingHelpers | undefined =
  import.meta.env.MODE === 'test'
    ? {
        reset(): void {
          seenLeadIds.clear();
          recentFormFires.clear();
        },
        sizes(): { leadIds: number; formKeys: number } {
          return { leadIds: seenLeadIds.size, formKeys: recentFormFires.size };
        },
      }
    : undefined;
