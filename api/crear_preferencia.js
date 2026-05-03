bash

cat /home/claude/tecnofy-backend/api/crear_preferencia.js
Salida

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { items, payer } = req.body;

  if (!items || !payer) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  // Access Token desde variable de entorno (la configurás en Vercel)
  const access_token = process.env.MP_ACCESS_TOKEN;

  const preference = {
    items: items.map(item => ({
      id:          item.codigo,
      title:       item.nombre,
      quantity:    parseInt(item.qty),
      unit_price:  parseFloat(item.precio),
      currency_id: 'ARS',
    })),
    payer: {
      name:  payer.nombre,
      email: payer.email,
      phone: { number: payer.telefono || '' },
    },
    back_urls: {
      success: 'https://www.tecnofy.com.ar',
      failure: 'https://www.tecnofy.com.ar',
      pending: 'https://www.tecnofy.com.ar',
    },
    auto_return:          'approved',
    statement_descriptor: 'TECNOFY',
    external_reference:   'TECNOFY-' + Date.now(),
  };

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (response.ok && data.init_point) {
      return res.status(200).json({
        success:    true,
        init_point: data.init_point,
        id:         data.id,
      });
    } else {
      console.error('Error MP:', data);
      return res.status(500).json({ error: 'Error MercadoPago', detalle: data });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
}
Listo
Pegá ese código completo en el editor de GitHub.

4. Hacé clic en "Commit changes" → "Commit changes"

Esto va a crear la carpeta api con el archivo adentro y Vercel va a deployar automáticamente. Mandame captura cuando esté listo 📸


