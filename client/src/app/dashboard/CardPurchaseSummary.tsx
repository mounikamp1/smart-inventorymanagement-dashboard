import { useGetDashboardMetricsQuery } from "@/src/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const purchaseData = data?.purchaseSummary || [];

  const lastDataPoint = purchaseData[purchaseData.length - 1] || null;

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl rounded-3xl transition-shadow duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-7 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Purchase Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Purchase overview
            </p>
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* BODY HEADER */}
            <div className="px-7 pt-6 pb-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Purchased
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {lastDataPoint
                      ? numeral(lastDataPoint.totalPurchased).format("$0.00a")
                      : "0"}
                  </p>
                </div>
                {lastDataPoint && (
                  <div
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                      lastDataPoint.changePercentage! >= 0
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        lastDataPoint.changePercentage! >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      } flex items-center`}
                    >
                      {lastDataPoint.changePercentage! >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(lastDataPoint.changePercentage!)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* CHART */}
            <div className="flex-1 overflow-hidden px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={purchaseData}
                  margin={{ top: 10, right: 10, left: -40, bottom: 40 }}
                >
                  <defs>
                    <linearGradient
                      id="purchaseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tickLine={false} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString("en")}`,
                      "Purchased",
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPurchased"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#purchaseGradient)"
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
