# Error Handling Guide

This document provides a comprehensive guide to error handling in the Shipping API, including all possible error scenarios, troubleshooting steps, and best practices.

---

## Error Response Structure

All API errors follow a consistent JSON structure:

```json
{
  "error": "ErrorTypeName",
  "message": "Detailed description of what went wrong",
  "hint": "Actionable suggestion for fixing the issue",
  "details": {
    "field": "fieldName",
    "additionalContext": "value"
  },
  "timestamp": "2026-01-30T14:20:00.000Z"
}
```

---

## Error Categories

### 1. Validation Errors (400 Bad Request)

#### Missing Required Parameters
**Scenario:** Required field not provided in request

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

**How to Fix:**
- Ensure all required parameters are included in your request
- For `nearest-warehouse`: requires `sellerId`
- For `shipping-charge`: requires `warehouseId`, `customerId`
- For `calculate-shipping`: requires `sellerId`, `customerId`

#### Invalid UUID Format
**Scenario:** Parameter is not a valid UUID v4

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "sellerId",
      "message": "sellerId must be a valid UUID"
    }
  ],
  "hint": "Provide a valid sellerId UUID parameter"
}
```

**Valid UUID Format:**
```
660e8400-e29b-41d4-a716-446655440001
```

**How to Fix:**
- Ensure UUIDs match pattern: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- UUIDs are case-insensitive
- Must be version 4 UUIDs

#### Invalid Delivery Speed
**Scenario:** Delivery speed is not 'standard' or 'express'

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "deliverySpeed",
      "message": "deliverySpeed must be one of: standard, express"
    }
  ]
}
```

**How to Fix:**
- Use only `"standard"` or `"express"` (case-sensitive)
- If omitted, defaults to `"standard"`

#### Invalid JSON
**Scenario:** Request body is not valid JSON

```json
{
  "error": "Invalid JSON in request body",
  "hint": "Ensure your request body is valid JSON with sellerId and customerId"
}
```

**How to Fix:**
- Validate JSON syntax before sending
- Ensure proper quotes and commas
- Use `Content-Type: application/json` header

---

### 2. Resource Not Found (404 Not Found)

#### Seller Not Found
```json
{
  "error": "ResourceNotFoundError",
  "message": "Seller not found: 660e8400-e29b-41d4-a716-446655440001",
  "hint": "Verify that the provided ID exists in the database and is spelled correctly.",
  "details": {
    "resourceType": "Seller",
    "resourceId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Common Causes:**
- Seller doesn't exist in database
- UUID typo or wrong ID
- Seller was deleted

**How to Fix:**
1. Verify seller exists: `SELECT * FROM sellers WHERE id = 'uuid'`
2. Check for typos in the UUID
3. Ensure you're using the correct environment (dev/prod)

#### Warehouse Not Found
Similar error structure for missing warehouses.

**How to Fix:**
1. Check warehouse exists: `SELECT * FROM warehouses WHERE id = 'uuid'`
2. Verify warehouse is active: `is_active = true`

#### Customer Not Found
Similar error structure for missing customers.

#### Product Not Found
Only applies when `productId` is provided in shipping calculations.

---

### 3. Method Not Allowed (405)

**Scenario:** Using wrong HTTP method

```json
{
  "error": "Method not allowed",
  "hint": "This endpoint only accepts POST requests",
  "allowedMethods": ["POST"]
}
```

**Endpoint Methods:**
- `/nearest-warehouse`: GET or POST
- `/shipping-charge`: GET or POST  
- `/calculate-shipping`: POST only

---

### 4. Unsupported Location (422 Unprocessable Entity)

#### Invalid Coordinates
**Scenario:** Latitude or longitude out of valid range

```json
{
  "error": "UnsupportedLocationError",
  "message": "Invalid seller coordinates: latitude 95, longitude 200",
  "hint": "Verify that latitude is between -90 and 90, and longitude is between -180 and 180. Ensure the location is within the serviceable area.",
  "details": {
    "sellerId": "660e8400-e29b-41d4-a716-446655440001",
    "latitude": 95,
    "longitude": 200
  }
}
```

**Valid Coordinate Ranges:**
- **Latitude**: -90 to 90 degrees
- **Longitude**: -180 to 180 degrees

**Common Issues:**
- Swapped latitude and longitude
- Using addresses instead of coordinates
- Coordinates outside Earth's bounds

**How to Fix:**
1. Validate coordinates before saving to database
2. Use geocoding service to convert addresses to coordinates
3. Check database for invalid data:
```sql
SELECT * FROM sellers 
WHERE latitude < -90 OR latitude > 90 
   OR longitude < -180 OR longitude > 180;
