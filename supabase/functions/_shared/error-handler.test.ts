/**
 * Unit Tests for Error Handler
 * Tests custom error classes and error response building
 */

import { assertEquals, assert } from "@std/assert";
import {
    AppError,
    NoWarehousesFoundError,
    UnsupportedLocationError,
    DatabaseConnectionError,
    ConfigurationError,
    ResourceNotFoundError,
    buildErrorResponse,
    logError
} from "./error-handler.ts";

Deno.test("Error Classes - AppError Base Class", async (t) => {

    await t.step("creates AppError with all properties", () => {
        const error = new AppError("Test error", 400, { userId: "123" });
        assertEquals(error.message, "Test error");
        assertEquals(error.statusCode, 400);
        assertEquals(error.context?.userId, "123");
        assertEquals(error.isOperational, true);
        assertEquals(error.name, "AppError");
    });

    await t.step("creates non-operational error", () => {
        const error = new AppError("Fatal error", 500, undefined, false);
        assertEquals(error.isOperational, false);
    });

    await t.step("is instance of Error", () => {
        const error = new AppError("Test", 400);
        assert(error instanceof Error);
    });
});

Deno.test("Error Classes - NoWarehousesFoundError", async (t) => {

    await t.step("creates error with correct properties", () => {
        const error = new NoWarehousesFoundError({ sellerId: "123" });
        assertEquals(error.message, "No active warehouses found in the system");
        assertEquals(error.statusCode, 503);
        assertEquals(error.context?.sellerId, "123");
        assertEquals(error.isOperational, true);
        assertEquals(error.name, "NoWarehousesFoundError");
    });

    await t.step("is instance of AppError", () => {
        const error = new NoWarehousesFoundError();
        assert(error instanceof AppError);
    });
});

Deno.test("Error Classes - UnsupportedLocationError", async (t) => {

    await t.step("creates error with custom message", () => {
        const error = new UnsupportedLocationError(
            "Invalid coordinates: lat=999, long=999",
            { lat: 999, long: 999 }
        );
        assertEquals(error.message, "Invalid coordinates: lat=999, long=999");
        assertEquals(error.statusCode, 422);
        assertEquals(error.context?.lat, 999);
    });

    await t.step("has correct name", () => {
        const error = new UnsupportedLocationError("Test");
        assertEquals(error.name, "UnsupportedLocationError");
    });
});

Deno.test("Error Classes - DatabaseConnectionError", async (t) => {

    await t.step("creates error with correct properties", () => {
        const error = new DatabaseConnectionError(
            "Connection timeout",
            { host: "db.example.com" }
        );
        assertEquals(error.message, "Connection timeout");
        assertEquals(error.statusCode, 503);
        assertEquals(error.context?.category, "database");
        assertEquals(error.context?.host, "db.example.com");
        assertEquals(error.isOperational, false); // Non-operational
    });

    await t.step("is non-operational error", () => {
        const error = new DatabaseConnectionError("Test");
        assertEquals(error.isOperational, false);
    });
});

Deno.test("Error Classes - ConfigurationError", async (t) => {

    await t.step("creates error with correct properties", () => {
        const error = new ConfigurationError(
            "Missing API key",
            { configFile: "config.json" }
        );
        assertEquals(error.message, "Missing API key");
        assertEquals(error.statusCode, 500);
        assertEquals(error.context?.category, "configuration");
        assertEquals(error.isOperational, false);
    });

    await t.step("has correct name", () => {
        const error = new ConfigurationError("Test");
        assertEquals(error.name, "ConfigurationError");
    });
});

Deno.test("Error Classes - ResourceNotFoundError", async (t) => {

    await t.step("creates error with resource type and ID", () => {
        const error = new ResourceNotFoundError("Seller", "seller-123");
        assertEquals(error.message, "Seller not found: seller-123");
        assertEquals(error.statusCode, 404);
        assertEquals(error.context?.resourceType, "Seller");
        assertEquals(error.context?.resourceId, "seller-123");
    });

    await t.step("includes additional context", () => {
        const error = new ResourceNotFoundError(
            "Customer",
            "customer-456",
            { requestedBy: "admin" }
        );
        assertEquals(error.context?.requestedBy, "admin");
    });

    await t.step("has correct name", () => {
        const error = new ResourceNotFoundError("Product", "123");
        assertEquals(error.name, "ResourceNotFoundError");
    });
});

