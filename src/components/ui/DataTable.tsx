import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | 'actions';
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  isLoading?: boolean;
  searchPlaceholder?: string;
}

export default function DataTable<T>({
  columns,
  data,
  className,
  isLoading = false,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = searchQuery
    ? data.filter((row) =>
        Object.entries(row).some(([key, value]) => {
          if (key === "actions") return false;
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      )
    : data;

  return (
    <div className={cn("space-y-4", className)}>
      <Input
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.header}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b hover:bg-muted/50"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className="whitespace-nowrap px-4 py-3 text-sm"
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.accessorKey !== 'actions' 
                            ? String(row[column.accessorKey as keyof T])
                            : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-sm text-muted-foreground"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
