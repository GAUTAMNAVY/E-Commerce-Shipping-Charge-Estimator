/**
 * Unit Tests for Cache Manager
 * Tests the Singleton pattern implementation and caching functionality
 */

import { assertEquals, assert } from "@std/assert";
import { CacheManager, CacheKeyBuilder, cache } from "./cache-manager.ts";
import { sleep } from "./test-utils.ts";

Deno.test("Cache Manager - Singleton Pattern", async (t) => {

    await t.step("getInstance returns the same instance", () => {
        const instance1 = CacheManager.getInstance();
        const instance2 = CacheManager.getInstance();
        assertEquals(instance1, instance2);
    });

    await t.step("exported cache is the singleton instance", () => {
        const instance = CacheManager.getInstance();
        assertEquals(cache, instance);
    });
});

Deno.test("Cache Manager - Basic Operations", async (t) => {
    const testCache = CacheManager.getInstance();

    // Clear cache before tests
    testCache.clear();

    await t.step("set and get value", () => {
        testCache.set("test-key", "test-value");
        const value = testCache.get("test-key");
        assertEquals(value, "test-value");
    });

    await t.step("get with type parameter", () => {
        testCache.set<string>("typed-key", "typed-value");
        const value = testCache.get<string>("typed-key");
        assertEquals(value, "typed-value");
    });

    await t.step("get non-existent key returns null", () => {
        const value = testCache.get("non-existent");
        assertEquals(value, null);
    });

    await t.step("has returns true for existing key", () => {
        testCache.set("exists", "value");
        assertEquals(testCache.has("exists"), true);
    });

    await t.step("has returns false for non-existent key", () => {
        assertEquals(testCache.has("does-not-exist"), false);
    });

    await t.step("delete removes key", () => {
        testCache.set("to-delete", "value");
        const deleted = testCache.delete("to-delete");
        assertEquals(deleted, true);
        assertEquals(testCache.has("to-delete"), false);
    });

    await t.step("delete non-existent key returns false", () => {
        const deleted = testCache.delete("never-existed");
        assertEquals(deleted, false);
    });

    testCache.clear();
});

Deno.test("Cache Manager - TTL and Expiration", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();

    await t.step("value expires after TTL", async () => {
        testCache.set("expiring-key", "expiring-value", 100); // 100ms TTL
        assertEquals(testCache.get("expiring-key"), "expiring-value");

        await sleep(150); // Wait for expiration

        assertEquals(testCache.get("expiring-key"), null);
    });

    await t.step("has returns false for expired key", async () => {
        testCache.set("short-lived", "value", 50);
        assertEquals(testCache.has("short-lived"), true);

        await sleep(100);

        assertEquals(testCache.has("short-lived"), false);
    });

    await t.step("value persists within TTL", async () => {
        testCache.set("persistent", "value", 200);

        await sleep(100);

        assertEquals(testCache.get("persistent"), "value");
    });

    testCache.clear();
});

Deno.test("Cache Manager - Statistics", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();
    testCache.resetStats();

    await t.step("tracks cache hits", () => {
        testCache.set("hit-key", "value");
        testCache.get("hit-key");
        testCache.get("hit-key");

        const stats = testCache.getStats();
        assertEquals(stats.hits, 2);
    });

    await t.step("tracks cache misses", () => {
        testCache.resetStats();
        testCache.get("miss-key-1");
        testCache.get("miss-key-2");

        const stats = testCache.getStats();
        assertEquals(stats.misses, 2);
    });

    await t.step("calculates hit rate correctly", () => {
        testCache.resetStats();
        testCache.set("rate-key", "value");

        testCache.get("rate-key"); // hit
        testCache.get("rate-key"); // hit
        testCache.get("miss-1");   // miss
        testCache.get("miss-2");   // miss

        const stats = testCache.getStats();
        assertEquals(stats.hits, 2);
        assertEquals(stats.misses, 2);
        assertEquals(stats.hitRate, 0.5); // 2 hits out of 4 total
    });

    await t.step("tracks cache size", () => {
        testCache.clear();
        testCache.resetStats();

        testCache.set("key1", "value1");
        testCache.set("key2", "value2");
        testCache.set("key3", "value3");

        const stats = testCache.getStats();
        assertEquals(stats.size, 3);
    });

    await t.step("resetStats clears hit/miss counters", () => {
        testCache.resetStats();
        const stats = testCache.getStats();
        assertEquals(stats.hits, 0);
        assertEquals(stats.misses, 0);
    });

    testCache.clear();
});

