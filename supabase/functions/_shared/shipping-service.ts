/**
 * Shipping Service Layer
 * 
 * Implements core business logic for B2B e-commerce shipping calculations.
 * This service layer separates concerns between API handlers and business rules,
 * providing a clean interface for shipping-related operations.
 * 
 * Key Features:
 * - Finds nearest warehouse to a seller's location
 * - Calculates shipping charges with transport mode selection
 * - Combines warehouse lookup with shipping calculation
 * - Implements caching for performance optimization
 * - Validates coordinates and handles edge cases
 * 
 * @module shipping-service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { calculateDistance } from './distance-calculator.ts';
import { createTransportModeSelector } from './transport-strategy.ts';
import { cache, CacheKeyBuilder } from './cache-manager.ts';
import {
    NoWarehousesFoundError,
    UnsupportedLocationError,
    ResourceNotFoundError,
    logError
} from './error-handler.ts';
import { validateCoordinates } from './validation.ts';

export interface Warehouse {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    city?: string;
}

export interface Seller {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface Customer {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface Product {
    id: string;
    weight_kg: number;
}

export interface DeliverySpeedConfig {
    speed_type: string;
    base_charge: number;
    extra_charge_per_kg: number;
}

export interface NearestWarehouseResult {
    warehouseId: string;
    warehouseLocation: {
        lat: number;
        long: number;
    };
    warehouseName: string;
    distance_km: number;
}

export interface ShippingChargeResult {
    shippingCharge: number;
    transportMode: string;
    distance_km: number;
    weight_kg: number;
    breakdown: {
        baseCharge: number;
        transportCharge: number;
        expressCharge: number;
    };
}

/**
 * Service class for shipping-related operations
 */
export class ShippingService {
    private supabase: SupabaseClient;
    private transportSelector = createTransportModeSelector();

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    /**
     * Find the nearest warehouse to a seller's location
     * 
     * This method queries all active warehouses and calculates the distance
     * from the seller's location to each warehouse using the Haversine formula.
     * Results are cached for 5 minutes to improve performance.
     * 
     * @param sellerId - Seller UUID to find nearest warehouse for
     * @returns Promise resolving to nearest warehouse information with distance
     * @throws {ResourceNotFoundError} If seller is not found
     * @throws {NoWarehousesFoundError} If no active warehouses exist
     * @throws {UnsupportedLocationError} If coordinates are invalid
     * 
     * @example
     * const result = await service.findNearestWarehouse('550e8400-e29b-41d4-a716-446655440001');
     * console.log(result.warehouseName); // "BLR_Warehouse"
     * console.log(result.distance_km);   // 15.32
     */
    async findNearestWarehouse(sellerId: string): Promise<NearestWarehouseResult> {
        // Check cache first
        const cacheKey = CacheKeyBuilder.nearestWarehouse(sellerId);
        const cached = cache.get<NearestWarehouseResult>(cacheKey);
        if (cached) {
            console.log(`Cache hit for nearest warehouse: seller ${sellerId}`);
            return cached;
        }

        // Fetch seller from database
        const { data: seller, error: sellerError } = await this.supabase
            .from('sellers')
            .select('id, name, latitude, longitude')
            .eq('id', sellerId)
            .single();

        if (sellerError || !seller) {
            const error = new ResourceNotFoundError('Seller', sellerId, { originalError: sellerError?.message });
            logError(error, { sellerId });
            throw error;
        }

        // Validate seller coordinates are within valid geographic ranges
        try {
            validateCoordinates(seller.latitude, seller.longitude, 'seller.');
        } catch (validationError) {
            const error = new UnsupportedLocationError(
                `Invalid seller coordinates: latitude ${seller.latitude}, longitude ${seller.longitude}`,
                { sellerId, latitude: seller.latitude, longitude: seller.longitude }
            );
            logError(error, { sellerId });
            throw error;
        }

        // Fetch all active warehouses from database
        const { data: warehouses, error: warehouseError } = await this.supabase
            .from('warehouses')
            .select('id, name, latitude, longitude, city')
            .eq('is_active', true);

        // Handle database query error
        if (warehouseError) {
            const error = new Error(`Database error fetching warehouses: ${warehouseError.message}`);
            logError(error, { sellerId, dbError: warehouseError });
            throw error;
        }

        // Check if any active warehouses exist - this is a critical edge case
        if (!warehouses || warehouses.length === 0) {
            const error = new NoWarehousesFoundError({ sellerId });
            logError(error, { sellerId });
            throw error;
        }

        // Find nearest warehouse
        let nearestWarehouse: Warehouse | null = null;
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
            throw new Error('Could not determine nearest warehouse');
        }

