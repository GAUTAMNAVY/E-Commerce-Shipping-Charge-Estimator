/**
 * Unit Tests for Distance Calculator
 * Tests the Haversine formula implementation
 */

import { assertEquals, assertThrows, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
    calculateDistance,
    calculateDistanceRounded
} from "./distance-calculator.ts";
import { KNOWN_DISTANCES } from "./test-fixtures.ts";

Deno.test("Distance Calculator", async (t) => {

    await t.step("calculates distance between Delhi and Mumbai correctly", () => {
        const distance = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777);
        // Allow 1km tolerance due to Earth's radius variations
        assertEquals(Math.round(distance), Math.round(KNOWN_DISTANCES.delhiToMumbai));
    });

    await t.step("calculates distance between Delhi and Bangalore correctly", () => {
        const distance = calculateDistance(28.6139, 77.2090, 12.9716, 77.5946);
        assertEquals(Math.round(distance), Math.round(KNOWN_DISTANCES.delhiToBangalore));
    });

    await t.step("calculates distance between Mumbai and Bangalore correctly", () => {
        const distance = calculateDistance(19.0760, 72.8777, 12.9716, 77.5946);
        assertEquals(Math.round(distance), Math.round(KNOWN_DISTANCES.mumbaiToBangalore));
    });

    await t.step("returns 0 for same coordinates", () => {
        const distance = calculateDistance(28.6139, 77.2090, 28.6139, 77.2090);
        assertEquals(distance, 0);
    });

    await t.step("throws error for invalid latitude (> 90)", () => {
        assertThrows(
            () => calculateDistance(91, 77.2090, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("throws error for invalid latitude (< -90)", () => {
        assertThrows(
            () => calculateDistance(-91, 77.2090, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("throws error for invalid longitude (> 180)", () => {
        assertThrows(
            () => calculateDistance(28.6139, 181, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("throws error for invalid longitude (< -180)", () => {
        assertThrows(
            () => calculateDistance(28.6139, -181, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("throws error for NaN latitude", () => {
        assertThrows(
            () => calculateDistance(NaN, 77.2090, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("throws error for NaN longitude", () => {
        assertThrows(
            () => calculateDistance(28.6139, NaN, 19.0760, 72.8777),
            Error,
            "Invalid coordinates"
        );
    });

    await t.step("handles North and South poles correctly", () => {
        const distanceToNorthPole = calculateDistance(0, 0, 90, 0);
        assertEquals(Math.round(distanceToNorthPole), 10018); // ~10,000 km (quarter of Earth's circumference)

        const distanceToSouthPole = calculateDistance(0, 0, -90, 0);
        assertEquals(Math.round(distanceToSouthPole), 10018);
    });

    await t.step("handles international date line crossing", () => {
        // Point on each side of the date line
        const distance = calculateDistance(0, 179, 0, -179);
        // Should be ~222 km (2 degrees of longitude at equator)
        assertEquals(Math.round(distance), 222);
    });

    await t.step("calculateDistanceRounded returns correct precision", () => {
        const distance = calculateDistanceRounded(28.6139, 77.2090, 19.0760, 72.8777, 2);
        // Should have exactly 2 decimal places
        const decimals = distance.toString().split('.')[1];
        assertEquals(decimals?.length || 0, 2);
    });

    await t.step("calculateDistanceRounded with 0 precision returns integer", () => {
        const distance = calculateDistanceRounded(28.6139, 77.2090, 19.0760, 72.8777, 0);
        assertEquals(distance % 1, 0); // Should be an integer
    });

    await t.step("calculates very short distances accurately", () => {
        // Two points ~100 meters apart
        const distance = calculateDistance(28.6139, 77.2090, 28.6148, 77.2090);
        // Should be ~1 km
        assertEquals(Math.round(distance), 1);
    });

    await t.step("handles equator crossing correctly", () => {
        const distance = calculateDistance(5, 80, -5, 80);
        // 10 degrees of latitude = ~1,111 km
        assertEquals(Math.round(distance), 1112);
    });
});
