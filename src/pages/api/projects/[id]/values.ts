import type { APIRoute } from 'astro';
import { getProjectById, upsertValue } from '../../../../lib/db/queries';

export const POST: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  const { alternativeId, criterionId, value } = body;

  if (value === undefined || value === null || isNaN(Number(value))) {
    return new Response(JSON.stringify({ error: 'Nilai tidak valid' }), { status: 400 });
  }

  await upsertValue(alternativeId, criterionId, Number(value));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
