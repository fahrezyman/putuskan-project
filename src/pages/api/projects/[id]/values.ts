import type { APIRoute } from 'astro';
import { getProjectById, upsertValue, touchProject } from '../../../../lib/db/queries';
import { isProjectLocked } from '../../../../lib/project-lock';

export const POST: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  if (isProjectLocked(project)) return new Response(JSON.stringify({ error: 'Project ini terkunci' }), { status: 403 });

  const body = await request.json();
  const { alternativeId, criterionId, value } = body;

  if (value === undefined || value === null || isNaN(Number(value))) {
    return new Response(JSON.stringify({ error: 'Nilai tidak valid' }), { status: 400 });
  }

  await upsertValue(alternativeId, criterionId, Number(value));
  await touchProject(params.id!);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
