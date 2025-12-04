import { useGetDashboardMetricsQuery } from "@/src/state/api";
import { TrendingUp, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  const salesData = data?.salesSummary || [];

  const [timeframe, setTimeframe] = useState("weekly");

  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + curr.changePercentage! / array.length;
    }, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

  if (isError) {
    return (
      <div className="row-span-3 xl:row-span-6 bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-medium">
            Failed to fetch sales data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl rounded-2xl flex flex-col justify-between transition-all duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading sales data...
            </p>
          </div>
        </div>
      ) : salesData.length > 0 ? (
        <>
          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-7 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sales Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Revenue overview
            </p>
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col">
            {/* STATS SECTION */}
            <div className="px-7 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Total Value
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      $
                      {(totalValueSum / 1000000).toLocaleString("en", {
                        maximumFractionDigits: 2,
                      })}
                      m
                    </span>
                    <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +{averageChangePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* TIMEFRAME SELECTOR */}
                <select
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={timeframe}
                  onChange={(e) => {
                    setTimeframe(e.target.value);
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* CHART */}
            <div className="flex-1 px-2 py-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop
                        offset="95%"
                        stopColor="#60a5fa"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => {
                      return `$${(value / 1000000).toFixed(0)}m`;
                    }}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString("en")}`,
                      "Sales Value",
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <Bar
                    dataKey="totalValue"
                    fill="url(#colorBar)"
                    barSize={12}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-7 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Data Points
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {salesData.length} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Highest Sales
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {highestValueDate}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No sales data available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSalesSummary;
