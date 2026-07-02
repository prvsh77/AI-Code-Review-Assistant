import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../lib/encryption";

describe("Encryption module", () => {
  it("should encrypt and decrypt a string successfully", () => {
    const text = "hello-world-secret-123";
    const encrypted = encrypt(text);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(text);
    expect(encrypted.split(":").length).toBe(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it("should throw an error for malformed encrypted text", () => {
    expect(() => decrypt("malformed_text")).toThrow("Invalid encrypted text format");
    expect(() => decrypt("a:b")).toThrow("Invalid encrypted text format");
  });
});
