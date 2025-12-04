import {
  ExpenseByCategorySummary,
  useGetDashboardMetricsQuery,
} from "@/src/state/api";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type ExpenseSums = {
  [category: string]: number;
};

const colors = ["#3b82f6", "#10b981", "#f59e0b"];

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  const expenseSummary = dashboardMetrics?.expenseSummary[0];

  const expenseByCategorySummary =
    dashboardMetrics?.expenseByCategorySummary || [];

  const expenseSums = expenseByCategorySummary.reduce(
    (acc: ExpenseSums, item: ExpenseByCategorySummary) => {
      const category = item.category + " Expenses";
      const amount = parseInt(item.amount, 10);
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    },
    {}
  );

  const expenseCategories = Object.entries(expenseSums).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const totalExpenses = expenseCategories.reduce(
    (acc, category: { value: number }) => acc + category.value,
    0
  );
  const formattedTotalExpenses = totalExpenses.toFixed(2);

  return (
    <div className="row-span-3 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl rounded-2xl flex flex-col justify-between transition-all duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading expenses...
            </p>
          </div>
        </div>
      ) : expenseCategories.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No expense data available
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-7 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Expense Summary
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monthly breakdown
                </p>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  30%
                </span>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col px-7 py-6 gap-6">
            {/* TOP: CHART AND BREAKDOWN SECTION */}
            <div className="flex gap-6">
              {/* CHART */}
              <div className="shrink-0">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        innerRadius={48}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                      Total
                    </p>
                    <span className="font-bold text-base text-gray-900 dark:text-white">
                      ${formattedTotalExpenses}
                    </span>
                  </div>
                </div>
              </div>

              {/* CATEGORY BREAKDOWN */}
              <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
                {expenseCategories.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shadow-md shrink-0"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2 shrink-0">
                      ${entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-7 py-4">
            {expenseSummary ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Expense
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${expenseSummary.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      On Track
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">No expense data available</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;
