import React from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";

interface TablaAnalisisProps {
  data: any[];
  onRowClick: (user: string) => void; // Para abrir el subpanel de detalles
}

const columns: ColumnDef<any>[] = [
  { accessorKey: "user", header: "Usuario" },
  { accessorKey: "totalContributions", header: "Total Contribuciones" },
  { accessorKey: "commits", header: "Commits" },
  { accessorKey: "linesAdded", header: "Líneas Añadidas" },
  { accessorKey: "linesDeleted", header: "Líneas Eliminadas" },
  { accessorKey: "pullRequests", header: "Pull Requests" },
  { accessorKey: "issues", header: "Issues" },
  { accessorKey: "comments", header: "Comentarios" },
];

const TablaAnalisis: React.FC<TablaAnalisisProps> = ({ data, onRowClick }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => onRowClick(row.original.user)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAnalisis;
