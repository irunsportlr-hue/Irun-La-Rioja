import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar preflight requests de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let preferenceBody;
  try {
    const { orderId, items, customer, returnUrl } = await req.json();
    const baseUrl = returnUrl || req.headers.get('origin') || 'http://localhost:5173';

    // Validar token de Mercado Pago
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error("MP_ACCESS_TOKEN no está configurado en las variables de entorno");
    }

    // Inicializar SDK de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const preference = new Preference(client);

    // Formatear items para Mercado Pago
    const mpItems = items.map((item: any) => ({
      id: item.product.id || 'item',
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price),
      currency_id: 'ARS',
    }));

    preferenceBody = {
      items: mpItems,
      payer: {
        name: customer.nombre,
        email: customer.email,
        phone: { number: customer.telefono },
        address: { street_name: customer.direccion }
      },
      payment_methods: {
        installments: 3, // Máximo de cuotas permitidas
        default_installments: 1
      },
      external_reference: orderId.toString(),
      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/checkout`,
        pending: `${baseUrl}/success`
      }
    };

    console.log("Creating preference with body:", JSON.stringify(preferenceBody));

    const result = await preference.create({
      body: preferenceBody
    });

    return new Response(
      JSON.stringify({ id: result.id, init_point: result.init_point }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error creating preference:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: error.cause || error, payload: preferenceBody ?? null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
