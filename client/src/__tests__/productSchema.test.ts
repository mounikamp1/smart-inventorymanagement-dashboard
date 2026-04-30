import { CreateProductSchema } from "@/src/schemas/productSchema";

describe("CreateProductSchema", () => {
  it("accepts valid product data", () => {
    const result = CreateProductSchema.safeParse({
      name: "Widget Pro",
      price: 29.99,
      stockQuantity: 100,
      rating: 4.5,
    });
    expect(result.success).toBe(true);
  });

  it("fails on empty name", () => {
    const result = CreateProductSchema.safeParse({
      name: "",
      price: 29.99,
      stockQuantity: 10,
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain("name");
  });

  it("fails on negative price", () => {
    const result = CreateProductSchema.safeParse({
      name: "Widget",
      price: -5,
      stockQuantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string price to number", () => {
    const result = CreateProductSchema.safeParse({
      name: "Widget",
      price: "29.99",
      stockQuantity: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(29.99);
    }
  });
});
