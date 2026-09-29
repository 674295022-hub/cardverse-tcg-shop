interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      email?: string;
      name?: string;
      avatar_url?: string;
      sub?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || email.split('@')[0] || 'User').trim();
    const avatar_url = body.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;
    const id = body.sub || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Role Assignment: seree999@gmail.com is always ADMIN
    const isAdmin = email === 'seree999@gmail.com';
    const assignedRole = isAdmin ? 'ADMIN' : 'CUSTOMER';

    // Check existing user in D1
    const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; name: string; avatar_url: string; role: string; store_credit: number }>();

    let user;
    if (existing) {
      // If seree999@gmail.com, guarantee role is ADMIN
      const effectiveRole = isAdmin ? 'ADMIN' : existing.role;
      await env.DB.prepare(`
        UPDATE users 
        SET name = ?, avatar_url = ?, role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).bind(name, avatar_url, effectiveRole, email).run();

      user = {
        ...existing,
        name,
        avatar_url,
        role: effectiveRole,
      };
    } else {
      // New user
      const initialStoreCredit = isAdmin ? 10000.0 : 0.0;
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, avatar_url, role, store_credit)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, email, name, avatar_url, assignedRole, initialStoreCredit).run();

      user = {
        id,
        email,
        name,
        avatar_url,
        role: assignedRole,
        store_credit: initialStoreCredit,
      };
    }

    return new Response(JSON.stringify({ success: true, user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