Deno.test("Cache Manager - Pattern Operations", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();

    await t.step("deletePattern removes matching keys", () => {
        testCache.set("user:1:profile", "data1");
        testCache.set("user:2:profile", "data2");
        testCache.set("product:1:details", "data3");

        const deleted = testCache.deletePattern("user:");
        assertEquals(deleted, 2);
        assertEquals(testCache.has("user:1:profile"), false);
        assertEquals(testCache.has("user:2:profile"), false);
        assertEquals(testCache.has("product:1:details"), true);
    });

    await t.step("deletePattern with no matches returns 0", () => {
        testCache.clear();
        testCache.set("key1", "value1");

        const deleted = testCache.deletePattern("nomatch");
        assertEquals(deleted, 0);
    });

    testCache.clear();
});

Deno.test("Cache Manager - Cleanup", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();

    await t.step("cleanup removes expired entries", async () => {
        testCache.set("expire1", "value1", 50);
        testCache.set("expire2", "value2", 50);
        testCache.set("persist", "value3", 10000);

        await sleep(100);

        const removed = testCache.cleanup();
        assertEquals(removed, 2);
        assertEquals(testCache.has("expire1"), false);
        assertEquals(testCache.has("expire2"), false);
        assertEquals(testCache.has("persist"), true);
    });

    await t.step("cleanup with no expired entries returns 0", () => {
        testCache.clear();
        testCache.set("key", "value", 10000);

        const removed = testCache.cleanup();
        assertEquals(removed, 0);
    });

    testCache.clear();
});

Deno.test("Cache Manager - getOrSet", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();

    await t.step("getOrSet returns cached value if exists", async () => {
        testCache.set("cached", "cached-value");

        const value = await testCache.getOrSet(
            "cached",
            async () => "new-value"
        );

        assertEquals(value, "cached-value");
    });

    await t.step("getOrSet calls factory and caches if not exists", async () => {
        let factoryCalled = false;

        const value = await testCache.getOrSet(
            "new-key",
            async () => {
                factoryCalled = true;
                return "factory-value";
            }
        );

        assertEquals(value, "factory-value");
        assertEquals(factoryCalled, true);
        assertEquals(testCache.get("new-key"), "factory-value");
    });

    await t.step("getOrSet respects custom TTL", async () => {
        const value = await testCache.getOrSet(
            "ttl-key",
            async () => "ttl-value",
            100 // 100ms TTL
        );

        assertEquals(value, "ttl-value");

        await sleep(150);

        assertEquals(testCache.get("ttl-key"), null);
    });

    testCache.clear();
});

Deno.test("Cache Manager - Complex Data Types", async (t) => {
    const testCache = CacheManager.getInstance();
    testCache.clear();

    await t.step("caches objects", () => {
        const obj = { name: "Test", value: 123 };
        testCache.set("object-key", obj);
        const retrieved = testCache.get<typeof obj>("object-key");
        assertEquals(retrieved, obj);
    });

    await t.step("caches arrays", () => {
        const arr = [1, 2, 3, 4, 5];
        testCache.set("array-key", arr);
        const retrieved = testCache.get<typeof arr>("array-key");
        assertEquals(retrieved, arr);
    });

    await t.step("caches nested structures", () => {
        const nested = {
            user: { id: 1, name: "Test" },
            products: [{ id: 1 }, { id: 2 }],
            metadata: { count: 2 }
        };
        testCache.set("nested-key", nested);
        const retrieved = testCache.get<typeof nested>("nested-key");
        assertEquals(retrieved, nested);
    });

    testCache.clear();
});

Deno.test("CacheKeyBuilder", async (t) => {

    await t.step("nearestWarehouse generates correct key", () => {
        const key = CacheKeyBuilder.nearestWarehouse("seller-123");
        assertEquals(key, "nearest_warehouse:seller:seller-123");
    });

    await t.step("shippingCharge generates correct key without productId", () => {
        const key = CacheKeyBuilder.shippingCharge("warehouse-1", "customer-1", "standard");
        assertEquals(key, "shipping_charge:warehouse-1:customer-1:standard");
    });

    await t.step("shippingCharge generates correct key with productId", () => {
        const key = CacheKeyBuilder.shippingCharge("warehouse-1", "customer-1", "express", "product-1");
        assertEquals(key, "shipping_charge:warehouse-1:customer-1:express:product-1");
    });

    await t.step("entity generates correct key", () => {
        const key = CacheKeyBuilder.entity("user", "user-123");
        assertEquals(key, "entity:user:user-123");
    });

    await t.step("calculation generates correct key without productId", () => {
        const key = CacheKeyBuilder.calculation("seller-1", "customer-1", "standard");
        assertEquals(key, "calculation:seller-1:customer-1:standard");
    });

    await t.step("calculation generates correct key with productId", () => {
        const key = CacheKeyBuilder.calculation("seller-1", "customer-1", "express", "product-1");
        assertEquals(key, "calculation:seller-1:customer-1:express:product-1");
    });
});
