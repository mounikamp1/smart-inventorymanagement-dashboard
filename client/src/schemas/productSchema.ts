import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name too long"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stockQuantity: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  rating: z.coerce.number().min(0, "Rating must be 0-5").max(5, "Rating must be 0-5").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateProductFormData = z.infer<typeof CreateProductSchema>;
