import { describe, it, expect } from "vitest";
import { escapeHtml } from "../lib/sanitizer";

describe("Sanitizer module", () => {
  it("should escape unsafe HTML characters", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    expect(escapeHtml('hello & "world"')).toBe("hello &amp; &quot;world&quot;");
  });

  it("should return the input if it is not a string", () => {
    expect(escapeHtml(123 as any)).toBe(123);
    expect(escapeHtml(null as any)).toBeNull();
  });
});
