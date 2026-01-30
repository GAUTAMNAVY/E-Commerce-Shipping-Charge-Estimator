/**
 * Unit Tests for Validation Utilities
 * Tests input validation functions and error handling
 */

import { assertEquals, assertThrows } from "@std/assert";
import {
    validateUUID,
    validateDeliverySpeed,
    validateRequired,
    validateCoordinates,
    validatePositiveNumber,
    validateRange,
    ValidationException,
    createValidationErrorResponse
} from "./validation.ts";
import { INVALID_UUIDS, TEST_SELLERS } from "./test-fixtures.ts";

Deno.test("Validation - UUID", async (t) => {

    await t.step("accepts valid UUID v4", () => {
        const validUUID = "550e8400-e29b-41d4-a716-446655440001";
        assertEquals(validateUUID(validUUID, "testId"), true);
    });

    await t.step("rejects empty string", () => {
        assertThrows(
            () => validateUUID("", "testId"),
            ValidationException,
            "testId is required"
        );
    });

    await t.step("rejects invalid UUID format - no hyphens", () => {
        assertThrows(
            () => validateUUID("550e8400e29b41d4a716446655440001", "testId"),
            ValidationException,
            "must be a valid UUID"
        );
    });

    await t.step("rejects invalid UUID format - wrong pattern", () => {
        assertThrows(
            () => validateUUID("invalid-uuid-format", "testId"),
            ValidationException,
            "must be a valid UUID"
        );
    });

    await t.step("rejects plain text", () => {
        assertThrows(
            () => validateUUID("not-a-uuid", "testId"),
            ValidationException,
            "must be a valid UUID"
        );
    });

    await t.step("rejects numeric string", () => {
        assertThrows(
            () => validateUUID("12345", "testId"),
            ValidationException,
            "must be a valid UUID"
        );
    });

    await t.step("error includes correct field name", () => {
        try {
            validateUUID("invalid", "customFieldName");
        } catch (error) {
            if (error instanceof ValidationException) {
                assertEquals(error.errors[0].field, "customFieldName");
            }
        }
    });
});

Deno.test("Validation - Delivery Speed", async (t) => {

    await t.step("accepts 'standard'", () => {
        assertEquals(validateDeliverySpeed("standard"), true);
    });

    await t.step("accepts 'express'", () => {
        assertEquals(validateDeliverySpeed("express"), true);
    });

    await t.step("rejects empty string", () => {
        assertThrows(
            () => validateDeliverySpeed(""),
            ValidationException,
            "deliverySpeed is required"
        );
    });

    await t.step("rejects invalid value", () => {
        assertThrows(
            () => validateDeliverySpeed("overnight"),
            ValidationException,
            "must be one of: standard, express"
        );
    });

    await t.step("rejects wrong case", () => {
        assertThrows(
            () => validateDeliverySpeed("Standard"),
            ValidationException,
            "must be one of"
        );
    });

    await t.step("rejects numeric value", () => {
        assertThrows(
            () => validateDeliverySpeed("1"),
            ValidationException
        );
    });
});

Deno.test("Validation - Required Fields", async (t) => {

    await t.step("passes when all fields have values", () => {
        assertEquals(validateRequired({
            sellerId: "value1",
            customerId: "value2",
            productId: "value3"
        }), true);
    });

    await t.step("throws when field is undefined", () => {
        assertThrows(
            () => validateRequired({ sellerId: undefined }),
            ValidationException,
            "sellerId is required"
        );
    });

    await t.step("throws when field is null", () => {
        assertThrows(
            () => validateRequired({ customerId: null }),
            ValidationException,
            "customerId is required"
        );
    });

    await t.step("throws when field is empty string", () => {
        assertThrows(
            () => validateRequired({ productId: "" }),
            ValidationException,
            "productId is required"
        );
    });

    await t.step("accepts 0 as valid value", () => {
        assertEquals(validateRequired({ count: 0 }), true);
    });

    await t.step("accepts false as valid value", () => {
        assertEquals(validateRequired({ isActive: false }), true);
    });

    await t.step("reports multiple missing fields", () => {
        try {
            validateRequired({
                field1: null,
                field2: "",
                field3: undefined
            });
        } catch (error) {
            if (error instanceof ValidationException) {
                assertEquals(error.errors.length, 3);
            }
        }
    });
});

Deno.test("Validation - Coordinates", async (t) => {

    await t.step("accepts valid coordinates - Delhi", () => {
        assertEquals(validateCoordinates(28.6139, 77.2090), true);
    });

    await t.step("accepts valid coordinates - Mumbai", () => {
        assertEquals(validateCoordinates(19.0760, 72.8777), true);
    });

    await t.step("accepts North Pole", () => {
        assertEquals(validateCoordinates(90, 0), true);
    });

    await t.step("accepts South Pole", () => {
        assertEquals(validateCoordinates(-90, 0), true);
    });

    await t.step("accepts international date line", () => {
        assertEquals(validateCoordinates(0, 180), true);
        assertEquals(validateCoordinates(0, -180), true);
    });

    await t.step("accepts equator", () => {
        assertEquals(validateCoordinates(0, 0), true);
    });

    await t.step("rejects latitude > 90", () => {
        assertThrows(
            () => validateCoordinates(91, 77.2090),
            ValidationException,
            "latitude must be between -90 and 90"
        );
    });

    await t.step("rejects latitude < -90", () => {
        assertThrows(
            () => validateCoordinates(-91, 77.2090),
            ValidationException,
            "latitude must be between -90 and 90"
        );
    });

    await t.step("rejects longitude > 180", () => {
        assertThrows(
            () => validateCoordinates(28.6139, 181),
            ValidationException,
            "longitude must be between -180 and 180"
        );
    });

    await t.step("rejects longitude < -180", () => {
        assertThrows(
            () => validateCoordinates(28.6139, -181),
            ValidationException,
            "longitude must be between -180 and 180"
        );
    });

    await t.step("rejects NaN latitude", () => {
        assertThrows(
            () => validateCoordinates(NaN, 77.2090),
            ValidationException,
            "must be a valid number"
        );
    });

    await t.step("rejects NaN longitude", () => {
        assertThrows(
            () => validateCoordinates(28.6139, NaN),
            ValidationException,
            "must be a valid number"
        );
    });

    await t.step("uses field prefix in error messages", () => {
        try {
            validateCoordinates(999, 999, "warehouse.");
        } catch (error) {
            if (error instanceof ValidationException) {
                assertEquals(error.errors[0].field, "warehouse.latitude");
                assertEquals(error.errors[1].field, "warehouse.longitude");
            }
        }
    });

    await t.step("reports both latitude and longitude errors", () => {
        try {
            validateCoordinates(999, 999);
        } catch (error) {
            if (error instanceof ValidationException) {
                assertEquals(error.errors.length, 2);
            }
        }
    });
});

