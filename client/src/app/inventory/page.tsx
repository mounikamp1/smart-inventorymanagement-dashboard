"use client";

import { useGetProductsQuery, useUpdateProductMutation, Product } from "@/src/state/api";
import React, { useState, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import Header from "@/src/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AlertCircle, Package, ChevronRight, ChevronLeft } from "lucide-react";

const Inventory = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const { data: paginatedData, isError, isLoading } = useGetProductsQuery({ take: 50, cursor });
  const [updateProduct] = useUpdateProductMutation();

  // Feature 15: Optimistic UI for stock updates
  const [optimisticProducts, updateOptimistic] = useOptimistic(
    paginatedData?.data ?? [],
    (state: Product[], updated: { productId: string; stockQuantity: number }) =>
      state.map((p) => (p.productId === updated.productId ? { ...p, stockQuantity: updated.stockQuantity } : p))
  );

  const handleNextPage = () => {
    if (paginatedData?.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor ?? ""]);
      setCursor(paginatedData.nextCursor);
    }
  };

  const handlePrevPage = () => {
    const prev = [...cursorHistory];
    const last = prev.pop();
    setCursorHistory(prev);
    setCursor(last || undefined);
  };

  // Feature 15: Inline stock edit with optimistic update (ADMIN only)
  const handleProcessRowUpdate = async (newRow: Product) => {
    if (!isAdmin) return newRow;
    startTransition(() => {
      updateOptimistic({ productId: newRow.productId, stockQuantity: newRow.stockQuantity });
    });
    await updateProduct({ id: newRow.productId, stockQuantity: newRow.stockQuantity }).unwrap();
    return newRow;
  };

  const columns: GridColDef[] = [
    { field: "productId", headerName: "ID", width: 90 },
    { field: "name", headerName: "Product Name", width: 200 },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      type: "number",
      valueGetter: (_value: unknown, row: Product) => `$${row.price}`,
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 110,
      type: "number",
      valueGetter: (_value: unknown, row: Product) => (row.rating ? row.rating : "N/A"),
    },
    {
      field: "stockQuantity",
      headerName: "Stock Quantity",
      width: 150,
      type: "number",
      editable: isAdmin, // Feature 18: Only ADMIN can edit inline
      renderCell: (params) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          params.value > 10
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : params.value > 0
            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        }`}>
          {params.value}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Inventory" />
        <div className="flex-1 flex items-center justify-center px-5 sm:px-7">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !paginatedData) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Inventory" />
        <div className="flex-1 flex items-center justify-center px-5 sm:px-7">
          <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Products</h3>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
      <div className="m-5 sm:m-7 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/80 px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Product Inventory</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {optimisticProducts.length} products
                {isAdmin && " \u2022 Click stock quantity to edit inline"}
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{optimisticProducts.length} Items</p>
          </div>
        </div>

        {/* Feature 15: DataGrid with optimistic rows + inline editing for ADMIN */}
        <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
          <DataGrid
            rows={optimisticProducts}
            columns={columns}
            getRowId={(row) => row.productId}
            checkboxSelection
            processRowUpdate={handleProcessRowUpdate}
            onProcessRowUpdateError={(err) => console.error("Row update error", err)}
            className="bg-white! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-0!"
            sx={{
              "& .MuiDataGrid-columnHeader": { backgroundColor: "#f9fafb", color: "#374151", fontWeight: 700, fontSize: "0.875rem", borderBottom: "2px solid #e5e7eb" },
              "& .MuiDataGrid-row": { borderBottom: "1px solid #f3f4f6", "&:hover": { backgroundColor: "#f9fafb" } },
              "& .MuiDataGrid-cell": { padding: "14px 16px", borderBottom: "none" },
              "& .MuiCheckbox-root": { color: "#9ca3af", "&.Mui-checked": { color: "#3b82f6" } },
              "& .MuiTablePagination-root": { color: "#6b7280", borderTop: "2px solid #e5e7eb", fontSize: "0.875rem", backgroundColor: "#f9fafb" },
            }}
          />
        </div>

        {/* Feature 19: Cursor Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {optimisticProducts.length} products
            {paginatedData.hasNextPage && " (more available)"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={cursorHistory.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!paginatedData.hasNextPage}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;