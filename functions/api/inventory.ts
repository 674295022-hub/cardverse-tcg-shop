interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const search = url.searchParams.get('q');
    const setCode = url.searchParams.get('set');
    const condition = url.searchParams.get('condition');

    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR card_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (setCode) {
      query += ' AND set_code = ?';
      params.push(setCode);
    }
    if (condition) {
      query += ' AND condition = ?';
      params.push(condition);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify({ success: true, data: results }), {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;

    const id = body.id || `sku-${Date.now()}`;
    const card_id = body.card_id || 'unknown';
    const name = body.name || 'Custom Card';
    const set_code = body.set_code || 'PROMO';
    const rarity = body.rarity || 'Common';
    const condition = body.condition || 'NM';
    const language = body.language || 'JP';
    const is_graded = body.is_graded ? 1 : 0;
    const grading_company = body.grading_company || null;
    const grade_number = body.grade_number || null;
    const cert_number = body.cert_number || null;
    const price = Number(body.price) || 100;
    const status = body.status || 'AVAILABLE';
    const image_url = body.image_url || null;

    await env.DB.prepare(`
      INSERT INTO inventory (id, card_id, name, set_code, rarity, condition, language, is_graded, grading_company, grade_number, cert_number, price, status, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, card_id, name, set_code, rarity, condition, language,
      is_graded, grading_company, grade_number, cert_number, price, status, image_url
    ).run();

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
