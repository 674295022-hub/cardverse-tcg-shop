interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email) {
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email.toLowerCase())
        .first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all users (Admin view)
    const { results } = await env.DB.prepare('SELECT id, email, name, role, store_credit, created_at FROM users ORDER BY created_at DESC').all();

    return new Response(JSON.stringify({ success: true, users: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
