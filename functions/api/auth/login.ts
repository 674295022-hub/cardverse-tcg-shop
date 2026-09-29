interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      email?: string;
      password?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find user in D1
    const user = await env.DB.prepare('SELECT id, email, name, avatar_url, role, store_credit, password_hash FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; name: string; avatar_url: string; role: string; store_credit: number; password_hash?: string }>();

    if (!user) {
      return new Response(JSON.stringify({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อน' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password (if registered with password)
    if (user.password_hash && user.password_hash !== password) {
      return new Response(JSON.stringify({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ensure seree999@gmail.com has ADMIN role
    const effectiveRole = email === 'seree999@gmail.com' ? 'ADMIN' : user.role;

    const returnUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: effectiveRole,
      store_credit: user.store_credit,
    };

    return new Response(JSON.stringify({ success: true, user: returnUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
