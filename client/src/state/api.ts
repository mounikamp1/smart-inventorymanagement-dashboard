import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

// Feature 2: Cursor pagination response type
export interface PaginatedProducts {
  data: Product[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

// Feature 14: Audit Log types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  model: string;
  recordId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  pages: number;
  hasNextPage: boolean;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    // Feature 1: Attach JWT token from NextAuth session on every request
    prepareHeaders: async (headers) => {
      const session = await getSession();
      const token = session?.user?.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses", "AuditLogs", "Me"],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),
    // Feature 2: Cursor pagination query
    getProducts: build.query<PaginatedProducts, { search?: string; cursor?: string; take?: number } | void>({
      query: (params) => ({
        url: "/products",
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.cursor ? { cursor: params.cursor } : {}),
          take: params?.take ?? 20,
        },
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct & { productId: string }>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    // Feature 15: Update product (for inventory optimistic UI)
    updateProduct: build.mutation<Product, { id: string; name?: string; price?: number; stockQuantity?: number; rating?: number }>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    // Feature 9: Image upload endpoint
    uploadProductImage: build.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: "/products/upload",
        method: "POST",
        body: formData,
      }),
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    // Feature 16: Get current user (Settings persistence)
    getMe: build.query<User, void>({
      query: () => "/users/me",
      providesTags: ["Me"],
    }),
    // Feature 16: Update current user profile
    updateMe: build.mutation<User, { name?: string; email?: string }>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Me"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    // Feature 14: Get audit logs (ADMIN only)
    getAuditLogs: build.query<PaginatedAuditLogs, { page?: number; limit?: number; model?: string } | void>({
      query: (params) => ({
        url: "/audit",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.model ? { model: params.model } : {}),
        },
      }),
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useGetUsersQuery,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetExpensesByCategoryQuery,
  useGetAuditLogsQuery,
} = api;