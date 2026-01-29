export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  created_at: string;
}

export interface Seller {
  id: string;
  name: string;
  phone_number?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  selling_price: number;
  weight_kg: number;
  dimension_length_cm: number;
  dimension_width_cm: number;
  dimension_height_cm: number;
  description?: string;
  category?: string;
  created_at: string;
  seller?: Seller;
}

export interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  capacity_kg?: number;
  is_active: boolean;
  created_at: string;
}

export interface ShippingRate {
  id: string;
  transport_mode: string;
  min_distance_km: number;
  max_distance_km?: number;
  rate_per_km_per_kg: number;
  description?: string;
  created_at: string;
}

export interface DeliverySpeed {
  id: string;
  speed_type: string;
  base_charge: number;
  extra_charge_per_kg: number;
  description?: string;
  created_at: string;
}

export interface NearestWarehouseResponse {
  warehouseId: string;
  warehouseLocation: {
    lat: number;
    long: number;
  };
  warehouseName: string;
  distance_km: number;
}

export interface ShippingChargeResponse {
  shippingCharge: number;
  transportMode: string;
  distance_km: number;
  weight_kg?: number;
  breakdown?: {
    baseCharge: number;
    transportCharge: number;
    expressCharge: number;
  };
}

export interface CalculateShippingResponse {
  shippingCharge: number;
  nearestWarehouse: {
    warehouseId: string;
    warehouseLocation: {
      lat: number;
      long: number;
    };
    warehouseName: string;
  };
  transportMode: string;
  distance_km: number;
  weight_kg: number;
  breakdown: {
    baseCharge: number;
    transportCharge: number;
    expressCharge: number;
  };
}

export type DeliverySpeedType = 'standard' | 'express';
