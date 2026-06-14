import type { APIRoute } from 'astro';
import { getProjectById, upsertCriterion, deleteCriterion } from '../../../../lib/db/queries';

export const POST: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  const { id, name, weight, type, input_type, position } = body;

  if (!name?.trim()) return new Response(JSON.stringify({ error: 'Nama faktor wajib diisi' }), { status: 400 });
  if (weight <= 0 || weight > 1) return new Response(JSON.stringify({ error: 'Bobot harus antara 0 dan 1' }), { status: 400 });

  const criterionId = await upsertCriterion(params.id!, { id, name: name.trim(), weight, type, input_type: input_type ?? 'number', position });
  return new Response(JSON.stringify({ id: criterionId }), { status: 200 });
};

export const DELETE: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const { criterionId } = await request.json();
  await deleteCriterion(criterionId, params.id!);
  return new Response(null, { status: 204 });
};
