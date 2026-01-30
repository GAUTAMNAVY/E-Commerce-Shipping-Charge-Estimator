/**
 * Test Utilities for Shipping API
 * Provides mocking utilities and helper functions for testing
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a mock Supabase client for testing
 * @param overrides - Custom query results to return
 * @returns Mock SupabaseClient
 */
export function createMockSupabaseClient(overrides?: {
    [key: string]: { data?: unknown; error?: unknown };
}): SupabaseClient {
    const defaultMock = {
        from: (table: string) => ({
            select: (columns?: string) => ({
                eq: (column: string, value: unknown) => ({
                    single: async () => {
                        const key = `${table}.${column}.${value}`;
                        return overrides?.[key] || { data: null, error: { message: 'Not found' } };
                    },
                    maybeSingle: async () => {
                        const key = `${table}.${column}.${value}`;
                        return overrides?.[key] || { data: null, error: null };
                    }
                }),
                single: async () => {
                    const key = `${table}`;
                    return overrides?.[key] || { data: null, error: { message: 'Not found' } };
                }
            }),
            insert: (data: unknown) => ({
                select: () => ({
                    single: async () => ({ data, error: null })
                })
            }),
            update: (data: unknown) => ({
                eq: (column: string, value: unknown) => ({
                    select: () => ({
                        single: async () => ({ data, error: null })
                    })
                })
            }),
            delete: () => ({
                eq: (column: string, value: unknown) => ({
                    single: async () => ({ data: null, error: null })
                })
            })
        })
    };

    return defaultMock as unknown as SupabaseClient;
}

/**
 * Create a mock Request object for testing edge functions
 * @param method - HTTP method
 * @param body - Request body
 * @param url - Request URL
 * @returns Mock Request
 */
export function createMockRequest(
    method: string,
    body?: Record<string, unknown>,
    url?: string
): Request {
    const baseUrl = url || 'http://localhost:54321/functions/v1/test';

    return new Request(baseUrl, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
        },
        body: body ? JSON.stringify(body) : undefined
    });
}

/**
 * Parse a Response object and extract JSON body
 * @param response - Response object
 * @returns Parsed response with status and body
 */
export async function parseResponse(response: Response): Promise<{
    status: number;
    body: unknown;
    headers: Record<string, string>;
}> {
    const body = await response.json();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headers[key] = value;
    });

    return {
        status: response.status,
        body,
        headers
    };
}

/**
 * Assert that a response has CORS headers
 * @param headers - Response headers
 */
export function assertCorsHeaders(headers: Record<string, string>): void {
    if (!headers['access-control-allow-origin']) {
        throw new Error('Missing CORS header: access-control-allow-origin');
    }
}

/**
 * Generate a valid UUID v4 for testing
 * @returns UUID string
 */
export function generateTestUUID(): string {
    return crypto.randomUUID();
}

/**
 * Sleep for testing async operations
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock Supabase query builder for specific table
 */
export class MockQueryBuilder {
    private mockData: Map<string, unknown>;

    constructor() {
        this.mockData = new Map();
    }

    setMockData(key: string, data: unknown): void {
        this.mockData.set(key, data);
    }

    createClient(): SupabaseClient {
        const mockData = this.mockData;

        return {
            from: (table: string) => ({
                select: (columns?: string) => ({
                    eq: (column: string, value: unknown) => ({
                        single: async () => {
                            const key = `${table}.${column}:${value}`;
                            const data = mockData.get(key);
                            return data
                                ? { data, error: null }
                                : { data: null, error: { message: 'Not found' } };
                        }
                    }),
                    is: (column: string, value: unknown) => ({
                        single: async () => {
                            const key = `${table}.${column}:${value}`;
                            const data = mockData.get(key);
                            return data
                                ? { data, error: null }
                                : { data: null, error: null };
                        }
                    })
                })
            })
        } as unknown as SupabaseClient;
    }
}

/**
 * Assertion helpers
 */
export const assertions = {
    /**
     * Assert that a value is a valid UUID
     */
    assertUUID(value: string): void {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw new Error(`Expected valid UUID, got: ${value}`);
        }
    },

    /**
     * Assert that a number is within a range
     */
    assertInRange(value: number, min: number, max: number): void {
        if (value < min || value > max) {
            throw new Error(`Expected value between ${min} and ${max}, got: ${value}`);
        }
    },

    /**
     * Assert that a value is approximately equal (for floating point comparisons)
     */
    assertApproximately(actual: number, expected: number, tolerance = 0.01): void {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            throw new Error(`Expected ${expected} ± ${tolerance}, got: ${actual}`);
        }
    }
};
