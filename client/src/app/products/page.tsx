"use client";

import { useCreateProductMutation, useGetProductsQuery, useUploadProductImageMutation, Product } from "@/src/state/api";
import { Search, Plus, AlertCircle, Package, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useOptimistic, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/src/app/(components)/Header";
import Rating from "@/src/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import type { CreateProductFormData } from "@/src/schemas/productSchema";
import { useSession } from "next-auth/react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Feature 18: Role-based UI
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const { data: paginatedData, isLoading, isError } = useGetProductsQuery({
    search: searchTerm || undefined,
    cursor,
    take: 20,
  });

  const [createProduct] = useCreateProductMutation();
  const [uploadImage] = useUploadProductImageMutation();

  // Feature 4: Optimistic UI - add product instantly before server confirms
  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    paginatedData?.data ?? [],
    (state: Product[], newProduct: Product) => [newProduct, ...state]
  );

  const handleCreateProduct = async (formData: CreateProductFormData, imageFile?: File) => {
    const productId = uuidv4();
    let imageUrl: string | undefined;

    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const uploadResult = await uploadImage(fd).unwrap().catch(() => null);
      imageUrl = uploadResult?.imageUrl;
    }

    // Optimistic: add product to UI immediately (sub-100ms perceived latency)
    const optimisticItem: Product = {
      productId,
      name: formData.name,
      price: formData.price,
      rating: formData.rating,
      stockQuantity: formData.stockQuantity,
      imageUrl: imageUrl ?? formData.imageUrl ?? null,
    };

    startTransition(() => {
      addOptimisticProduct(optimisticItem);
    });

    await createProduct({
      productId,
      ...formData,
      imageUrl,
    });
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Products" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Products" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Products</h3>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Products" />
      <div className="px-5 sm:px-7 pt-6">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCursor(undefined); setCursorHistory([]); }}
            />
          </div>
        </div>

        {isAdmin && (
        <div className="mb-8 flex justify-end">
          <button
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Create Product
          </button>
        </div>
        )}

        {/* Feature 4: Products are shown optimistically - UI updates instantly */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 ${isPending ? "opacity-70" : ""}`}>
          {optimisticProducts.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No products found. Create one to get started!</p>
              </div>
            </div>
          ) : (
            optimisticProducts.map((product) => (
              <div
                key={product.productId}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.imageUrl || `https://s3-smart-inventory-dashboard.s3.us-east-2.amazonaws.com/product${(product.productId.charCodeAt(0) % 3) + 1}.png`}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock Quantity</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      product.stockQuantity > 10
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : product.stockQuantity > 0
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                      {product.stockQuantity}
                    </span>
                  </div>
                  {product.rating && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                      <Rating rating={product.rating} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feature 2: Cursor Pagination Controls */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <button
            onClick={handlePrevPage}
            disabled={cursorHistory.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!paginatedData?.hasNextPage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;

