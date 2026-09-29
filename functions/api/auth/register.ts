interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const name = (body.name || email.split('@')[0] || 'Member').trim();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกอีเมลให้ถูกต้อง' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user already exists
    const existing = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string }>();

    if (existing) {
      return new Response(JSON.stringify({ error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Role assignment: seree999@gmail.com is ADMIN
    const isAdmin = email === 'seree999@gmail.com';
    const role = isAdmin ? 'ADMIN' : 'CUSTOMER';
    const store_credit = isAdmin ? 10000.0 : 0.0;
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    // Insert new user into D1
    await env.DB.prepare(`
      INSERT INTO users (id, email, name, avatar_url, role, store_credit, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, email, name, avatar_url, role, store_credit, password).run();

    const newUser = {
      id,
      email,
      name,
      avatar_url,
      role,
      store_credit,
    };

    return new Response(JSON.stringify({ success: true, user: newUser, message: 'สมัครสมาชิกสำเร็จ' }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