```

---

### 5. No Warehouses Found (503 Service Unavailable)

**Scenario:** No active warehouses in the system

```json
{
  "error": "NoWarehousesFoundError",
  "message": "No active warehouses found in the system",
  "hint": "The system has no active warehouses configured. Please contact the administrator to activate warehouses.",
  "details": {
    "sellerId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Common Causes:**
- All warehouses are inactive (`is_active = false`)
- No warehouses exist in database
- Database migration not run

**How to Fix:**
1. Check warehouse count: `SELECT COUNT(*) FROM warehouses WHERE is_active = true`
2. Activate warehouses:
```sql
UPDATE warehouses SET is_active = true WHERE id = 'warehouse-uuid';
```
3. Insert sample warehouses (see migrations)

---

### 6. Database Errors (503 Service Unavailable)

#### Connection Error
```json
{
  "error": "Database error fetching warehouses: connection timeout",
  "hint": "Database connection issue. Please try again in a few moments. Contact support if the problem persists."
}
```

**Common Causes:**
- Database connection timeout
- Too many concurrent connections
- Network issues
- Database maintenance

**How to Fix:**
- Retry the request (implement exponential backoff)
- Check Supabase project status
- Review connection pool settings
- Contact Supabase support if persistent

---

### 7. Configuration Errors (500 Internal Server Error)

**Scenario:** Missing environment variables

```json
{
  "error": "ConfigurationError",
  "message": "Missing Supabase configuration",
  "hint": "System configuration error. Please contact the administrator."
}
```

**Common Causes:**
- `SUPABASE_URL` not set
- `SUPABASE_SERVICE_ROLE_KEY` not set
- Wrong environment selected

**How to Fix:**
```bash
# Set environment secrets
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## Error Handling Best Practices

### 1. Client-Side Error Handling

```typescript
async function calculateShipping(sellerId: string, customerId: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, customerId })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific errors
      if (response.status === 404) {
        console.error('Resource not found:', error.message);
        // Show user-friendly message
      } else if (response.status === 503) {
        console.error('Service unavailable:', error.message);
        // Retry with exponential backoff
      }
      
      throw new Error(error.message);
    }

    return await response.json();
  } catch (err) {
    console.error('API error:', err);
    throw err;
  }
}
```

### 2. Retry Strategy

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Only retry on 5xx errors
      if (response.status < 500 || i === maxRetries - 1) {
        return response;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

### 3. Input Validation

```typescript
function validateShippingRequest(data: any): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!data.sellerId || !uuidPattern.test(data.sellerId)) {
    throw new Error('Invalid sellerId');
  }
  
  if (data.deliverySpeed && !['standard', 'express'].includes(data.deliverySpeed)) {
    throw new Error('deliverySpeed must be standard or express');
  }
  
  return true;
}
```

---

## Debugging Checklist

When encountering errors:

- [ ] **Check request format**
  - Valid JSON syntax
  - Correct Content-Type header
  - All required parameters included

- [ ] **Validate UUIDs**
  - Correct format (version 4)
  - No typos
  - Resources exist in database

- [ ] **Verify coordinates**
  - Latitude: -90 to 90
  - Longitude: -180 to 180
  - Not swapped

- [ ] **Check warehouse status**
  - At least one warehouse exists
  - At least one warehouse is active

- [ ] **Review environment**
  - Correct API URL
  - Valid authentication
  - Environment variables set

- [ ] **Test database connection**
  - Direct database queries work
  - No connection timeouts
  - Migrations applied

---

## Testing Error Scenarios

### Test Invalid UUID
```bash
curl -X POST "http://localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "invalid-uuid", "customerId": "also-invalid"}'
# Expected: 400 Validation Error
```

### Test Missing Seller
```bash
curl -X POST "http://localhost:54321/functions/v1/calculate-shipping" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "00000000-0000-4000-8000-000000000000", "customerId": "550e8400-e29b-41d4-a716-446655440001"}'
# Expected: 404 Resource Not Found
```

### Test No Warehouses
```sql
-- Temporarily disable all warehouses
UPDATE warehouses SET is_active = false;
```
```bash
curl -X GET "http://localhost:54321/functions/v1/nearest-warehouse?sellerId=660e8400-e29b-41d4-a716-446655440001"
# Expected: 503 No Warehouses Found
```

---

## Support

If you encounter persistent errors:

1. Check the [API Documentation](./README.md)
2. Review your database schema and data
3. Enable debug logging for detailed error traces
4. Check Supabase project logs
5. Contact support with:
   - Full error response
   - Request parameters
   - Timestamp of occurrence
   - Environment (dev/prod)

---

**Last Updated:** 2026-01-30
