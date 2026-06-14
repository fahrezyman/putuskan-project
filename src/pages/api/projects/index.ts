import type { APIRoute } from 'astro';
import { createProject, getProjectsByUser } from '../../../lib/db/queries';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const projects = await getProjectsByUser(locals.user.id);
  return new Response(JSON.stringify(projects), { status: 200 });
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return new Response(JSON.stringify({ error: 'Nama project wajib diisi' }), { status: 400 });
  }

  const id = await createProject(locals.user.id, name.trim(), description?.trim() ?? '');
  return new Response(JSON.stringify({ id }), { status: 201 });
};
