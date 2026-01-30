/**
 * Simple Test to Verify Setup
 */

import { assertEquals } from "@std/assert";

Deno.test("Basic test to verify Deno test setup", () => {
    assertEquals(1 + 1, 2);
});

Deno.test("String comparison", () => {
    assertEquals("hello", "hello");
});
