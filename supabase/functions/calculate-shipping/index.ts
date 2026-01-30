/**
 * POST /api/v1/shipping-charge/calculate
 * Calculate complete shipping from seller to customer
 * Combines nearest warehouse lookup and shipping charge calculation
 * 
 * Only supports POST method
 * Required parameters: sellerId, customerId
 * Optional parameters: deliverySpeed (default: standard), productId
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
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

  // Enforce POST-only endpoint
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        hint: 'This endpoint only accepts POST requests',
        allowedMethods: ['POST']
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST' } }
    );
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

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
          hint: 'Ensure your request body is valid JSON with sellerId and customerId'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sellerId, customerId, deliverySpeed = 'standard', productId } = body;

    // Validate required parameters
    try {
      validateRequired({ sellerId, customerId });
      validateUUID(sellerId, 'sellerId');
      validateUUID(customerId, 'customerId');
      if (productId) validateUUID(productId, 'productId');
      validateDeliverySpeed(deliverySpeed);
    } catch (error) {
      const validationError = createValidationErrorResponse(error);
      return new Response(
        JSON.stringify({
          ...validationError,
          hint: 'Provide valid sellerId, customerId, and optional deliverySpeed (standard or express)'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate complete shipping using service layer
    const result = await shippingService.calculateCompleteShipping(
      sellerId,
      customerId,
      deliverySpeed,
      productId || undefined
    );

    const responseTime = Date.now() - startTime;
    console.log(`✓ Complete shipping calculated: Seller ${sellerId} → Warehouse ${result.nearestWarehouse.warehouseName} → Customer ${customerId}`);
    console.log(`  Distance: ${result.distance_km}km, Mode: ${result.transportMode}, Charge: ₹${result.shippingCharge} - ${responseTime}ms`);

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
    console.error('✗ Error in calculate-shipping function:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return new Response(
      JSON.stringify({
        error: statusCode === 404 ? 'Resource not found' : 'Internal server error',
        message: errorMessage,
        hint: statusCode === 404
          ? 'Verify that the sellerId and customerId exist in the database'
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
