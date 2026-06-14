import { auth } from './lib/auth';
import { defineMiddleware } from 'astro:middleware';

const protectedRoutes = ['/dashboard', '/project'];

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  const pathname = new URL(context.request.url).pathname;
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !session?.user) {
    return context.redirect('/login');
  }

  return next();
});
