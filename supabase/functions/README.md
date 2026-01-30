# B2B E-Commerce Shipping API Documentation

A comprehensive shipping calculation API for B2B e-commerce marketplaces, built with Supabase Edge Functions and PostgreSQL.

## Overview

This API provides three endpoints for calculating shipping charges between sellers, warehouses, and customers. It automatically selects the nearest warehouse to a seller and calculates optimal shipping costs based on distance, weight, and delivery speed.

**Key Features:**
- ✅ Automatic nearest warehouse selection
- ✅ Dynamic transport mode selection (Mini Van, Truck, Aeroplane)
- ✅ Support for standard and express delivery
- ✅ Intelligent caching for performance
- ✅ Comprehensive error handling
- ✅ Clean service layer architecture
- ✅ Extensive test coverage (155+ unit tests)
- ✅ Well-documented design patterns

---

## API Endpoints

### 1. Find Nearest Warehouse
**`GET/POST /api/v1/warehouse/nearest`**

Finds the closest warehouse to a seller's location.

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sellerId` | UUID | Yes | Unique identifier for the seller |
| `productId` | UUID | No | Product ID (for future use) |

#### Example Request (cURL)
```bash
# Using GET
curl -X GET "https://your-project.supabase.co/functions/v1/nearest-warehouse?sellerId=660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Using POST
curl -X POST "https://your-project.supabase.co/functions/v1/nearest-warehouse" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "660e8400-e29b-41d4-a716-446655440001"}'
```

#### Success Response (200 OK)
```json
{
  "warehouseId": "770e8400-e29b-41d4-a716-446655440002",
  "warehouseLocation": {
    "lat": 11.99999,
    "long": 27.923273
  },
  "warehouseName": "MUMB_Warehouse",
  "distance_km": 12.45
}
```

#### Error Responses
- **404 Not Found** - Seller not found
- **503 Service Unavailable** - No active warehouses available
- **422 Unprocessable Entity** - Invalid coordinates

---

### 2. Calculate Shipping Charge
**`GET/POST /api/v1/shipping-charge`**

Calculates shipping cost from a specific warehouse to a customer.

#### Request Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `warehouseId` | UUID | Yes | - | Warehouse identifier |
| `customerId` | UUID | Yes | - | Customer identifier |
| `deliverySpeed` | string | No | `standard` | `standard` or `express` |
| `productId` | UUID | No | - | Product for weight calculation |

#### Example Request (cURL)
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

#### Success Response (200 OK)
```json
{
  "shippingCharge": 156.50,
  "transportMode": "Mini Van",
  "distance_km": 45.30,
  "weight_kg": 10.0,
  "breakdown": {
    "baseCharge": 10.00,
    "transportCharge": 134.50,
    "expressCharge": 12.00
  }
}
```

---

### 3. Calculate Complete Shipping
**`POST /api/v1/shipping-charge/calculate`**

End-to-end shipping calculation from seller to customer (combines endpoints 1 & 2).

#### Request Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sellerId` | UUID | Yes | - | Seller identifier |
| `customerId` | UUID | Yes | - | Customer identifier |
| `deliverySpeed` | string | No | `standard` | `standard` or `express` |
| `productId` | UUID | No | - | Product for weight calculation |

#### Example Request (JavaScript/TypeScript)
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/calculate-shipping', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sellerId: '660e8400-e29b-41d4-a716-446655440001',
    customerId: '550e8400-e29b-41d4-a716-446655440001',
    deliverySpeed: 'standard'
  })
});