Deno.test("Error Response Builder - AppError Instances", async (t) => {

    await t.step("builds response from NoWarehousesFoundError", () => {
        const error = new NoWarehousesFoundError({ city: "Mumbai" });
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 503);
        assertEquals(response.error, "NoWarehousesFoundError");
        assertEquals(response.message, "No active warehouses found in the system");
        assert(response.hint?.includes("administrator"));
        assertEquals(response.details?.city, "Mumbai");
    });

    await t.step("builds response from ResourceNotFoundError", () => {
        const error = new ResourceNotFoundError("Warehouse", "wh-123");
        const { response, statusCode } = buildErrorResponse(error, "req-001");

        assertEquals(statusCode, 404);
        assertEquals(response.error, "ResourceNotFoundError");
        assertEquals(response.requestId, "req-001");
        assert(response.hint?.includes("database"));
    });

    await t.step("builds response from UnsupportedLocationError", () => {
        const error = new UnsupportedLocationError("Bad coords");
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 422);
        assert(response.hint?.includes("latitude"));
        assert(response.hint?.includes("longitude"));
    });

    await t.step("includes timestamp", () => {
        const error = new AppError("Test", 400);
        const { response } = buildErrorResponse(error);

        assert(response.timestamp);
        // Timestamp should be valid ISO 8601
        assert(!isNaN(Date.parse(response.timestamp)));
    });
});

Deno.test("Error Response Builder - Standard Errors", async (t) => {

    await t.step("builds response from Error with 'not found' message", () => {
        const error = new Error("User not found");
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 404);
        assertEquals(response.error, "Error");
        assertEquals(response.message, "User not found");
    });

    await t.step("builds response from Error with 'validation' message", () => {
        const error = new Error("Validation failed for input");
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 400);
        assert(response.hint?.includes("parameters"));
    });

    await t.step("builds response from Error with 'database' message", () => {
        const error = new Error("Database connection failed");
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 503);
        assert(response.hint?.includes("Database"));
    });

    await t.step("defaults to 500 for generic errors", () => {
        const error = new Error("Something went wrong");
        const { response, statusCode } = buildErrorResponse(error);

        assertEquals(statusCode, 500);
    });
});

Deno.test("Error Response Builder - Unknown Errors", async (t) => {

    await t.step("builds response from unknown error type", () => {
        const { response, statusCode } = buildErrorResponse("string error");

        assertEquals(statusCode, 500);
        assertEquals(response.error, "UnknownError");
        assertEquals(response.message, "An unexpected error occurred");
        assert(response.hint?.includes("try again"));
    });

    await t.step("builds response from null", () => {
        const { response, statusCode } = buildErrorResponse(null);

        assertEquals(statusCode, 500);
        assertEquals(response.error, "UnknownError");
    });

    await t.step("builds response from undefined", () => {
        const { response, statusCode } = buildErrorResponse(undefined);

        assertEquals(statusCode, 500);
    });
});

Deno.test("Error Logging", async (t) => {

    await t.step("logs AppError without throwing", () => {
        const error = new NoWarehousesFoundError();
        // Should not throw
        logError(error, { additionalContext: "test" });
    });

    await t.step("logs standard Error without throwing", () => {
        const error = new Error("Test error");
        logError(error);
    });

    await t.step("logs unknown error without throwing", () => {
        logError("unknown error type");
    });

    await t.step("logs with additional context", () => {
        const error = new AppError("Test", 400);
        logError(error, { userId: "123", action: "create" });
    });
});

Deno.test("Error Hints", async (t) => {

    await t.step("provides warehouse hint for NoWarehousesFoundError", () => {
        const error = new NoWarehousesFoundError();
        const { response } = buildErrorResponse(error);
        assert(response.hint?.includes("administrator"));
        assert(response.hint?.includes("warehouses"));
    });

    await t.step("provides coordinates hint for UnsupportedLocationError", () => {
        const error = new UnsupportedLocationError("Invalid");
        const { response } = buildErrorResponse(error);
        assert(response.hint?.includes("-90 and 90"));
        assert(response.hint?.includes("-180 and 180"));
    });

    await t.step("provides database hint for DatabaseConnectionError", () => {
        const error = new DatabaseConnectionError("Connection failed");
        const { response } = buildErrorResponse(error);
        assert(response.hint?.includes("Database"));
    });

    await t.step("provides config hint for ConfigurationError", () => {
        const error = new ConfigurationError("Missing env var");
        const { response } = buildErrorResponse(error);
        assert(response.hint?.includes("administrator"));
    });

    await t.step("provides generic hint for ResourceNotFoundError", () => {
        const error = new ResourceNotFoundError("Item", "123");
        const { response } = buildErrorResponse(error);
        assert(response.hint?.includes("database"));
    });
});
