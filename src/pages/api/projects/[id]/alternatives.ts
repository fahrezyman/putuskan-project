import type { APIRoute } from 'astro';
import { getProjectById, upsertAlternative, deleteAlternative } from '../../../../lib/db/queries';

export const POST: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  const { id, name, position } = body;

  if (!name?.trim()) return new Response(JSON.stringify({ error: 'Nama alternatif wajib diisi' }), { status: 400 });

  const altId = await upsertAlternative(params.id!, { id, name: name.trim(), position });
  return new Response(JSON.stringify({ id: altId }), { status: 200 });
};

export const DELETE: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const { alternativeId } = await request.json();
  await deleteAlternative(alternativeId, params.id!);
  return new Response(null, { status: 204 });
};
