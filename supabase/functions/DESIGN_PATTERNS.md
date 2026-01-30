# Design Patterns in Shipping API

This document explains the design patterns used in the B2B E-Commerce Shipping API, why they were chosen, and how to extend them.

## Table of Contents

1. [Singleton Pattern](#singleton-pattern)
2. [Strategy Pattern](#strategy-pattern)
3. [Factory Pattern](#factory-pattern)
4. [Service Layer Pattern](#service-layer-pattern)
5. [Builder Pattern](#builder-pattern)
6. [Extending the Patterns](#extending-the-patterns)

---

## Singleton Pattern

### Implementation: Cache Manager

**Location**: [`_shared/cache-manager.ts`](file:///c:/shipbuddy/kirana-ship-buddy/supabase/functions/_shared/cache-manager.ts)

### Description

The Cache Manager uses the Singleton pattern to ensure only one cache instance exists across all edge function invocations.

### Code Example

```typescript
export class CacheManager {
    private static instance: CacheManager | null = null;
    
    private constructor() {
        this.cache = new Map();
    }
    
    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
}

// Export singleton instance for convenience
export const cache = CacheManager.getInstance();
```

### Why This Pattern?

✅ **Single Source of Truth**: All functions share the same cache  
✅ **Memory Efficiency**: Prevents multiple cache instances  
✅ **Centralized Statistics**: Hit/miss tracking across all operations  
✅ **Consistent TTLs**: One cleanup schedule for all cached data  

### Usage

```typescript
import { cache } from "../_shared/cache-manager.ts";

// Set with 5-minute TTL
cache.set("user:123", userData, 300000);

// Get cached value
const user = cache.get<User>("user:123");

// Check statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

---

## Strategy Pattern

### Implementation: Transport Mode Selection

**Location**: [`_shared/transport-strategy.ts`](file:///c:/shipbuddy/kirana-ship-buddy/supabase/functions/_shared/transport-strategy.ts)

### Description

The Strategy pattern allows runtime selection of transport modes (Mini Van, Truck, Aeroplane) based on distance without conditional logic scattered throughout the codebase.

### Code Example

```typescript
// Strategy Interface
export interface TransportStrategy {
    canHandle(distance: number): boolean;
    getRate(): number;
    getMode(): string;
}

// Concrete Strategies
export class MiniVanStrategy implements TransportStrategy {
    canHandle(distance: number): boolean {
        return distance >= 0 && distance < 100;
    }
    getRate(): number {
        return 3.0; // Rs per km per kg
    }
    getMode(): string {
        return 'Mini Van';
    }
}

export class TruckStrategy implements TransportStrategy {
    canHandle(distance: number): boolean {
        return distance >= 100 && distance < 500;
    }
    getRate(): number {
        return 2.0;
    }
    getMode(): string {
        return 'Truck';
    }
}

export class AeroplaneStrategy implements TransportStrategy {
    canHandle(distance: number): boolean {
        return distance >= 500;
    }
    getRate(): number {
        return 1.0;
    }
    getMode(): string {
        return 'Aeroplane';
    }
}

// Context Class
export class TransportModeSelector {
    private strategies: TransportStrategy[];
    
    constructor() {
        this.strategies = [
            new AeroplaneStrategy(),
            new TruckStrategy(),
            new MiniVanStrategy(),
        ];
    }
    
    getTransportModeAndRate(distance: number): { mode: string; rate: number } {
        const strategy = this.selectStrategy(distance);
        return {
            mode: strategy.getMode(),
            rate: strategy.getRate(),
        };
    }
}
```

### Why This Pattern?

✅ **Open/Closed Principle**: Easy to add new transport modes without modifying existing code  
✅ **Encapsulation**: Each strategy encapsulates its own logic  
✅ **Testability**: Each strategy can be tested in isolation  
✅ **Maintainability**: Rates and distance ranges are in one place  

### Usage

```typescript
const selector = createTransportModeSelector();
const { mode, rate } = selector.getTransportModeAndRate(150); // Returns Truck at 2.0
const cost = distance * rate * weight;
```

### Extending with New Transport Modes

```typescript
// 1. Create new strategy
export class DroneStrategy implements TransportStrategy {
    canHandle(distance: number): boolean {
        return distance >= 0 && distance < 50; // Short distances
    }
    getRate(): number {
        return 5.0; // Premium rate
    }
    getMode(): string {
        return 'Drone';
    }
}

// 2. Add to selector
constructor() {
    this.strategies = [
        new AeroplaneStrategy(),
        new TruckStrategy(),
        new DroneStrategy(),    // Add here
        new MiniVanStrategy(),
    ];
}
```

---

## Factory Pattern

### Implementation: Transport Mode Selector Factory

**Location**: [`_shared/transport-strategy.ts`](file:///c:/shipbuddy/kirana-ship-buddy/supabase/functions/_shared/transport-strategy.ts)

### Description

The Factory pattern provides a clean way to create TransportModeSelector instances without directly calling the constructor.

### Code Example

```typescript
export function createTransportModeSelector(): TransportModeSelector {
    return new TransportModeSelector();
}
```

### Why This Pattern?

✅ **Abstraction**: Hides construction complexity  
✅ **Flexibility**: Can add dependency injection later  
✅ **Consistent API**: All modules use the same creation method  

### Usage

```typescript
import { createTransportModeSelector } from "../_shared/transport-strategy.ts";

const selector = createTransportModeSelector();
```

---

## Service Layer Pattern

### Implementation: Shipping Service

**Location**: [`_shared/shipping-service.ts`](file:///c:/shipbuddy/kirana-ship-buddy/supabase/functions/_shared/shipping-service.ts)

### Description

The Service Layer pattern separates business logic from API handlers, providing a reusable interface for shipping operations.

### Code Example

```typescript
export class ShippingService {
    private supabase: SupabaseClient;
    private transportSelector = createTransportModeSelector();
    
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    
    async findNearestWarehouse(sellerId: string): Promise<NearestWarehouseResult> {
        // Business logic here
    }
    
    async calculateShippingCharge(
        warehouseId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ): Promise<ShippingChargeResult> {
        // Business logic here
    }
    
    async calculateCompleteShipping(
        sellerId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ) {
        // Orchestrates the two methods above
    }
}
```

### Why This Pattern?

✅ **Separation of Concerns**: Business logic separate from HTTP handling  
✅ **Reusability**: Same service used across multiple endpoints  
✅ **Testability**: Can test business logic without HTTP layer  
✅ **Single Responsibility**: Service focuses only on shipping calculations  

### Usage

```typescript
// In API handler
const supabase = createClient(supabaseUrl, supabaseKey);
const shippingService = new ShippingService(supabase);

const result = await shippingService.calculateCompleteShipping(
    sellerId,
    customerId,
    "standard"
);
```

---

## Builder Pattern

### Implementation: Cache Key Builder

**Location**: [`_shared/cache-manager.ts`](file:///c:/shipbuddy/kirana-ship-buddy/supabase/functions/_shared/cache-manager.ts)

### Description

The Builder pattern provides a consistent way to construct cache keys with proper formatting and conventions.

### Code Example

```typescript
export class CacheKeyBuilder {
    static nearestWarehouse(sellerId: string): string {
        return `nearest_warehouse:seller:${sellerId}`;
    }
    
    static shippingCharge(
        warehouseId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ): string {
        const base = `shipping_charge:${warehouseId}:${customerId}:${deliverySpeed}`;
        return productId ? `${base}:${productId}` : base;
    }
    
    static entity(entityType: string, entityId: string): string {
        return `entity:${entityType}:${entityId}`;
    }
}
```

### Why This Pattern?

✅ **Consistency**: All cache keys follow the same naming convention  
✅ **Type Safety**: Method parameters ensure correct key structure  
✅ **Maintainability**: Easy to update key format in one place  
✅ **Discoverability**: Developers know where to find key builders  

### Usage

```typescript
import { cache, CacheKeyBuilder } from "../_shared/cache-manager.ts";

const key = CacheKeyBuilder.shippingCharge(warehouseId, customerId, "express", productId);
cache.set(key, result, 120000);
```

---

## Extending the Patterns

### Adding a New Delivery Speed

1. Update the database `delivery_speeds` table
2. Update validation in `_shared/validation.ts`:

```typescript
export function validateDeliverySpeed(value: string): boolean {
    const validSpeeds = ['standard', 'express', 'overnight']; // Add here
    // ...
}
```

3. No changes needed to service layer - it queries delivery speeds from DB

### Adding Custom Caching Logic

Create a new cache key builder method:

```typescript
static customOperation(param1: string, param2: string): string {
    return `custom:${param1}:${param2}`;
}
```

### Adding a New Error Type

1. Create custom error class in `_shared/error-handler.ts`:

```typescript
export class PaymentRequiredError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 402, context);
    }
}
```

2. Add hint in `getErrorHint` function
3. Use in service layer:

```typescript
if (accountBalance < shippingCharge) {
    throw new PaymentRequiredError("Insufficient balance");
}
```

---

## Benefits Summary

| Pattern | Primary Benefit | Extensibility |
|---------|----------------|---------------|
| **Singleton** | Single cache instance | Add new cache methods |
| **Strategy** | Runtime transport selection | Add new transport modes |
| **Factory** | Clean object creation | Add dependency injection |
| **Service Layer** | Business logic separation | Add new business methods |
| **Builder** | Consistent key format | Add new key types |

---

## Anti-Patterns Avoided

❌ **God Object**: Service layer is focused only on shipping  
❌ **Magic Numbers**: Rates and distances are in strategy classes  
❌ **Scattered Conditionals**: Transport selection is centralized  
❌ **Global State**: Cache is explicitly singleton, not implicit global  
❌ **Hard-coded Strings**: Cache keys are built programmatically  

---

## Further Reading

- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Patterns.dev](https://www.patterns.dev/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
