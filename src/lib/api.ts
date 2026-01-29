import { supabase } from "@/integrations/supabase/client";
import type { 
  Customer, 
  Seller, 
  Product, 
  Warehouse, 
  ShippingRate, 
  DeliverySpeed,
  NearestWarehouseResponse,
  ShippingChargeResponse,
  CalculateShippingResponse,
  DeliverySpeedType
} from "./types";

// Fetch all entities
export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchSellers(): Promise<Seller[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:sellers(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const { data, error } = await supabase
    .from('shipping_rates')
    .select('*')
    .order('min_distance_km', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function fetchDeliverySpeeds(): Promise<DeliverySpeed[]> {
  const { data, error } = await supabase
    .from('delivery_speeds')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

// API Endpoint Functions
export async function getNearestWarehouse(
  sellerId: string, 
  productId: string
): Promise<NearestWarehouseResponse> {
  const { data, error } = await supabase.functions.invoke('nearest-warehouse', {
    body: { sellerId, productId }
  });
  
  if (error) throw error;
  return data;
}

export async function getShippingCharge(
  warehouseId: string,
  customerId: string,
  deliverySpeed: DeliverySpeedType,
  productId?: string
): Promise<ShippingChargeResponse> {
  const { data, error } = await supabase.functions.invoke('shipping-charge', {
    body: { warehouseId, customerId, deliverySpeed, productId }
  });
  
  if (error) throw error;
  return data;
}

export async function calculateShipping(
  sellerId: string,
  customerId: string,
  deliverySpeed: DeliverySpeedType,
  productId?: string
): Promise<CalculateShippingResponse> {
  const { data, error } = await supabase.functions.invoke('calculate-shipping', {
    body: { sellerId, customerId, deliverySpeed, productId }
  });
  
  if (error) throw error;
  return data;
}
