"use client";

import { useCreateProductMutation, useGetProductsQuery } from "@/src/state/api";
import { Search, Plus, AlertCircle, Package } from "lucide-react";
import { useState } from "react";
import Header from "@/src/app/(components)/Header";
import Rating from "@/src/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  const [createProduct] = useCreateProductMutation();
  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Products" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loading products...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fetching your inventory
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Products" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Load Products
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                Failed to fetch product data. Please try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Products" />

      <div className="px-5 sm:px-7 pt-6">
        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CREATE BUTTON */}
        <div className="mb-8 flex justify-end">
          <button
            className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Create Product
          </button>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {products?.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No products found. Create one to get started!
                </p>
              </div>
            </div>
          ) : (
            products?.map((product) => (
              <div
                key={product.productId}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700"
              >
                {/* Product image */}
                <div className="relative h-48 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center group-hover:from-blue-50 group-hover:to-indigo-50 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 transition-colors overflow-hidden">
                  <Image
                    src={`https://s3-smart-inventory-dashboard.s3.us-east-2.amazonaws.com/product${
                      Math.floor(Math.random() * 3) + 1
                    }.png`}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Product info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Stock Quantity
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.stockQuantity > 10
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : product.stockQuantity > 0
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Rating
                      </span>
                      <Rating rating={product.rating} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;
