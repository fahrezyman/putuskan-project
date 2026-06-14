import type { Criterion, Alternative, CriterionValue, SAWResult } from '../types';

export function calculateSAW(
  criteria: Criterion[],
  alternatives: Alternative[],
  values: CriterionValue[]
): SAWResult[] {
  // Build lookup: alternativeId -> criterionId -> value
  const valueMap: Record<string, Record<string, number>> = {};
  for (const v of values) {
    if (!valueMap[v.alternativeId]) valueMap[v.alternativeId] = {};
    valueMap[v.alternativeId][v.criterionId] = v.value;
  }

  // Step 1: Normalisasi per kriteria
  const normalizedMap: Record<string, Record<string, number>> = {};

  for (const criterion of criteria) {
    const vals = alternatives.map((a) => valueMap[a.id]?.[criterion.id] ?? 0);

    const max = Math.max(...vals);
    const min = Math.min(...vals);

    for (const alt of alternatives) {
      if (!normalizedMap[alt.id]) normalizedMap[alt.id] = {};
      const raw = valueMap[alt.id]?.[criterion.id] ?? 0;

      // benefit: nilai/max | cost: min/nilai
      if (criterion.type === 'benefit') {
        normalizedMap[alt.id][criterion.id] = max === 0 ? 0 : raw / max;
      } else {
        normalizedMap[alt.id][criterion.id] = raw === 0 ? 0 : min / raw;
      }
    }
  }

  // Step 2: Hitung skor akhir = sum(weight * normalized)
  const results: SAWResult[] = alternatives.map((alt) => {
    let score = 0;
    for (const criterion of criteria) {
      const normalized = normalizedMap[alt.id]?.[criterion.id] ?? 0;
      score += criterion.weight * normalized;
    }

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      normalizedValues: normalizedMap[alt.id] ?? {},
      score: Math.round(score * 100) / 100,
      rank: 0,
    };
  });

  // Step 3: Ranking berdasarkan skor tertinggi
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));

  return results;
}
