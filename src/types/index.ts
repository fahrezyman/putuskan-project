export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  conclusion: string | null;
  resultsViewedAt: Date | null;
  unlocked: boolean;
  method: 'SAW';
  createdAt: Date;
  updatedAt: Date;
}

export interface Criterion {
  id: string;
  projectId: string;
  name: string;
  weight: number;
  type: 'benefit' | 'cost';
  input_type: 'number' | 'scale5';
  position: number;
}

export interface Alternative {
  id: string;
  projectId: string;
  name: string;
  position: number;
}

export interface CriterionValue {
  id: string;
  alternativeId: string;
  criterionId: string;
  value: number;
}

export interface SAWResult {
  alternativeId: string;
  alternativeName: string;
  normalizedValues: Record<string, number>;
  score: number;
  rank: number;
}
