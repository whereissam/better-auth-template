/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Pages Function — proxy all /api/* requests to the backend Worker.
 * This keeps cookies on the same domain so auth sessions work correctly.
 */
interface Env {
  BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context: EventContext<Env, string, unknown>) => {
  const backendUrl = context.env.BACKEND_URL;
  if (!backendUrl) {
    return new Response("Missing BACKEND_URL Pages environment variable", { status: 500 });
  }

  const url = new URL(context.request.url);
  const target = new URL(url.pathname + url.search, backendUrl);

  const headers = new Headers(context.request.headers);
  headers.set("X-Forwarded-Host", url.hostname);

  const response = await fetch(target.toString(), {
    method: context.request.method,
    headers,
    body: context.request.method !== "GET" && context.request.method !== "HEAD"
      ? context.request.body
      : undefined,
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
