/**
 * Unit Tests for Transport Strategy Pattern
 * Tests the Strategy pattern implementation for transport mode selection
 */

import { assertEquals, assertThrows } from "@std/assert";
import {
    TransportModeSelector,
    AeroplaneStrategy,
    TruckStrategy,
    MiniVanStrategy,
    createTransportModeSelector
} from "./transport-strategy.ts";

Deno.test("Transport Strategy - MiniVanStrategy", async (t) => {
    const strategy = new MiniVanStrategy();

    await t.step("handles 0 km distance", () => {
        assertEquals(strategy.canHandle(0), true);
        assertEquals(strategy.getMode(), "Mini Van");
        assertEquals(strategy.getRate(), 3.0);
    });

    await t.step("handles 50 km distance", () => {
        assertEquals(strategy.canHandle(50), true);
    });

    await t.step("handles 99 km distance (upper boundary)", () => {
        assertEquals(strategy.canHandle(99), true);
    });

    await t.step("does NOT handle 100 km distance", () => {
        assertEquals(strategy.canHandle(100), false);
    });

    await t.step("does NOT handle 500 km distance", () => {
        assertEquals(strategy.canHandle(500), false);
    });

    await t.step("returns correct min/max distances", () => {
        assertEquals(strategy.getMinDistance(), 0);
        assertEquals(strategy.getMaxDistance(), 99.99);
    });
});

Deno.test("Transport Strategy - TruckStrategy", async (t) => {
    const strategy = new TruckStrategy();

    await t.step("does NOT handle 99 km distance", () => {
        assertEquals(strategy.canHandle(99), false);
    });

    await t.step("handles 100 km distance (lower boundary)", () => {
        assertEquals(strategy.canHandle(100), true);
        assertEquals(strategy.getMode(), "Truck");
        assertEquals(strategy.getRate(), 2.0);
    });

    await t.step("handles 250 km distance", () => {
        assertEquals(strategy.canHandle(250), true);
    });

    await t.step("handles 499 km distance (upper boundary)", () => {
        assertEquals(strategy.canHandle(499), true);
    });

    await t.step("does NOT handle 500 km distance", () => {
        assertEquals(strategy.canHandle(500), false);
    });

    await t.step("returns correct min/max distances", () => {
        assertEquals(strategy.getMinDistance(), 100);
        assertEquals(strategy.getMaxDistance(), 499.99);
    });
});

Deno.test("Transport Strategy - AeroplaneStrategy", async (t) => {
    const strategy = new AeroplaneStrategy();

    await t.step("does NOT handle 499 km distance", () => {
        assertEquals(strategy.canHandle(499), false);
    });

    await t.step("handles 500 km distance (lower boundary)", () => {
        assertEquals(strategy.canHandle(500), true);
        assertEquals(strategy.getMode(), "Aeroplane");
        assertEquals(strategy.getRate(), 1.0);
    });

    await t.step("handles 1000 km distance", () => {
        assertEquals(strategy.canHandle(1000), true);
    });

    await t.step("handles very long distances", () => {
        assertEquals(strategy.canHandle(5000), true);
        assertEquals(strategy.canHandle(10000), true);
    });

    await t.step("returns correct min distance and no max", () => {
        assertEquals(strategy.getMinDistance(), 500);
        assertEquals(strategy.getMaxDistance(), null);
    });
});

Deno.test("Transport Strategy - TransportModeSelector", async (t) => {
    const selector = new TransportModeSelector();

    await t.step("selects Mini Van for 0 km", () => {
        const result = selector.getTransportModeAndRate(0);
        assertEquals(result.mode, "Mini Van");
        assertEquals(result.rate, 3.0);
    });

    await t.step("selects Mini Van for 50 km", () => {
        const result = selector.getTransportModeAndRate(50);
        assertEquals(result.mode, "Mini Van");
        assertEquals(result.rate, 3.0);
    });

    await t.step("selects Mini Van for 99 km", () => {
        const result = selector.getTransportModeAndRate(99);
        assertEquals(result.mode, "Mini Van");
        assertEquals(result.rate, 3.0);
    });

    await t.step("selects Truck for 100 km (boundary)", () => {
        const result = selector.getTransportModeAndRate(100);
        assertEquals(result.mode, "Truck");
        assertEquals(result.rate, 2.0);
    });

    await t.step("selects Truck for 250 km", () => {
        const result = selector.getTransportModeAndRate(250);
        assertEquals(result.mode, "Truck");
        assertEquals(result.rate, 2.0);
    });

    await t.step("selects Truck for 499 km", () => {
        const result = selector.getTransportModeAndRate(499);
        assertEquals(result.mode, "Truck");
        assertEquals(result.rate, 2.0);
    });

    await t.step("selects Aeroplane for 500 km (boundary)", () => {
        const result = selector.getTransportModeAndRate(500);
        assertEquals(result.mode, "Aeroplane");
        assertEquals(result.rate, 1.0);
    });

    await t.step("selects Aeroplane for 1000 km", () => {
        const result = selector.getTransportModeAndRate(1000);
        assertEquals(result.mode, "Aeroplane");
        assertEquals(result.rate, 1.0);
    });

    await t.step("throws error for negative distance", () => {
        assertThrows(
            () => selector.getTransportModeAndRate(-10),
            Error,
            "Distance cannot be negative"
        );
    });

    await t.step("getAllStrategies returns all three strategies", () => {
        const strategies = selector.getAllStrategies();
        assertEquals(strategies.length, 3);
        assertEquals(strategies[0] instanceof AeroplaneStrategy, true);
        assertEquals(strategies[1] instanceof TruckStrategy, true);
        assertEquals(strategies[2] instanceof MiniVanStrategy, true);
    });

    await t.step("selectStrategy returns correct strategy object", () => {
        const strategy = selector.selectStrategy(50);
        assertEquals(strategy.getMode(), "Mini Van");
        assertEquals(strategy.canHandle(50), true);
    });
});

Deno.test("Transport Strategy - createTransportModeSelector factory", async (t) => {
    await t.step("creates a new TransportModeSelector instance", () => {
        const selector = createTransportModeSelector();
        assertEquals(selector instanceof TransportModeSelector, true);
    });

    await t.step("created selector works correctly", () => {
        const selector = createTransportModeSelector();
        const result = selector.getTransportModeAndRate(150);
        assertEquals(result.mode, "Truck");
        assertEquals(result.rate, 2.0);
    });
});

Deno.test("Transport Strategy - Rate Calculations", async (t) => {
    const selector = createTransportModeSelector();

    await t.step("calculates correct transport cost for Mini Van (50km, 10kg)", () => {
        const { rate } = selector.getTransportModeAndRate(50);
        const cost = 50 * rate * 10;
        assertEquals(cost, 1500); // 50 * 3.0 * 10
    });

    await t.step("calculates correct transport cost for Truck (200km, 10kg)", () => {
        const { rate } = selector.getTransportModeAndRate(200);
        const cost = 200 * rate * 10;
        assertEquals(cost, 4000); // 200 * 2.0 * 10
    });

    await t.step("calculates correct transport cost for Aeroplane (1000km, 10kg)", () => {
        const { rate } = selector.getTransportModeAndRate(1000);
        const cost = 1000 * rate * 10;
        assertEquals(cost, 10000); // 1000 * 1.0 * 10
    });
});