const data = await response.json();
console.log(`Shipping Charge: ₹${data.shippingCharge}`);
```

#### Success Response (200 OK)
```json
{
  "shippingCharge": 125.75,
  "nearestWarehouse": {
    "warehouseId": "770e8400-e29b-41d4-a716-446655440002",
    "warehouseLocation": {
      "lat": 11.99999,
      "long": 27.923273
    },
    "warehouseName": "MUMB_Warehouse"
  },
  "transportMode": "Mini Van",
  "distance_km": 45.30,
  "weight_kg": 1.0,
  "breakdown": {
    "baseCharge": 10.00,
    "transportCharge": 115.75,
    "expressCharge": 0.00
  }
}
```

---

## Transport Modes & Pricing

The API automatically selects the best transport mode based on distance:

| Transport Mode | Distance Range | Rate (₹/km/kg) |
|----------------|----------------|----------------|
| **Mini Van** | 0 - 99 km | ₹3.00 |
| **Truck** | 100 - 499 km | ₹2.00 |
| **Aeroplane** | 500+ km | ₹1.00 |

### Delivery Speed Pricing

| Speed Type | Base Charge | Extra Charge per KG |
|------------|-------------|---------------------|
| **Standard** | ₹10.00 | ₹0.00 |
| **Express** | ₹10.00 | ₹1.20 |

### Cost Calculation Formula
```
Total Charge = Base Charge + (Distance × Rate × Weight) + Express Charge
```

**Example:**
- Distance: 50 km
- Weight: 10 kg
- Mode: Mini Van (₹3/km/kg)
- Speed: Express

```
= ₹10 (base) + (50 × ₹3 × 10) + (₹1.2 × 10)
= ₹10 + ₹1500 + ₹12
= ₹1522
```

---

## Database Schema

### Core Tables

#### `customers`
Kirana stores and B2B buyers
- `id` (UUID, PK)
- `name`, `phone_number`
- `latitude`, `longitude`
- `address`, `city`

#### `sellers`
Product suppliers
- `id` (UUID, PK)
- `name`, `phone_number`
- `latitude`, `longitude`
- `address`, `city`

#### `warehouses`
Distribution centers
- `id` (UUID, PK)
- `name`, `latitude`, `longitude`
- `city`, `capacity_kg`
- `is_active` (boolean)

#### `products`
Items being shipped
- `id` (UUID, PK)
- `seller_id` (FK → sellers)
- `name`, `selling_price`
- `weight_kg`, dimensions
- `category`

#### `shipping_rates`
Transport mode configurations
- `transport_mode`, `min_distance_km`, `max_distance_km`
- `rate_per_km_per_kg`

#### `delivery_speeds`
Delivery speed pricing
- `speed_type` (standard/express)
- `base_charge`, `extra_charge_per_kg`

---

## Error Handling

All endpoints return JSON errors with helpful hints:

### Error Response Format
```json
{
  "error": "ErrorType",
  "message": "Detailed error message",
  "hint": "Suggestion for fixing the issue",
  "timestamp": "2026-01-30T14:20:00.000Z"
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| **400** | Validation Error | Invalid parameters (bad UUID, missing fields) |
| **404** | Resource Not Found | Seller, customer, warehouse, or product doesn't exist |
| **405** | Method Not Allowed | Wrong HTTP method used |
| **422** | Unsupported Location | Invalid coordinates or out of bounds |
| **503** | Service Unavailable | No active warehouses or database connection issue |

### Example Error Responses

**Missing Parameter (400)**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "sellerId",
      "message": "sellerId is required"
    }
  ],
  "hint": "Provide a valid sellerId UUID parameter"
}
```

**No Warehouses (503)**
```json
{
  "error": "NoWarehousesFoundError",
  "message": "No active warehouses found in the system",
  "hint": "The system has no active warehouses configured. Please contact the administrator to activate warehouses."
}
```

---

## Setup & Deployment

### Prerequisites
- Supabase project
- Deno runtime (for local development)
- Supabase CLI

### Environment Variables
```bash
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy nearest-warehouse
supabase functions deploy shipping-charge
supabase functions deploy calculate-shipping

# Apply database migrations
supabase db push
```

### Local Development
```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST "http://localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "...", "customerId": "..."}'
```

---

## Architecture & Design Patterns

### Service Layer Pattern
Business logic is separated into reusable service classes:
- `ShippingService` - Core shipping calculations
- `TransportModeSelector` - Strategy pattern for transport selection

### Strategy Pattern
Transport mode selection uses the Strategy pattern:
```typescript
const selector = createTransportModeSelector();
const { mode, rate } = selector.getTransportModeAndRate(distance);
```

### Caching Strategy
- **Nearest Warehouse**: Cached for 5 minutes
- **Shipping Calculations**: Cached for 2 minutes
- In-memory cache with TTL expiration

### Error Handling
Custom error classes for specific scenarios:
- `NoWarehousesFoundError`
- `UnsupportedLocationError`
- `ResourceNotFoundError`
- `DatabaseConnectionError`

---

## Performance Considerations

- **Caching**: Frequently accessed calculations are cached to reduce database queries
- **Haversine Formula**: Efficient great-circle distance calculation
- **Indexed Queries**: Database queries use indexed columns (`id`, `is_active`)
- **Edge Functions**: Low-latency serverless execution

### Response Times
- Cached requests: ~10-50ms
- First-time requests: ~100-300ms

---

## Testing

### Test Coverage
- **155+ unit tests** covering all shared utilities
- **Integration test structures** for all endpoints
- **Test fixtures and mocks** for database operations

### Running Tests
```bash
# Run all tests
deno test --allow-all

# Run specific test file
deno test --allow-all _shared/cache-manager.test.ts

# Run with coverage
deno test --allow-all --coverage=coverage
deno coverage coverage --lcov --output=coverage.lcov

# Watch mode (auto-rerun on changes)
deno test --allow-all --watch
```

### Test Categories
- **Unit Tests**: Distance calculator, transport strategy, cache manager, validation, error handler
- **Service Tests**: Shipping service business logic
- **Integration Tests**: API endpoints (calculate-shipping, nearest-warehouse, shipping-charge)

### Documentation
- [Testing Guide](./TESTING.md) - Comprehensive testing documentation
- [Design Patterns](./DESIGN_PATTERNS.md) - Architecture and patterns explained

---

## Support & Contact

For issues, questions, or feature requests:
- Check the [Error Handling Guide](./ERROR_HANDLING.md)
- Review database migrations in `supabase/migrations/`
- Examine shared utilities in `supabase/functions/_shared/`

---

**Built with:** Supabase Edge Functions, PostgreSQL, TypeScript, Deno
