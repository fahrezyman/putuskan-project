import pool from './index';
import { randomUUID } from 'crypto';
import type { Project, Criterion, Alternative, CriterionValue } from '../../types';

// Projects
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const [rows] = await pool.execute(
    'SELECT * FROM project WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
  return rows as Project[];
}

export async function getProjectById(id: string, userId: string): Promise<Project | null> {
  const [rows] = await pool.execute(
    'SELECT * FROM project WHERE id = ? AND userId = ?',
    [id, userId]
  ) as any[];
  return rows[0] ?? null;
}

export async function createProject(userId: string, name: string, description: string): Promise<string> {
  const id = randomUUID();
  await pool.execute(
    'INSERT INTO project (id, userId, name, description, method) VALUES (?, ?, ?, ?, ?)',
    [id, userId, name, description || null, 'SAW']
  );
  return id;
}

export async function updateProject(id: string, data: { name: string; description: string | null }): Promise<void> {
  await pool.execute(
    'UPDATE project SET name = ?, description = ? WHERE id = ?',
    [data.name, data.description, id]
  );
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  await pool.execute('DELETE FROM project WHERE id = ? AND userId = ?', [id, userId]);
}

// Criteria
export async function getCriteriaByProject(projectId: string): Promise<Criterion[]> {
  const [rows] = await pool.execute(
    'SELECT * FROM criterion WHERE projectId = ? ORDER BY position ASC',
    [projectId]
  );
  return rows as Criterion[];
}

export async function upsertCriterion(
  projectId: string,
  criterion: { id?: string; name: string; weight: number; type: 'benefit' | 'cost'; input_type: 'number' | 'scale5'; position: number }
): Promise<string> {
  const id = criterion.id ?? randomUUID();
  await pool.execute(
    `INSERT INTO criterion (id, projectId, name, weight, type, input_type, position)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), weight = VALUES(weight), type = VALUES(type), input_type = VALUES(input_type), position = VALUES(position)`,
    [id, projectId, criterion.name, criterion.weight, criterion.type, criterion.input_type ?? 'number', criterion.position]
  );
  return id;
}

export async function deleteCriterion(id: string, projectId: string): Promise<void> {
  await pool.execute('DELETE FROM criterion WHERE id = ? AND projectId = ?', [id, projectId]);
}

// Alternatives
export async function getAlternativesByProject(projectId: string): Promise<Alternative[]> {
  const [rows] = await pool.execute(
    'SELECT * FROM alternative WHERE projectId = ? ORDER BY position ASC',
    [projectId]
  );
  return rows as Alternative[];
}

export async function upsertAlternative(
  projectId: string,
  alt: { id?: string; name: string; position: number }
): Promise<string> {
  const id = alt.id ?? randomUUID();
  await pool.execute(
    `INSERT INTO alternative (id, projectId, name, position)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), position = VALUES(position)`,
    [id, projectId, alt.name, alt.position]
  );
  return id;
}

export async function deleteAlternative(id: string, projectId: string): Promise<void> {
  await pool.execute('DELETE FROM alternative WHERE id = ? AND projectId = ?', [id, projectId]);
}

// Values
export async function getValuesByProject(projectId: string): Promise<CriterionValue[]> {
  const [rows] = await pool.execute(
    `SELECT cv.* FROM criterion_value cv
     JOIN alternative a ON cv.alternativeId = a.id
     WHERE a.projectId = ?`,
    [projectId]
  );
  return rows as CriterionValue[];
}

export async function upsertValue(alternativeId: string, criterionId: string, value: number): Promise<void> {
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO criterion_value (id, alternativeId, criterionId, value)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [id, alternativeId, criterionId, value]
  );
}
