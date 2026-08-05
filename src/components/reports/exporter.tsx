"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface ExporterProps {
  data?: Record<string, any>[];
  tableId?: string;
  filename?: string;
  title?: string;
}

export function DataExporter({ data, tableId, filename = "report", title = "Export Options" }: ExporterProps) {
  
  const exportToCSV = () => {
    try {
      let csvContent = "";
      
      if (data && data.length > 0) {
        // Extract headers from first object
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\n";
        
        // Add row values
        data.forEach((row) => {
          const values = headers.map((header) => {
            const val = row[header];
            // Escape double quotes and surround with quotes if contains commas
            const valStr = val === null || val === undefined ? "" : String(val);
            const cleanVal = valStr.replace(/"/g, '""');
            return cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"') 
              ? `"${cleanVal}"` 
              : cleanVal;
          });
          csvContent += values.join(",") + "\n";
        });
      } else if (tableId) {
        // Extract from DOM
        const table = document.getElementById(tableId);
        if (!table) {
          toast.error("HTML Table element not found.");
          return;
        }
        
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const cols = row.querySelectorAll("th, td");
          const rowData: string[] = [];
          cols.forEach((col) => {
            const colText = col.textContent?.trim() || "";
            const cleanVal = colText.replace(/"/g, '""');
            const formatted = cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"')
              ? `"${cleanVal}"`
              : cleanVal;
            rowData.push(formatted);
          });
          csvContent += rowData.join(",") + "\n";
        });
      } else {
        toast.error("No data available to export.");
        return;
      }
      
      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Excel CSV export downloaded.");
    } catch (err) {
      toast.error("Failed to export data.");
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={exportToCSV}>
        <Download className="h-4 w-4 mr-2" /> Export Excel
      </Button>
      <Button variant="outline" size="sm" onClick={triggerPrint}>
        <Printer className="h-4 w-4 mr-2" /> Print PDF
      </Button>
    </div>
  );
}