Deno.test("Validation - Positive Number", async (t) => {

    await t.step("accepts positive integer", () => {
        assertEquals(validatePositiveNumber(10, "weight"), true);
    });

    await t.step("accepts positive decimal", () => {
        assertEquals(validatePositiveNumber(10.5, "weight"), true);
    });

    await t.step("accepts very small positive number", () => {
        assertEquals(validatePositiveNumber(0.001, "weight"), true);
    });

    await t.step("rejects zero", () => {
        assertThrows(
            () => validatePositiveNumber(0, "weight"),
            ValidationException,
            "must be greater than 0"
        );
    });

    await t.step("rejects negative number", () => {
        assertThrows(
            () => validatePositiveNumber(-5, "weight"),
            ValidationException,
            "must be greater than 0"
        );
    });

    await t.step("rejects NaN", () => {
        assertThrows(
            () => validatePositiveNumber(NaN, "weight"),
            ValidationException,
            "must be a valid number"
        );
    });

    await t.step("includes field name in error", () => {
        try {
            validatePositiveNumber(-1, "customField");
        } catch (error) {
            if (error instanceof ValidationException) {
                assertEquals(error.errors[0].field, "customField");
            }
        }
    });
});

Deno.test("Validation - Range", async (t) => {

    await t.step("accepts value within range", () => {
        assertEquals(validateRange(50, "age", 0, 100), true);
    });

    await t.step("accepts minimum value", () => {
        assertEquals(validateRange(0, "age", 0, 100), true);
    });

    await t.step("accepts maximum value", () => {
        assertEquals(validateRange(100, "age", 0, 100), true);
    });

    await t.step("rejects value below minimum", () => {
        assertThrows(
            () => validateRange(-1, "age", 0, 100),
            ValidationException,
            "must be between 0 and 100"
        );
    });

    await t.step("rejects value above maximum", () => {
        assertThrows(
            () => validateRange(101, "age", 0, 100),
            ValidationException,
            "must be between 0 and 100"
        );
    });

    await t.step("rejects NaN", () => {
        assertThrows(
            () => validateRange(NaN, "age", 0, 100),
            ValidationException,
            "must be a valid number"
        );
    });

    await t.step("works with decimal ranges", () => {
        assertEquals(validateRange(0.5, "percentage", 0.0, 1.0), true);
    });

    await t.step("works with negative ranges", () => {
        assertEquals(validateRange(-5, "temperature", -10, 10), true);
    });
});

Deno.test("Validation - Error Response Creation", async (t) => {

    await t.step("creates response from ValidationException", () => {
        const exception = new ValidationException([
            { field: "sellerId", message: "sellerId is required" }
        ]);

        const response = createValidationErrorResponse(exception);
        assertEquals(response.error, "Validation failed");
        assertEquals(response.details?.length, 1);
        assertEquals(response.details?.[0].field, "sellerId");
    });

    await t.step("creates response from generic Error", () => {
        const error = new Error("Something went wrong");
        const response = createValidationErrorResponse(error);
        assertEquals(response.error, "Invalid request");
        assertEquals(response.message, "Something went wrong");
    });

    await t.step("creates response from unknown error", () => {
        const response = createValidationErrorResponse("unknown");
        assertEquals(response.error, "Invalid request");
        assertEquals(response.message, "Unknown validation error");
    });

    await t.step("includes all validation errors in details", () => {
        const exception = new ValidationException([
            { field: "field1", message: "Error 1" },
            { field: "field2", message: "Error 2" },
            { field: "field3", message: "Error 3" }
        ]);

        const response = createValidationErrorResponse(exception);
        assertEquals(response.details?.length, 3);
    });
});

Deno.test("Validation - ValidationException", async (t) => {

    await t.step("exception has correct name", () => {
        const exception = new ValidationException([
            { field: "test", message: "test error" }
        ]);
        assertEquals(exception.name, "ValidationException");
    });

    await t.step("exception has correct message", () => {
        const exception = new ValidationException([
            { field: "test", message: "test error" }
        ]);
        assertEquals(exception.message, "Validation failed");
    });

    await t.step("exception stores errors array", () => {
        const errors = [
            { field: "field1", message: "Error 1" },
            { field: "field2", message: "Error 2" }
        ];
        const exception = new ValidationException(errors);
        assertEquals(exception.errors, errors);
    });
});
