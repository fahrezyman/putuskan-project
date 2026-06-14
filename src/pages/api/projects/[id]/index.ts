import type { APIRoute } from 'astro';
import { getProjectById, deleteProject, updateProject } from '../../../../lib/db/queries';

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const body = await request.json();
  const { name, description } = body;

  if (name !== undefined && !name.trim()) {
    return new Response(JSON.stringify({ error: 'Nama project tidak boleh kosong' }), { status: 400 });
  }

  await updateProject(params.id!, {
    name: name?.trim() ?? project.name,
    description: description !== undefined ? description?.trim() ?? null : project.description,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const project = await getProjectById(params.id!, locals.user.id);
  if (!project) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  await deleteProject(params.id!, locals.user.id);
  return new Response(null, { status: 204 });
};
