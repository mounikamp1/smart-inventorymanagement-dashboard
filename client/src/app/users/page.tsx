"use client";

import { useGetUsersQuery } from "@/src/state/api";
import Header from "@/src/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AlertCircle, Users as UsersIcon } from "lucide-react";

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 90 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "email", headerName: "Email", width: 250 },
];

const Users = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Users" />
        <div className="flex-1 flex items-center justify-center px-5 sm:px-7">
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
              Loading users...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fetching user data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex flex-col h-screen">
        <Header name="Users" />
        <div className="flex-1 flex items-center justify-center px-5 sm:px-7">
          <div className="w-full max-w-md">
            <div className="text-center bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900 p-8 shadow-xl">
              {/* Icon container */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Load Users
              </h3>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                Failed to fetch user data. Please try again later.
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
      <Header name="Users" />
      <div className="m-5 sm:m-7 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Premium Header Section */}
        <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/80 px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                User Directory
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {users.length} users • Access management
              </p>
            </div>
          </div>
          {/* Stats badge */}
          <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {users.length} Users
            </p>
          </div>
        </div>

        {/* DataGrid */}
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          checkboxSelection
          className="bg-white! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-0!"
          sx={{
            "& .MuiDataGrid-root": {
              backgroundColor: "transparent",
              color: "var(--color-text)",
              border: "none",
              fontSize: "0.875rem",
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "transparent",
              },
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f9fafb",
              color: "#374151",
              fontWeight: 700,
              fontSize: "0.875rem",
              borderBottom: "2px solid #e5e7eb",
              letterSpacing: "0.025em",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "none",
              },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #f3f4f6",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#f9fafb",
                boxShadow: "inset 0 0 8px rgba(59, 130, 246, 0.1)",
              },
              "&.Mui-selected": {
                backgroundColor: "#dbeafe !important",
                "&:hover": {
                  backgroundColor: "#bfdbfe !important",
                },
              },
            },
            "& .MuiDataGrid-cell": {
              padding: "14px 16px",
              borderBottom: "none",
            },
            "& .MuiCheckbox-root": {
              color: "#9ca3af",
              "&.Mui-checked": {
                color: "#3b82f6",
              },
            },
            "& .MuiTablePagination-root": {
              color: "#6b7280",
              borderTop: "2px solid #e5e7eb",
              fontSize: "0.875rem",
              backgroundColor: "#f9fafb",
              "& .MuiIconButton-root": {
                color: "#3b82f6",
              },
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "12px",
            },
            /* Scrollbar styling */
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
              backgroundColor: "#f3f4f6",
            },
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
              backgroundColor: "#d1d5db",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#9ca3af",
              },
            },
            "& .dark .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
              backgroundColor: "#1f2937",
            },
            "& .dark .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
              backgroundColor: "#4b5563",
              "&:hover": {
                backgroundColor: "#6b7280",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Users;
