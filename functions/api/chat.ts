interface Env {
  DB: D1Database;
  AI?: any;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as {
      messages?: { role: string; content: string }[];
      message?: string;
    };

    const userMessage = (body.message || (body.messages && body.messages[body.messages.length - 1]?.content) || '').trim();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'กรุณาส่งข้อความคำถาม' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. ดึงข้อมูลสินค้าล่าสุดจาก D1 Database มาทำเป็น Context
    let inventorySummary = '';
    try {
      const { results } = await env.DB.prepare(
        'SELECT name, set_code, rarity, condition, price, status FROM inventory WHERE status != "SOLD" LIMIT 15'
      ).all();

      if (results && results.length > 0) {
        inventorySummary = results
          .map((r: any) => `- ${r.name} (${r.set_code}) [${r.rarity}] สภาพ: ${r.condition} ราคา: ฿${Number(r.price).toLocaleString()} (สถานะ: ${r.status})`)
          .join('\n');
      }
    } catch (e) {
      console.warn('Failed to fetch inventory from D1:', e);
    }

    // 2. กำหนด System Prompt ให้ AI เป็นผู้เชี่ยวชาญ TCG ประจำร้าน CardVerse
    const systemPrompt = `คุณคือ "CardBot" ผู้ช่วย AI อัจฉริยะประจำร้าน CardVerse TCG Shop
หน้าที่ของคุณ:
1. ให้คำแนะนำเกี่ยวกับการ์ดโปเกมอน (Pokémon TCG) และการ์ดวันพีช (One Piece Card Game)
2. แนะนำสภาพการ์ด: PSA 10 (สมบูรณ์แบบ), NM (Near Mint 95-99%), LP (มีรอยขนแมวเล็กน้อย), MP (มีรอยปานกลาง), DMG (ชำรุด)
3. อธิบายกฎร้าน:
   - มีระบบล็อกสต็อกการ์ด 15 นาทีระหว่างกดชำระเงิน ป้องกันสินค้าชนกัน
   - รับซื้อการ์ดผ่านระบบ Buy-list หากรับเป็น Store Credit จะได้รับโบนัสเพิ่ม +10%
   - สิทธิ์แอดมินคือ seree999@gmail.com
4. รายการสินค้าเด่นในสต็อกปัจจุบันของร้าน:
${inventorySummary || '- Monkey D. Luffy (Gear 5 Manga Rare) PSA 10 ราคา ฿120,000\n- Charizard ex SAR (SV4a) NM ราคา ฿5,400\n- Pikachu with Grey Felt Hat PSA 10 ราคา ฿18,500'}

แนวทางการตอบ:
- ตอบด้วยภาษาไทยที่สุภาพ เป็นมิตร และกระชับ ตรงประเด็น
- หากถามหาสินค้า ให้แนะนำจากรายการสต็อกข้างต้น
- ไม่ตอบเรื่องที่ไม่เกี่ยวกับ TCG หรือร้านค้า`;

    // 3. ตรวจสอบว่ามี Cloudflare Workers AI Binding หรือไม่
    if (env.AI) {
      try {
        const aiMessages: Message[] = [
          { role: 'system', content: systemPrompt }
        ];

        if (body.messages && Array.isArray(body.messages)) {
          body.messages.slice(-5).forEach(m => {
            if (m.role === 'user' || m.role === 'assistant') {
              aiMessages.push({ role: m.role as any, content: m.content });
            }
          });
        } else {
          aiMessages.push({ role: 'user', content: userMessage });
        }

        // เรียกใช้โมเดล Llama 3.1 8B บน Cloudflare Workers AI
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: aiMessages,
          max_tokens: 512,
          temperature: 0.7,
        });

        const replyText = aiResponse.response || aiResponse.text || 'ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้';

        return new Response(JSON.stringify({
          success: true,
          reply: replyText,
          source: 'cloudflare-workers-ai'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (aiErr: any) {
        console.error('Workers AI execution error:', aiErr);
      }
    }

    // 4. Fallback Rule-Based Engine (หากยังไม่ได้เปิด Workers AI บน Dashboard หรือ Token ยังไม่พร้อม)
    const lower = userMessage.toLowerCase();
    let fallbackReply = '';

    if (lower.includes('สต็อก') || lower.includes('มีอะไร') || lower.includes('ขาย') || lower.includes('การ์ด')) {
      fallbackReply = `สวัสดีครับ! ปัจจุบันร้าน CardVerse ของเรามีสินค้าเด่นในสต็อกดังนี้ครับ:\n${inventorySummary || '- Monkey D. Luffy Gear 5 Manga Rare (PSA 10) ฿120,000\n- Charizard ex SAR (NM) ฿5,400\n- Pikachu Van Gogh (PSA 10) ฿18,500'}\n\nคุณลูกค้าสามารถคลิกดูรูปถ่ายสภาพจริง 4 มุมหรือกดสั่งซื้อที่หน้าเว็บได้เลยครับ!`;
    } else if (lower.includes('สภาพ') || lower.includes('เกรด') || lower.includes('psa') || lower.includes('nm')) {
      fallbackReply = `ระดับสภาพการ์ดของร้าน CardVerse มีมาตรฐานดังนี้ครับ:\n- PSA 10 / BGS 9.5: การ์ดแท้ในกรอบเกรด สภาพกริบ 100%\n- Near Mint (NM): สภาพสะสม 95-99% ไร้ตำหนิหรือมีรอยจางมากๆ\n- Lightly Played (LP): มีรอยขนแมวขอบขาวเล็กน้อย\n- Moderately Played (MP): มีรอยเล่นปานกลาง\nเราถ่ายรูปการ์ดจริงคมชัด 4 มุมให้ตรวจสอบก่อนตัดสินใจซื้อครับ!`;
    } else if (lower.includes('ล็อก') || lower.includes('จอง') || lower.includes('15')) {
      fallbackReply = `ระบบของเรามีฟีเจอร์ "ล็อกสต็อก 15 นาที" ครับ! เมื่อคุณกดดำเนินการชำระเงิน การ์ดใบนั้นจะถูกล็อกไว้ให้คุณทันที 15:00 นาที เพื่อป้องกันไม่ให้มีผู้อื่นสั่งซื้อชนกันครับ`;
    } else if (lower.includes('รับซื้อ') || lower.includes('ขายการ์ด') || lower.includes('buylist') || lower.includes('buy-list')) {
      fallbackReply = `ทางร้านมีระบบ Buy-list รับซื้อการ์ดสะสมครับ! พิเศษสุดหากคุณลูกค้าเลือกรับเงินเป็น "Store Credit" จะได้รับโบนัสเพิ่มทันที +10% จากราคาประเมินครับ`;
    } else if (lower.includes('แอดมิน') || lower.includes('ติดต่อ') || lower.includes('เจ้าของ')) {
      fallbackReply = `คุณสามารถติดต่อทีมงานหรือผู้ดูแลระบบได้ที่อีเมล seree999@gmail.com หรือเข้าสู่ระบบด้วยบัญชีเพื่อจัดการข้อมูลได้ทันทีครับ`;
    } else {
      fallbackReply = `สวัสดีครับ! ผม CardBot ผู้ช่วยประจำร้าน CardVerse TCG ยินดีให้บริการครับ คุณสามารถสอบถามสต็อกการ์ด, เช็คราคาสภาพการ์ด (PSA 10 / NM), ระบบล็อกสต็อก 15 นาที หรือสอบถามการรับซื้อการ์ดได้เลยครับ!`;
    }

    return new Response(JSON.stringify({
      success: true,
      reply: fallbackReply,
      source: 'smart-fallback-engine'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
