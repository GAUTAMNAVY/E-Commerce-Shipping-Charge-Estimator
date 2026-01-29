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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body or query params
    let sellerId: string | null = null;
    let productId: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json();
      sellerId = body.sellerId;
      productId = body.productId;
    } else {
      const url = new URL(req.url);
      sellerId = url.searchParams.get('sellerId');
      productId = url.searchParams.get('productId');
    }

    // Validate required parameters
    if (!sellerId) {
      return new Response(
        JSON.stringify({ error: 'sellerId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch seller location
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, name, latitude, longitude')
      .eq('id', sellerId)
      .single();

    if (sellerError || !seller) {
      console.error('Seller not found:', sellerError);
      return new Response(
        JSON.stringify({ error: 'Seller not found', details: sellerError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all active warehouses
    const { data: warehouses, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id, name, latitude, longitude, city')
      .eq('is_active', true);

    if (warehouseError || !warehouses || warehouses.length === 0) {
      console.error('No warehouses found:', warehouseError);
      return new Response(
        JSON.stringify({ error: 'No active warehouses available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find nearest warehouse
    let nearestWarehouse = null;
    let minDistance = Infinity;

    for (const warehouse of warehouses) {
      const distance = calculateDistance(
        seller.latitude,
        seller.longitude,
        warehouse.latitude,
        warehouse.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWarehouse = warehouse;
      }
    }

    if (!nearestWarehouse) {
      return new Response(
        JSON.stringify({ error: 'Could not determine nearest warehouse' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Nearest warehouse for seller ${sellerId}: ${nearestWarehouse.name} (${minDistance.toFixed(2)} km)`);

    const response = {
      warehouseId: nearestWarehouse.id,
      warehouseLocation: {
        lat: nearestWarehouse.latitude,
        long: nearestWarehouse.longitude
      },
      warehouseName: nearestWarehouse.name,
      distance_km: Math.round(minDistance * 100) / 100
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nearest-warehouse function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
