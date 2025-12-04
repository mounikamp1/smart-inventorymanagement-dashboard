"use client";

import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "@/src/state/api";
import { useMemo, useState } from "react";
import Header from "@/src/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AlertCircle, Filter } from "lucide-react";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#06b6d4",
      "#6366f1",
      "#d946ef",
    ];
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { name: data.category, amount: 0 };
          acc[data.category].color =
            colors[Object.keys(acc).length % colors.length];
          acc[data.category].amount += amount;
        }
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Expenses" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Premium spinner */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loading expenses...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fetching expense data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="flex flex-col h-screen px-5 sm:px-7 pt-8">
        <Header name="Expenses" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Load Expenses
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                Failed to fetch expense data. Please try again later.
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
      {/* HEADER */}
      <Header name="Expenses" />

      <div className="px-5 sm:px-7 pt-6">
        {/* FILTERS AND CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FILTER SECTION */}
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Filters
              </h3>
            </div>

            <div className="space-y-5">
              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  defaultValue="All"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option>All</option>
                  <option>Office</option>
                  <option>Professional</option>
                  <option>Salaries</option>
                </select>
              </div>

              {/* START DATE */}
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  name="start-date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* END DATE */}
              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  name="end-date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* RESET BUTTON */}
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full mt-6 px-4 py-2.5 bg-linear-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/50 text-blue-700 dark:text-blue-300 font-semibold rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-700/50"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Expense Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  label
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {aggregatedData.map(
                    (entry: AggregatedDataItem, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === activeIndex
                            ? "rgb(29, 78, 216)"
                            : entry.color
                        }
                        style={{
                          filter:
                            index === activeIndex
                              ? "brightness(1.1)"
                              : "brightness(1)",
                        }}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? "rgba(17, 24, 39, 0.95)"
                        : "rgba(255, 255, 255, 0.95)",
                    border:
                      typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? "1px solid rgb(75, 85, 99)"
                        : "1px solid rgb(229, 231, 235)",
                    borderRadius: "8px",
                    color:
                      typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? "#fff"
                        : "#1f2937",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