        const result: NearestWarehouseResult = {
            warehouseId: nearestWarehouse.id,
            warehouseLocation: {
                lat: nearestWarehouse.latitude,
                long: nearestWarehouse.longitude,
            },
            warehouseName: nearestWarehouse.name,
            distance_km: Math.round(minDistance * 100) / 100,
        };

        // Cache the result for 5 minutes
        cache.set(cacheKey, result, 300000);

        return result;
    }

    /**
     * Calculate shipping charge from warehouse to customer
     * 
     * Calculates the total shipping cost including base charge, transport charge
     * (based on distance and weight), and express delivery surcharge if applicable.
     * Uses the Strategy pattern for transport mode selection based on distance.
     * Results are cached for 2 minutes.
     * 
     * @param warehouseId - Warehouse UUID
     * @param customerId - Customer UUID  
     * @param deliverySpeed - Delivery speed: 'standard' or 'express'
     * @param productId - Optional product UUID (if provided, uses actual weight; otherwise defaults to 1kg)
     * @returns Promise resolving to shipping charge breakdown with transport mode
     * @throws {ResourceNotFoundError} If warehouse, customer, or product not found
     * @throws {UnsupportedLocationError} If coordinates are invalid
     * @throws {Error} If delivery speed configuration not found
     * 
     * @example
     * const result = await service.calculateShippingCharge(
     *   '770e8400-e29b-41d4-a716-446655440001',
     *   '550e8400-e29b-41d4-a716-446655440001',
     *   'express',
     *   '880e8400-e29b-41d4-a716-446655440004'
     * );
     * console.log(result.shippingCharge); // 156.50
     * console.log(result.transportMode);   // "Mini Van"
     */
    async calculateShippingCharge(
        warehouseId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ): Promise<ShippingChargeResult> {
        // Check cache
        const cacheKey = CacheKeyBuilder.shippingCharge(
            warehouseId,
            customerId,
            deliverySpeed,
            productId
        );
        const cached = cache.get<ShippingChargeResult>(cacheKey);
        if (cached) {
            console.log(`Cache hit for shipping charge calculation`);
            return cached;
        }

        // Fetch warehouse from database
        const { data: warehouse, error: warehouseError } = await this.supabase
            .from('warehouses')
            .select('id, name, latitude, longitude')
            .eq('id', warehouseId)
            .single();

        if (warehouseError || !warehouse) {
            const error = new ResourceNotFoundError('Warehouse', warehouseId, { originalError: warehouseError?.message });
            logError(error, { warehouseId });
            throw error;
        }

        // Validate warehouse coordinates
        try {
            validateCoordinates(warehouse.latitude, warehouse.longitude, 'warehouse.');
        } catch (validationError) {
            const error = new UnsupportedLocationError(
                `Invalid warehouse coordinates: latitude ${warehouse.latitude}, longitude ${warehouse.longitude}`,
                { warehouseId, latitude: warehouse.latitude, longitude: warehouse.longitude }
            );
            logError(error, { warehouseId });
            throw error;
        }

        // Fetch customer from database
        const { data: customer, error: customerError } = await this.supabase
            .from('customers')
            .select('id, name, latitude, longitude')
            .eq('id', customerId)
            .single();

        if (customerError || !customer) {
            const error = new ResourceNotFoundError('Customer', customerId, { originalError: customerError?.message });
            logError(error, { customerId });
            throw error;
        }

        // Validate customer coordinates
        try {
            validateCoordinates(customer.latitude, customer.longitude, 'customer.');
        } catch (validationError) {
            const error = new UnsupportedLocationError(
                `Invalid customer coordinates: latitude ${customer.latitude}, longitude ${customer.longitude}`,
                { customerId, latitude: customer.latitude, longitude: customer.longitude }
            );
            logError(error, { customerId });
            throw error;
        }

        // Fetch delivery speed config
        const { data: deliveryConfig, error: deliveryError } = await this.supabase
            .from('delivery_speeds')
            .select('*')
            .eq('speed_type', deliverySpeed)
            .single();

        if (deliveryError || !deliveryConfig) {
            throw new Error(`Delivery speed configuration not found: ${deliverySpeed}`);
        }

        // Get product weight if provided
        let weightKg = 1;
        if (productId) {
            const { data: product } = await this.supabase
                .from('products')
                .select('weight_kg')
                .eq('id', productId)
                .single();

            if (product) {
                weightKg = product.weight_kg;
            }
        }

        // Calculate distance
        const distance = calculateDistance(
            warehouse.latitude,
            warehouse.longitude,
            customer.latitude,
            customer.longitude
        );

        // Get transport mode and rate using Strategy pattern
        const { mode, rate } = this.transportSelector.getTransportModeAndRate(distance);

        // Calculate charges
        const baseCharge = Number(deliveryConfig.base_charge);
        const transportCharge = distance * rate * weightKg;
        const expressCharge =
            deliverySpeed === 'express'
                ? Number(deliveryConfig.extra_charge_per_kg) * weightKg
                : 0;

        const totalCharge = baseCharge + transportCharge + expressCharge;

        const result: ShippingChargeResult = {
            shippingCharge: Math.round(totalCharge * 100) / 100,
            transportMode: mode,
            distance_km: Math.round(distance * 100) / 100,
            weight_kg: weightKg,
            breakdown: {
                baseCharge: baseCharge,
                transportCharge: Math.round(transportCharge * 100) / 100,
                expressCharge: Math.round(expressCharge * 100) / 100,
            },
        };

        // Cache for 2 minutes
        cache.set(cacheKey, result, 120000);

        return result;
    }

    /**
     * Calculate complete shipping cost from seller to customer
     * 
     * This is the main orchestration method that combines two operations:
     * 1. Finds the nearest warehouse to the seller
     * 2. Calculates shipping cost from that warehouse to the customer
     * 
     * Results are cached for 2 minutes to improve performance for repeated queries.
     * 
     * @param sellerId - Seller UUID
     * @param customerId - Customer UUID
     * @param deliverySpeed - Delivery speed: 'standard' or 'express'
     * @param productId - Optional product UUID for actual weight calculation
     * @returns Promise resolving to complete shipping details including nearest warehouse and cost breakdown
     * @throws {ResourceNotFoundError} If seller, customer, warehouse, or product not found
     * @throws {NoWarehousesFoundError} If no active warehouses exist
     * @throws {UnsupportedLocationError} If any coordinates are invalid
     * 
     * @example
     * const result = await service.calculateCompleteShipping(
     *   '660e8400-e29b-41d4-a716-446655440001', // Nestle Seller
     *   '550e8400-e29b-41d4-a716-446655440001', // Shree Kirana Store
     *   'standard'
     * );
     * console.log(result.nearestWarehouse.warehouseName); // "MUMB_Warehouse"
     * console.log(result.shippingCharge); // 125.75
     */
    async calculateCompleteShipping(
        sellerId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ) {
        // Check cache
        const cacheKey = CacheKeyBuilder.calculation(
            sellerId,
            customerId,
            deliverySpeed,
            productId
        );
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache hit for complete shipping calculation`);
            return cached;
        }

        // Step 1: Find nearest warehouse
        const nearestWarehouse = await this.findNearestWarehouse(sellerId);

        // Step 2: Calculate shipping charge
        const shippingCharge = await this.calculateShippingCharge(
            nearestWarehouse.warehouseId,
            customerId,
            deliverySpeed,
            productId
        );

        const result = {
            shippingCharge: shippingCharge.shippingCharge,
            nearestWarehouse: {
                warehouseId: nearestWarehouse.warehouseId,
                warehouseLocation: nearestWarehouse.warehouseLocation,
                warehouseName: nearestWarehouse.warehouseName,
            },
            transportMode: shippingCharge.transportMode,
            distance_km: shippingCharge.distance_km,
            weight_kg: shippingCharge.weight_kg,
            breakdown: shippingCharge.breakdown,
        };

        // Cache for 2 minutes
        cache.set(cacheKey, result, 120000);

        return result;
    }
}
