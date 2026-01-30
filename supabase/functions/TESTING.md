# Testing Guide for Shipping API

## Overview

This guide provides instructions for running and writing tests for the B2B E-Commerce Shipping API built with Supabase Edge Functions and Deno.

## Prerequisites

- Deno runtime installed (`>=1.28.0`)
- Supabase CLI (for integration testing)

## Test Structure

```
supabase/functions/
├── _shared/
│   ├── *.test.ts              # Unit tests for shared utilities
│   ├── test-fixtures.ts       # Test data and fixtures
│   └── test-utils.ts          # Testing utilities and mocks
├── calculate-shipping/
│   └── index.test.ts          # Integration tests
├── nearest-warehouse/
│   └── index.test.ts          # Integration tests
└── shipping-charge/
    └── index.test.ts          # Integration tests
```

## Running Tests

### Run All Tests
```bash
deno test --allow-all
```

### Run Specific Test File
```bash
deno test --allow-all _shared/cache-manager.test.ts
```

### Run with Coverage
```bash
# Generate coverage
deno test --allow-all --coverage=coverage

# View coverage report
deno coverage coverage --lcov --output=coverage.lcov
```

### Watch Mode (Auto-rerun on changes)
```bash
deno test --allow-all --watch
```

## Test Categories

### Unit Tests - Shared Utilities

**Distance Calculator** (`_shared/distance-calculator.test.ts`)
- Haversine formula accuracy
- Edge cases (poles, date line, equator)
- Invalid coordinate handling

**Transport Strategy** (`_shared/transport-strategy.test.ts`)
- Strategy pattern implementation
- Mode selection logic (Mini Van, Truck, Aeroplane)
- Boundary conditions (99km, 100km, 499km, 500km)
- Rate calculations

**Cache Manager** (`_shared/cache-manager.test.ts`)
- Singleton pattern
- Set/get operations
- TTL expiration
- Hit/miss statistics
- Pattern-based deletion

**Validation** (`_shared/validation.test.ts`)
- UUID validation
- Delivery speed validation
- Required field validation
- Coordinate validation
- Positive number and range validation

**Error Handler** (`_shared/error-handler.test.ts`)
- Custom error classes
- Error response building
- Status code determination
- Error hints generation

### Integration Tests - API Endpoints

Integration tests verify end-to-end functionality of API endpoints including:
- HTTP method handling (GET, POST, OPTIONS)
- Request parameter validation
- Response format validation
- Error responses
- CORS headers

## Test Fixtures

Test fixtures are located in `_shared/test-fixtures.ts` and provide:

- **TEST_SELLERS**: Sample seller data (Nestle, Unilever, Coca-Cola)
- **TEST_CUSTOMERS**: Sample customer data (Kirana stores, Metro Cash & Carry)
- **TEST_WAREHOUSES**: Sample warehouse data (Mumbai, Delhi, Bangalore)
- **TEST_PRODUCTS**: Sample product data with various weights
- **KNOWN_DISTANCES**: Pre-calculated distances for validation
- **INVALID_UUIDS**: Invalid UUID formats for negative testing

## Writing Tests

### Basic Test Structure

```typescript
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Feature Name", async (t) => {
  await t.step("specific scenario", () => {
    const result = myFunction(input);
    assertEquals(result, expected);
  });
});
```

### Using Mocks

```typescript
import { createMockSupabaseClient } from "./_shared/test-utils.ts";
import { TEST_SELLERS } from "./_shared/test-fixtures.ts";

const mockClient = createMockSupabaseClient({
  "sellers.id.seller-123": {
    data: TEST_SELLERS.nestle,
    error: null
  }
});
```

### Testing Async Code

```typescript
await t.step("async operation", async () => {
  const result = await asyncFunction();
  assertEquals(result, expected);
});
```

### Testing Errors

```typescript
import { assertThrows } from "https://deno.land/std@0.168.0/testing/asserts.ts";

await t.step("throws error for invalid input", () => {
  assertThrows(
    () => functionThatThrows(),
    Error,
    "Expected error message"
  );
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Clear cache and reset state between tests
- Use fresh mock data for each test

### 2. Descriptive Names
```typescript
✓ "calculates shipping charge for express delivery with 10kg product"
✗ "test 1"
```

### 3. Arrange-Act-Assert Pattern
```typescript
// Arrange
const input = { sellerId: "123", customerId: "456" };

// Act
const result = await calculateShipping(input);

// Assert
assertEquals(result.shippingCharge, 125.50);
```

### 4. Test Edge Cases
- Boundary values (0, 99, 100, 499, 500)
- Invalid inputs (null, undefined, NaN)
- Empty collections
- Extreme values

### 5. Mock External Dependencies
- Database queries (Supabase client)
- HTTP requests
- Time-dependent operations

## Coverage Goals

- **Target**: 80%+ code coverage
- **Critical paths**: 100% coverage (distance calculation, charge calculation, validation)
- **Error handling**: All error types should be tested

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - run: deno test --allow-all --coverage=coverage
      - run: deno coverage coverage --lcov --output=coverage.lcov
```

## Troubleshooting

### Tests Fail with "Cannot find module"
Ensure Deno has cached all dependencies:
```bash
deno cache --reload supabase/functions/**/*.ts
```

### "Permission denied" errors
Add required permissions:
```bash
deno test --allow-env --allow-net --allow-read
```

### Tests timeout
Increase timeout for slow operations:
```typescript
Deno.test({
  name: "slow operation",
  fn: async () => { /* test code */ },
  sanitizeResources: false,
  sanitizeOps: false
});
```

## Resources

- [Deno Testing Documentation](https://deno.land/manual/testing)
- [Deno Standard Library - Testing](https://deno.land/std/testing)
- [Supabase Edge Functions Testing](https://supabase.com/docs/guides/functions/unit-test)

---

**Note**: For integration tests that require a database, run `supabase start` locally first to spin up a local Supabase instance.
