export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { items, payer } = req.body;
  if (!items || !payer) return res.status(400).json({ error: 'Datos inválidos' });

  const access_token = process.env.MP_ACCESS_TOKEN;
  if (!access_token) {
    return res.status(500).json({ error: 'Access Token no configurado en Vercel' });
  }

  const preference = {
    items: items.map(item => ({
      id:          String(item.codigo),
      title:       String(item.nombre),
      quantity:    parseInt(item.qty),
      unit_price:  parseFloat(item.precio),
      currency_id: 'ARS',
    })),
    payer: {
      name:  payer.nombre,
      email: payer.email,
    },
    back_urls: {
      success: 'https://project-np9c5.vercel.app/tecnofy-app.html',
      failure: 'https://project-np9c5.vercel.app/tecnofy-app.html',
      pending: 'https://project-np9c5.vercel.app/tecnofy-app.html',
    },
    auto_return:          'approved',
    statement_descriptor: 'TECNOFY',
    external_reference:   'TECNOFY-' + Date.now(),
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(preference),
    });

    const text = await mpRes.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { return res.status(500).json({ error: 'Respuesta inválida de MP', raw: text.substring(0,300) }); }

    if (mpRes.ok && data.init_point) {
      return res.status(200).json({ success: true, init_point: data.init_point, id: data.id });
    } else {
      return res.status(500).json({ error: 'Error de MercadoPago', detalle: data });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
}
