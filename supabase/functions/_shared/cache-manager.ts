/**
 * Cache Manager - Singleton Pattern Implementation
 * Provides in-memory caching for Deno edge functions with TTL support
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}

/**
 * Singleton cache manager for storing frequently accessed data
 */
export class CacheManager {
    private static instance: CacheManager | null = null;
    private cache: Map<string, CacheEntry<unknown>>;
    private hits: number = 0;
    private misses: number = 0;
    private defaultTTL: number = 300000; // 5 minutes in milliseconds

    private constructor() {
        this.cache = new Map();
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Get the singleton instance of CacheManager
     * @returns The CacheManager instance
     */
    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Store a value in the cache with optional TTL
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in milliseconds (default: 5 minutes)
     */
    public set<T>(key: string, value: T, ttl?: number): void {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Retrieve a value from the cache
     * @param key - Cache key
     * @returns The cached value or null if not found/expired
     */
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            this.misses++;
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return entry.value;
    }

    /**
     * Check if a key exists in the cache and is not expired
     * @param key - Cache key
     * @returns true if key exists and is valid
     */
    public has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a specific key from the cache
     * @param key - Cache key to delete
     * @returns true if key was deleted, false if not found
     */
    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     * @param pattern - String pattern to match (simple includes)
     * @returns Number of keys deleted
     */
    public deletePattern(pattern: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Clear all entries from the cache
     */
    public clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Remove expired entries from the cache
     * @returns Number of entries removed
     */
    public cleanup(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Get cache statistics
     * @returns Object with hit/miss counts and rates
     */
    public getStats(): CacheStats {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    }

    /**
     * Reset statistics counters
     */
    public resetStats(): void {
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get or set a value using a factory function
     * @param key - Cache key
     * @param factory - Function to generate value if not cached
     * @param ttl - Time to live in milliseconds
     * @returns The cached or newly generated value
     */
    public async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
}

/**
 * Helper function to generate cache keys
 */
export class CacheKeyBuilder {
    /**
     * Generate cache key for nearest warehouse lookup
     */
    static nearestWarehouse(sellerId: string): string {
        return `nearest_warehouse:seller:${sellerId}`;
    }

    /**
     * Generate cache key for shipping charge calculation
     */
    static shippingCharge(
        warehouseId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ): string {
        const base = `shipping_charge:${warehouseId}:${customerId}:${deliverySpeed}`;
        return productId ? `${base}:${productId}` : base;
    }

    /**
     * Generate cache key for entity lookup
     */
    static entity(entityType: string, entityId: string): string {
        return `entity:${entityType}:${entityId}`;
    }

    /**
     * Generate cache key for calculation result
     */
    static calculation(
        sellerId: string,
        customerId: string,
        deliverySpeed: string,
        productId?: string
    ): string {
        const base = `calculation:${sellerId}:${customerId}:${deliverySpeed}`;
        return productId ? `${base}:${productId}` : base;
    }
}

// Export singleton instance for convenience
export const cache = CacheManager.getInstance();
