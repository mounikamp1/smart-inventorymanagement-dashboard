import { useGetDashboardMetricsQuery } from "@/src/state/api";
import { ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";
import React from "react";
import Image from "next/image";
import Rating from "../(components)/Rating";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl rounded-2xl pb-6 transition-all duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading products...
            </p>
          </div>
        </div>
      ) : dashboardMetrics?.popularProducts &&
        dashboardMetrics.popularProducts.length > 0 ? (
        <>
          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-7 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Popular Products
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Top selling items
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* PRODUCTS LIST */}
          <div className="overflow-y-auto flex-1">
            {dashboardMetrics.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="group px-6 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE - PRODUCT INFO */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* PRODUCT IMAGE */}
                    <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm overflow-hidden relative">
                      <Image
                        src={`https://s3-smart-inventory-dashboard.s3.us-east-2.amazonaws.com/product${
                          Math.floor(Math.random() * 3) + 1
                        }.png`}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full rounded-xl"
                      />
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="flex flex-col justify-between gap-2 min-w-0 flex-1">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                          ${product.price}
                        </span>
                        <span className="text-gray-400 dark:text-gray-600">
                          •
                        </span>
                        <Rating rating={product.rating || 0} />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE - ACTIONS & STATS */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 shadow-sm hover:shadow-md"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Sold
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {Math.round(product.stockQuantity / 1000)}k
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No popular products available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPopularProducts;
