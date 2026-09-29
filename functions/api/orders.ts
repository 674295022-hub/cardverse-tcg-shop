interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    let query = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50';
    let stmt = env.DB.prepare(query);

    if (userId) {
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
      stmt = env.DB.prepare(query).bind(userId);
    }

    const { results } = await stmt.all();

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

    const id = body.id || `ORD-${Date.now()}`;
    const user_id = body.userId || null;
    const customer_name = body.customerName || 'Customer';
    const customer_email = body.customerEmail || 'customer@example.com';
    const customer_phone = body.customerPhone || '';
    const customer_address = body.shippingAddress || '';
    const total_amount = Number(body.totalAmount) || 0;
    const payment_method = body.paymentMethod || 'PromptPay QR';
    const payment_status = body.paymentStatus || 'PAID';
    const items_json = JSON.stringify(body.items || []);

    await env.DB.prepare(`
      INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, payment_status, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, user_id, customer_name, customer_email, customer_phone,
      customer_address, total_amount, payment_method, payment_status, items_json
    ).run();

    return new Response(JSON.stringify({ success: true, orderId: id }), {
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
