# API Request Examples

This document provides comprehensive examples for testing all Shipping API endpoints using various tools and programming languages.

---

## Table of Contents
1. [Sample Data Reference](#sample-data-reference)
2. [cURL Examples](#curl-examples)
3. [JavaScript/TypeScript Examples](#javascripttypescript-examples)
4. [Python Examples](#python-examples)
5. [Postman Collection](#postman-collection)

---

## Sample Data Reference

Use these sample IDs from the seed data for testing:

### Sellers
- **Nestle Seller**: `660e8400-e29b-41d4-a716-446655440001` (Mumbai)
- **Rice Seller**: `660e8400-e29b-41d4-a716-446655440002` (Chennai)
- **Sugar Seller**: `660e8400-e29b-41d4-a716-446655440003` (Kolkata)

### Customers
- **Shree Kirana Store**: `550e8400-e29b-41d4-a716-446655440001` (Mumbai)
- **Delhi General Store**: `550e8400-e29b-41d4-a716-446655440003` (Delhi)
- **Bangalore Provisions**: `550e8400-e29b-41d4-a716-446655440004` (Bangalore)

### Warehouses
- **BLR_Warehouse**: `770e8400-e29b-41d4-a716-446655440001` (Bangalore)
- **MUMB_Warehouse**: `770e8400-e29b-41d4-a716-446655440002` (Mumbai)
- **DEL_Warehouse**: `770e8400-e29b-41d4-a716-446655440003` (Delhi)

### Products
- **Maggie 500g**: `880e8400-e29b-41d4-a716-446655440001` (0.5 kg)
- **Rice Bag 10Kg**: `880e8400-e29b-41d4-a716-446655440004` (10 kg)
- **Sugar Bag 25kg**: `880e8400-e29b-41d4-a716-446655440007` (25 kg)

---

## cURL Examples

### 1. Find Nearest Warehouse (GET)
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/nearest-warehouse?sellerId=660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 2. Find Nearest Warehouse (POST)
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/nearest-warehouse" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

### 3. Calculate Shipping Charge (Standard Delivery)
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/shipping-charge" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouseId": "770e8400-e29b-41d4-a716-446655440002",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "deliverySpeed": "standard"
  }'
```

### 4. Calculate Shipping Charge (Express with Product)
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/shipping-charge" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouseId": "770e8400-e29b-41d4-a716-446655440002",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "deliverySpeed": "express",
    "productId": "880e8400-e29b-41d4-a716-446655440004"
  }'
```

### 5. Complete Shipping Calculation
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/calculate-shipping" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "660e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "deliverySpeed": "standard"
  }'
```

### 6. Complete Shipping with Product Weight
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/calculate-shipping" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "660e8400-e29b-41d4-a716-446655440002",
    "customerId": "550e8400-e29b-41d4-a716-446655440004",
    "deliverySpeed": "express",
    "productId": "880e8400-e29b-41d4-a716-446655440007"
  }'
```

---

## JavaScript/TypeScript Examples

### Setup
```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const API_BASE = `${SUPABASE_URL}/functions/v1`;
```

### 1. Find Nearest Warehouse
```typescript
async function findNearestWarehouse(sellerId: string) {
  const response = await fetch(
    `${API_BASE}/nearest-warehouse?sellerId=${sellerId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  console.log('Nearest Warehouse:', data.warehouseName);
  console.log('Distance:', data.distance_km, 'km');
  
  return data;
}

// Usage
findNearestWarehouse('660e8400-e29b-41d4-a716-446655440001');
```

### 2. Calculate Shipping Charge
```typescript
interface ShippingRequest {
  warehouseId: string;
  customerId: string;
  deliverySpeed?: 'standard' | 'express';
  productId?: string;
}

async function calculateShipping(request: ShippingRequest) {
  const response = await fetch(`${API_BASE}/shipping-charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deliverySpeed: 'standard',
      ...request
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.message, error.hint);
    throw new Error(error.message);
  }

  const data = await response.json();
  console.log('Shipping Charge: ₹', data.shippingCharge);
  console.log('Transport Mode:', data.transportMode);
  console.log('Breakdown:', data.breakdown);
  
  return data;
}

// Usage
calculateShipping({
  warehouseId: '770e8400-e29b-41d4-a716-446655440002',
  customerId: '550e8400-e29b-41d4-a716-446655440001',
  deliverySpeed: 'express',
  productId: '880e8400-e29b-41d4-a716-446655440004'
});
```

### 3. Complete Shipping Calculation
```typescript
interface CompleteShippingRequest {
  sellerId: string;
  customerId: string;
  deliverySpeed?: 'standard' | 'express';
  productId?: string;
}

async function calculateCompleteShipping(request: CompleteShippingRequest) {
  const response = await fetch(`${API_BASE}/calculate-shipping`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deliverySpeed: 'standard',
      ...request
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to calculate shipping');
  }
  
  console.log('=== Complete Shipping Calculation ===');
  console.log('Nearest Warehouse:', data.nearestWarehouse.warehouseName);
  console.log('Distance:', data.distance_km, 'km');
  console.log('Transport Mode:', data.transportMode);
  console.log('Total Charge: ₹', data.shippingCharge);
  console.log('Breakdown:', {
    base: `₹${data.breakdown.baseCharge}`,
    transport: `₹${data.breakdown.transportCharge}`,
    express: `₹${data.breakdown.expressCharge}`
  });
  
  return data;
}

// Usage
calculateCompleteShipping({
  sellerId: '660e8400-e29b-41d4-a716-446655440001',
  customerId: '550e8400-e29b-41d4-a716-446655440003',
  deliverySpeed: 'standard'
});
```

### 4. React Hook Example
```typescript
import { useState } from 'react';

function useShippingCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const calculate = async (sellerId: string, customerId: string, deliverySpeed = 'standard') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/calculate-shipping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sellerId, customerId, deliverySpeed })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to calculate shipping');
        return null;
      }

      setResult(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading, error, result };
}

// Usage in component
function ShippingCalculator() {
  const { calculate, loading, error, result } = useShippingCalculator();

  const handleCalculate = async () => {
    await calculate(
      '660e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440001'
    );
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={loading}>
        Calculate Shipping
      </button>
      {loading && <p>Calculating...</p>}
      {error && <p>Error: {error}</p>}
      {result && <p>Charge: ₹{result.shippingCharge}</p>}
    </div>
  );
}
```

---

## Python Examples

### Setup
```python
import requests
import json

SUPABASE_URL = 'https://your-project.supabase.co'
SUPABASE_ANON_KEY = 'your-anon-key'
API_BASE = f'{SUPABASE_URL}/functions/v1'

headers = {
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}
```

### 1. Find Nearest Warehouse
```python
def find_nearest_warehouse(seller_id):
    url = f'{API_BASE}/nearest-warehouse'
    params = {'sellerId': seller_id}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Nearest Warehouse: {data['warehouseName']}")
        print(f"Distance: {data['distance_km']} km")
        return data
    else:
        error = response.json()
        print(f"Error: {error.get('message')}")
        raise Exception(error.get('message'))

# Usage
find_nearest_warehouse('660e8400-e29b-41d4-a716-446655440001')
```

### 2. Calculate Complete Shipping
```python
def calculate_complete_shipping(seller_id, customer_id, delivery_speed='standard', product_id=None):
    url = f'{API_BASE}/calculate-shipping'
    
    payload = {
        'sellerId': seller_id,
        'customerId': customer_id,
        'deliverySpeed': delivery_speed
    }
    
    if product_id:
        payload['productId'] = product_id
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("=== Shipping Calculation ===")
        print(f"Warehouse: {data['nearestWarehouse']['warehouseName']}")
        print(f"Distance: {data['distance_km']} km")
        print(f"Transport: {data['transportMode']}")
        print(f"Total Charge: ₹{data['shippingCharge']}")
        print(f"Breakdown: {json.dumps(data['breakdown'], indent=2)}")
        return data
    else:
        error = response.json()
        print(f"Error ({response.status_code}): {error.get('message')}")
        print(f"Hint: {error.get('hint')}")
        raise Exception(error.get('message'))

# Usage
calculate_complete_shipping(
    seller_id='660e8400-e29b-41d4-a716-446655440001',
    customer_id='550e8400-e29b-41d4-a716-446655440001',
    delivery_speed='express',
    product_id='880e8400-e29b-41d4-a716-446655440004'
)
```

### 3. Batch Calculation
```python
def batch_calculate_shipping(seller_customer_pairs):
    """Calculate shipping for multiple seller-customer pairs"""
    results = []
    
    for seller_id, customer_id in seller_customer_pairs:
        try:
            result = calculate_complete_shipping(seller_id, customer_id)
            results.append({
                'success': True,
                'sellerId': seller_id,
                'customerId': customer_id,
                'charge': result['shippingCharge']
            })
        except Exception as e:
            results.append({
                'success': False,
                'sellerId': seller_id,
                'customerId': customer_id,
                'error': str(e)
            })
    
    return results

# Usage
pairs = [
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),
]

results = batch_calculate_shipping(pairs)
for result in results:
    if result['success']:
        print(f"✓ Charge: ₹{result['charge']}")
    else:
        print(f"✗ Error: {result['error']}")
```

---

## Postman Collection

### Import this JSON to Postman:

```json
{
  "info": {
    "name": "Shipping API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://your-project.supabase.co/functions/v1"
    },
    {
      "key": "anonKey",
      "value": "your-anon-key"
    }
  ],
  "item": [
    {
      "name": "1. Find Nearest Warehouse",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{anonKey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"sellerId\": \"660e8400-e29b-41d4-a716-446655440001\"\n}"
        },
        "url": "{{baseUrl}}/nearest-warehouse"
      }
    },
    {
      "name": "2. Calculate Shipping Charge",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{anonKey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"warehouseId\": \"770e8400-e29b-41d4-a716-446655440002\",\n  \"customerId\": \"550e8400-e29b-41d4-a716-446655440001\",\n  \"deliverySpeed\": \"standard\"\n}"
        },
        "url": "{{baseUrl}}/shipping-charge"
      }
    },
    {
      "name": "3. Complete Shipping Calculation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{anonKey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"sellerId\": \"660e8400-e29b-41d4-a716-446655440001\",\n  \"customerId\": \"550e8400-e29b-41d4-a716-446655440001\",\n  \"deliverySpeed\": \"express\",\n  \"productId\": \"880e8400-e29b-41d4-a716-446655440004\"\n}"
        },
        "url": "{{baseUrl}}/calculate-shipping"
      }
    }
  ]
}
```

---

## Testing Scenarios

### Scenario 1: Quick Local Delivery (Mini Van)
```bash
# Nestle Seller (Mumbai) → Shree Kirana (Mumbai)
# Expected: Mini Van, ~50-60 km
curl -X POST "localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"660e8400-e29b-41d4-a716-446655440001","customerId":"550e8400-e29b-41d4-a716-446655440001"}'
```

### Scenario 2: Long Distance (Aeroplane)
```bash
# Rice Seller (Chennai) → Delhi General Store
# Expected: Aeroplane, ~1500+ km
curl -X POST "localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"660e8400-e29b-41d4-a716-446655440002","customerId":"550e8400-e29b-41d4-a716-446655440003"}'
```

### Scenario 3: Heavy Product with Express
```bash
# Sugar 25kg with express delivery
curl -X POST "localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId":"660e8400-e29b-41d4-a716-446655440003",
    "customerId":"550e8400-e29b-41d4-a716-446655440004",
    "deliverySpeed":"express",
    "productId":"880e8400-e29b-41d4-a716-446655440007"
  }'
```

---

**Last Updated:** 2026-01-30
