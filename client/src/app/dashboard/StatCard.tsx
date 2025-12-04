import { LucideIcon } from "lucide-react";
import React, { JSX } from "react";

type StatDetail = {
  title: string;
  amount: string;
  changePercentage: number;
  IconComponent: LucideIcon;
};

type StatCardProps = {
  title: string;
  primaryIcon: JSX.Element;
  details: StatDetail[];
  dateRange: string;
};

const StatCard = ({
  title,
  primaryIcon,
  details,
  dateRange,
}: StatCardProps) => {
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? "+" : "";
    return `${signal}${value.toFixed()}%`;
  };

  const getChangeColor = (value: number) =>
    value >= 0
      ? "text-green-500 dark:text-green-400"
      : "text-red-500 dark:text-red-400";

  return (
    <div className="md:row-span-1 xl:row-span-2 bg-white dark:bg-gray-900 col-span-1 shadow-lg hover:shadow-2xl rounded-3xl flex flex-col justify-between transition-all duration-300 border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* HEADER */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {dateRange}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-center justify-around gap-4 px-6 py-6">
        <div className="shrink-0 rounded-full p-4 bg-linear-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-700">
          {primaryIcon}
        </div>
        <div className="flex-1 space-y-3">
          {details.map((detail, index) => (
            <div key={index}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {detail.title}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {detail.amount}
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                    <detail.IconComponent
                      className={`w-4 h-4 ${getChangeColor(
                        detail.changePercentage
                      )}`}
                    />
                    <span
                      className={`font-semibold text-sm ${getChangeColor(
                        detail.changePercentage
                      )}`}
                    >
                      {formatPercentage(detail.changePercentage)}
                    </span>
                  </div>
                </div>
              </div>
              {index < details.length - 1 && (
                <div className="h-px bg-gray-100 dark:bg-gray-800 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
