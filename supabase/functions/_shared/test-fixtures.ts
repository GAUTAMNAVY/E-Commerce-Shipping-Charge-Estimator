/**
 * Test Fixtures for Shipping API
 * Provides sample data for testing edge functions
 */

export const TEST_SELLERS = {
    nestle: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Nestle India Ltd.',
        phone_number: '+91-9876543210',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Connaught Place',
        city: 'New Delhi'
    },
    unilever: {
        id: '660e8400-e29b-41d4-a716-446655440002',
        name: 'Hindustan Unilever',
        phone_number: '+91-9876543211',
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Andheri East',
        city: 'Mumbai'
    },
    cocacola: {
        id: '660e8400-e29b-41d4-a716-446655440003',
        name: 'Coca-Cola India',
        phone_number: '+91-9876543212',
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'MG Road',
        city: 'Bangalore'
    },
    invalidCoords: {
        id: '660e8400-e29b-41d4-a716-446655440099',
        name: 'Invalid Seller',
        phone_number: '+91-9876543299',
        latitude: 999, // Invalid latitude
        longitude: 999, // Invalid longitude
        address: 'Nowhere',
        city: 'Invalid'
    }
};

export const TEST_CUSTOMERS = {
    kiranaMumbai: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Shree Kirana Store',
        phone_number: '+91-9988776655',
        latitude: 19.1136,
        longitude: 72.8697,
        address: 'Malad West',
        city: 'Mumbai'
    },
    metroCashCarry: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Metro Cash & Carry',
        phone_number: '+91-9988776656',
        latitude: 28.5355,
        longitude: 77.3910,
        address: 'Noida',
        city: 'Noida'
    },
    kiranaBangalore: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Karnataka Provisions',
        phone_number: '+91-9988776657',
        latitude: 12.9352,
        longitude: 77.6245,
        address: 'Indiranagar',
        city: 'Bangalore'
    }
};

export const TEST_WAREHOUSES = {
    mumbai: {
        id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'MUMB_Warehouse',
        latitude: 19.0760,
        longitude: 72.8777,
        city: 'Mumbai',
        capacity_kg: 100000,
        is_active: true
    },
    delhi: {
        id: '770e8400-e29b-41d4-a716-446655440002',
        name: 'Delhi_Warehouse',
        latitude: 28.7041,
        longitude: 77.1025,
        city: 'Delhi',
        capacity_kg: 150000,
        is_active: true
    },
    bangalore: {
        id: '770e8400-e29b-41d4-a716-446655440003',
        name: 'BLR_Warehouse',
        latitude: 12.9716,
        longitude: 77.5946,
        city: 'Bangalore',
        capacity_kg: 80000,
        is_active: true
    },
    inactive: {
        id: '770e8400-e29b-41d4-a716-446655440099',
        name: 'Inactive_Warehouse',
        latitude: 22.5726,
        longitude: 88.3639,
        city: 'Kolkata',
        capacity_kg: 50000,
        is_active: false
    }
};

export const TEST_PRODUCTS = {
    lightProduct: {
        id: '880e8400-e29b-41d4-a716-446655440001',
        seller_id: TEST_SELLERS.nestle.id,
        name: 'Maggi Noodles - 12 Pack',
        selling_price: 120.00,
        weight_kg: 2.5,
        category: 'Food'
    },
    mediumProduct: {
        id: '880e8400-e29b-41d4-a716-446655440002',
        seller_id: TEST_SELLERS.unilever.id,
        name: 'Surf Excel Detergent - 5kg',
        selling_price: 450.00,
        weight_kg: 10.0,
        category: 'Home Care'
    },
    heavyProduct: {
        id: '880e8400-e29b-41d4-a716-446655440003',
        seller_id: TEST_SELLERS.cocacola.id,
        name: 'Coca-Cola 24-Pack Case',
        selling_price: 960.00,
        weight_kg: 25.0,
        category: 'Beverages'
    }
};

export const TEST_DELIVERY_SPEEDS = {
    standard: {
        speed_type: 'standard',
        base_charge: 10.00,
        extra_charge_per_kg: 0.00
    },
    express: {
        speed_type: 'express',
        base_charge: 10.00,
        extra_charge_per_kg: 1.20
    }
};

// Known distances for testing (calculated using Haversine formula)
export const KNOWN_DISTANCES = {
    delhiToMumbai: 1155.24, // km
    delhiToBangalore: 1741.57, // km
    mumbaiToBangalore: 842.15, // km
    sameLocation: 0, // km
};

// Test UUIDs
export const INVALID_UUIDS = [
    'not-a-uuid',
    '12345',
    'invalid-uuid-format',
    '',
    'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
];

export const NON_EXISTENT_UUID = '999e8400-e29b-41d4-a716-446655440999';
