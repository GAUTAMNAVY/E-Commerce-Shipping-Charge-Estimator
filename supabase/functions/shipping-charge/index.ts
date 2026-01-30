/**
 * GET /api/v1/shipping-charge
 * Calculate shipping charge from warehouse to customer
 * 
 * Supports both GET and POST methods
 * Required parameters: warehouseId, customerId
 * Optional parameters: deliverySpeed (default: standard), productId
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ShippingService } from "../_shared/shipping-service.ts";
import {
  validateUUID,
  validateRequired,
  validateDeliverySpeed,
  createValidationErrorResponse
} from "../_shared/validation.ts";

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
    let warehouseId: string | null = null;
    let customerId: string | null = null;
    let deliverySpeed: string = 'standard';
    let productId: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        warehouseId = body.warehouseId;
        customerId = body.customerId;
        deliverySpeed = body.deliverySpeed || 'standard';
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
      warehouseId = url.searchParams.get('warehouseId');
      customerId = url.searchParams.get('customerId');
      deliverySpeed = url.searchParams.get('deliverySpeed') || 'standard';
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
      validateRequired({ warehouseId, customerId });
      if (warehouseId) validateUUID(warehouseId, 'warehouseId');
      if (customerId) validateUUID(customerId, 'customerId');
      if (productId) validateUUID(productId, 'productId');
      validateDeliverySpeed(deliverySpeed);
    } catch (error) {
      const validationError = createValidationErrorResponse(error);
      return new Response(
        JSON.stringify({
          ...validationError,
          hint: 'Provide valid warehouseId, customerId, and deliverySpeed (standard or express)'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate shipping charge using service layer
    const result = await shippingService.calculateShippingCharge(
      warehouseId!,
      customerId!,
      deliverySpeed,
      productId || undefined
    );

    const responseTime = Date.now() - startTime;
    console.log(`✓ Shipping charge calculated: ₹${result.shippingCharge} (${result.transportMode}, ${result.distance_km}km) - ${responseTime}ms`);

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
    console.error('✗ Error in shipping-charge function:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return new Response(
      JSON.stringify({
        error: statusCode === 404 ? 'Resource not found' : 'Internal server error',
        message: errorMessage,
        hint: statusCode === 404
          ? 'Verify that the warehouseId and customerId exist in the database'
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
