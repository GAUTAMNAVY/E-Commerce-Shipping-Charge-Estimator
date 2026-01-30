/**
 * GET /api/v1/warehouse/nearest
 * Find the nearest warehouse for a seller to drop off products
 * 
 * Supports both GET and POST methods
 * Required parameters: sellerId
 * Optional parameters: productId (for future use)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ShippingService } from "../_shared/shipping-service.ts";
import { validateUUID, validateRequired, createValidationErrorResponse, ValidationException } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const shippingService = new ShippingService(supabase);

    // Parse request parameters (support both GET and POST)
    let sellerId: string | null = null;
    let productId: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        sellerId = body.sellerId;
        productId = body.productId;
      } catch {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON in request body',
            hint: 'Ensure your request body is valid JSON'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      sellerId = url.searchParams.get('sellerId');
      productId = url.searchParams.get('productId');
    } else {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
          hint: 'This endpoint supports GET and POST methods',
          allowedMethods: ['GET', 'POST']
        }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, POST' } }
      );
    }

    // Validate required parameters
    try {
      validateRequired({ sellerId });
      if (sellerId) {
        validateUUID(sellerId, 'sellerId');
      }
      if (productId) {
        validateUUID(productId, 'productId');
      }
    } catch (error) {
      const validationError = createValidationErrorResponse(error);
      return new Response(
        JSON.stringify({
          ...validationError,
          hint: 'Provide a valid sellerId UUID parameter'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find nearest warehouse using service layer
    const result = await shippingService.findNearestWarehouse(sellerId!);

    const responseTime = Date.now() - startTime;
    console.log(`✓ Nearest warehouse found for seller ${sellerId}: ${result.warehouseName} - ${responseTime}ms`);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`
        }
      }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('✗ Error in nearest-warehouse function:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return new Response(
      JSON.stringify({
        error: statusCode === 404 ? 'Resource not found' : 'Internal server error',
        message: errorMessage,
        hint: statusCode === 404
          ? 'Verify that the sellerId exists in the database'
          : 'Please try again later or contact support if the issue persists'
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`
        }
      }
    );
  }
});
