import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

describe("Auth Schema Validation", () => {
  it("accepts valid login credentials", () => {
    const result = LoginSchema.safeParse({ email: "admin@test.com", password: "Admin123!" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ email: "admin@test.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid register payload", () => {
    const result = RegisterSchema.safeParse({ name: "Alice", email: "alice@test.com", password: "password123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("STAFF");
  });

  it("rejects short password on register", () => {
    const result = RegisterSchema.safeParse({ name: "Bob", email: "bob@test.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts ADMIN role on register", () => {
    const result = RegisterSchema.safeParse({ name: "Admin", email: "admin@test.com", password: "secure123", role: "ADMIN" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("ADMIN");
  });
});

describe("UpdateProductSchema", () => {
  const UpdateProductSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    price: z.number().positive().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    rating: z.number().min(0).max(5).optional(),
  });

  it("accepts partial update", () => {
    const result = UpdateProductSchema.safeParse({ stockQuantity: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects negative stock", () => {
    const result = UpdateProductSchema.safeParse({ stockQuantity: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = UpdateProductSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });
});