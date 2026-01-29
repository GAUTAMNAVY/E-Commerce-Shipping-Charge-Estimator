import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Determine transport mode based on distance
function getTransportMode(distance: number): { mode: string; rate: number } {
  if (distance >= 500) {
    return { mode: 'Aeroplane', rate: 1.0 };
  } else if (distance >= 100) {
    return { mode: 'Truck', rate: 2.0 };
  } else {
    return { mode: 'Mini Van', rate: 3.0 };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    let warehouseId: string | null = null;
    let customerId: string | null = null;
    let deliverySpeed: string | null = null;
    let productId: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json();
      warehouseId = body.warehouseId;
      customerId = body.customerId;
      deliverySpeed = body.deliverySpeed || 'standard';
      productId = body.productId;
    } else {
      const url = new URL(req.url);
      warehouseId = url.searchParams.get('warehouseId');
      customerId = url.searchParams.get('customerId');
      deliverySpeed = url.searchParams.get('deliverySpeed') || 'standard';
      productId = url.searchParams.get('productId');
    }

    // Validate required parameters
    if (!warehouseId || !customerId) {
      return new Response(
        JSON.stringify({ error: 'warehouseId and customerId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate delivery speed
    if (deliverySpeed !== 'standard' && deliverySpeed !== 'express') {
      return new Response(
        JSON.stringify({ error: 'deliverySpeed must be "standard" or "express"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch warehouse
    const { data: warehouse, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, name, latitude, longitude')
      .eq('id', warehouseId)
      .single();

    if (warehouseError || !warehouse) {
      console.error('Warehouse not found:', warehouseError);
      return new Response(
        JSON.stringify({ error: 'Warehouse not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, latitude, longitude')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      console.error('Customer not found:', customerError);
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch delivery speed config
    const { data: deliveryConfig, error: deliveryError } = await supabase
      .from('delivery_speeds')
      .select('*')
      .eq('speed_type', deliverySpeed)
      .single();

    if (deliveryError || !deliveryConfig) {
      console.error('Delivery speed config not found:', deliveryError);
      return new Response(
        JSON.stringify({ error: 'Delivery speed configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate distance
    const distance = calculateDistance(
      warehouse.latitude,
      warehouse.longitude,
      customer.latitude,
      customer.longitude
    );

    // Get transport mode and rate
    const { mode, rate } = getTransportMode(distance);

    // Get product weight if provided, default to 1kg
    let weightKg = 1;
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('weight_kg')
        .eq('id', productId)
        .single();
      
      if (product) {
        weightKg = product.weight_kg;
      }
    }

    // Calculate charges
    const baseCharge = Number(deliveryConfig.base_charge);
    const transportCharge = distance * rate * weightKg;
    const expressCharge = deliverySpeed === 'express' 
      ? Number(deliveryConfig.extra_charge_per_kg) * weightKg 
      : 0;
    
    const totalCharge = baseCharge + transportCharge + expressCharge;

    console.log(`Shipping charge calculated: ${totalCharge.toFixed(2)} Rs (${mode}, ${distance.toFixed(2)} km, ${weightKg} kg)`);

    const response = {
      shippingCharge: Math.round(totalCharge * 100) / 100,
      transportMode: mode,
      distance_km: Math.round(distance * 100) / 100,
      weight_kg: weightKg,
      breakdown: {
        baseCharge: baseCharge,
        transportCharge: Math.round(transportCharge * 100) / 100,
        expressCharge: Math.round(expressCharge * 100) / 100
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shipping-charge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
